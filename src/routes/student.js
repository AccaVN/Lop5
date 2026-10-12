const router = require('express').Router();
const pool = require('../db');
const { authMiddleware, requireRole } = require('../auth');
const { saveAttempt, recalcTotal, studentDetail, toInt, saveSpeak } = require('../score');

// Ngày học tính theo giờ Việt Nam (máy chủ Vercel/Neon chạy giờ UTC)
const VN_TODAY = "(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date";
const { classRanking } = require('../rank');

async function getOwnStudent(userId) {
  const { rows } = await pool.query('SELECT id, user_id, name, avatar, gender, join_code, created_at, total_points FROM students WHERE user_id=$1', [userId]);
  return rows[0];
}

router.use(authMiddleware, requireRole('student'));

// Dữ liệu tối thiểu cho trang chủ.
// Quan trọng: toàn bộ dữ liệu được lấy bằng MỘT round-trip tới Neon.
// Không tải skill_stats, lịch sử session, sticker/shop hoặc BXH ở đây.
router.get('/me/home', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.avatar,
        s.gender,
        s.join_code,
        s.total_points,
        COALESCE(p.total_stars, 0)::int AS total_stars,
        COALESCE(p.progress, '[]'::json) AS progress,
        COALESCE(r.coins, 0)::int AS coins,
        COALESCE((SELECT json_object_agg(b.item_key, b.stars) FROM speak_best b WHERE b.student_id = s.id), '{}'::json) AS speak,
        COALESCE(d.seconds, 0)::int AS today_seconds
      FROM students s
      LEFT JOIN LATERAL (
        SELECT
          COALESCE(SUM(pr.stars), 0)::int AS total_stars,
          COALESCE(
            json_agg(
              json_build_object('level_key', pr.level_key, 'stars', pr.stars, 'best', GREATEST(pr.best_stars, pr.stars), 'points', pr.points, 'bp', GREATEST(pr.best_points, pr.points))
              ORDER BY pr.level_key
            ),
            '[]'::json
          ) AS progress
        FROM progress pr
        WHERE pr.student_id = s.id
      ) p ON TRUE
      LEFT JOIN student_rewards r ON r.student_id = s.id
      LEFT JOIN daily_sessions d
        ON d.student_id = s.id AND d.day = ${VN_TODAY}
      WHERE s.user_id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });

    res.json({
      student: {
        id: row.id,
        name: row.name,
        avatar: row.avatar,
        gender: row.gender,
        join_code: row.join_code,
        total_points: Number(row.total_points || 0),
      },
      total_stars: Number(row.total_stars || 0),
      progress: row.progress || [],
      coins: Number(row.coins || 0),
      speak: row.speak || {},
      today_seconds: Number(row.today_seconds || 0),
    });
  } catch (e) {
    console.error('GET /student/me/home:', e);
    // Dự phòng: truy vấn gộp lỗi (vd. database thiếu cột/bảng) → lấy từng phần riêng, phần nào lỗi thì bỏ qua,
    // để học sinh vẫn vào được app. Lỗi gốc trả kèm trong "detail" để dễ tìm nguyên nhân.
    try {
      const st = await pool.query('SELECT id, name, avatar, gender, join_code, total_points FROM students WHERE user_id=$1 LIMIT 1', [req.user.id]);
      const row = st.rows[0];
      if (!row) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
      const safe = async (sql, args, def) => { try { return (await pool.query(sql, args)).rows; } catch (err) { console.error('home fallback:', err.message); return def; } };
      const progress = await safe(
        `SELECT level_key, stars, GREATEST(best_stars, stars) AS best, points, GREATEST(best_points, points) AS bp FROM progress WHERE student_id=$1 ORDER BY level_key`,
        [row.id], null)
        || await safe('SELECT level_key, stars, stars AS best, 0 AS points, 0 AS bp FROM progress WHERE student_id=$1 ORDER BY level_key', [row.id], []);
      const coins = (await safe('SELECT coins FROM student_rewards WHERE student_id=$1', [row.id], []))[0];
      const speak = await safe('SELECT item_key, stars FROM speak_best WHERE student_id=$1', [row.id], []);
      const today = (await safe(`SELECT seconds FROM daily_sessions WHERE student_id=$1 AND day=${VN_TODAY}`, [row.id], []))[0];
      res.json({
        student: { id: row.id, name: row.name, avatar: row.avatar, gender: row.gender, join_code: row.join_code, total_points: Number(row.total_points || 0) },
        total_stars: progress.reduce((a, p) => a + (Number(p.stars) || 0), 0),
        progress,
        coins: Number((coins && coins.coins) || 0),
        speak: Object.fromEntries(speak.map((x) => [x.item_key, x.stars])),
        today_seconds: Number((today && today.seconds) || 0),
        degraded: e.message,
      });
    } catch (e2) {
      console.error('GET /student/me/home fallback:', e2);
      res.status(500).json({ error: 'Không thể tải dữ liệu trang chủ', detail: String(e2.message || e.message || '').slice(0, 300) });
    }
  }
});

