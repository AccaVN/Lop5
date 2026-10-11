// Cách dùng: node scripts/create-admin.js admin@example.com mat_khau_manh
require('dotenv').config();
const pool = require('../src/db');
const { hashPassword } = require('../src/auth');

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.log('Cách dùng: node scripts/create-admin.js <email> <mật_khẩu>');
    process.exit(1);
  }
  const hash = await hashPassword(password);
  await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = 'admin'`,
    [email.toLowerCase().trim(), hash]
  );
  console.log('Đã tạo tài khoản admin:', email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
