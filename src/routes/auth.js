const router = require('express').Router();
const pool = require('../db');
const { TRIAL_MSG, hashPassword, comparePassword, newSessionId, signToken, authMiddleware } = require('../auth');

// Tự đăng ký tài khoản học sinh / phụ huynh (admin vẫn chỉ tạo qua script hoặc SQL).
async function createAccount(req, res, role) {
  const { email, password, name } = req.body || {};
  const mail = String(email || '').toLowerCase().trim();
  if (!mail || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
  if (!/^\S+@\S+$/.test(mail)) return res.status(400).json({ error: 'Email không hợp lệ' });
  if (String(password).length < 4) return res.status(400).json({ error: 'Mật khẩu cần ít nhất 4 ký tự' });
  const sname = String(name || '').trim().slice(0, 16);
  if (role === 'student' && !sname) return res.status(400).json({ error: 'Nhập tên của con nhé' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sid = newSessionId();
    const hash = await hashPassword(String(password));
    const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().slice(0, 60);
    const device = String(req.headers['user-agent'] || '').slice(0, 300);
    const { rows } = await client.query(
      'INSERT INTO users(email,password_hash,role,session_id,last_login_at,last_login_ip,last_login_device,trial_expires_at) VALUES($1,$2,$3,$4,now(),$5,$6,now() + interval \'5 days\') RETURNING id,email,role,display_name,trial_expires_at',
      [mail, hash, role, sid, ip || null, device || null]);
    const user = rows[0];
    let student = null;
    if (role === 'student') {
      const crypto = require('crypto');
      let joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      for (let i = 0; i < 10; i++) {
        const q = await client.query('SELECT 1 FROM students WHERE join_code=$1', [joinCode]);
        if (!q.rowCount) break;
        joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      }
      const r = await client.query('INSERT INTO students(user_id,name,join_code) VALUES($1,$2,$3) RETURNING id,name,avatar,join_code', [user.id, sname, joinCode]);
      student = r.rows[0];
    }
    await client.query('COMMIT');
    const out = { user, token: signToken(user, sid) };
    if (student) out.student = student;
    res.status(201).json(out);
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === '23505') return res.status(409).json({ error: 'Email này đã được sử dụng' });
    throw e;
  } finally { client.release(); }
}
router.post('/register/student', (req, res) => createAccount(req, res, 'student'));
// Không còn đăng ký tài khoản phụ huynh (10/2026) — mọi đăng ký đều là học sinh
router.post('/register/parent', (req, res) => res.status(410).json({ error: 'Không còn tài khoản phụ huynh. Bố mẹ xem kết quả ở mục "Phụ huynh" trên máy của con.' }));
router.post('/register', (req, res) => createAccount(req, res, 'student'));

// ---- Chống dò mật khẩu: sai 5 lần liên tiếp với 1 tài khoản → khóa 15 phút;
// 1 địa chỉ IP sai 30 lần (nhiều tài khoản) → khóa IP đó 15 phút. Admin đặt lại mật khẩu thì mở khóa.
const LOCK = { email: 5, ip: 30, minutes: 15 };
async function lockedMinutes(keys) {
  const { rows } = await pool.query(
    `SELECT CEIL(EXTRACT(EPOCH FROM MAX(locked_until) - now()) / 60)::int AS m
     FROM login_attempts WHERE key = ANY($1) AND locked_until > now()`, [keys]);
  return rows[0] && rows[0].m > 0 ? rows[0].m : 0;
}
async function recordFail(key, max) {
  const { rows } = await pool.query(
    `INSERT INTO login_attempts (key, fails, updated_at) VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET
       fails = CASE WHEN login_attempts.updated_at < now() - make_interval(mins => $2)
                      OR login_attempts.locked_until IS NOT NULL THEN 1 ELSE login_attempts.fails + 1 END,
       locked_until = NULL, updated_at = now()
     RETURNING fails`, [key, LOCK.minutes]);
  const fails = rows[0].fails;
  if (fails >= max) await pool.query(`UPDATE login_attempts SET locked_until = now() + make_interval(mins => $2) WHERE key = $1`, [key, LOCK.minutes]);
  return fails;
}
const lockMsg = (m) => `Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${m} phút hoặc nhờ admin đặt lại mật khẩu.`;

// Đăng nhập chung cho cả admin / phụ huynh / học sinh
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });
  const mail = String(email).toLowerCase().trim();
  const reqIp = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().slice(0, 60) || 'unknown';
  const keys = ['e:' + mail, 'ip:' + reqIp];
  const wait = await lockedMinutes(keys);
  if (wait) return res.status(429).json({ error: lockMsg(wait), code: 'LOCKED' });
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [mail]);
  const user = rows[0];
  if (!user || !(await comparePassword(String(password), user.password_hash))) {
    const [fe] = await Promise.all([recordFail(keys[0], LOCK.email), recordFail(keys[1], LOCK.ip)]);
    if (fe >= LOCK.email) return res.status(429).json({ error: lockMsg(LOCK.minutes), code: 'LOCKED' });
    const left = LOCK.email - fe;
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' + (left <= 2 ? ` (còn ${left} lần thử trước khi bị khóa ${LOCK.minutes} phút)` : '') });
  }
  await pool.query('DELETE FROM login_attempts WHERE key = $1', [keys[0]]);
  // Tài khoản phụ huynh cũ → chuyển thành tài khoản học sinh ngay khi đăng nhập
  let converted = null;
  if (user.role === 'parent') {
    converted = await require('../convert').parentToStudent(user.id);
    user.role = 'student';
  } else if (user.role === 'student') {
    await require('../convert').ensureStudentProfile(user.id);
  }
  if (user.role !== 'admin' && user.trial_expires_at && new Date(user.trial_expires_at) < new Date()) {
    return res.status(403).json({ error: TRIAL_MSG, code: 'TRIAL_EXPIRED' });
  }
  // Học sinh: tạo phiên mới → thiết bị đang đăng nhập trước đó (nếu có) bị đá ra ở request kế tiếp.
  // Admin: được đăng nhập nhiều máy cùng lúc → dùng lại phiên hiện có (chỉ tạo mới nếu chưa có).
  const sid = (user.role === 'admin' && user.session_id) ? user.session_id : newSessionId();
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().slice(0, 60);
  const device = String(req.headers['user-agent'] || '').slice(0, 300);
  await pool.query(
    'UPDATE users SET session_id=$1, last_login_at=now(), last_login_ip=$2, last_login_device=$3 WHERE id=$4',
    [sid, ip || null, device || null, user.id]);
  res.json({ user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name || null, trial_expires_at: user.trial_expires_at || null }, token: signToken(user, sid), ...(converted ? { student: converted, converted: true } : {}) });
});

