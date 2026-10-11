const router = require('express').Router();
const pool = require('../db');
const { authMiddleware, requireRole, hashPassword } = require('../auth');

router.use(authMiddleware, requireRole('admin'));

// Danh sách toàn bộ học sinh kèm tổng sao — dùng cho bảng so sánh toàn lớp
router.get('/students', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT s.id, s.name, s.avatar, s.gender, s.join_code, u.email, s.created_at, s.total_points,
           COALESCE(SUM(p.stars), 0)::int AS total_stars,
           COUNT(p.level_key) FILTER (WHERE p.stars > 0)::int AS completed_levels
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN progress p ON p.student_id = s.id
    GROUP BY s.id, u.email
    ORDER BY s.total_points DESC, total_stars DESC, completed_levels DESC, s.name
  `);
  res.json({ students: rows });
});

router.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const [student, progress, skills, sessions, parents, rewards] = await Promise.all([
    pool.query('SELECT s.*, u.email FROM students s JOIN users u ON u.id = s.user_id WHERE s.id=$1', [id]),
    pool.query('SELECT level_key, stars FROM progress WHERE student_id=$1 ORDER BY level_key', [id]),
    pool.query('SELECT skill_key, correct, total FROM skill_stats WHERE student_id=$1', [id]),
    pool.query('SELECT day, seconds FROM daily_sessions WHERE student_id=$1 ORDER BY day DESC LIMIT 30', [id]),
    pool.query(`SELECT u.id, u.email, u.display_name FROM users u JOIN parent_student ps ON ps.parent_user_id = u.id WHERE ps.student_id=$1`, [id]),
    pool.query('SELECT stickers, shop, coins, en_stickers FROM student_rewards WHERE student_id=$1', [id]),
  ]);
  if (!student.rows[0]) return res.status(404).json({ error: 'Không tìm thấy học sinh' });
  res.json({ student: student.rows[0], progress: progress.rows, skills: skills.rows, sessions: sessions.rows, parents: parents.rows, rewards: rewards.rows[0] || {stickers: [], shop: [], coins: 0, en_stickers: []} });
});

router.get('/parents', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT u.id, u.email, u.display_name, u.created_at, COUNT(ps.student_id)::int AS so_con
    FROM users u LEFT JOIN parent_student ps ON ps.parent_user_id = u.id
    WHERE u.role = 'parent' GROUP BY u.id ORDER BY u.email
  `);
  res.json({ parents: rows });
});

