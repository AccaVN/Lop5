-- Tối ưu các truy vấn mới /student/me/home và BXH.
-- PK của progress/daily_sessions/skill_stats đã bao phủ truy vấn theo student_id,
-- nên chỉ thêm index thực sự hữu ích cho thứ tự điểm của BXH.
CREATE INDEX IF NOT EXISTS idx_students_total_points
  ON students (total_points DESC, id);

-- Hỗ trợ tổng hợp BXH theo học sinh mà không cần đọc các cột khác của progress.
CREATE INDEX IF NOT EXISTS idx_progress_student_stars
  ON progress (student_id, stars);