// Đăng xuất: hủy phiên hiện tại trên máy chủ
router.post('/logout', authMiddleware, async (req, res) => {
  // Admin đăng xuất 1 máy không làm văng các máy admin khác
  if (req.user.role === 'admin') return res.json({ ok: true });
  await pool.query('UPDATE users SET session_id=NULL WHERE id=$1 AND session_id=$2', [req.user.id, req.user.sid]);
  res.json({ ok: true });
});

router.get('/me', authMiddleware, async (req, res) => {
  const { rows } = await pool.query('SELECT id, email, role, display_name, trial_expires_at FROM users WHERE id=$1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Tài khoản không còn tồn tại' });
  res.json({ user: rows[0] });
});

// Mọi tài khoản tự đổi tên hiển thị / mật khẩu của chính mình.
// Đổi mật khẩu phải nhập đúng mật khẩu hiện tại.
router.put('/me', authMiddleware, async (req, res) => {
  const { name, current_password, new_password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'Tài khoản không còn tồn tại' });
  if (new_password) {
    if (String(new_password).length < 4) return res.status(400).json({ error: 'Mật khẩu mới cần ít nhất 4 ký tự' });
    if (!current_password || !(await comparePassword(String(current_password), user.password_hash))) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại chưa đúng' });
    }
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await hashPassword(String(new_password)), user.id]);
  }
  if (typeof name === 'string') {
    const n = name.trim().slice(0, 40);
    if (user.role === 'student') {
      if (!n) return res.status(400).json({ error: 'Tên không được để trống' });
      await pool.query('UPDATE students SET name=$1 WHERE user_id=$2', [n, user.id]);
    } else {
      await pool.query('UPDATE users SET display_name=$1 WHERE id=$2', [n || null, user.id]);
    }
  }
  res.json({ ok: true });
});

module.exports = router;
