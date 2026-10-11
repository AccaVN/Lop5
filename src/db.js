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
