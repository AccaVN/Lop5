const router = require('express').Router();
const pool = require('../db');
const { VOICES, byId, isAvailable, normalizeConfig } = require('../tts/voices');
const { microsoftTts } = require('../tts/edge');
const { googleTts } = require('../tts/google');

const MAX_CHARS = 600;
const cache = new Map(); // bộ nhớ đệm trong 1 instance (LRU đơn giản)
const CACHE_MAX = 300;

async function getVoiceConfig() {
  try {
    const { rows } = await pool.query("SELECT value FROM app_settings WHERE key='voices'");
    return normalizeConfig(rows[0] && rows[0].value);
  } catch (e) {
    return normalizeConfig(null);
  }
}

async function synthesize(id, text, rate) {
  const [provider, name] = id.split(/:(.+)/);
  if (provider === 'ms') return microsoftTts(name, text, rate);
  if (provider === 'google') return googleTts(name, text, rate);
  throw new Error('Nhà cung cấp giọng không hợp lệ');
}

// Danh sách giọng + giọng chuẩn đang dùng (công khai, học sinh cần để phát âm thanh)
router.get('/voices', async (req, res) => {
  const config = await getVoiceConfig();
  res.set('Cache-Control', 'no-store');
  res.json({ voices: VOICES.map((v) => ({ ...v, available: isAvailable(v) })), config });
});

// GET /api/tts?v=<voice id>&r=<tốc độ %>&t=<nội dung>  →  audio/mpeg
router.get('/', async (req, res) => {
  const id = String(req.query.v || '');
  const text = String(req.query.t || '').replace(/\s+/g, ' ').trim();
  const rate = Math.max(-40, Math.min(20, Math.round(Number(req.query.r) || 0)));
  const v = byId.get(id);
  if (!v) return res.status(400).json({ error: 'Giọng đọc không hợp lệ' });
  if (!isAvailable(v)) return res.status(400).json({ error: 'Giọng này cần cấu hình ' + v.needs });
  if (!text) return res.status(400).json({ error: 'Thiếu nội dung cần đọc' });
  if (text.length > MAX_CHARS) return res.status(413).json({ error: 'Nội dung quá dài' });
  const key = `${id}|${rate}|${text}`;
  try {
    let buf = cache.get(key);
    if (!buf) {
      buf = await synthesize(id, text, rate);
      cache.set(key, buf);
      if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    }
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buf.length,
      // CDN của Vercel giữ file âm thanh 1 năm: mỗi câu chỉ tổng hợp 1 lần cho cả lớp
      'Cache-Control': 'public, max-age=604800, s-maxage=31536000, immutable',
    });
    res.end(buf);
  } catch (e) {
    console.error('TTS lỗi:', id, e.message);
    res.set('Cache-Control', 'no-store');
    res.status(502).json({ error: 'Không tạo được giọng đọc, thử lại sau.' });
  }
});

module.exports = { router, getVoiceConfig };
