const pool = require('./db');

// 10/2026: BỎ tài khoản phụ huynh. Tài khoản phụ huynh cũ được chuyển thành tài khoản HỌC SINH
// (giữ nguyên email, mật khẩu, hạn dùng thử; tên học sinh = tên hiển thị hoặc phần trước @ của email).
// Liên kết phụ huynh–con cũ bị xóa. Bố mẹ xem kết quả của con ở mục "Phụ huynh" trên máy của con.
const CONVERT_SQL = `
  WITH u AS (
    UPDATE users SET role = 'student' WHERE id = $1 AND role = 'parent'
    RETURNING id, COALESCE(NULLIF(TRIM(display_name), ''), split_part(email, '@', 1)) AS nm
  ), del AS (
    DELETE FROM parent_student WHERE parent_user_id IN (SELECT id FROM u)
  )
  INSERT INTO students (user_id, name, join_code)
  SELECT id, LEFT(nm, 16), UPPER(SUBSTR(MD5(random()::text || id::text || clock_timestamp()::text), 1, 8)) FROM u
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id, name, avatar, join_code`;

async function parentToStudent(userId) {
  for (let i = 0; i < 5; i++) {
    try {
      const { rows } = await pool.query(CONVERT_SQL, [userId]);
      return rows[0] || null;
    } catch (e) {
      if (e.code !== '23505') throw e; // trùng join_code (rất hiếm) → thử lại
    }
  }
  throw new Error('Không chuyển được tài khoản phụ huynh');
}

// Tài khoản học sinh tạo thẳng bằng SQL (chỉ có dòng trong users, chưa có hồ sơ trong students)
// → tự tạo hồ sơ, nếu không app không tải được trang chủ và quay lại màn hình đăng nhập.
const PROFILE_SQL = `
  INSERT INTO students (user_id, name, join_code)
  SELECT id, LEFT(COALESCE(NULLIF(TRIM(display_name), ''), split_part(email, '@', 1)), 16),
         UPPER(SUBSTR(MD5(random()::text || id::text || clock_timestamp()::text), 1, 8))
  FROM users WHERE id = $1 AND role = 'student' AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = $1)
  ON CONFLICT (user_id) DO NOTHING`;

async function ensureStudentProfile(userId) {
  for (let i = 0; i < 5; i++) {
    try { await pool.query(PROFILE_SQL, [userId]); return; } catch (e) { if (e.code !== '23505') throw e; }
  }
}

module.exports = { parentToStudent, ensureStudentProfile };
