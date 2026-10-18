// Mã Sec-MS-GEC phiên bản 2 cho dịch vụ đọc "Read Aloud" của Microsoft Edge.
// Từ khoảng 13/10/2026 Microsoft từ chối mã v1 (SHA-256 thường) → máy chủ giọng đọc báo lỗi 502.
// Đây là bản chuyển nguyên văn sang JavaScript của edge_tts/drm.py (thư viện edge-tts 7.3.1,
// https://github.com/rany2/edge-tts). Dùng BigInt để tính giống hệt số nguyên của Python.
const M = 0xffffffffn;

const SHA256_INITIAL = [0x6a09e667n, 0xbb67ae85n, 0x3c6ef372n, 0xa54ff53an, 0x510e527fn, 0x9b05688cn, 0x1f83d9abn, 0x5be0cd19n];
const SHA256_STATE = [0xfd9fbea2n, 0x91243ce7n, 0xbe499094n, 0xcd2e1e0an, 0x6c006f49n, 0x04bd35abn, 0xfeb0a7e4n, 0x03effbd2n];
const SHA256_SCHEDULE = [0xeb24bf9en, 0x1558691fn, 0xa0c09ee2n, 0x0cfa32ban, 0xa622ee8cn, 0xd1dd9491n, 0xc0dd25a0n, 0xf9e70ab6n, 0xf0c31573n, 0x7058ce4en, 0x7188e606n, 0x00e5ab33n, 0xd258b060n, 0x72766564n];
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
].map(BigInt);
const SHA256_ADJUSTMENT = 0xc9dc06a7n;
const K_BLOCK = K.slice(0, 14).concat([SHA256_ADJUSTMENT], K.slice(15));
const SIGMA0_ADJ = 0x059c0b80n;
const SIGMA1_ADJ = 0x000b92c0n;

const CS64_COEFFICIENTS = [
  [0xe82e91b1n, 0xb32700d0n], [0x44de24c6n, 0x88dff51dn], [0x3beb65bcn, 0x29514038n], [0xc89c5933n, 0xb328cbdfn],
  [0x8d1ec211n, 0xd405b4d5n], [0x314ef5d5n, 0x26e55f3cn], [0xe92491b1n, 0x607801c6n], [0xf0a5b9d5n, 0x82b2c1fbn],
  [0x06064cf3n, 0xfa51a3dan], [0xda79fa60n, 0x207cc464n], [0xbed20560n, 0x3c3c74f3n], [0x89f9c9f8n, 0xd2d14b61n],
  [0x35fa38c6n, 0xbb04a2c1n], [0xcb49e3c6n, 0xc5626167n],
];
const CS64_FACTOR = 0x82893933n;
const CS64_ADJ0 = 0xf2f90b1an;
const CS64_ADJ1 = 0x0b1a0000n;

const rol16 = (v) => { v &= M; return ((v << 16n) | (v >> 16n)) & M; };
const sigma0 = (v) => ((v >> 7n) ^ (v << 25n) ^ (v >> 18n) ^ (v << 14n) ^ (v >> 3n)) & M;
const sigma1 = (v) => ((v >> 17n) ^ (v << 15n) ^ (v >> 19n) ^ (v << 13n) ^ (v >> 10n)) & M;
const ROT = 0x100000001n;

function wordsLe4Even(buf) {
  const pad = (4 - (buf.length % 4)) % 4;
  const b = Buffer.concat([buf, Buffer.alloc(pad)]);
  const w = [];
  for (let i = 0; i < b.length; i += 4) w.push(BigInt(b.readUInt32LE(i)));
  if (w.length % 2) w.push(0n);
  return w;
}

function sha256Rounds(state, words, firstRound = 0) {
  let [a, b, c, d, e, f, g, h] = state;
  const k = firstRound === 14 ? K_BLOCK : K;
  for (let i = firstRound; i < 64; i++) {
    const re = e * ROT, ra = a * ROT;
    const t1 = h + ((re >> 6n) ^ (re >> 11n) ^ (re >> 25n)) + (g ^ (e & (f ^ g))) + k[i] + words[i];
    const t2 = ((ra >> 2n) ^ (ra >> 13n) ^ (ra >> 22n)) + ((a & b) | (c & (a | b)));
    h = g; g = f; f = e; e = (d + t1) & M; d = c; c = b; b = a; a = (t1 + t2) & M;
  }
  return [a, b, c, d, e, f, g, h];
}

function expandSchedule(words, firstWord = 16) {
  for (let i = firstWord; i < 64; i++) {
    const x = words[i - 2], y = words[i - 15];
    const s1 = (x >> 17n) ^ (x << 15n) ^ (x >> 19n) ^ (x << 13n) ^ (x >> 10n);
    const s0 = (y >> 7n) ^ (y << 25n) ^ (y >> 18n) ^ (y << 14n) ^ (y >> 3n);
    words.push((s1 + words[i - 7] + s0 + words[i - 16]) & M);
  }
}

