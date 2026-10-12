require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Thiếu DATABASE_URL trong biến môi trường.');
}

// max nhỏ vì môi trường serverless (Vercel) có thể chạy nhiều instance function
// song song, mỗi cái mở pool riêng — nếu max lớn dễ vượt giới hạn kết nối của Neon.
const useSsl = !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) && process.env.PGSSLMODE !== 'disable';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false, // Neon yêu cầu SSL
  max: 3,
  idleTimeoutMillis: 10000,
});

// Tự cập nhật cấu trúc bảng khi app khởi động (chạy 1 lần mỗi instance, đều là
// lệnh "IF NOT EXISTS" nên chạy lại nhiều lần vẫn an toàn). Nhờ vậy khi deploy bản
// mới lên Vercel KHÔNG cần vào Neon chạy SQL thủ công.
const SCHEMA_SQL = `
  ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS session_id TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_device TEXT;
  -- Hạn dùng thử của tài khoản tự đăng ký (3 ngày). NULL = tài khoản chính thức.
  ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;
  CREATE TABLE IF NOT EXISTS student_rewards (
    student_id INTEGER PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    stickers   JSONB NOT NULL DEFAULT '[]'::jsonb,
    shop       JSONB NOT NULL DEFAULT '[]'::jsonb,
    coins      INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ALTER TABLE student_rewards ADD COLUMN IF NOT EXISTS en_stickers JSONB NOT NULL DEFAULT '[]'::jsonb;
  ALTER TABLE students ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;
  -- 09/2026: giảm xu 5 lần (chạy đúng 1 lần nhờ cột coin_v)
  ALTER TABLE student_rewards ADD COLUMN IF NOT EXISTS coin_v INTEGER NOT NULL DEFAULT 1;
  UPDATE student_rewards SET coins = coins / 5, coin_v = 2 WHERE coin_v < 2;
  ALTER TABLE student_rewards ALTER COLUMN coin_v SET DEFAULT 2;
  CREATE TABLE IF NOT EXISTS app_settings (
    key        TEXT PRIMARY KEY,
    value      JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  -- 10/2026: mỗi bài chỉ tính điểm LẦN LÀM CUỐI (xem src/score.js)
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS best_stars INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS points     INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS correct    INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS total      INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS attempts   INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS skills     JSONB;
  ALTER TABLE students ADD COLUMN IF NOT EXISTS bonus_points INTEGER NOT NULL DEFAULT 0;
  -- Quy đổi dữ liệu cũ đúng 1 lần: điểm cũ cộng dồn mọi lần làm lại → ước lượng điểm
  -- 1 lần làm theo số sao (3★ = 160, 2★ = 120, 1★ = 90). Bài làm lại sẽ ghi điểm chính xác.
  DO $mig$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM app_settings WHERE key = 'score_last_attempt_v1') THEN
      UPDATE progress SET best_stars = GREATEST(best_stars, stars),
        points = CASE WHEN level_key ~ '^(main|tv|en|exam)_' THEN
                   CASE stars WHEN 3 THEN 160 WHEN 2 THEN 120 WHEN 1 THEN 90 ELSE 0 END
                 ELSE 0 END,
        attempts = GREATEST(attempts, 1)
      WHERE attempts = 0;
      UPDATE students s SET total_points =
        COALESCE((SELECT SUM(p.points) FROM progress p WHERE p.student_id = s.id), 0) + s.bonus_points;
      INSERT INTO app_settings (key, value) VALUES ('score_last_attempt_v1', 'true'::jsonb)
        ON CONFLICT (key) DO NOTHING;
    END IF;
  END $mig$;
  COMMENT ON COLUMN progress.best_stars IS 'score_last_attempt_v1';
  -- 10/2026 (v2): kỷ lục điểm từng bài (xu chỉ thưởng khi vượt kỷ lục), điểm luyện nói lưu
  -- trên máy chủ theo từng từ/câu (đổi máy không nhận lại điểm), khóa đăng nhập khi sai nhiều lần.
  ALTER TABLE progress ADD COLUMN IF NOT EXISTS best_points INTEGER NOT NULL DEFAULT 0;
  CREATE TABLE IF NOT EXISTS speak_best (
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    item_key   TEXT NOT NULL,
    stars      INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, item_key)
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    key          TEXT PRIMARY KEY,
    fails        INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  DO $mig2$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM app_settings WHERE key = 'score_v2') THEN
      UPDATE progress SET best_points = GREATEST(best_points, points);
      -- Điểm luyện nói cũ không biết thuộc từ nào → bỏ; máy của con sẽ gửi lại từng từ đã đọc.
      UPDATE students SET bonus_points = 0;
      UPDATE students s SET total_points =
        COALESCE((SELECT SUM(p.points) FROM progress p WHERE p.student_id = s.id), 0)
        + 2 * COALESCE((SELECT SUM(b.stars) FROM speak_best b WHERE b.student_id = s.id), 0);
      INSERT INTO app_settings (key, value) VALUES ('score_v2', 'true'::jsonb) ON CONFLICT (key) DO NOTHING;
    END IF;
  END $mig2$;
  COMMENT ON COLUMN progress.best_points IS 'score_v2';
`;
// Kiểm tra nhanh bằng catalog (chỉ đọc, không khóa bảng). Lệnh ALTER TABLE ... IF NOT EXISTS
// vẫn lấy khóa ACCESS EXCLUSIVE dù cột đã có → mỗi lần Vercel cold start sẽ chặn/chờ các
// truy vấn khác. Vì vậy chỉ chạy SCHEMA_SQL khi thực sự thiếu cột/bảng.
const SCHEMA_CHECK_SQL = `
  SELECT
    EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('users') AND attname = 'display_name' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('users') AND attname = 'session_id' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('users') AND attname = 'last_login_device' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('users') AND attname = 'trial_expires_at' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('student_rewards') AND attname = 'en_stickers' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('students') AND attname = 'total_points' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('student_rewards') AND attname = 'coin_v' AND NOT attisdropped)
    AND to_regclass('app_settings') IS NOT NULL
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('progress') AND attname = 'skills' AND NOT attisdropped)
    AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('students') AND attname = 'bonus_points' AND NOT attisdropped)
    AND col_description(to_regclass('progress'), (SELECT attnum FROM pg_attribute WHERE attrelid = to_regclass('progress') AND attname = 'best_stars' AND NOT attisdropped)) = 'score_last_attempt_v1'
    AND col_description(to_regclass('progress'), (SELECT attnum FROM pg_attribute WHERE attrelid = to_regclass('progress') AND attname = 'best_points' AND NOT attisdropped)) = 'score_v2'
    AND to_regclass('speak_best') IS NOT NULL
    AND to_regclass('login_attempts') IS NOT NULL
    AS ok
`;
let schemaReady = null;
pool.ensureSchema = function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool
      .query(SCHEMA_CHECK_SQL)
      .then(({ rows }) => (rows[0] && rows[0].ok ? null : pool.query(SCHEMA_SQL)))
      .catch((e) => {
        schemaReady = null; // lần sau thử lại
        throw e;
      });
  }
  return schemaReady;
};

module.exports = pool;
