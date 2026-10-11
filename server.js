// Chỉ dùng khi chạy ở máy local (npm start / npm run dev).
// Trên Vercel, api/index.js export thẳng app — Vercel tự quản lý việc lắng nghe request.
require('dotenv').config();
const path = require('path');
const express = require('express');
const app = require('./src/app');

// Local: phục vụ luôn giao diện trong public/ (trên Vercel do vercel.json lo)
const pub = path.join(__dirname, 'public');
const root = express();
root.use(express.static(pub));
root.use(app);
root.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(pub, 'index.html')));

const PORT = process.env.PORT || 4000;
root.listen(PORT, () => console.log(`hocvui-backend đang chạy ở cổng ${PORT} (local)`));
