-- ============================================================
-- Schema cho Neon (Postgres) — Học Vui Lớp 3
-- Chạy 1 lần trên Neon SQL editor hoặc: psql "$DATABASE_URL" -f schema.sql
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'parent', 'student');

-- Tài khoản đăng nhập (admin / phụ huynh / học sinh)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT,                  -- tên hiển thị (admin / phụ huynh)
  session_id    TEXT,                  -- phiên đăng nhập hiện tại (1 tài khoản = 1 thiết bị)
  last_login_at     TIMESTAMPTZ,       -- lần đăng nhập gần nhất
  last_login_ip     TEXT,
  last_login_device TEXT,              -- User-Agent của thiết bị đăng nhập gần nhất
  trial_expires_at  TIMESTAMPTZ,       -- hạn dùng thử 3 ngày (tự đăng ký); NULL = chính thức
  role          user_role NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hồ sơ học sinh (1 user role=student có đúng 1 hồ sơ student)
CREATE TABLE students (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  avatar     TEXT NOT NULL DEFAULT '🦊',
  gender     TEXT NOT NULL DEFAULT 'both',
  join_code  TEXT UNIQUE NOT NULL,   -- mã 8 ký tự để phụ huynh liên kết (ba + mẹ dùng chung mã này)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_points INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;

-- Liên kết nhiều-nhiều: 1 học sinh có thể có 2 phụ huynh (ba/mẹ),
-- 1 phụ huynh có thể có nhiều học sinh (nhiều con)
CREATE TABLE parent_student (
  parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id     INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_user_id, student_id)
);

-- Tiến độ theo từng bài/level (level_key ví dụ: "toan_1", "tv_5", "en_12")
CREATE TABLE progress (
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  level_key  TEXT NOT NULL,
  stars      INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, level_key)
);

-- Thống kê đúng/sai theo từng kỹ năng (cộng dồn)
CREATE TABLE skill_stats (
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_key  TEXT NOT NULL,
  correct    INTEGER NOT NULL DEFAULT 0,
  total      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (student_id, skill_key)
);

-- Thời gian học theo ngày (giây, cộng dồn) — dùng để vẽ biểu đồ 7 ngày
CREATE TABLE daily_sessions (
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  day        DATE NOT NULL,
  seconds    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (student_id, day)
);

CREATE INDEX idx_parent_student_student ON parent_student(student_id);
CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_sessions_student ON daily_sessions(student_id);

-- Bộ sưu tập sticker/cửa hàng của học sinh: lưu theo account, không chỉ local browser.
CREATE TABLE IF NOT EXISTS student_rewards (
  student_id INTEGER PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  stickers   JSONB NOT NULL DEFAULT '[]'::jsonb,
  shop       JSONB NOT NULL DEFAULT '[]'::jsonb,
  coins      INTEGER NOT NULL DEFAULT 0,
  en_stickers JSONB NOT NULL DEFAULT '[]'::jsonb, -- sticker Xe cộ (thưởng bài English)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cài đặt chung của ứng dụng (ví dụ: giọng đọc chuẩn nam/nữ do admin chọn)
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 09/2026: thang xu mới (giảm 5 lần). DB tạo mới dùng luôn coin_v = 2.
ALTER TABLE student_rewards ADD COLUMN IF NOT EXISTS coin_v INTEGER NOT NULL DEFAULT 2;
