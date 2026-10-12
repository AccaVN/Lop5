-- 10/2026: mỗi bài chỉ tính điểm LẦN LÀM CUỐI.
-- KHÔNG cần chạy tay: src/db.js tự chạy đoạn này ở lần gọi API đầu tiên sau khi deploy.
-- File này để tham khảo / chạy thủ công nếu muốn.
ALTER TABLE progress ADD COLUMN IF NOT EXISTS best_stars INTEGER NOT NULL DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS points     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS correct    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS total      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS attempts   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS skills     JSONB;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bonus_points INTEGER NOT NULL DEFAULT 0;
-- Điểm cũ (cộng dồn mọi lần làm lại) → ước lượng điểm 1 lần làm theo số sao.
UPDATE progress SET best_stars = GREATEST(best_stars, stars),
  points = CASE WHEN level_key ~ '^(main|tv|en|exam)_' THEN
             CASE stars WHEN 3 THEN 160 WHEN 2 THEN 120 WHEN 1 THEN 90 ELSE 0 END
           ELSE 0 END,
  attempts = GREATEST(attempts, 1)
WHERE attempts = 0;
UPDATE students s SET total_points =
  COALESCE((SELECT SUM(p.points) FROM progress p WHERE p.student_id = s.id), 0) + s.bonus_points;
INSERT INTO app_settings (key, value) VALUES ('score_last_attempt_v1', 'true'::jsonb) ON CONFLICT (key) DO NOTHING;
COMMENT ON COLUMN progress.best_stars IS 'score_last_attempt_v1';
