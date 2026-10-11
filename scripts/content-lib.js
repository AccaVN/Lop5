/* Nạp các hàm tiện ích của app (public/index.html) + các file nội dung trong content-src/
   vào một môi trường Node để tạo sẵn ngân hàng câu hỏi và kiểm tra lỗi. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'public', 'index.html');

const HELPERS = ['const rnd=', 'const pick=', 'const shuffle=', 'const esc=', 'function mc(', 'function inp(', 'function ord(',
  'function nearNums(', 'const fmtN=', 'function tableHTML(', 'const qKey=', 'function uniqList('];

function makeContext(files) {
  const lines = fs.readFileSync(HTML, 'utf8').split('\n');
  const code = [];
  for (const h of HELPERS) {
    const l = lines.find(x => x.startsWith(h));
    if (!l) throw new Error('Không tìm thấy hàm tiện ích: ' + h);
    code.push(l);
  }
  const ctx = { console, Math, JSON, String, Number, Array, Object, Set, Map, RegExp };
  vm.createContext(ctx);
  vm.runInContext(code.join('\n'), ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, 'content-src', f), 'utf8') + '\n;', ctx, { filename: f });
  return ctx;
}

/* Kiểm tra một câu hỏi: đủ trường, đáp án nằm trong lựa chọn, không có NaN/undefined. */
function checkQ(q, where) {
  const errs = [];
  const s = JSON.stringify(q);
  if (/undefined|NaN|Infinity|\[object Object\]/.test(s)) errs.push('có undefined/NaN');
  if (!q.prompt) errs.push('thiếu prompt');
  if (q.type === 'mc') {
    if (!Array.isArray(q.options) || q.options.length < 2) errs.push('ít hơn 2 lựa chọn');
    else {
      if (!q.options.includes(q.answer)) errs.push('đáp án không có trong lựa chọn');
      if (new Set(q.options).size !== q.options.length) errs.push('lựa chọn bị trùng: ' + q.options.join(' | '));
    }
  } else if (q.type === 'input') {
    if (typeof q.answer !== 'number' || !isFinite(q.answer)) errs.push('đáp án không phải số');
    if (q.answer < 0) errs.push('đáp án âm');
    const dec = String(q.answer).split('.')[1];
    if (dec && dec.length > 4) errs.push('đáp án quá nhiều chữ số thập phân: ' + q.answer);
    if (String(q.answer).replace('.', '').length > 9) errs.push('đáp án quá dài: ' + q.answer);
  } else if (q.type === 'order') {
    if (!Array.isArray(q.answer) || !Array.isArray(q.items) || q.answer.length !== q.items.length) errs.push('câu sắp xếp lỗi');
    else if (q.answer.slice().sort().join('|') !== q.items.slice().sort().join('|')) errs.push('câu sắp xếp: các mục không khớp đáp án');
  } else errs.push('type lạ: ' + q.type);
  if (errs.length) throw new Error(where + ': ' + errs.join('; ') + '\n' + s.slice(0, 400));
}

const qKey = q => q.prompt + '|' + (q.big || '') + '|' + (Array.isArray(q.answer) ? q.answer.join() : q.answer);

/* Tạo n câu không trùng từ danh sách hàm sinh (xoay vòng). */
function genUnique(gens, n, where, tries = 400) {
  const out = [], keys = new Set();
  let i = 0, t = 0;
  while (out.length < n && t < tries) {
    const g = gens[i % gens.length]; i++; t++;
    const q = g();
    checkQ(q, where);
    const k = qKey(q);
    if (keys.has(k)) continue;
    keys.add(k); out.push(q);
  }
  if (out.length < n) throw new Error(`${where}: chỉ tạo được ${out.length}/${n} câu không trùng`);
  return out;
}

module.exports = { ROOT, HTML, makeContext, checkQ, genUnique, qKey };
