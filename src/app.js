require('dotenv').config();
require('express-async-errors'); // lỗi trong route async không làm treo request
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Tự cập nhật cấu trúc DB (thêm cột/bảng mới) trước khi xử lý API
app.use('/api', async (req, res, next) => {
  try { await pool.ensureSchema(); } catch (e) { console.error('ensureSchema:', e.message); }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tts', require('./routes/tts').router);

app.get('/', (req, res) => res.json({ ok: true, service: 'hocvui-backend' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Lỗi máy chủ không xác định' });
});

module.exports = app;
