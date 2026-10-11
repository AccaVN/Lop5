#!/usr/bin/env node
/* Kiểm tra nhanh toàn bộ nội dung trên trình duyệt thật (Chromium, không cần database):
   mở public/index.html ở chế độ thử (window.__TEST__), dựng mọi bài Toán / Tiếng Việt / English,
   mọi đề luyện thi, hiển thị từng câu, trả lời đúng rồi bấm Kiểm tra — câu nào lỗi sẽ được in ra.
   Chạy:  npx playwright install chromium   (một lần)  rồi  node scripts/smoke-test.js [số vòng] */
const http = require('http');
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Cần cài: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const PUB = path.join(__dirname, '..', 'public');
const ROUNDS = +process.argv[2] || 3;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith('/api/')) { res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"error":"offline test"}'); }
  if (p === '/') p = '/index.html';
  const f = path.join(PUB, p);
  if (!f.startsWith(PUB) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.addInitScript(() => { window.__TEST__ = true; try { localStorage.clear(); } catch (e) {} });
  await page.goto(`http://localhost:${port}/index.html`);
  const result = await page.evaluate(async rounds => {
    const errs = [];
    let total = 0;
    const typedOf = a => numShow(a).replace(/\s/g, '');
    function run(q, where) {
      total++;
      try {
        Q = { mode: 'test', level: 0, qs: [q], i: 0, correct: 0, coins: 0, start: Date.now(), gamePlayed: true };
        renderQ();
        if (!document.querySelector('.prompt')) throw new Error('không hiện câu hỏi');
        if (q.type === 'mc') {
          if (!q.options.includes(q.answer)) throw new Error('đáp án không có trong lựa chọn');
          const btn = [...document.querySelectorAll('.opt')].find(b => q.options[+b.dataset.k] === q.answer);
          btn.click();
        } else if (q.type === 'input') {
          for (const k of typedOf(q.answer)) document.querySelector(`.key[data-k="${k}"]`).click();
        } else if (q.type === 'order') {
          const used = new Set();
          for (const a of q.answer) { const k = q.items.findIndex((t, j) => t === a && !used.has(j)); used.add(k); document.querySelector(`#pool .chip[data-k="${k}"]`).click(); }
        }
        if (document.querySelector('#check').disabled) throw new Error('nút Kiểm tra vẫn bị khóa');
        document.querySelector('#check').click();
        if (Q.correct !== 1) throw new Error('trả lời đúng mà app chấm sai (typed=' + Q.typed + ')');
        const txt = document.querySelector('#scr, .quiz').innerText;
        if (/undefined|NaN|\[object/.test(txt)) throw new Error('màn hình có chữ undefined/NaN');
      } catch (e) { errs.push(where + ': ' + e.message + ' | ' + (q.prompt || '') + ' ' + (q.big || '') + ' → ' + JSON.stringify(q.answer)); }
    }
    for (let r = 0; r < rounds; r++) {
      for (let w = 0; w < WEEKS.length; w++) for (let d = 0; d < 6; d++) { const qs = buildLevel(w, d); if (qs.length !== 15) errs.push(`Toán ${w + 1}.${d + 1}: ${qs.length} câu`); qs.forEach((q, i) => run(q, `Toán chặng ${w + 1} bài ${d + 1} câu ${i + 1}`)); }
      for (let u = 0; u < TV_UNITS.length; u++) for (let d = 0; d < 3; d++) { const qs = buildTv(u, d); if (qs.length !== 15) errs.push(`TV ${u + 1}.${d + 1}: ${qs.length} câu`); qs.forEach((q, i) => run(q, `TV phần ${u + 1} bài ${d + 1} câu ${i + 1}`)); }
      for (let u = 0; u < EN_UNITS.length; u++) for (let d = 0; d < 3; d++) { const qs = buildEn(u, d); if (qs.length !== 15) errs.push(`EN ${u + 1}.${d + 1}: ${qs.length} câu`); qs.forEach((q, i) => run(q, `EN ${EN_UNITS[u].lab} bài ${d + 1} câu ${i + 1}`)); }
      for (const subj of ['toan', 'tv', 'en']) EXAM_SUBJ[subj].list().forEach((_, k) => EXAM_SUBJ[subj].build(k).forEach((q, i) => run(q, `Đề ${subj} ${k + 1} câu ${i + 1}`)));
    }
    // Màn hình chính
    for (const f of ['renderHome', 'renderTv', 'renderEnglish', 'renderSpeed']) { try { window[f] ? window[f]() : eval(f + '()'); } catch (e) { errs.push('Màn hình ' + f + ': ' + e.message); } }
    try { renderExams('toan'); renderExams('tv'); renderExams('en'); } catch (e) { errs.push('Màn luyện đề: ' + e.message); }
    try { for (let u = 0; u < EN_UNITS.length; u++) { renderCards(u, u * 3); renderSpeak(u, 0); renderSpeak(u, 1); } } catch (e) { errs.push('Từ vựng/Luyện nói: ' + e.message); }
    try { renderSpeak('time', 0); } catch (e) { errs.push('Luyện nói Daily routines: ' + e.message); }
    // Giọng đọc: chuẩn hoá số thập phân, phân số, đơn vị
    const sp = [viSpeech('3,05 + 12,5 = ?'), viSpeech('2 1/3 m²'), viSpeech('45 km/giờ'), viSpeech('25%'), viSpeech('tỉ lệ 1 : 1 000')];
    return { errs, total, sp };
  }, ROUNDS);
  await browser.close(); server.close();
  console.log('Đã kiểm tra', result.total, 'lượt câu hỏi.');
  console.log('Đọc thử:', result.sp.join(' | '));
  const all = pageErrors.map(e => 'Lỗi JS: ' + e).concat(result.errs);
  if (all.length) { console.log(all.length + ' lỗi:'); all.slice(0, 80).forEach(e => console.log(' - ' + e)); process.exit(1); }
  console.log('Không có lỗi ✔');
})().catch(e => { console.error(e); process.exit(1); });
