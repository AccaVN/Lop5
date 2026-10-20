// Hỏi đáp tiếng Anh (10/2026): máy hỏi bằng tiếng Anh, con trả lời bằng tiếng Anh, máy chấm.
// App luôn tự chấm trên máy (theo mẫu câu của từng câu hỏi). Nếu máy chủ có ANTHROPIC_API_KEY,
// câu trả lời được Claude chấm thêm: hiểu câu trả lời tự do, sửa lỗi ngữ pháp, nhận xét bằng tiếng Việt.
// Không có khóa → GET /api/qa/status trả { ai: false } và app chỉ dùng cách chấm trên máy.
const router = require('express').Router();
const { authMiddleware, requireRole } = require('../auth');

const MODEL = process.env.QA_MODEL || 'claude-opus-5-5';
const DAILY_LIMIT = Math.max(1, Number(process.env.QA_DAILY_LIMIT) || 150); // số lần chấm AI / học sinh / ngày
let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    const Anthropic = require('@anthropic-ai/sdk');
    client = new Anthropic({ timeout: 15000, maxRetries: 1 });
  }
  return client;
}

// Giới hạn đơn giản trong bộ nhớ (mỗi function Vercel một bộ đếm riêng — đủ để chặn lạm dụng).
const used = new Map(); // `${student}|${ngày}` -> số lần
function allow(userId) {
  const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const k = `${userId}|${day}`;
  const n = used.get(k) || 0;
  if (n >= DAILY_LIMIT) return false;
  if (used.size > 5000) used.clear();
  used.set(k, n + 1);
  return true;
}

const SYSTEM = `You grade spoken English answers from Vietnamese primary-school children (kindergarten to grade 5) in a speaking-practice app.
The app asks one question in English; the child answers aloud and speech recognition turns it into text.
Grade strictly what was actually recognised. Do not excuse pronunciation problems: if a word came out as a different word (e.g. "three" -> "tree", "I like" -> "alike"), or a final -s, an article (a/an/the) or a verb ending is missing or wrong, count it as an error and name it in the feedback.
Grading (stars 1-5):
5 = answers the question in a complete English sentence with no errors at all (every word, article and ending correct).
4 = answers correctly in a complete sentence but with exactly one small error (article, final -s / plural, verb form, or one misrecognised word).
3 = right meaning but only a word or short phrase, or several grammar errors.
2 = on topic but does not really answer the question, or mostly wrong grammar.
1 = unrelated, Vietnamese only, or not understandable.
Any truthful personal answer is fine (the child's own name, age, likes, family); never require the sample answer's exact facts.
feedback_vi: 1-2 short, warm sentences in Vietnamese addressed to the child as "con", saying what was good and what to fix. Simple words a 6-10 year old understands.
better: one natural, simple English sentence the child could say, keeping the child's own idea (correct their sentence; if the answer was unrelated, adapt the sample). Use vocabulary suitable for the grade.`;

const SCHEMA = {
  type: 'object',
  properties: {
    stars: { type: 'integer', enum: [1, 2, 3, 4, 5] },
    meaning_ok: { type: 'boolean', description: 'true if the answer actually answers the question' },
    feedback_vi: { type: 'string' },
    better: { type: 'string' },
  },
  required: ['stars', 'meaning_ok', 'feedback_vi', 'better'],
  additionalProperties: false,
};

const clip = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);

router.get('/status', (req, res) => res.json({ ai: !!process.env.ANTHROPIC_API_KEY }));

router.post('/grade', authMiddleware, requireRole('student'), async (req, res) => {
  const c = getClient();
  if (!c) return res.status(503).json({ error: 'Chưa bật chấm AI' });
  const b = req.body || {};
  const question = clip(b.question, 200);
  const answer = clip(b.answer, 400);
  if (!question || !answer) return res.status(400).json({ error: 'Thiếu câu hỏi hoặc câu trả lời' });
  if (!allow(req.user.id)) return res.status(429).json({ error: 'Hôm nay con đã dùng hết lượt chấm AI' });
  const grade = Math.max(0, Math.min(5, Number(b.grade) || 0));
  const samples = (Array.isArray(b.samples) ? b.samples : []).slice(0, 3).map((s) => clip(s, 160)).filter(Boolean);
  const user = [
    `Grade: ${grade === 0 ? 'kindergarten' : grade}`,
    b.topic ? `Unit topic: ${clip(b.topic, 120)}` : '',
    `Question: ${question}`,
    samples.length ? `Sample answers: ${samples.join(' | ')}` : '',
    `Child's answer (speech recognition): ${answer}`,
  ].filter(Boolean).join('\n');
  try {
    const msg = await c.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }],
    });
    if (msg.stop_reason === 'refusal') return res.status(502).json({ error: 'Không chấm được câu này' });
    const text = msg.content.filter((x) => x.type === 'text').map((x) => x.text).join('');
    const r = JSON.parse(text);
    res.json({
      stars: Math.max(1, Math.min(5, Math.round(Number(r.stars) || 1))),
      meaning_ok: !!r.meaning_ok,
      feedback_vi: clip(r.feedback_vi, 400),
      better: clip(r.better, 200),
    });
  } catch (e) {
    console.error('qa/grade:', e && e.message);
    res.status(502).json({ error: 'Máy chấm AI đang bận' });
  }
});

module.exports = router;
