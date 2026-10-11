-- 09/2026: giảm số xu của học sinh 10 lần (chỉ chạy 1 lần).
-- App tự chạy đoạn này khi khởi động (src/db.js). File này chỉ để chạy tay nếu cần.
ALTER TABLE student_rewards ADD COLUMN IF NOT EXISTS coin_v INTEGER NOT NULL DEFAULT 1;
UPDATE student_rewards SET coins = coins / 10, coin_v = 2 WHERE coin_v < 2;
ALTER TABLE student_rewards ALTER COLUMN coin_v SET DEFAULT 2;
