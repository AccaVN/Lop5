const pool = require('./db');

// Gom sao/số bài theo học sinh TRƯỚC rồi mới JOIN (dùng index idx_progress_student_stars,
// không phải GROUP BY trên toàn bộ bảng students × progress).
const RANK_SQL = `
  WITH agg AS (
    SELECT student_id,
           SUM(stars)::int AS total_stars,
           COUNT(*) FILTER (WHERE stars > 0)::int AS completed_levels
    FROM progress
    GROUP BY student_id
  )
  SELECT s.id, s.name, s.avatar, s.gender, s.total_points,
         COALESCE(a.total_stars, 0)::int AS total_stars,
         COALESCE(a.completed_levels, 0)::int AS completed_levels
  FROM students s
  LEFT JOIN agg a ON a.student_id = s.id
`;
const RANK_ORDER = `ORDER BY total_points DESC, total_stars DESC, completed_levels DESC, name`;

// Bảng xếp hạng cả lớp: điểm tích lũy → tổng sao → số bài đã hoàn thành → tên
async function classRanking() {
  const { rows } = await pool.query(`${RANK_SQL} ${RANK_ORDER}`);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

// Bảng xếp hạng + đánh dấu học sinh của userId — chỉ MỘT round-trip tới Neon.
async function rankingForUser(userId) {
  const { rows } = await pool.query(
    `WITH me AS (SELECT id FROM students WHERE user_id = $1),
     board AS (${RANK_SQL})
     SELECT b.*, (SELECT id FROM me) AS me_id FROM board b ${RANK_ORDER}`,
    [userId]
  );
  const meId = rows.length ? rows[0].me_id : null;
  const list = rows.map(({ me_id, ...r }, i) => ({ ...r, rank: i + 1, me: r.id === meId }));
  return { meId, list };
}

module.exports = { classRanking, rankingForUser };
