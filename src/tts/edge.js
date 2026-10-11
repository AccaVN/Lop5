// Giọng đọc Microsoft (neural) — 2 cách gọi:
//  1) Có AZURE_SPEECH_KEY + AZURE_SPEECH_REGION: gọi API chính thức Azure Speech (ổn định, có gói miễn phí 500.000 ký tự/tháng).
//  2) Không có key: dùng dịch vụ "Read Aloud" của trình duyệt Microsoft Edge (miễn phí, cùng giọng HoaiMy/NamMinh).
const crypto = require('crypto');
const WebSocket = require('ws');

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR = CHROMIUM_FULL_VERSION.split('.')[0];
const WSS_URL = (process.env.EDGE_TTS_WSS || 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1') + `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;
const WIN_EPOCH = 11644473600;
let clockSkew = 0; // giây, tự chỉnh nếu đồng hồ máy chủ lệch

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function secMsGec() {
  let ticks = Date.now() / 1000 + clockSkew + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e7;
  return crypto.createHash('sha256').update(`${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`, 'ascii').digest('hex').toUpperCase();
}
const uuid = () => crypto.randomUUID().replace(/-/g, '');
const jsDate = () => new Date().toUTCString().replace(/^(\w+), (\d+) (\w+) (\d+) ([\d:]+) GMT$/, (m, d, dd, mo, y, t) => `${d} ${mo} ${dd} ${y} ${t} GMT+0000 (Coordinated Universal Time)`);
const pct = (r) => `${r >= 0 ? '+' : ''}${Math.round(r)}%`;

function ssml(voice, text, ratePct) {
  const lang = voice.split('-').slice(0, 2).join('-');
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'><voice name='${voice}'><prosody pitch='+0Hz' rate='${pct(ratePct)}' volume='+0%'>${escapeXml(text)}</prosody></voice></speak>`;
}

function edgeOnce(voice, text, ratePct, timeoutMs) {
  return new Promise((resolve, reject) => {
    const url = `${WSS_URL}&ConnectionId=${uuid()}&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`;
    const ws = new WebSocket(url, {
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR}.0.0.0`,
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        Cookie: `muid=${crypto.randomBytes(16).toString('hex').toUpperCase()};`,
      },
      perMessageDeflate: true,
    });
    const chunks = [];
    let done = false;
    const finish = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { ws.terminate(); } catch (e) {}
      if (err) reject(err);
      else if (!chunks.length) reject(new Error('Edge TTS: không nhận được âm thanh'));
      else resolve(Buffer.concat(chunks));
    };
    const timer = setTimeout(() => finish(new Error('Edge TTS: hết thời gian chờ')), timeoutMs);
    ws.on('unexpected-response', (req, res) => {
      const date = res.headers && res.headers.date;
      if (res.statusCode === 403 && date) {
        const server = Date.parse(date) / 1000;
        if (!Number.isNaN(server)) clockSkew += server - (Date.now() / 1000 + clockSkew);
      }
      const e = new Error('Edge TTS HTTP ' + res.statusCode);
      e.status = res.statusCode;
      finish(e);
    });
    ws.on('error', (e) => finish(e));
    ws.on('close', () => finish(chunks.length ? null : new Error('Edge TTS: kết nối bị đóng')));
    ws.on('open', () => {
      ws.send(
        `X-Timestamp:${jsDate()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n'
      );
      ws.send(`X-RequestId:${uuid()}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${jsDate()}Z\r\nPath:ssml\r\n\r\n` + ssml(voice, text, ratePct));
    });
    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        if (buf.length < 2) return;
        const hl = buf.readUInt16BE(0);
        const head = buf.slice(2, 2 + hl).toString('utf8');
        if (!/Path:audio/.test(head)) return;
        const audio = buf.slice(2 + hl);
        if (audio.length) chunks.push(audio);
      } else {
        const s = data.toString();
        if (/Path:turn\.end/.test(s)) finish(null);
      }
    });
  });
}

async function edgeTts(voice, text, ratePct) {
  try {
    return await edgeOnce(voice, text, ratePct, 12000);
  } catch (e) {
    if (e.status === 403) return edgeOnce(voice, text, ratePct, 12000); // thử lại sau khi chỉnh lệch giờ
    throw e;
  }
}

async function azureTts(voice, text, ratePct) {
  const region = process.env.AZURE_SPEECH_REGION || 'southeastasia';
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'hocvui',
    },
    body: ssml(voice, text, ratePct),
  });
  if (!r.ok) throw new Error('Azure TTS HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

async function microsoftTts(voice, text, ratePct) {
  if (process.env.AZURE_SPEECH_KEY) {
    try { return await azureTts(voice, text, ratePct); } catch (e) { console.error(e.message); }
  }
  return edgeTts(voice, text, ratePct);
}

module.exports = { microsoftTts, _test: { secMsGec, ssml, jsDate } };
