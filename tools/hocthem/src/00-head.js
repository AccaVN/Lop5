/* ============ HỌC THÊM: TOÁN TƯ DUY, THẺ KIẾN THỨC, GỢI Ý, ÔN TẬP THÔNG MINH ============
   Dùng chung cho các app Học Vui (Lớp Lá, 1, 2, 3, 4, 5). Chèn TRƯỚC lớp Duolingo (DUO) nên lớp DUO
   bọc bên ngoài: làm lại câu sai vẫn chạy cho cả bài Tư duy.
   - 🧩 Toán tư duy: 7 nhóm kỹ năng, đề tự sinh theo lớp, có hình vẽ, gợi ý nhiều bước, thử thách mỗi ngày.
   - 📘 Thẻ kiến thức cho Toán và Tư duy (mở ngay khi làm sai), ⚑ báo câu sai (admin xem được).
   - Ôn câu sai bằng câu cùng dạng nhưng đổi số; mục "Cần ôn lại" nhắc ôn theo lịch 1–3–7 ngày.
   - Phụ huynh: nhận xét tuần, dạng bài con hay sai, mục tiêu phút mỗi ngày, quà do bố mẹ đặt.
   - Bảng xếp hạng thêm "Tuần này" và "Chăm chỉ".
   Nguồn: tools/hocthem/src/*.js → build.py ghép thành hocthem.js → inject.py chèn vào public/index.html. */
