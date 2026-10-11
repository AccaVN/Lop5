# Học Vui Lớp 5 — 1 repo, 1 project Vercel (Neon)

Bản lớp 5 của app Học Vui, dựng từ khung **Học Vui Lớp 3** (giữ nguyên toàn bộ tính năng: tài khoản học sinh/phụ huynh/admin,
đăng nhập 1 thiết bị, giọng đọc, sticker, cửa hàng, bảng xếp hạng, luyện đề, luyện nói, mini game…), nội dung viết mới
theo SGK lớp 5 bộ **Chân trời sáng tạo**. Xem mục *Nội dung lớp 5* ở cuối file.

> Lớp 5 dùng **database Neon riêng** và **project Vercel riêng** (không dùng chung với lớp 3).

Toàn bộ app (frontend + backend) nằm trong **1 thư mục duy nhất**, deploy bằng **1 project
Vercel duy nhất** — Vercel tự nhận diện: các file trong `public/` là trang web tĩnh, các file
trong `api/` là backend (serverless function). Không cần 2 project, không cần cấu hình CORS
thủ công vì frontend và backend chung 1 domain.

```
lop5hocvui/
├── public/
│   ├── index.html        ← app (giao diện + toàn bộ logic học tập)
│   └── voice-data.json    ← dữ liệu âm thanh (tải nền, tách riêng cho nhẹ trang)
├── api/
│   └── index.js           ← cửa vào cho toàn bộ API (Vercel gọi file này)
├── src/                   ← code backend thật (routes, db, auth...)
├── schema.sql              ← chạy 1 lần trên Neon để tạo bảng
├── scripts/create-admin.js
├── server.js               ← chỉ dùng khi chạy thử ở máy local
└── vercel.json              ← nói cho Vercel biết cái nào là web, cái nào là API
```

## 1. Tạo database trên Neon

1. Tạo project mới tại https://neon.tech
2. Vào **SQL Editor**, dán toàn bộ nội dung `schema.sql` và chạy 1 lần.
3. Vào **Connection Details**, copy connection string dạng **pooled connection**
   (`...-pooler...neon.tech...`) — dùng cho `DATABASE_URL` ở bước sau.

## 2. Đẩy lên GitHub (1 repo duy nhất)

Từ thư mục `lop5hocvui` này:
```bash
git init
git add .
git commit -m "init"
git remote add origin <link repo GitHub bạn tạo>
git push -u origin main
```

## 3. Deploy lên Vercel

1. Vào https://vercel.com, đăng nhập bằng GitHub.
2. **Add New > Project**, chọn repo vừa đẩy lên. Vercel tự đọc `vercel.json`, không cần
   chỉnh Build Command hay Output Directory gì cả.
3. Thêm biến môi trường (**Environment Variables**):
   - `DATABASE_URL` = chuỗi pooled connection từ Neon (bước 1)
   - `JWT_SECRET` = chuỗi ngẫu nhiên dài (tạo bằng `openssl rand -hex 32`, hoặc dùng trang
     randomkeygen.com nếu không có terminal)
4. Bấm **Deploy**. Xong sẽ có 1 URL duy nhất, ví dụ `https://hocvuilop5.vercel.app`
   — mở URL đó là vào thẳng app, API cũng nằm sẵn dưới `/api/...` trên cùng URL này.

Từ giờ, mỗi lần sửa gì (frontend hay backend) chỉ cần `git push` — Vercel tự deploy lại
đúng phần đã đổi.

**Không cần sửa `API_BASE` trong `public/index.html`** — đã để sẵn `/api` (đường dẫn tương
đối), tự động trỏ đúng vào backend vì cùng domain.

## 4. Tạo tài khoản admin đầu tiên

Không có route tự đăng ký admin (tránh ai đó tự tạo quyền admin qua API công khai).

**Cách nhanh nhất — chèn thẳng qua Neon SQL Editor** (không cần cài gì):
```sql
INSERT INTO users (email, password_hash, role)
VALUES ('admin@cafehonghoa.vn', '<bcrypt_hash_mật_khẩu>', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin';
```
(Nhắn lại nếu muốn mình tạo sẵn 1 hash bcrypt cho mật khẩu cụ thể.)

**Hoặc chạy script** từ máy có Node, trỏ `DATABASE_URL` vào Neon:
```bash
DATABASE_URL="postgres://..." node scripts/create-admin.js admin@cafe.vn mat_khau_manh
```

