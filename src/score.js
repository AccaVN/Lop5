const pool = require('./db');

// ============================================================
// Quy tắc tính điểm (10/2026): MỖI BÀI CHỈ TÍNH KẾT QUẢ LẦN LÀM CUỐI CÙNG.
//   progress.stars      = số sao của lần làm gần nhất
//   progress.points     = điểm của lần làm gần nhất
//   progress.best_stars = số sao cao nhất từng đạt — CHỈ dùng để giữ bài đã mở khóa
//                         và sticker đã nhận, KHÔNG dùng để tính điểm/xếp hạng
//   progress.best_points = điểm cao nhất từng đạt — xu chỉ thưởng khi vượt kỷ lục này
//   students.total_points = SUM(progress.points) + 2 × SUM(speak_best.stars) + bonus_points (cũ, = 0)
//   speak_best: sao cao nhất của từng từ/câu luyện nói — lưu trên máy chủ nên đổi máy không nhận lại điểm
// ============================================================

const LEVEL_KEY_RE = /^[a-z]{2,8}_[a-z0-9_]{1,24}$|^speed$/;
const SKILL_KEY_RE = /^[a-z_]{2,20}$/;

const toInt = (v, min, max) => Math.min(max, Math.max(min, Math.floor(Number(v) || 0)));

function cleanSkills(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.keys(raw).slice(0, 30).forEach((k) => {
    if (!SKILL_KEY_RE.test(k)) return;
    const t = toInt(raw[k] && raw[k].t, 0, 200);
    const c = Math.min(t, toInt(raw[k] && raw[k].c, 0, 200));
    if (t > 0) out[k] = { c, t };
  });
  return out;
}

// Tổng điểm luôn tính lại từ dữ liệu — client không thể tự đặt tổng điểm.
const RECALC_SQL = `
  UPDATE students s
  SET total_points = COALESCE((SELECT SUM(p.points) FROM progress p WHERE p.student_id = s.id), 0)
    + 2 * COALESCE((SELECT SUM(b.stars) FROM speak_best b WHERE b.student_id = s.id), 0)
    + s.bonus_points
  WHERE s.id = $1
  RETURNING total_points`;

async function recalcTotal(studentId, client) {
  const { rows } = await (client || pool).query(RECALC_SQL, [studentId]);
  return rows[0] ? Number(rows[0].total_points) : 0;
}

// Ghi nhận 1 lần làm bài: GHI ĐÈ kết quả lần trước của bài đó.
async function saveAttempt(studentId, body) {
  const level_key = String(body.level_key || '');
  if (!LEVEL_KEY_RE.test(level_key)) throw Object.assign(new Error('level_key không hợp lệ'), { status: 400 });
  const total = toInt(body.total, 0, 200);
  const correct = Math.min(total || 200, toInt(body.correct, 0, 200));
  const stars = toInt(body.stars, 0, 3);
  // Trần điểm: 10 điểm/câu + thưởng 3 sao/mini game/làm nhanh. Tính nhẩm: 5 điểm/phép.
  const maxPts = level_key === 'speed' ? 5 * 200 : total * 10 + 60;
  const points = toInt(body.points, 0, Math.max(60, maxPts));
  const skills = cleanSkills(body.skills);

  const { rows } = await pool.query(
    `WITH old AS (
       SELECT points, stars, GREATEST(best_points, points) AS best_points FROM progress WHERE student_id = $1 AND level_key = $2
     ), up AS (
       INSERT INTO progress (student_id, level_key, stars, best_stars, points, best_points, correct, total, attempts, skills, updated_at)
       VALUES ($1, $2, $3, $3, $4, $4, $5, $6, 1, $7::jsonb, now())
       ON CONFLICT (student_id, level_key) DO UPDATE SET
         stars = $3,
         best_stars = GREATEST(progress.best_stars, progress.stars, $3),
         best_points = GREATEST(progress.best_points, progress.points, $4),
         points = $4, correct = $5, total = $6,
         attempts = progress.attempts + 1,
         skills = $7::jsonb,
         updated_at = now()
       RETURNING best_stars, attempts
     )
     SELECT (SELECT points FROM old) AS prev_points, (SELECT stars FROM old) AS prev_stars,
            (SELECT best_points FROM old) AS prev_best,
            up.best_stars, up.attempts FROM up`,
    [studentId, level_key, stars, points, correct, total, JSON.stringify(skills)]
  );
  const total_points = await recalcTotal(studentId);
  const r = rows[0] || {};
  return {
    ok: true,
    level_key,
    stars,
    points,
    best_stars: Number(r.best_stars) || stars,
    attempts: Number(r.attempts) || 1,
    prev_points: r.prev_points == null ? null : Number(r.prev_points),
    prev_stars: r.prev_stars == null ? null : Number(r.prev_stars),
    prev_best: r.prev_best == null ? null : Number(r.prev_best),
    new_record: r.prev_best == null || points > Number(r.prev_best),
    total_points,
  };
}