// Quản lý tài khoản: admin được thêm/sửa/xóa học sinh và phụ huynh.
router.get('/users', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT u.id, u.email, u.role, u.created_at, u.display_name, u.trial_expires_at,
           (u.session_id IS NOT NULL) AS online, u.last_login_at, u.last_login_ip, u.last_login_device,
           COALESCE(s.name, u.display_name) AS name, s.gender, s.avatar, s.id AS student_id
    FROM users u LEFT JOIN students s ON s.user_id=u.id
    ORDER BY CASE u.role WHEN 'admin' THEN 0 WHEN 'parent' THEN 1 ELSE 2 END, COALESCE(s.name, u.display_name, u.email)
  `);
  res.json({ users: rows });
});

// Số ngày dùng thử hợp lệ (1–3650); bỏ trống / 0 = không đặt (tài khoản chính thức)
function parseTrialDays(v) {
  if (v == null || v === '' || Number(v) === 0) return 0;
  const d = Number(v);
  if (!Number.isInteger(d) || d < 1 || d > 3650) throw Object.assign(new Error('Số ngày dùng thử phải từ 1 đến 3650'), { status: 400 });
  return d;
}

router.post('/users', async (req, res) => {
  const { email, password, role, name, gender, avatar, trial_days } = req.body;
  if (!email || !password || !['student','parent','admin'].includes(role)) return res.status(400).json({ error: 'Email, mật khẩu và loại tài khoản là bắt buộc' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await hashPassword(password);
    if (String(password).length < 4) throw Object.assign(new Error('Mật khẩu cần ít nhất 4 ký tự'), { status: 400 });
    const { rows } = await client.query('INSERT INTO users(email,password_hash,role,display_name) VALUES($1,$2,$3,$4) RETURNING id,email,role,created_at', [email.toLowerCase().trim(), hash, role, role !== 'student' && name ? String(name).trim().slice(0, 40) : null]);
    const user = rows[0];
    const td = parseTrialDays(trial_days);
    if (td && role !== 'admin') await client.query('UPDATE users SET trial_expires_at = now() + make_interval(days => $1) WHERE id=$2', [td, user.id]);
    if (role === 'student') {
      if (!name || !name.trim()) throw Object.assign(new Error('Tên học sinh là bắt buộc'), { status: 400 });
      const crypto = require('crypto');
      let joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      for (let i=0;i<10;i++) { const q=await client.query('SELECT 1 FROM students WHERE join_code=$1',[joinCode]); if(!q.rowCount) break; joinCode=crypto.randomBytes(4).toString('hex').toUpperCase(); }
      await client.query('INSERT INTO students(user_id,name,avatar,gender,join_code) VALUES($1,$2,$3,$4,$5)', [user.id,name.trim(),avatar||'🦊',gender||'both',joinCode]);
    }
    await client.query('COMMIT');
    res.status(201).json({ user });
  } catch(e) {
    await client.query('ROLLBACK');
    if (e.code === '23505') return res.status(409).json({ error: 'Email này đã được sử dụng' });
    res.status(e.status || 500).json({ error: e.message || 'Lỗi máy chủ' });
  } finally { client.release(); }
});

// Sửa tài khoản: đổi tên, email, mật khẩu cho MỌI tài khoản (kể cả admin).
// Học sinh: tên nằm ở bảng students. Admin/phụ huynh: tên hiển thị ở users.display_name.
router.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const { email, password, name, gender, avatar, make_official, trial_days } = req.body;
  if (password != null && password !== '' && String(password).length < 4) return res.status(400).json({ error: 'Mật khẩu cần ít nhất 4 ký tự' });
  if (email != null && email !== '' && !/^\S+@\S+$/.test(String(email).trim())) return res.status(400).json({ error: 'Email không hợp lệ' });
  if (name != null && typeof name === 'string' && name.trim().length > 40) return res.status(400).json({ error: 'Tên tối đa 40 ký tự' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const u = await client.query('SELECT id, role FROM users WHERE id=$1', [id]);
    if (!u.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Không tìm thấy tài khoản' }); }
    const role = u.rows[0].role;
    // Admin chuyển chính thức (bất cứ lúc nào) hoặc đặt/đổi hạn dùng thử = N ngày kể từ hôm nay
    if (make_official) {
      await client.query('UPDATE users SET trial_expires_at=NULL WHERE id=$1', [id]);
    } else if (trial_days != null) {
      const td = parseTrialDays(trial_days);
      if (!td) throw Object.assign(new Error('Hãy nhập số ngày dùng thử'), { status: 400 });
      if (role === 'admin') throw Object.assign(new Error('Không đặt dùng thử cho tài khoản admin'), { status: 400 });
      await client.query('UPDATE users SET trial_expires_at = now() + make_interval(days => $1) WHERE id=$2', [td, id]);
    }
    if (email) await client.query('UPDATE users SET email=$1 WHERE id=$2', [String(email).toLowerCase().trim(), id]);
    // Admin đặt lại mật khẩu → đăng xuất tài khoản đó khỏi thiết bị đang dùng (trừ khi admin tự sửa chính mình)
    if (password) await client.query(
      'UPDATE users SET password_hash=$1, session_id = CASE WHEN id=$3 THEN session_id ELSE NULL END WHERE id=$2',
      [await hashPassword(String(password)), id, req.user.id]);
    if (role === 'student') {
      if (typeof name === 'string' && !name.trim()) throw Object.assign(new Error('Tên học sinh không được để trống'), { status: 400 });
      await client.query('UPDATE students SET name=COALESCE($1,name), gender=COALESCE($2,gender), avatar=COALESCE($3,avatar) WHERE user_id=$4',
        [typeof name === 'string' ? name.trim() : null, gender || null, avatar || null, id]);
    } else if (typeof name === 'string') {
      await client.query('UPDATE users SET display_name=$1 WHERE id=$2', [name.trim() || null, id]);
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === '23505') return res.status(409).json({ error: 'Email này đã được sử dụng' });
    res.status(e.status || 500).json({ error: e.status ? e.message : 'Lỗi máy chủ' });
  } finally { client.release(); }
});

// Xóa tài khoản. Admin chỉ xóa được khi hệ thống còn từ 2 admin trở lên (luôn giữ lại ít nhất 1 admin).
router.delete('/users/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(7001)'); // tránh 2 admin cùng xóa nhau một lúc
    const u = await client.query('SELECT id, role FROM users WHERE id=$1', [req.params.id]);
    if (!u.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Không tìm thấy tài khoản' }); }
    if (u.rows[0].role === 'admin') {
      const c = await client.query("SELECT count(*)::int AS n FROM users WHERE role='admin'");
      if (c.rows[0].n < 2) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Chỉ xóa được tài khoản admin khi có từ 2 admin trở lên' }); }
    }
    const r = await client.query('DELETE FROM users WHERE id=$1 RETURNING id,email,role', [req.params.id]);
    await client.query('COMMIT');
    res.json({ ok: true, user: r.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
});

// Giọng đọc chuẩn (nữ + nam) cho toàn bộ học sinh
router.put('/settings/voices', async (req, res) => {
  const { normalizeConfig } = require('../tts/voices');
  const config = normalizeConfig(req.body);
  await pool.query(`INSERT INTO app_settings(key,value,updated_at) VALUES('voices',$1::jsonb,now())
    ON CONFLICT(key) DO UPDATE SET value=$1::jsonb, updated_at=now()`, [JSON.stringify(config)]);
  res.json({ ok: true, config });
});

module.exports = router;
