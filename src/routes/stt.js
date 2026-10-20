// Nhận dạng giọng nói trên máy chủ (10/2026) — dự phòng cho máy KHÔNG cho vừa ghi âm vừa nhận dạng
// (một số điện thoại Android): app ghi âm 1 lần, gửi file lên đây để lấy chữ rồi chấm sao, con không phải đọc lại.
// Dùng Google Cloud Speech-to-Text: biến môi trường GOOGLE_STT_API_KEY (hoặc GOOGLE_TTS_API_KEY nếu khóa đó
// đã bật "Cloud Speech-to-Text API"). Không có khóa → GET /api/stt/status trả { ok: false }, app dùng cách cũ.
const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../auth');

const KEY = () => process.env.GOOGLE_STT_API_KEY || process.env.GOOGLE_TTS_API_KEY || '';
const DAILY_LIMIT = Math.max(1, Number(process.env.STT_DAILY_LIMIT) || 200);
const used = new Map();
function allow(userId) {
  const k = `${userId}|${new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)}`;
  const n = used.get(k) || 0;
  if (n >= DAILY_LIMIT) return false;
  if (used.size > 5000) used.clear();
  used.set(k, n + 1);
  return true;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

router.get('/status', (req, res) => res.json({ ok: !!KEY() }));

// Body: file ghi âm (audio/webm;codecs=opus hoặc audio/ogg), tối đa ~2 phút. Header X-Audio-Ms: độ dài (ms).
router.post('/', authMiddleware, requireRole('student'), express.raw({ type: () => true, limit: '4mb' }), async (req, res) => {
  const key = KEY();
  if (!key) return res.status(503).json({ error: 'Chưa bật nhận dạng trên máy chủ' });
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || buf.length < 500) return res.status(400).json({ error: 'Không có âm thanh' });
  const ct = String(req.headers['content-type'] || '');
  const encoding = /ogg/.test(ct) ? 'OGG_OPUS' : /webm/.test(ct) ? 'WEBM_OPUS' : null;
  if (!encoding) return res.status(415).json({ error: 'Định dạng âm thanh chưa hỗ trợ' });
  if (!allow(req.user.id)) return res.status(429).json({ error: 'Hôm nay đã dùng hết lượt nhận dạng' });
  const ms = Number(req.headers['x-audio-ms']) || 0;
  const body = {
    config: { encoding, sampleRateHertz: 48000, languageCode: 'en-US', maxAlternatives: 1, enableAutomaticPunctuation: true },
    audio: { content: buf.toString('base64') },
  };
  const api = process.env.GOOGLE_STT_BASE || 'https://speech.googleapis.com/v1/';
  const q = '?key=' + encodeURIComponent(key);
  try {
    let data;
    if (ms && ms < 55000) {
      const r = await fetch(api + 'speech:recognize' + q, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + ((data.error && data.error.message) || ''));
    } else {
      // dài hơn ~1 phút: nhận dạng dài rồi hỏi lại kết quả (đoạn văn đến 2 phút thường xong trong vài giây)
      const r = await fetch(api + 'speech:longrunningrecognize' + q, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const op = await r.json().catch(() => ({}));
      if (!r.ok || !op.name) throw new Error('HTTP ' + r.status + ' ' + ((op.error && op.error.message) || ''));
      for (let i = 0; i < 40; i++) {
        await sleep(i < 5 ? 600 : 1200);
        const p = await fetch(api + 'operations/' + encodeURIComponent(op.name) + q).then((x) => x.json()).catch(() => ({}));
        if (p.error) throw new Error(p.error.message || 'operation error');
        if (p.done) { data = p.response || {}; break; }
      }
      if (!data) throw new Error('timeout');
    }
    const text = (data.results || []).map((x) => (x.alternatives && x.alternatives[0] && x.alternatives[0].transcript) || '').join(' ').replace(/\s+/g, ' ').trim();
    res.json({ text });
  } catch (e) {
    console.error('stt:', e && e.message);
    res.status(502).json({ error: 'Máy chủ chưa nhận dạng được' });
  }
});

module.exports = router;