(function(){
"use strict";
if(window.__HT__)return;
if(typeof check!=='function'||typeof finish!=='function'||typeof renderQ!=='function'||typeof renderAnswer!=='function'||typeof renderHome!=='function'||typeof tabbar!=='function')return;
window.__HT__=1;
const KM=/^lop(la|\d)_/.exec(typeof KEY==='string'?KEY:'');
const GRADE=KM?(KM[1]==='la'?0:+KM[1]):3;
const GNAME=GRADE===0?'Lớp Lá':'lớp '+GRADE;
const LOGGED=()=>typeof TOKEN!=='undefined'&&!!TOKEN&&typeof ROLE!=='undefined'&&ROLE==='student';
const sayVi=t=>{try{if(S.autoRead!==false)speak([['vi',t]],{silent:true});}catch(e){}};
const H=s=>esc(s==null?'':s);

/* ---------------- CSS ---------------- */
const CSS=`
.tabs.ht7{grid-template-columns:repeat(7,1fr)}
.tabs.ht7 .tab{font-size:10px;letter-spacing:-.2px;min-width:0;padding-left:1px;padding-right:1px;overflow-wrap:anywhere;line-height:1.1}
.tabs.ht7 .tab span{font-size:24px}
.ht-page h1{margin-bottom:4px}
.ht-row{display:flex;align-items:center;gap:12px;width:100%;border:2px solid var(--line);border-bottom-width:4px;background:var(--card);color:var(--ink);border-radius:16px;padding:10px 12px;margin:0 0 10px;text-align:left;font:inherit}
.ht-row:active{transform:translateY(2px);border-bottom-width:2px;margin-bottom:12px}
.ht-row .n{flex:none;width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;background:var(--soft);color:var(--c,var(--sky))}
.ht-row .tx{flex:1;min-width:0}
.ht-row .tx b{display:block;font-size:17px;line-height:1.2}
.ht-row .tx small{display:block;color:var(--muted);font-size:13px;font-weight:600;margin-top:2px}
.ht-row .go{font-size:22px;color:var(--muted);font-weight:800}
.ht-row .ht-stars{color:#F5A700;font-size:16px;letter-spacing:1px;white-space:nowrap}
.ht-row .ht-stars i{color:var(--lock);font-style:normal}
.ht-bar{height:8px;border-radius:8px;background:var(--soft);overflow:hidden;margin-top:6px}
.ht-bar i{display:block;height:100%;background:var(--c,var(--leaf));border-radius:8px}
.ht-gh{display:flex;align-items:center;gap:10px;margin:18px 2px 8px}
.ht-gh .ic{font-size:26px}
.ht-gh h2{margin:0;font-size:20px}
.ht-gh small{margin-left:auto;color:var(--muted);font-weight:700;font-size:13px}
.ht-banner{width:calc(100% - 58px)}
.ht-banner.full{width:100%;margin:0 0 12px}
.ht-due{border:2px solid var(--berry);border-radius:18px;background:var(--card);padding:12px 14px;margin:12px 14px 0 44px;position:relative;z-index:1}
.ht-due.full{margin:0 0 14px}
.ht-due h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:6px}
.ht-due h3 small{margin-left:auto;font-size:12px;color:var(--muted);font-weight:700}
.ht-due .it{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px dashed var(--line);font-weight:700;font-size:15px}
.ht-due .it:first-of-type{border-top:0}
.ht-due .it i{flex:none;width:9px;height:9px;border-radius:50%;background:var(--berry)}
.ht-due .it span{flex:1;min-width:0}
.ht-due .it button{flex:none;border:0;background:none;color:var(--berry-d);font-weight:800;font-size:14px;padding:4px 2px}
.ht-due p{margin:6px 0 0;font-size:13px;color:var(--muted)}
.ht-daily{border-color:var(--sun);background:linear-gradient(135deg,rgba(255,200,61,.18),transparent)}
/* thẻ kiến thức */
.ht-kc h2{text-align:left;margin:0 0 12px;font-size:22px;padding-right:30px}
.ht-kc .tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:left}
.ht-kc .tl{border-radius:16px;padding:12px;min-height:92px}
.ht-kc .tl b{display:block;font-size:18px;line-height:1.15;margin-bottom:4px}
.ht-kc .tl span{display:block;font-size:14px;font-weight:600;line-height:1.3;color:var(--ink)}
.ht-kc .tl em{display:block;font-style:normal;font-weight:800;font-size:13px;margin-top:6px;line-height:1.3}
.ht-kc .t0{background:#FFE1E7}.ht-kc .t0 b,.ht-kc .t0 em{color:#B4234A}
.ht-kc .t1{background:#FFF1C7}.ht-kc .t1 b,.ht-kc .t1 em{color:#7A5200}
.ht-kc .t2{background:#DDF4E8}.ht-kc .t2 b,.ht-kc .t2 em{color:#16774A}
.ht-kc .t3{background:#E1EEFF}.ht-kc .t3 b,.ht-kc .t3 em{color:#1F5AA6}
.ht-kc .tl span{color:#2A2F45}
.ht-kc .tip{display:flex;gap:12px;align-items:center;text-align:left;border:2px solid var(--line);border-radius:16px;padding:12px;margin:12px 0}
.ht-kc .tip .ow{font-size:38px;flex:none}
.ht-kc .tip small{display:block;color:var(--berry-d);font-weight:800;font-size:12px;letter-spacing:.4px;text-transform:uppercase}
.ht-kc .tip p{margin:2px 0 0;font-weight:700;font-size:15px}
.ht-kc .x{position:absolute;right:16px;top:14px;border:0;background:var(--soft);color:var(--muted);width:36px;height:36px;border-radius:12px;font-size:20px;font-weight:800}
.ht-kc{position:relative}
/* màn làm bài */
.quiz .prompt.ht-long{font-size:19px;line-height:1.4}
.quiz .prompt.ht-mid{font-size:21px}
.ht-fig{display:flex;justify-content:center;margin:4px 0 8px;color:var(--ink)}
.ht-fig svg{max-width:100%;height:auto;overflow:visible}
.ht-cap{text-align:center;color:var(--muted);font-weight:700;font-size:14px;margin:2px 0 8px}
.ht-emo{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;font-size:34px;line-height:1.1;margin:6px 0 10px}
.ht-emo.wrap{max-width:330px;margin-left:auto;margin-right:auto}
.ht-big{font-size:64px;text-align:center;line-height:1}
.ht-two{display:flex;gap:10px;justify-content:center}.ht-two svg{width:120px;height:auto}
.ht-eqs{display:grid;gap:6px;justify-items:center;margin:6px 0}.ht-eq{font-size:26px;font-weight:800;background:var(--card,#fff);border:2px solid var(--line,#D6E2F0);border-radius:14px;padding:6px 14px;letter-spacing:1px}
.ht-mach span.hd{font-size:13px;font-weight:800;background:var(--soft,#EEF4FB)}
.ht-grid{display:grid;gap:6px;max-width:240px;margin:6px auto 10px}
.ht-grid span{border:2px solid var(--line);border-radius:12px;background:var(--card);font-weight:800;font-size:20px;text-align:center;padding:10px 4px}
.ht-grid span.hid{border-color:var(--berry);color:var(--berry-d);background:var(--soft)}
.ht-pyr{display:flex;flex-direction:column;align-items:center;gap:6px;margin:6px 0 10px}
.ht-pyr .pr{display:flex;gap:6px}
.ht-pyr span{min-width:54px;border:2px solid var(--line);border-radius:12px;background:var(--card);font-weight:800;font-size:20px;text-align:center;padding:8px 6px}
.ht-pyr span.hid{border-color:var(--berry);color:var(--berry-d)}
.ht-slots{display:flex;flex-direction:column;align-items:center;gap:10px;border:2px solid var(--line);border-radius:18px;padding:14px;margin:4px 0 10px}
.ht-slots .sr{display:flex;align-items:center;gap:10px;font-size:22px;font-weight:800}
.ht-slots .sb{min-width:76px;height:52px;border:2.5px dashed var(--lock-d);border-radius:14px;background:var(--soft);font-size:22px;font-weight:800;color:var(--ink)}
.ht-slots .sb.on{border-color:var(--sky);border-style:solid}
.ht-slots .sb.fill{border-style:solid;border-color:var(--berry);background:var(--card)}
.ht-slots.ok .sb.fill{border-color:var(--leaf)}
.ht-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.ht-chips .chip{min-width:58px;font-size:22px;font-weight:800;padding:10px 12px}
.ht-chips .chip.used{opacity:.25;pointer-events:none}
.ht-tools{display:flex;justify-content:center;gap:16px;margin-top:10px}
.ht-hint{border:0;background:none;color:var(--berry-d);font-weight:800;font-size:16px;padding:6px 4px}
.ht-hint:disabled{color:var(--muted)}
.ht-note{text-align:center;color:var(--muted);font-size:13px;font-weight:700;margin-top:6px}
.ht-bub{display:flex;gap:10px;align-items:flex-start;margin:4px 0 12px}
.ht-bub .ow{font-size:34px;flex:none;line-height:1}
.ht-bub div{flex:1;background:var(--card);border:2px solid var(--line);border-radius:16px;padding:10px 12px;font-weight:700;font-size:16px;line-height:1.35}
.ht-bub a{display:inline-block;margin-top:6px;color:var(--berry-d);font-weight:800;cursor:pointer}
.ht-rvnote{display:inline-block;background:var(--soft);color:var(--muted);border-radius:10px;padding:3px 10px;font-size:13px;font-weight:800;margin:0 0 6px}
.ht-fbx{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 2px}
.ht-fbx button{border:2px solid currentColor;background:rgba(255,255,255,.55);color:inherit;border-radius:12px;padding:7px 12px;font-weight:800;font-size:14px}
.ht-fbx .rp{border:0;background:none;text-decoration:underline;padding:7px 4px;opacity:.85}
/* phụ huynh, quà */
.ht-gift{display:flex;align-items:center;gap:12px;border:2px solid var(--line);border-radius:16px;padding:10px 12px;margin-bottom:10px;background:var(--card)}
.ht-gift .gi{flex:none;width:46px;height:46px;border-radius:14px;background:var(--soft);display:flex;align-items:center;justify-content:center;font-size:26px}
.ht-gift .gt{flex:1;min-width:0}
.ht-gift .gt b{display:block;font-size:16px}
.ht-gift .gt small{display:block;color:var(--muted);font-weight:700;font-size:13px}
.ht-gift .ht-bar i{background:var(--sun)}
.ht-wallet{background:var(--sun);color:#2A1E00;border-radius:20px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:12px;box-shadow:0 5px 0 #C99400}
.ht-wallet b{font-size:30px;display:block;line-height:1}
.ht-wallet small{font-weight:800}
.ht-warn{background:#FFE4E8;color:#9E1F3D;border-radius:14px;padding:10px 12px;font-weight:700;font-size:14px;margin-bottom:12px}
.ht-wk p{margin:6px 0;font-size:15px;line-height:1.4}
.ht-wk{background:linear-gradient(135deg,rgba(240,71,106,.08),transparent)}
.ht-wk h2 small{font-size:12px;color:var(--muted);font-weight:700;margin-left:6px}
.ht-mis summary{list-style:none;display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid var(--line);font-weight:700;cursor:pointer}
.ht-mis summary::-webkit-details-marker{display:none}
.ht-mis summary span{flex:1}
.ht-mis summary b{color:var(--berry-d);font-size:14px;white-space:nowrap}
.ht-mis summary b.ok{color:var(--leaf-d)}
.ht-mis .q{font-size:14px;padding:6px 0 6px 18px;border-left:3px solid var(--line);margin:0 0 6px 4px}
.ht-mis .q small{display:block;color:var(--muted)}
.ht-mini{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.ht-mini .field{flex:1;min-width:120px}
.ht-icons{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.ht-icons button{font-size:24px;width:44px;height:44px;border-radius:12px;border:2px solid var(--line);background:var(--card)}
.ht-icons button[aria-pressed="true"]{border-color:var(--sky);background:var(--soft)}
.ht-subseg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:var(--soft);border-radius:14px;padding:4px;margin:0 0 12px}
.ht-subseg button{border:0;background:none;border-radius:10px;padding:8px 2px;font-weight:800;font-size:15px;color:var(--muted)}
.ht-subseg button[aria-selected="true"]{background:var(--berry);color:#fff}
.seg.ht4{grid-template-columns:repeat(4,1fr)}
.seg.ht4 button{font-size:13px;padding:8px 1px}
.seg.ht5{grid-template-columns:repeat(5,1fr)}
.seg.ht5 button{font-size:12px;padding:8px 1px}
.ht-rep{text-align:left}
.ht-rep label{display:flex;gap:8px;align-items:center;padding:8px 0;font-weight:700}
.ht-rep textarea{width:100%;min-height:70px;border:2px solid var(--line);border-radius:12px;padding:8px;font:inherit;background:var(--card);color:var(--ink)}
.ht-adm .rq{border-top:1px solid var(--line);padding:10px 0}
.ht-adm .rq b{display:block}
.ht-adm .rq small{display:block;color:var(--muted)}
.ht-adm .rq .acts{margin-top:6px;display:flex;gap:8px}
.ht-adm .rq.done{opacity:.55}
`;
const stEl=document.createElement('style');stEl.id='ht-css';stEl.textContent=CSS;document.head.appendChild(stEl);
