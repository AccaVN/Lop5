// API mở rộng (10/2026): báo câu sai, quà do bố mẹ đặt, xếp hạng tuần / chăm chỉ.
// Gắn ở /api/x (src/app.js). Tự tạo bảng/cột khi cần — không phải chạy SQL thủ công trên Neon.
const router = require('express').Router();
const pool = require('../db');
const { authMiddleware, requireRole, comparePassword } = require('../auth');

const VN_TODAY = "(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date";
const EXTRA_SQL = `
  CREATE TABLE IF NOT EXISTS question_reports (
    id          SERIAL PRIMARY KEY,
    student_id  INTEGER REFERENCES students(id) ON DELETE CASCADE,
    level_key   TEXT,
    level_name  TEXT,
    grade       INTEGER,
    prompt      TEXT,
    big         TEXT,
    options     JSONB,
    answer      TEXT,
    chosen      TEXT,
    explain     TEXT,
    reason      TEXT,
    note        TEXT,
    resolved    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_question_reports_created ON question_reports (created_at DESC);
  ALTER TABLE student_rewards ADD COLUMN IF NOT EXISTS gifts JSONB;
`;
// Chỉ đọc catalog (không khóa bảng); chỉ chạy EXTRA_SQL khi thật sự thiếu.
const EXTRA_CHECK = `
  SELECT to_regclass('question_reports') IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass('student_rewards') AND attname = 'gifts' AND NOT attisdropped)
     AS ok`;
let ready = null;
function ensureExtra() {
  if (!ready) {
    ready = pool.query(EXTRA_CHECK)
      .then(({ rows }) => (rows[0] && rows[0].ok ? null : pool.query(EXTRA_SQL)))
      .catch((e) => { ready = null; throw e; });
  }
  return ready;
}
router.use(async (req, res, next) => {
  try { await ensureExtra(); } catch (e) { console.error('ensureExtra:', e.message); }
  next();
});

const str = (v, n) => (v == null ? '' : String(v)).slice(0, n);
async function ownStudentId(userId) {
  const { rows } = await pool.query('SELECT id FROM students WHERE user_id=$1', [userId]);
  return rows[0] ? rows[0].id : null;
}

/* ---------- học sinh ---------- */
const student = require('express').Router();
student.use(authMiddleware, requireRole('student'));

// Báo câu hỏi sai / khó hiểu (tối đa 40 báo cáo mỗi ngày cho mỗi học sinh)
student.post('/report', async (req, res) => {
  const sid = await ownStudentId(req.user.id);
  if (!sid) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const { rows: c } = await pool.query(
    `SELECT COUNT(*)::int AS n FROM question_reports WHERE student_id=$1 AND created_at > now() - interval '1 day'`, [sid]);
  if (c[0].n >= 40) return res.status(429).json({ error: 'Hôm nay con đã gửi nhiều báo lỗi rồi. Cảm ơn con!' });
  const b = req.body || {};
  const reason = ['wrong', 'unclear', 'display', 'other'].includes(b.reason) ? b.reason : 'other';
  const options = Array.isArray(b.options) ? b.options.slice(0, 8).map((o) => str(o, 120)) : [];
  const { rows } = await pool.query(
    `INSERT INTO question_reports (student_id, level_key, level_name, grade, prompt, big, options, answer, chosen, explain, reason, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12) RETURNING id`,
    [sid, str(b.level_key, 40), str(b.level_name, 200), Math.max(0, Math.min(12, parseInt(b.grade, 10) || 0)),
      str(b.prompt, 600), str(b.big, 200), JSON.stringify(options), str(b.answer, 200), str(b.chosen, 200),
      str(b.explain, 500), reason, str(b.note, 300)]);
  res.json({ ok: true, id: rows[0].id });
});

// Cổng phụ huynh: kiểm tra mật khẩu đăng nhập của tài khoản (không tạo phiên mới, không đá thiết bị).
// Sai 6 lần liên tiếp thì khóa 10 phút (bảng login_attempts có sẵn).
student.post('/verify-password', async (req, res) => {
  const key = 'pg:' + req.user.id;
  const { rows: lk } = await pool.query('SELECT fails, locked_until FROM login_attempts WHERE key=$1', [key]).catch(() => ({ rows: [] }));
  if (lk[0] && lk[0].locked_until && new Date(lk[0].locked_until) > new Date()) {
    const m = Math.ceil((new Date(lk[0].locked_until) - new Date()) / 60000);
    return res.status(429).json({ error: `Nhập sai nhiều lần. Thử lại sau ${m} phút.` });
  }
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
  const ok = !!rows[0] && (await comparePassword(String((req.body && req.body.password) || ''), rows[0].password_hash));
  if (ok) {
    await pool.query('DELETE FROM login_attempts WHERE key=$1', [key]).catch(() => {});
    return res.json({ ok: true });
  }
  await pool.query(
    `INSERT INTO login_attempts (key, fails, updated_at) VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET fails = login_attempts.fails + 1,
       locked_until = CASE WHEN login_attempts.fails + 1 >= 6 THEN now() + interval '10 minutes' ELSE NULL END,
       updated_at = now()`, [key]).catch(() => {});
  res.status(403).json({ error: 'Mật khẩu chưa đúng.' });
});

