// Google Cloud Text-to-Speech — chỉ dùng khi có biến môi trường GOOGLE_TTS_API_KEY.
async function googleTts(name, text, ratePct) {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) throw new Error('Chưa cấu hình GOOGLE_TTS_API_KEY');
  const languageCode = name.split('-').slice(0, 2).join('-');
  const audioConfig = { audioEncoding: 'MP3' };
  if (!/Chirp/.test(name)) audioConfig.speakingRate = Math.max(0.5, Math.min(1.5, 1 + ratePct / 100));
  const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { text }, voice: { languageCode, name }, audioConfig }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.audioContent) throw new Error('Google TTS HTTP ' + r.status + ' ' + ((data.error && data.error.message) || ''));
  return Buffer.from(data.audioContent, 'base64');
}
module.exports = { googleTts };
