#!/usr/bin/env node
/* Tạo nội dung Học Vui Lớp 5 (SGK Kết nối tri thức + Global Success) từ content-src/ và ghi vào public/index.html.
   Chạy:  node scripts/build-content.js
   - Ngân hàng câu hỏi (MATH_BANK, TV_BANK, EN_BANK) được tạo sẵn, mỗi bài 20–24 câu không trùng
     (mỗi lượt học app lấy ngẫu nhiên 12 câu + 3 câu thử thách = 15 câu).
   - Mã sinh câu hỏi chạy trên trình duyệt (thử thách, luyện đề, luyện nói…) được chèn giữa hai dấu
     mốc LOP5-BEGIN / LOP5-END. Chạy lại script bao nhiêu lần cũng được. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const L = require('./content-lib');

const SRC = ['math5.js', 'math5-hard.js', 'tv5-a.js', 'tv5-b.js', 'tv5-exam.js', 'en5.js'];
const RUNTIME = ['math5.js', 'math5-hard.js', 'tv5-exam.js', 'en5.js'];
const ctx = L.makeContext(SRC);
const get = n => vm.runInContext(n, ctx);
const shuffle = get('shuffle'), mc = get('mc'), ord = get('ord'), pick = get('pick');

/* ---------------- TOÁN ---------------- */
const WEEKS5 = get('WEEKS5');
const MATH_BANK = WEEKS5.map((wk, w) => wk.lv.map((_, d) => L.genUnique(get('m5Lesson')(w, d), 24, `Toán chặng ${w + 1} bài ${d + 1}`)));

/* ---------------- TIẾNG VIỆT ---------------- */
const TV5 = get('TV5_A').concat(get('TV5_B'));
const orderPrompt = items => {
  if (/^(Mở bài|Thân bài|Kết bài)/.test(items[0])) return 'Sắp xếp các ý thành dàn ý hợp lí:';
  if (/ngày \d+ tháng/.test(items[0]) || /thân mến|Kính gửi/.test(items.join(' '))) return 'Sắp xếp các phần của văn bản theo đúng thứ tự:';
  const sent = items.filter(x => /[.!?]$/.test(x)).length;
  return sent >= items.length - 0 && items.every(x => /^[A-ZĐÂĂÊÔƠƯÁÀẢÃẠ]/.test(x)) ? 'Sắp xếp các câu thành đoạn văn hợp lí:' : 'Sắp xếp các từ ngữ thành câu đúng:';
};
const mcq = (skill, [q, a, w, ex], extra = {}) => mc(skill, q, a, w, Object.assign(ex ? { explain: ex } : {}, extra));
const TV_UNITS = TV5.map(U => ({ lab: U.lab, t: U.t, vn: U.vn }));
const TV_BANK = TV5.map((U, u) => {
  const where = `TV ${U.lab}`;
  const PS = Array.isArray(U.P) ? U.P : [Object.assign({ R: U.R }, U.P)];
  const dedupe = (arr, n, w) => { const out = [], k = new Set(); for (const q of arr) { L.checkQ(q, w); const key = L.qKey(q); if (k.has(key)) continue; k.add(key); out.push(q); } if (out.length < n) throw new Error(`${w}: chỉ có ${out.length} câu`); return out; };
  const R = PS.flatMap(P => P.R.map(x => mcq('dochieu', x, { passage: { title: P.title, text: P.text } })));
  const V = U.V.map(x => mcq('tucau', x));
  const G = U.G.map(x => mcq(/dấu|viết hoa|Tên/.test(x[0]) ? 'daucau' : 'tucau', x));
  const S = U.S.map(([right, wr]) => mc('chinhta', 'Nghe đọc và chọn từ viết đúng chính tả:', right, wr, { say: right, explain: `Viết đúng: “${right}”.` }));
  const B = U.B.map(([blank, ans, opts, full]) => mc('chinhta', `Điền ${opts.join(' hay ')} vào chỗ trống:`, ans, opts.filter(o => o !== ans), { big: blank, say: full, explain: `Viết đúng: “${full}”.` }));
  const O = U.O.map(items => ord(/^(Mở bài|Thân bài|Kết bài)/.test(items[0]) || items.length && /[.!?]$/.test(items[0]) ? 'doanvan' : 'doanvan', orderPrompt(items), items));
  const W = U.W.map(x => mcq('doanvan', x));
  const lv0 = dedupe(R.concat(shuffle(V).slice(0, 5), shuffle(G).slice(0, 5)), 16, where + ' Đọc hiểu');
  const lv1 = dedupe(S.concat(B, V), 18, where + ' Chính tả & Từ ngữ');
  const lv2 = dedupe(G.concat(O, W), 16, where + ' Câu & Viết');
  return [lv0, lv1, lv2];
});