// Sticker/cửa hàng chỉ tải khi học sinh mở Thành tích.
router.get('/me/rewards', async (req, res) => {
  try {
    const student = await getOwnStudent(req.user.id);
    if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
    const [{ rows }, en] = await Promise.all([
      pool.query(`SELECT stickers, shop, coins, en_stickers FROM student_rewards WHERE student_id=$1`, [student.id]),
      pool.query(`SELECT level_key FROM progress WHERE student_id=$1 AND level_key ~ '^en_[0-9]+$' AND GREATEST(best_stars, stars) >= 1`, [student.id]),
    ]);
    const r = rows[0] || { stickers: [], shop: [], coins: 0, en_stickers: [] };
    // Sticker Xe cộ = thưởng bài English. Gộp thêm từ tiến độ đã lưu để bù các sticker bị mất trước đây.
    const fromProgress = en.rows.map((x) => Number(x.level_key.slice(3))).filter((i) => i < 48);
    r.en_stickers = [...new Set([...(Array.isArray(r.en_stickers) ? r.en_stickers : []), ...fromProgress])].sort((a, b) => a - b);
    res.json(r);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Không thể tải bộ sưu tập' });
  }
});


// Lấy toàn bộ dữ liệu của chính học sinh đang đăng nhập
router.get('/me', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const [progress, skills, sessions, rewards] = await Promise.all([
    pool.query('SELECT level_key, stars, GREATEST(best_stars, stars) AS best, points FROM progress WHERE student_id=$1', [student.id]),
    pool.query('SELECT skill_key, correct, total FROM skill_stats WHERE student_id=$1', [student.id]),
    pool.query('SELECT day, seconds FROM daily_sessions WHERE student_id=$1 ORDER BY day DESC LIMIT 30', [student.id]),
    pool.query('SELECT stickers, shop, coins, en_stickers FROM student_rewards WHERE student_id=$1', [student.id]),
  ]);
  res.json({ student, progress: progress.rows, skills: skills.rows, sessions: sessions.rows, rewards: rewards.rows[0] || {stickers: [], shop: [], coins: 0} });
});

// Báo cáo học tập của chính con (Góc phụ huynh trên máy của con) — giống dữ liệu phụ huynh xem
router.get('/me/report', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  res.set('Cache-Control', 'private, no-cache');
  res.json(await studentDetail(student.id));
});

// Cập nhật tên / nhân vật / giới tính (gọi khi học sinh đổi tên hoặc chọn lại nhân vật)
router.put('/me/profile', async (req, res) => {
  const { name, avatar, gender } = req.body;
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  await pool.query(
    `UPDATE students SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), gender = COALESCE($3, gender) WHERE id=$4`,
    [name || null, avatar || null, gender || null, student.id]
  );
  res.json({ ok: true });
});

// Đồng bộ bộ sưu tập sticker/cửa hàng theo tài khoản học sinh
// Bảng xếp hạng toàn bộ học viên — điểm tích lũy là tiêu chí chính, sao và số bài là tiêu chí phụ.
router.get('/me/rank', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const rows = await classRanking();
  const list=rows.map((r)=>({...r, me:r.id===student.id}));
  const me=list.find(x=>x.id===student.id);
  res.json({ students:list, me });
});

// Tổng điểm do MÁY CHỦ tính (tổng điểm lần làm cuối của từng bài + điểm luyện nói).
// Bản app cũ còn mở trên máy học sinh vẫn gọi API này với tổng cộng dồn → bỏ qua giá trị gửi lên.
router.put('/me/points', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  res.json({ ok: true, total_points: await recalcTotal(student.id) });
});

// (Bản cũ) Điểm luyện nói cộng theo phần chênh lệch — nay thay bằng POST /me/speak, API này không cộng nữa.
router.post('/me/bonus', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  res.json({ ok: true, total_points: await recalcTotal(student.id) });
});

// Điểm luyện nói/từ vựng lưu theo TỪNG TỪ/CÂU trên máy chủ: chỉ cộng khi con đọc tốt hơn
// kỷ lục của chính từ/câu đó (đổi sang máy khác cũng không nhận lại điểm).
// Body: { items: { "<item_key>": sao } }
router.post('/me/speak', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  res.json(await saveSpeak(student.id, (req.body && req.body.items) || {}));
});

