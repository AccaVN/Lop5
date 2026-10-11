// Vercel gom mọi request (theo vercel.json) vào đây. Express app tự xử lý
// routing bên trong dựa trên req.url đầy đủ (/api/auth/login, /api/student/me...).
module.exports = require('../src/app');