/* ---------------- ENGLISH ---------------- */
const EN5 = get('EN5');
const EN_UNITS = EN5.map(U => ({ t: U.t, vn: U.vn, w: U.w, c: U.c, lab: U.lab }));
const others = (arr, x, n) => shuffle(arr.filter(a => a !== x)).slice(0, n);
const firstSound = w => { const DG = ['sh', 'ch', 'th', 'wh', 'qu', 'ph']; const s = w.toLowerCase(); return DG.find(d => s.startsWith(d)) || s[0]; };
const EG = {
  what: U => { const w = pick(U.w); return mc('en_vocab', 'What is this?', w[0], others(U.w, w, 2).map(o => o[0]), { visual: `<div class="emo">${w[1]}</div>`, voice: [['en', 'What is this?']], explain: `${w[0]} = ${w[2]}` }); },
  pic: U => { const w = pick(U.w); return mc('en_vocab', 'Choose the correct picture:', w[1], others(U.w, w, 2).map(o => o[1]), { big: w[0], emo: true, voice: [['en', w[0]]], explain: `${w[0]} ${w[1]} = ${w[2]}` }); },
  mean: U => { const w = pick(U.w); return mc('en_vocab', 'What does this word mean?', w[2], others(U.w, w, 2).map(o => o[2]), { big: w[0], voice: [['en', w[0]]], explain: `${w[0]} = ${w[2]}` }); },
  word: U => { const w = pick(U.w); return mc('en_vocab', 'Which word means:', w[0], others(U.w, w, 2).map(o => o[0]), { big: w[2], bigSmall: true, voice: [['en', 'Which word is it?']], explain: `${w[2]} = ${w[0]}` }); },
  listenWord: U => { const w = pick(U.w); return mc('en_listen', 'Listen and choose the word:', w[0], others(U.w, w, 2).map(o => o[0]), { voice: [['en', w[0]]], auto: true, explain: `${w[0]} = ${w[2]}` }); },
  listenPic: U => { const w = pick(U.w); return mc('en_listen', 'Listen and choose the picture:', w[1], others(U.w, w, 2).map(o => o[1]), { emo: true, voice: [['en', w[0]]], auto: true, explain: `${w[0]} = ${w[2]}` }); },
  listenSent: U => { const c = pick(U.c); return mc('en_listen', 'Listen and choose the sentence:', c[0], others(U.c, c, 2).map(o => o[0]), { voice: [['en', c[0]]], auto: true, explain: `${c[0]} = ${c[1]}` }); },
  letter: U => { const W = U.w.filter(w => /^[a-z]{3,}/i.test(w[0])); const w = pick(W); const pre = firstSound(w[0]); const pool = pre.length === 2 ? ['sh', 'ch', 'th', 'wh', 'qu', 'ph', 'st', 'tr'] : 'bcdfghjklmnprstvwy'.split(''); const wr = shuffle(pool.filter(x => x !== pre)).slice(0, 2);
    return mc('en_listen', 'Listen and complete the word:', pre, wr, { big: '_'.repeat(pre.length) + w[0].slice(pre.length), visual: `<div class="emo sm">${w[1]}</div>`, voice: [['en', w[0]]], explain: `${w[0]} = ${w[2]}` }); },
  order: U => { const C = U.c.filter(c => c[0].split(' ').length >= 3 && c[0].split(' ').length <= 9); const c = pick(C); return ord('en_sent', 'Put the words in the correct order:', c[0].split(' '), { voice: [['en', c[0]]], explain: `${c[0]} = ${c[1]}` }); },
  gap: U => { const [s, a, w] = pick(U.g); return mc('en_sent', 'Choose the correct word:', a, w, { big: s, bigSmall: true, voice: [['en', 'Choose the correct word.']], explain: s.replace('___', a) }); },
  sentMean: U => { const c = pick(U.c); return mc('en_sent', 'What does this sentence mean?', c[1], others(U.c, c, 2).map(o => o[1]), { big: c[0], bigSmall: true, voice: [['en', c[0]]], explain: `${c[0]} = ${c[1]}` }); },
  qa: U => { const [q, a, w] = pick(U.qa); return mc('en_sent', 'Choose the correct answer:', a, w, { big: q, bigSmall: true, voice: [['en', q]], explain: `${q} → ${a}` }); }
};
const EN_BANK = EN5.map(U => [
  L.genUnique([EG.what, EG.pic, EG.mean, EG.word, EG.what, EG.pic].map(g => () => g(U)), 22, `EN ${U.lab} Vocabulary`),
  L.genUnique([EG.listenWord, EG.listenPic, EG.listenSent, EG.letter, EG.listenSent].map(g => () => g(U)), 22, `EN ${U.lab} Listen`),
  L.genUnique([EG.order, EG.gap, EG.sentMean, EG.qa, EG.gap, EG.order].map(g => () => g(U)), 20, `EN ${U.lab} Sentences`)
]);