// Nộp kết quả 1 lần làm bài/đề/tính nhẩm. Kết quả này THAY THẾ lần làm trước của cùng bài.
router.post('/me/attempt', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  try {
    res.json(await saveAttempt(student.id, req.body || {}));
  } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    throw e;
  }
});

router.put('/me/rewards', async (req, res) => {
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const stickers = Array.isArray(req.body.stickers) ? req.body.stickers.map(Number).filter(Number.isInteger) : [];
  const shop = Array.isArray(req.body.shop) ? req.body.shop.map(Number).filter(Number.isInteger) : [];
  // coin_v = 2: máy học sinh đã dùng thang xu mới (giảm 5 lần). Bản app cũ còn lưu trong trình duyệt
  // (chưa tải lại) sẽ không được ghi đè số xu trên máy chủ bằng số xu kiểu cũ.
  const freshCoins = Number(req.body.coin_v) === 2;
  const rawCoins = Math.max(0, Math.floor(Number(req.body.coins) || 0));
  const coins = freshCoins ? rawCoins : Math.floor(rawCoins / 5);
  // en_stickers (Xe cộ) chỉ cộng thêm, không bị xóa bởi máy chưa có dữ liệu.
  const enSt = Array.isArray(req.body.en_stickers) ? [...new Set(req.body.en_stickers.map(Number).filter((i) => Number.isInteger(i) && i >= 0 && i < 48))] : [];
  await pool.query(`INSERT INTO student_rewards(student_id,stickers,shop,coins,en_stickers,coin_v,updated_at) VALUES($1,$2::jsonb,$3::jsonb,$4,$5::jsonb,2,now())
    ON CONFLICT(student_id) DO UPDATE SET stickers=$2::jsonb,shop=$3::jsonb,coins=CASE WHEN $6::boolean THEN $4 ELSE student_rewards.coins END,coin_v=2,
      en_stickers=(SELECT COALESCE(jsonb_agg(DISTINCT x ORDER BY x),'[]'::jsonb) FROM jsonb_array_elements(student_rewards.en_stickers || $5::jsonb) AS t(x)),
      updated_at=now()`, [student.id, JSON.stringify(stickers), JSON.stringify(shop), coins, JSON.stringify(enSt), freshCoins]);
  res.json({ ok: true });
});

// Bản cũ / bài luyện nói: chỉ ghi số sao (không có điểm). Bài làm thường dùng POST /me/attempt.
router.put('/me/progress', async (req, res) => {
  const { level_key, stars } = req.body;
  if (!level_key || stars == null) return res.status(400).json({ error: 'Thiếu level_key hoặc stars' });
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  const st = toInt(stars, 0, 5);
  await pool.query(
    `INSERT INTO progress (student_id, level_key, stars, best_stars, attempts, updated_at) VALUES ($1,$2,$3,$3,1, now())
     ON CONFLICT (student_id, level_key)
     DO UPDATE SET stars = GREATEST(progress.stars, $3), best_stars = GREATEST(progress.best_stars, $3), updated_at = now()`,
    [student.id, level_key, st]
  );
  res.json({ ok: true });
});

// (Cũ) Cộng dồn đúng/sai theo kỹ năng. Bản mới gửi kỹ năng kèm /me/attempt (chỉ lần cuối).
router.post('/me/skill', async (req, res) => {
  const { skill_key, correct, total } = req.body;
  if (!skill_key) return res.status(400).json({ error: 'Thiếu skill_key' });
  const student = await getOwnStudent(req.user.id);
  await pool.query(
    `INSERT INTO skill_stats (student_id, skill_key, correct, total) VALUES ($1,$2,$3,$4)
     ON CONFLICT (student_id, skill_key)
     DO UPDATE SET correct = skill_stats.correct + $3, total = skill_stats.total + $4`,
    [student.id, skill_key, correct || 0, total || 0]
  );
  res.json({ ok: true });
});

// Cộng dồn thời gian học trong ngày hôm nay (giây)
router.post('/me/session', async (req, res) => {
  const seconds = toInt(req.body.seconds, 0, 3 * 3600);
  const student = await getOwnStudent(req.user.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy hồ sơ học sinh' });
  await pool.query(
    `INSERT INTO daily_sessions (student_id, day, seconds) VALUES ($1, ${VN_TODAY}, $2)
     ON CONFLICT (student_id, day) DO UPDATE SET seconds = daily_sessions.seconds + $2`,
    [student.id, seconds]
  );
  res.json({ ok: true });
});

module.exports = router;
