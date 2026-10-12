const router = require('express').Router();
const pool = require('../db');
const { authMiddleware, requireRole } = require('../auth');
const { classRanking } = require('../rank');
const { studentDetail } = require('../score');

router.use(authMiddleware, requireRole('parent'));

// Liên kết với 1 học sinh bằng join_code của con
// (cả tài khoản ba và tài khoản mẹ đều dùng chung 1 mã này để cùng liên kết tới 1 học sinh)
router.post('/me/link', async (req, res) => {
  const { join_code } = req.body;
  if (!join_code) return res.status(400).json({ error: 'Thiếu mã học sinh' });
  const { rows } = await pool.query('SELECT id, name, avatar FROM students WHERE join_code=$1', [String(join_code).toUpperCase().trim()]);
  const student = rows[0];
  if (!student) return res.status(404).json({ error: 'Mã học sinh không đúng' });
  await pool.query(
    `INSERT INTO parent_student (parent_user_id, student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
    [req.user.id, student.id]
  );
  res.json({ ok: true, student });
});

// Bỏ liên kết với 1 con (nếu nhập nhầm mã)
router.delete('/me/link/:studentId', async (req, res) => {
  await pool.query('DELETE FROM parent_student WHERE parent_user_id=$1 AND student_id=$2', [req.user.id, req.params.studentId]);
  res.json({ ok: true });
});

// Danh sách các con đã liên kết với tài khoản phụ huynh này
router.get('/me/students', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.avatar, s.gender, s.total_points,
            (SELECT MAX(p.updated_at) FROM progress p WHERE p.student_id = s.id) AS last_active
     FROM students s JOIN parent_student ps ON ps.student_id = s.id
     WHERE ps.parent_user_id = $1 ORDER BY s.name`,
    [req.user.id]
  );
  res.json({ students: rows });
});

// Xem chi tiết tiến độ 1 con — chỉ khi đã liên kết (không xem được con của người khác)
router.get('/me/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const link = await pool.query(
    'SELECT 1 FROM parent_student WHERE parent_user_id=$1 AND student_id=$2',
    [req.user.id, studentId]
  );
  if (link.rowCount === 0) return res.status(403).json({ error: 'Bạn chưa liên kết với học sinh này' });

  // progress: kết quả LẦN LÀM CUỐI của từng bài (sao, điểm, số câu đúng, số lần làm)
  // skills: tỉ lệ đúng theo kỹ năng, tính từ lần làm cuối của từng bài
  const d = await studentDetail(studentId);
  if (!d) return res.status(404).json({ error: 'Không tìm thấy học sinh' });
  res.set('Cache-Control', 'private, no-cache');
  res.json(d);
});

// Bảng xếp hạng cả lớp — đánh dấu các con của phụ huynh này
router.get('/me/rank', async (req, res) => {
  const [list, mine] = await Promise.all([
    classRanking(),
    pool.query('SELECT student_id FROM parent_student WHERE parent_user_id=$1', [req.user.id]),
  ]);
  const ids = new Set(mine.rows.map((r) => r.student_id));
  res.json({ students: list.map((r) => ({ ...r, me: ids.has(r.id) })) });
});

module.exports = router;