## 5. Luồng nghiệp vụ

- **Học sinh** tự đăng ký (`/api/auth/register/student`) → hệ thống tạo hồ sơ `students`
  kèm `join_code` (mã 8 ký tự, hiện cho phụ huynh xem trong "Góc phụ huynh" trên app).
- **Phụ huynh** đăng ký (`/api/auth/register/parent`) rồi gọi `/api/parent/me/link`
  với `join_code` của con để liên kết. Ba và mẹ dùng **chung 1 mã** → cả 2 tài khoản
  đều liên kết được với cùng 1 học sinh (bảng `parent_student` là nhiều-nhiều).
- **Phụ huynh** chỉ xem được con đã liên kết (kiểm tra qua bảng `parent_student` ở mọi
  route `/api/parent/me/students/:id`) — không xem được con của phụ huynh khác.
- **Admin** xem được toàn bộ học sinh và phụ huynh qua `/api/admin/*`.

## 6. API tóm tắt

| Method | Endpoint | Ai gọi | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register/parent` | công khai | Đăng ký phụ huynh |
| POST | `/api/auth/register/student` | công khai | Đăng ký học sinh (trả về `join_code`) |
| POST | `/api/auth/login` | công khai | Đăng nhập, trả JWT |
| GET | `/api/auth/me` | đã đăng nhập | Thông tin token hiện tại |
| GET | `/api/student/me` | học sinh | Toàn bộ tiến độ/kỹ năng/phiên học của bản thân |
| PUT | `/api/student/me/profile` | học sinh | Cập nhật tên/nhân vật/giới tính |
| PUT | `/api/student/me/progress` | học sinh | Lưu số sao 1 bài `{level_key, stars}` |
| POST | `/api/student/me/skill` | học sinh | Cộng dồn đúng/sai theo kỹ năng |
| POST | `/api/student/me/session` | học sinh | Cộng dồn thời gian học trong ngày (giây) |
| POST | `/api/parent/me/link` | phụ huynh | Liên kết con bằng `join_code` |
| GET | `/api/parent/me/students` | phụ huynh | Danh sách con đã liên kết |
| GET | `/api/parent/me/students/:id` | phụ huynh | Chi tiết tiến độ 1 con (chỉ con đã liên kết) |
| GET | `/api/admin/students` | admin | Toàn bộ học sinh + tổng sao |
| GET | `/api/admin/students/:id` | admin | Chi tiết 1 học sinh + danh sách phụ huynh |
| GET | `/api/admin/parents` | admin | Toàn bộ phụ huynh + số con |

Mọi route trừ `register`/`login` cần header: `Authorization: Bearer <token>`.

## 7. Chạy thử ở máy local (tuỳ chọn)

Chỉ test riêng backend:
```bash
npm install
DATABASE_URL="..." JWT_SECRET="..." npm start
```
rồi mở `public/index.html` trực tiếp trong trình duyệt và sửa tạm `API_BASE` thành
`http://localhost:4000/api` (đổi lại `/api` trước khi đẩy lên Vercel).

Muốn giả lập đúng như Vercel thật (frontend + API cùng domain) thì dùng:
```bash
npm install -g vercel
vercel dev
```

## Cập nhật: sticker ảnh, sửa tài khoản, giọng đọc chuẩn, bảng xếp hạng lớp

**Không cần chạy SQL thủ công** — khi deploy, backend tự thêm cột/bảng mới (`src/db.js` → `ensureSchema`):
`users.display_name`, `student_rewards.en_stickers`, bảng `app_settings`. (File `migrations/004_accounts_rewards_voice.sql`
là bản chạy tay nếu muốn, có kèm lệnh bù sticker Xe cộ cũ.)

- **Sticker**: ảnh nằm trong `public/stickers/{nhan-vat,xe-co,cua-hang}/*.webp`. Món nào chưa có ảnh vẫn hiển thị emoji
  theo kiểu sticker cắt dán viền trắng.
- **Sticker Xe cộ** giờ được lưu vào database (`student_rewards.en_stickers`), và tự bù lại từ các bài English đã đạt sao.
- **Tài khoản**: Quản trị → Tài khoản → *Sửa* để đổi tên / email / đặt mật khẩu mới cho mọi tài khoản (kể cả admin).
  Mọi người cũng tự đổi được mật khẩu của mình (API `PUT /api/auth/me`).