// Kỹ năng: lấy từ kết quả LẦN CUỐI của từng bài. Kỹ năng chưa có dữ liệu mới
// thì tạm dùng số liệu cộng dồn cũ (skill_stats) để phụ huynh không bị trống.
function mergeSkills(progressRows, legacyRows) {
  const agg = {};
  progressRows.forEach((p) => {
    const sk = p.skills || {};
    Object.keys(sk).forEach((k) => {
      const a = agg[k] || (agg[k] = { skill_key: k, correct: 0, total: 0, source: 'last' });
      a.correct += Number(sk[k].c) || 0;
      a.total += Number(sk[k].t) || 0;
    });
  });
  (legacyRows || []).forEach((s) => {
    if (!agg[s.skill_key] && Number(s.total) > 0) {
      agg[s.skill_key] = { skill_key: s.skill_key, correct: Number(s.correct), total: Number(s.total), source: 'legacy' };
    }
  });
  return Object.values(agg);
}

// Dữ liệu chi tiết 1 học sinh cho phụ huynh/admin
async function studentDetail(studentId, extra) {
  const [student, progress, skills, sessions] = await Promise.all([
    pool.query(
      `SELECT s.id, s.name, s.avatar, s.gender, s.join_code, s.created_at, s.total_points, s.bonus_points${extra ? ', u.email' : ''}
       FROM students s ${extra ? 'JOIN users u ON u.id = s.user_id' : ''} WHERE s.id = $1`,
      [studentId]
    ),
    pool.query(
      `SELECT level_key, stars, best_stars, points, correct, total, attempts, skills, updated_at
       FROM progress WHERE student_id = $1 ORDER BY updated_at DESC`,
      [studentId]
    ),
    pool.query('SELECT skill_key, correct, total FROM skill_stats WHERE student_id = $1', [studentId]),
    pool.query('SELECT day, seconds FROM daily_sessions WHERE student_id = $1 ORDER BY day DESC LIMIT 30', [studentId]),
  ]);
  if (!student.rows[0]) return null;
  return {
    student: student.rows[0],
    progress: progress.rows.map(({ skills: _s, ...p }) => p),
    skills: mergeSkills(progress.rows, skills.rows),
    sessions: sessions.rows.map((s) => ({ day: dayStr(s.day), seconds: Number(s.seconds) })),
  };
}

// Ngày dạng YYYY-MM-DD theo giờ VN (pg trả DATE thành Date lúc 00:00 giờ máy chủ)
function dayStr(d) {
  if (typeof d === 'string') return d.slice(0, 10);
  const x = new Date(d);
  const p = (n) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
}

// Điểm luyện nói: items = { "v.3.2.w": 4, "p.time.0_1": 5, ... } (sao 0–5; từ vựng gõ đúng = 1)
const SPEAK_KEY_RE = /^[vp]\.[A-Za-z0-9_]{1,12}\.[A-Za-z0-9_]{1,12}(\.[a-z]{1,2})?$/;
async function saveSpeak(studentId, items) {
  const keys = [], vals = [];
  Object.keys(items || {}).slice(0, 500).forEach((k) => {
    if (!SPEAK_KEY_RE.test(k)) return;
    const v = toInt(items[k], 0, 5);
    if (v > 0) { keys.push(k); vals.push(v); }
  });
  let gained = 0;
  if (keys.length) {
    const { rows } = await pool.query(
      `WITH inp AS (SELECT * FROM unnest($2::text[], $3::int[]) AS t(item_key, stars)),
       old AS (SELECT b.item_key, b.stars FROM speak_best b JOIN inp USING (item_key) WHERE b.student_id = $1),
       up AS (
         INSERT INTO speak_best (student_id, item_key, stars, updated_at)
         SELECT $1, item_key, stars, now() FROM inp
         ON CONFLICT (student_id, item_key) DO UPDATE SET stars = GREATEST(speak_best.stars, EXCLUDED.stars),
           updated_at = CASE WHEN EXCLUDED.stars > speak_best.stars THEN now() ELSE speak_best.updated_at END
         RETURNING item_key, stars)
       SELECT COALESCE(SUM(up.stars - COALESCE(old.stars, 0)), 0)::int AS gained FROM up LEFT JOIN old USING (item_key)`,
      [studentId, keys, vals]
    );
    gained = Number(rows[0].gained) || 0;
  }
  return { ok: true, gained_points: gained * 2, total_points: await recalcTotal(studentId) };
}

module.exports = { saveAttempt, recalcTotal, studentDetail, mergeSkills, toInt, saveSpeak };