/* ---------------- Kiểm tra mã chạy trên trình duyệt ---------------- */
const CH5 = get('CH5');
CH5.forEach((Ls, w) => Ls.forEach((g, i) => { for (let t = 0; t < 120; t++) L.checkQ(g(), `Thử thách Toán ${w + 1}.${i + 1}`); }));
for (let k = 0; k < 13; k++) get(`buildExamToan(${k},${k >= 10})`).forEach((q, i) => L.checkQ(q, `Đề Toán ${k + 1} câu ${i + 1}`));
for (const h of ['gk1', 'ck1', 'gk2']) for (let k = 0; k < 3; k++) for (let t = 0; t < 20; t++) get(`buildExamToanHK('${h}',${k})`).forEach((q, i) => L.checkQ(q, `Đề Toán ${h} ${k + 1} câu ${i + 1}`));
/* Đề English: đủ phần, đáp án không trùng phương án sai, chỗ trống khớp đoạn văn */
get('EN_TESTS5').forEach((T, k) => {
  const w = `Đề English ${k + 1}`;
  const chkMC = (a, wr, where) => { if (!a || wr.length < 2 || wr.includes(a) || new Set(wr).size !== wr.length) throw new Error(`${w} ${where}: phương án lỗi (${a} | ${wr})`); };
  if (!T.g || T.lis.length !== 3 || T.cloze.ans.length !== 4 || T.read.tf.length !== 2 || T.read.mc.length !== 3 || T.gram.length !== 4 || T.ord.length !== 2) throw new Error(w + ': thiếu phần');
  T.lis.forEach(([sc, q, a, wr], i) => { if (!sc.length || !q) throw new Error(w + ' nghe ' + i); chkMC(a, wr, 'nghe ' + (i + 1)); });
  T.cloze.ans.forEach(([a, wr], i) => { if (!T.cloze.text.includes(`(${i + 1}) ___`)) throw new Error(`${w}: thiếu chỗ trống (${i + 1})`); chkMC(a, wr, 'điền từ ' + (i + 1)); if (wr.length !== 3) throw new Error(w + ' điền từ cần 4 phương án'); });
  T.read.mc.forEach(([q, a, wr], i) => chkMC(a, wr, 'đọc hiểu ' + (i + 1)));
  T.gram.forEach(([q, a, wr], i) => { if (!q.includes('___')) throw new Error(w + ' ngữ pháp ' + i); chkMC(a, wr, 'ngữ pháp ' + (i + 1)); });
  T.u.forEach(u => { if (!get('EN5')[u]) throw new Error(w + ': Unit sai ' + u); });
  const words = T.read.text.split(/\s+/).length; if (words < 80) throw new Error(`${w}: bài đọc quá ngắn (${words} từ)`);
});
get('EXT').forEach((P, k) => { if (P.qs.length < 5 || P.lt.length < 3) throw new Error('Đề TV ' + (k + 1) + ' thiếu câu'); });

/* ---------------- Ghi vào index.html ---------------- */
let html = fs.readFileSync(L.HTML, 'utf8');
const setLine = (prefix, value) => {
  const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*$', 'm');
  if (!re.test(html)) throw new Error('Không tìm thấy dòng: ' + prefix);
  html = html.replace(re, () => prefix + value + ';');
};
setLine('const MATH_BANK=', JSON.stringify(MATH_BANK));
setLine('const TV_UNITS=', JSON.stringify(TV_UNITS));
setLine('const TV_BANK=', JSON.stringify(TV_BANK));
setLine('const EN_UNITS=', JSON.stringify(EN_UNITS));
setLine('const EN_BANK=', JSON.stringify(EN_BANK));

const runtime = RUNTIME.map(f => `/* ---- content-src/${f} ---- */\n` + fs.readFileSync(path.join(L.ROOT, 'content-src', f), 'utf8').trim()).join('\n');
const BEGIN = '/* @@LOP5-BEGIN@@ (tự sinh từ content-src/ bằng scripts/build-content.js — đừng sửa tay) */';
const END = '/* @@LOP5-END@@ */';
const block = BEGIN + '\n' + runtime + '\n' + END;
if (html.includes(BEGIN.slice(0, 18))) {
  const a = html.indexOf('/* @@LOP5-BEGIN@@'), b = html.indexOf(END) + END.length;
  html = html.slice(0, a) + block + html.slice(b);
} else {
  const anchor = '\nconst qKey=';
  const i = html.indexOf(anchor);
  if (i < 0) throw new Error('Không tìm thấy chỗ chèn mã lớp 5');
  html = html.slice(0, i + 1) + block + '\n' + html.slice(i + 1);
}
/* Chặn trùng tên biến/hàm giữa mã lớp 5 và phần còn lại của app (lỗi này làm trắng trang) */
const topNames = src => new Set([...src.matchAll(/^(?:const|let|var|function|async function)\s+([A-Za-z_$][\w$]*)/gm)].map(m => m[1]));
const inBlock = topNames(runtime), rest = topNames(html.replace(block, ''));
const clash = [...inBlock].filter(n => rest.has(n));
if (clash.length) throw new Error('Trùng tên với mã có sẵn trong index.html: ' + clash.join(', '));
fs.writeFileSync(L.HTML, html);

const n = B => B.flat(2).length;
console.log(`Đã ghi public/index.html — Toán ${n(MATH_BANK)} câu, Tiếng Việt ${n(TV_BANK)} câu, English ${n(EN_BANK)} câu.`);
