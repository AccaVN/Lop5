-- Chạy 1 lần trên Neon cho database đang tồn tại.
ALTER TABLE students ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;

-- Dữ liệu cũ: quy đổi số sao đã đạt thành điểm nền (10 điểm / sao).
UPDATE students s
SET total_points = COALESCE(x.points, 0)
FROM (
  SELECT student_id, SUM(stars)::int * 10 AS points
  FROM progress
  GROUP BY student_id
) x
WHERE x.student_id = s.id
  AND COALESCE(s.total_points, 0) = 0;
