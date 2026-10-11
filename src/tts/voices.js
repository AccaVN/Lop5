// Danh mục giọng đọc. id = "<nhà cung cấp>:<tên giọng>".
//  ms:*     — Microsoft neural (miễn phí qua Edge, hoặc Azure nếu có AZURE_SPEECH_KEY)
//  google:* — Google Cloud TTS (cần GOOGLE_TTS_API_KEY)
const VOICES = [
  // ---- Tiếng Việt ----
  { id: 'ms:vi-VN-HoaiMyNeural', lang: 'vi', gender: 'female', label: 'Hoài My (Microsoft)', note: 'Nữ · giọng Bắc chuẩn, rõ, ấm — như cô giáo đọc bài' },
  { id: 'ms:vi-VN-NamMinhNeural', lang: 'vi', gender: 'male', label: 'Nam Minh (Microsoft)', note: 'Nam · giọng Bắc chuẩn, trầm, rõ chữ' },
  { id: 'google:vi-VN-Neural2-A', lang: 'vi', gender: 'female', label: 'Neural2-A (Google)', note: 'Nữ · giọng Bắc, tự nhiên', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Neural2-D', lang: 'vi', gender: 'male', label: 'Neural2-D (Google)', note: 'Nam · giọng Bắc, tự nhiên', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Wavenet-A', lang: 'vi', gender: 'female', label: 'Wavenet-A (Google)', note: 'Nữ · giọng Bắc', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Wavenet-C', lang: 'vi', gender: 'female', label: 'Wavenet-C (Google)', note: 'Nữ · giọng Bắc, trong', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Wavenet-B', lang: 'vi', gender: 'male', label: 'Wavenet-B (Google)', note: 'Nam · giọng Bắc', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Wavenet-D', lang: 'vi', gender: 'male', label: 'Wavenet-D (Google)', note: 'Nam · giọng Bắc', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Chirp3-HD-Aoede', lang: 'vi', gender: 'female', label: 'Chirp3 HD Aoede (Google)', note: 'Nữ · thế hệ mới, rất tự nhiên', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Chirp3-HD-Kore', lang: 'vi', gender: 'female', label: 'Chirp3 HD Kore (Google)', note: 'Nữ · thế hệ mới, rõ ràng', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Chirp3-HD-Charon', lang: 'vi', gender: 'male', label: 'Chirp3 HD Charon (Google)', note: 'Nam · thế hệ mới, trầm ấm', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:vi-VN-Chirp3-HD-Puck', lang: 'vi', gender: 'male', label: 'Chirp3 HD Puck (Google)', note: 'Nam · thế hệ mới, vui tươi', needs: 'GOOGLE_TTS_API_KEY' },
  // ---- English ----
  { id: 'ms:en-US-JennyNeural', lang: 'en', gender: 'female', label: 'Jenny (US)', note: 'Female · American, clear' },
  { id: 'ms:en-US-AnaNeural', lang: 'en', gender: 'female', label: 'Ana (US, child)', note: 'Female · giọng bé gái' },
  { id: 'ms:en-GB-SoniaNeural', lang: 'en', gender: 'female', label: 'Sonia (UK)', note: 'Female · British' },
  { id: 'ms:en-US-GuyNeural', lang: 'en', gender: 'male', label: 'Guy (US)', note: 'Male · American, clear' },
  { id: 'ms:en-US-ChristopherNeural', lang: 'en', gender: 'male', label: 'Christopher (US)', note: 'Male · American, warm' },
  { id: 'ms:en-GB-RyanNeural', lang: 'en', gender: 'male', label: 'Ryan (UK)', note: 'Male · British' },
  { id: 'google:en-US-Neural2-F', lang: 'en', gender: 'female', label: 'Neural2-F (Google US)', note: 'Female · American', needs: 'GOOGLE_TTS_API_KEY' },
  { id: 'google:en-US-Neural2-D', lang: 'en', gender: 'male', label: 'Neural2-D (Google US)', note: 'Male · American', needs: 'GOOGLE_TTS_API_KEY' },
];

const DEFAULT_CONFIG = {
  female: { vi: 'ms:vi-VN-HoaiMyNeural', en: 'ms:en-US-JennyNeural' },
  male: { vi: 'ms:vi-VN-NamMinhNeural', en: 'ms:en-US-GuyNeural' },
  rate: -10, // % tốc độ đọc (âm = chậm hơn), hợp với học sinh nhỏ
};

const byId = new Map(VOICES.map((v) => [v.id, v]));
const isAvailable = (v) => !v.needs || !!process.env[v.needs];

function normalizeConfig(c) {
  const out = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (!c || typeof c !== 'object') return out;
  for (const g of ['female', 'male']) {
    for (const l of ['vi', 'en']) {
      const id = c[g] && c[g][l];
      const v = byId.get(id);
      if (v && v.lang === l && isAvailable(v)) out[g][l] = id;
    }
  }
  const r = Number(c.rate);
  if (Number.isFinite(r)) out.rate = Math.max(-40, Math.min(20, Math.round(r)));
  return out;
}

module.exports = { VOICES, DEFAULT_CONFIG, byId, isAvailable, normalizeConfig };