- **Giọng đọc**: `GET /api/tts?v=<giọng>&t=<câu>` trả về mp3, CDN Vercel lưu 1 năm. Admin chọn 1 giọng nữ + 1 giọng nam
  ở Quản trị → Giọng đọc; học sinh chọn *Giọng cô* / *Giọng thầy*. Mất mạng → tự dùng giọng thiết bị / giọng thu sẵn.
  Biến môi trường tùy chọn: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `GOOGLE_TTS_API_KEY` (xem `.env.example`).
- **Bảng xếp hạng cả lớp**: tab Thành tích → Hạng (học sinh), Góc phụ huynh, và Quản trị. Đã xóa tính năng "Thu mã điểm".

Chạy thử ở máy: `npm install` → tạo `.env` (DATABASE_URL, JWT_SECRET) → `npm start` → mở http://localhost:4000

## Cập nhật 09/2026 — Luyện đề, Luyện nói, Khỉ nhảy đảo

- **📝 Luyện đề thi học kì** (nút ở đầu mỗi bản đồ):
  - Toán: 10 đề theo ma trận đề cuối HK2 (đọc/viết số đến 100 000, giá trị chữ số, làm tròn, số La Mã,
    chu vi – diện tích, đồng hồ, lịch, tiền, so sánh đơn vị đo, bảng số liệu, khả năng xảy ra, Đúng/Sai,
    đặt tính 4 phép tính, biểu thức, tìm thành phần, toán lời văn 2 bước, chia có dư) + 3 đề nâng cao.
    Mỗi lần làm lại, số liệu thay đổi.
  - Tiếng Việt: 10 đề (bài đọc hiểu phỏng theo chủ đề đề thi + luyện từ và câu, dấu câu, so sánh, ch/tr…).
  - English: 8 bài kiểm tra theo nhóm Unit (Listen, Look and choose, Odd one out, Complete the word,
    Choose the correct word/answer, Order, Read – True/False).
  - Chấm điểm thang 10, thưởng điểm khi làm nhanh (như luyenthi123). Kết quả lưu vào `progress` với
    `level_key = exam_<môn>_<số đề>`.
- **📒 Từ vựng** mỗi Unit (kiểu iSmart): nghe từ, gõ lại từ để nhớ mặt chữ, câu ví dụ, ghi âm đọc từ/câu
  và chấm 1–5 sao, xem lại *Record history*.
- **🗣️ Luyện nói (Communication)** mỗi Unit + bài *Daily routines & Time* giống Handouts MP2U1R:
  tranh + đồng hồ + câu mẫu, con tự nói, app ghi âm và chấm sao (nhận dạng giọng nói của Chrome/Edge/Safari).
  `level_key = spk_<unit>`.
- **🐒 Khỉ con nhảy đảo**: đếm số bước nhảy giống hình (mini game giữa bài + chơi riêng ở tab Siêu tốc).
  Đã bỏ trò *Tráo bài may mắn*.