function sha256Init(data7) {
  const words = new Array(14).fill(0n);
  words.push(BigInt(data7.readUIntBE(0, 3)));
  words.push(BigInt(data7.readUInt32BE(3)));
  for (let i = 16; i < 30; i++) {
    let v = SHA256_SCHEDULE[i - 16];
    if (i - 2 >= 14) v += i === 16 ? (sigma1(words[i - 2]) ^ SIGMA1_ADJ) : sigma1(words[i - 2]);
    if (i - 7 >= 14) v += words[i - 7];
    if (i - 15 >= 14) v += i === 29 ? (sigma0(words[i - 15]) ^ SIGMA0_ADJ) : sigma0(words[i - 15]);
    words.push(v & M);
  }
  words.push((sigma1(words[28]) + words[23] + sigma0(words[15]) + words[14] + SHA256_ADJUSTMENT - K[14]) & M);
  expandSchedule(words, 31);
  const w = sha256Rounds(SHA256_STATE, words, 14);
  return SHA256_INITIAL.map((x, i) => (x + w[i]) & M);
}

function sha256Digest(data) {
  if (data.length < 7) throw new Error('Token salt must contain at least seven bytes');
  const length = 57 + data.length;
  const zeros = (((55 - length) % 64) + 64) % 64; // Python % luôn không âm
  const lenBuf = Buffer.alloc(8);
  lenBuf.writeBigUInt64BE(BigInt(length * 8));
  const padded = Buffer.concat([data.subarray(7), Buffer.from([0x80]), Buffer.alloc(zeros), lenBuf]);
  let state = sha256Init(data.subarray(0, 7));
  for (let off = 0; off < padded.length; off += 64) {
    const words = [];
    for (let j = 0; j < 16; j++) words.push(BigInt(padded.readUInt32BE(off + j * 4)));
    expandSchedule(words);
    const w = sha256Rounds(state, words);
    state = state.map((x, i) => (x + w[i]) & M);
  }
  const out = Buffer.alloc(32);
  state.forEach((x, i) => out.writeUInt32BE(Number(x), i * 4));
  return out;
}

function cs64Digest(data, digest) {
  let keyA = BigInt(digest.readUInt32LE(0)) | 1n;
  let keyB = BigInt(digest.readUInt32LE(4)) | 1n;
  const factors = [(keyA * CS64_FACTOR) & M, (keyB * CS64_FACTOR) & M];
  const terms = CS64_COEFFICIENTS.map(([c], i) => (c * factors[i % 2]) & M);
  const offsets = CS64_COEFFICIENTS.map(([, o]) => o);
  wordsLe4Even(Buffer.concat([Buffer.from([0]), data])).forEach((word, i) => {
    let term = word * (i % 2 === 0 ? keyA : keyB);
    let offset = rol16(word) * (i % 2 === 0 ? 0xef0569fbn : 0xc31713dbn);
    if (i === 0) { term += CS64_ADJ0 * factors[0]; offset += CS64_ADJ1; }
    terms.push(term & M);
    offsets.push(offset & M);
  });
  let swapAcc = 0n, swapLast = 0n, state = 0n, acc = 0n;
  for (let i = 0; i < terms.length; i += 2) {
    const x = terms[i], y = terms[i + 1];
    let t = rol16((offsets[i] + x) & M);
    let q = (t * 0x76f50f34n) & M;
    swapAcc += (rol16(q) * 0xc3efea97n + q) & M;
    t = rol16((offsets[i + 1] + y) & M);
    q = (t * 0x1881ce3cn) & M;
    swapLast = (rol16(q) * 0x35bd1ec9n + q) & M;
    swapAcc = (swapAcc + swapLast) & M;

    state = (state * keyA + x) & M;
    state = (rol16(state) * 0xcf98b111n) & M;
    state = (rol16(state) * 0x87085b9fn) & M;
    state = (rol16(state) * 0x12ceb96dn) & M;
    state = (rol16(state) * 0x257e1d83n) & M;
    acc += state;
    t = (state * keyB + y) & M;
    t = (rol16(t) * 0xa27416f5n) & M;
    t = (rol16(t) * 0xd38396ffn) & M;
    state = (rol16((rol16(t) * 0x7c932b89n) & M) * 0xbfa49f69n) & M;
    acc = (acc + state) & M;
  }
  return [swapLast ^ state, swapAcc ^ acc];
}

const WIN_EPOCH = 11644473600;
let cacheKey = '', cacheVal = '';
// unixSeconds: thời điểm (giây) đã chỉnh lệch giờ; trustedToken: TRUSTED_CLIENT_TOKEN
function secMsGecV2(unixSeconds, trustedToken) {
  let ticks = unixSeconds + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e9 / 100;
  const str = `${ticks.toFixed(0)}${trustedToken}`;
  if (str === cacheKey) return cacheVal;
  const data = Buffer.from(str, 'ascii');
  const digest = sha256Digest(data);
  const [c0, c1] = cs64Digest(data, digest);
  const cs = Buffer.alloc(8);
  cs.writeUInt32LE(Number(c0), 0);
  cs.writeUInt32LE(Number(c1), 4);
  cacheKey = str;
  cacheVal = `${cs.toString('hex').toUpperCase()}-${digest.toString('hex').toUpperCase()}`;
  return cacheVal;
}

module.exports = { secMsGecV2 };