// Quà do bố mẹ đặt (đổi bằng xu)
function cleanGifts(g) {
  const out = { list: [], log: [] };
  if (!g || typeof g !== 'object') return out;
  (Array.isArray(g.list) ? g.list : []).slice(0, 12).forEach((x) => {
    const p = Math.round(Number(x && x.p));
    const n = str(x && x.n, 40).trim();
    if (n && p >= 5 && p <= 5000) out.list.push({ id: str(x.id, 20) || Date.now().toString(36), n, i: str(x.i, 8) || '🎁', p });
  });
  (Array.isArray(g.log) ? g.log : []).slice(-30).forEach((x) => {
    const p = Math.round(Number(x && x.p));
    const n = str(x && x.n, 40).trim();
    if (n && p > 0) out.log.push({ n, i: str(x.i, 8), p, d: str(x.d, 10) });
  });
  return out;
}
student.get('/gifts', async (req, res) => {
  const sid = await ownStudentId(req.user.id);
  if (!sid) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const { rows } = await pool.query('SELECT gifts FROM student_rewards WHERE student_id=$1', [sid]);
  res.json({ gifts: cleanGifts(rows[0] && rows[0].gifts) });
});
student.put('/gifts', async (req, res) => {
  const sid = await ownStudentId(req.user.id);
  if (!sid) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const gifts = cleanGifts(req.body && req.body.gifts);
  await pool.query(
    `INSERT INTO student_rewards (student_id, gifts, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (student_id) DO UPDATE SET gifts = $2::jsonb, updated_at = now()`,
    [sid, JSON.stringify(gifts)]);
  res.json({ ok: true, gifts });
});

// Xếp hạng mở rộng: điểm trong tuần (thứ Hai → Chủ nhật, giờ VN), số ngày học trong tháng, chuỗi ngày học
const RANK2_SQL = `
  WITH wk AS (
    SELECT student_id, SUM(points)::int AS week_points
    FROM progress
    WHERE updated_at >= (date_trunc('week', now() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh')
    GROUP BY student_id
  ), mo AS (
    SELECT student_id, COUNT(*)::int AS month_days
    FROM daily_sessions
    WHERE seconds >= 60 AND day >= date_trunc('month', now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    GROUP BY student_id
  ), d AS (
    SELECT student_id, day, day - (ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY day))::int AS grp
    FROM daily_sessions
    WHERE seconds >= 60 AND day >= ${VN_TODAY} - 120
  ), isl AS (
    SELECT student_id, MAX(day) AS last_day, COUNT(*)::int AS n FROM d GROUP BY student_id, grp
  ), st AS (
    SELECT student_id, MAX(n)::int AS streak FROM isl WHERE last_day >= ${VN_TODAY} - 1 GROUP BY student_id
  )
  SELECT s.id, s.name, s.avatar, s.total_points,
         COALESCE(wk.week_points, 0)::int AS week_points,
         COALESCE(mo.month_days, 0)::int AS month_days,
         COALESCE(st.streak, 0)::int AS streak
  FROM students s
  JOIN users u ON u.id = s.user_id
  LEFT JOIN wk ON wk.student_id = s.id
  LEFT JOIN mo ON mo.student_id = s.id
  LEFT JOIN st ON st.student_id = s.id`;
student.get('/rank2', async (req, res) => {
  const sid = await ownStudentId(req.user.id);
  const { rows } = await pool.query(RANK2_SQL);
  res.json({ students: rows.map((r) => ({ ...r, total_points: Number(r.total_points) || 0, me: r.id === sid })) });
});

/* ---------- admin ---------- */
const admin = require('express').Router();
admin.use(authMiddleware, requireRole('admin'));
admin.get('/reports', async (req, res) => {
  const all = req.query.all === '1';
  const { rows } = await pool.query(
    `SELECT q.*, s.name AS student_name FROM question_reports q LEFT JOIN students s ON s.id = q.student_id
     ${all ? '' : 'WHERE NOT q.resolved'} ORDER BY q.created_at DESC LIMIT 300`);
  res.json({ reports: rows });
});
admin.put('/reports/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Mã báo lỗi không hợp lệ' });
  await pool.query('UPDATE question_reports SET resolved=$2 WHERE id=$1', [id, !!(req.body && req.body.resolved)]);
  res.json({ ok: true });
});
admin.delete('/reports/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Mã báo lỗi không hợp lệ' });
  await pool.query('DELETE FROM question_reports WHERE id=$1', [id]);
  res.json({ ok: true });
});

router.use('/student', student);
router.use('/admin', admin);
module.exports = router;