- Lời khen khi học English đổi sang tiếng Anh (Great job!, Excellent!…) và được đọc bằng giọng tiếng Anh.
- Sửa lỗi đọc câu hỏi có dấu ngoặc kép (“ ” " ' ‘ ’): bỏ dấu ngoặc trước khi đọc; số có dấu cách hàng
  nghìn (78 935) được đọc liền đúng số.
- Không cần chạy migration mới.

## Cập nhật 09/2026 (lần 2)

- Emoji đời mới (🪙 xu, 🪆, 🪟, 🟢…) được thay bằng ảnh SVG trong `public/emoji/` → máy cũ vẫn hiện đủ hình.
  Các từ vựng English trước đây không có hình (aunt, uncle, eraser…) đã có hình riêng.
- Giọng đọc tiếng Việt đọc đúng phép tính (nhân, chia, cộng, trừ, bằng) và đơn vị đo (mi-li-mét, xăng-ti-mét,
  ki-lô-gam, lít…). Khi trả lời sai, app đọc thêm đáp án đúng và lời giải; đọc lời dẫn mini game và kết quả bài.
- Xu giảm 5 lần: mỗi câu đúng +2 xu, 3 sao +4, mini game +4. Số xu đang có của học sinh tự chia 5 đúng 1 lần
  (trên máy chủ nhờ cột `student_rewards.coin_v`, tự chạy khi deploy; trên máy học sinh nhờ `S.coinV`).
- Game “Thú con ló đầu” dùng sticker hình thú.
- Thành tích: gộp Nhân vật + Xe cộ thành “🎁 Sticker của tôi”, có thêm mục sticker đã mua ở Cửa hàng.
- Mỗi bài học (Toán 48 bài, Tiếng Việt 48 bài, English 48 bài) có thêm 3 câu “⭐ Thử thách” khó hơn ở cuối bài, đúng chủ đề
  của bài, số liệu thay đổi mỗi lần. Câu thử thách tính như điểm cộng: làm đúng thì bù cho câu sai, làm sai không bị trừ sao.

## Nội dung lớp 5 (10/2026)

Toàn bộ nội dung nằm trong `content-src/` (dễ đọc, dễ sửa). Sau khi sửa, chạy:

```bash
node scripts/build-content.js   # tạo lại ngân hàng câu hỏi và ghi vào public/index.html
node scripts/smoke-test.js      # (tùy chọn) mở app trên Chromium, làm thử mọi bài, báo câu lỗi
```
`smoke-test` cần `npm i -D playwright && npx playwright install chromium` (chỉ ở máy của bạn, Vercel không cần).

| Môn | Lộ trình | File |
|---|---|---|
| **Toán 5** | 8 chặng × 6 bài: ôn số tự nhiên & phân số · tỉ số và các bài toán · số thập phân · cộng/trừ/nhân STP · chia STP · tam giác, hình thang, hình tròn · tỉ số phần trăm, thể tích · thời gian, chuyển động đều, thống kê – xác suất | `math5.js` (bộ sinh câu hỏi), `math5-hard.js` (thử thách, đề thi) |
| **Tiếng Việt 5** | 8 chủ điểm (Khung trời tuổi thơ, Chủ nhân tương lai, Chung sống yêu thương, Cộng đồng gắn bó, Giữ mãi màu xanh, Đất nước ngàn năm, Khúc ca hòa bình, Chân trời mở rộng) chia 15 phần + Ôn tập. Mỗi phần: Đọc hiểu · Chính tả & Từ ngữ · Câu & Viết (từ đồng nghĩa, đa nghĩa, đại từ, kết từ, câu ghép, liên kết câu, dấu gạch ngang, điệp từ…) | `tv5-a.js`, `tv5-b.js`, `tv5-exam.js` |
| **English 5** | Family and Friends 5: Starter + Unit 1–12 + 3 bài Review; mỗi Unit có Vocabulary, Listen & Phonics, Sentences, 📒 Từ vựng, 🗣️ Luyện nói | `en5.js` |

- Mỗi bài có 20–24 câu trong ngân hàng; mỗi lượt học lấy ngẫu nhiên 12 câu + 3 câu ⭐ thử thách = 15 câu (số liệu Toán thay đổi).
- **Số thập phân**: bàn phím có nút dấu phẩy (gõ `12,5`), bàn phím máy tính gõ được cả `,` và `.`.
  Giọng đọc đọc đúng “12 phẩy 5”, “3 phần 4”, “2 và 1 phần 3”, %, m², m³, km/giờ, héc-ta, “tỉ lệ 1 phần 1 000”.
- **Luyện đề**: Toán 10 đề cuối HK2 (trắc nghiệm M1–M2 + tự luận) + 3 đề nâng cao; Tiếng Việt 10 đề đọc hiểu mới;
  English 8 bài kiểm tra theo nhóm Unit; Cambridge Starters/Movers/Flyers giữ nguyên.
- Kỹ năng ở Góc phụ huynh: Số tự nhiên · Phân số · Số thập phân · Tỉ số, % · Giải toán · Hình học, thể tích ·
  Đo lường, thời gian, chuyển động · Thống kê, xác suất (Toán) và các kỹ năng Tiếng Việt / English như bản lớp 3.
- Bài đọc Tiếng Việt và đề thi là bài **viết mới, phỏng theo chủ đề** từng bài đọc trong sách (không chép nguyên văn SGK).
- `localStorage` của bản lớp 5 dùng khóa `lop5_hoc_vui_v1` (không lẫn với lớp 3).
