const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const SECRET = process.env.JWT_SECRET;
const TRIAL_MSG = 'Tài khoản dùng thử đã hết 3 ngày. Liên hệ admin để được hỗ trợ chuyển sang tài khoản chính thức. Admin: email nguyenanhlac93@gmail.com · SĐT/Zalo 0901.01.09.93';

function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}

function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

function newSessionId() {
  return crypto.randomUUID();
}

// sid = mã phiên đăng nhập. Mỗi lần đăng nhập tạo sid mới và lưu vào users.session_id,
// nên token của thiết bị cũ (mang sid cũ) sẽ bị từ chối → 1 tài khoản chỉ dùng được trên 1 thiết bị.
function signToken(user, sid) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email, sid }, SECRET, { expiresIn: '30d' });
}

// Bắt buộc phải có Bearer token hợp lệ VÀ đúng phiên đăng nhập hiện tại của tài khoản
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Thiếu token đăng nhập' });
  }
  let payload;
  try {
    payload = jwt.verify(header.slice(7), SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
  try {
    const { rows } = await pool.query('SELECT session_id, last_login_at, last_login_device, role, (trial_expires_at IS NOT NULL AND trial_expires_at < now()) AS trial_expired FROM users WHERE id=$1', [payload.id]);
    if (!rows[0]) return res.status(401).json({ error: 'Tài khoản không còn tồn tại' });
    if (rows[0].trial_expired && rows[0].role !== 'admin') {
      return res.status(401).json({ error: TRIAL_MSG, code: 'TRIAL_EXPIRED' });
    }
    if (!payload.sid || rows[0].session_id !== payload.sid) {
      return res.status(401).json({
        error: 'Tài khoản đã đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại.',
        code: 'SESSION_REPLACED',
        // Cho biết thiết bị nào vừa đăng nhập (null nếu phiên đã bị đăng xuất / admin đặt lại mật khẩu)
        other: rows[0].session_id ? { at: rows[0].last_login_at, device: rows[0].last_login_device } : null,
      });
    }
  } catch (e) {
    return next(e);
  }
  req.user = payload;
  next();
}

// Chỉ cho phép một số role nhất định (dùng sau authMiddleware)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Tài khoản không có quyền truy cập mục này' });
    }
    next();
  };
}

module.exports = { TRIAL_MSG, hashPassword, comparePassword, newSessionId, signToken, authMiddleware, requireRole };
