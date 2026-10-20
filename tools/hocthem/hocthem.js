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
/* ---------------- KHO THẺ KIẾN THỨC (Toán) ----------------
   Mỗi thẻ: t = tên, g = [lớp nhỏ nhất, lớp lớn nhất] (0 = Lớp Lá), re = từ khóa để tìm thẻ hợp với bài/câu hỏi,
   sk = kỹ năng gần nhất, tiles = 4 ô [tiêu đề, ý chính, ví dụ], tip = mẹo nhớ của Cú Bông. */
const KC=[
/* ---- số và đếm ---- */
{id:'dem5',t:'Đếm và nhận biết số',g:[0,1],re:/đếm|chữ số|số lượng|các số (0|1|6) đến|số 0\b|mấy và mấy/i,sk:['so'],
 tiles:[['Chỉ tay','Chạm vào từng đồ vật và đếm to','1, 2, 3, 4, 5'],['Số cuối cùng','Số đếm sau cùng là số lượng cả nhóm','🍎🍎🍎 → 3 quả'],['Số 0','Không có đồ vật nào thì viết số 0','đĩa trống → 0'],['Mấy và mấy','Một nhóm tách được thành hai nhóm nhỏ','5 gồm 2 và 3']],
 tip:'Đếm xong một đồ vật thì đánh dấu lại, để không đếm sót, không đếm hai lần.'},
{id:'sosanh0',t:'So sánh số lượng',g:[0,1],re:/nhiều hơn|ít hơn|so sánh|bằng nhau|lớn hơn|bé hơn/i,sk:['so'],
 tiles:[['Nối từng cặp','Nối mỗi đồ vật nhóm này với một đồ vật nhóm kia','nhóm còn thừa là nhóm nhiều hơn'],['Dấu >','Miệng cá sấu há về phía số lớn','5 > 3'],['Dấu <','Đầu nhọn chỉ về số bé','2 < 4'],['Dấu =','Hai bên bằng nhau','4 = 4']],
 tip:'Cá sấu tham ăn luôn há miệng về phía số lớn hơn.'},
{id:'sosanh',t:'So sánh, sắp xếp số',g:[1,5],re:/so sánh|lớn nhất|bé nhất|sắp xếp|xếp số|thứ tự|lớn hơn|bé hơn|dấu thích hợp|dấu >, <, =/i,sk:['so'],
 tiles:[['Nhiều chữ số hơn','Số nào có nhiều chữ số hơn thì lớn hơn','1 000 > 999'],['Cùng số chữ số','So từng hàng từ trái sang phải','457 < 462 (5 < 6)'],['Lớn nhất, bé nhất','So hết các số rồi chọn','35, 53, 30 → lớn nhất 53'],['Thứ tự','Bé đến lớn: tăng dần; lớn đến bé: giảm dần','12, 21, 102']],
 tip:'Viết các số thẳng hàng theo cột rồi so từ hàng cao nhất xuống.'},
{id:'cautao',t:'Cấu tạo số, hàng',g:[1,3],re:/chục và đơn vị|cấu tạo|giá trị (của )?(mỗi )?chữ số|đọc, viết số|số có (hai|ba|bốn|năm) chữ số|các số đến|trăm, nghìn|số tròn|bảng số|tia số|liền trước|liền sau|gồm \d+ (nghìn|trăm|chục)|viết (thành tổng|số gồm)|đọc là|hàng (đơn vị|chục|trăm|nghìn)/i,sk:['so'],
 tiles:[['Hàng','Từ phải sang trái: đơn vị, chục, trăm, nghìn','3 528'],['Giá trị chữ số','Chữ số đứng ở hàng nào thì có giá trị của hàng đó','5 trong 3 528 là 500'],['Viết thành tổng','Tách theo từng hàng','3 528 = 3 000 + 500 + 20 + 8'],['Liền trước, liền sau','Kém 1 hoặc hơn 1','liền sau 999 là 1 000']],
 tip:'Đọc số theo từng nhóm từ trái sang phải; hàng nào là 0 thì đọc "linh" hoặc "không trăm".'},
{id:'cautao4',t:'Hàng và lớp',g:[4,5],re:/hàng và lớp|lớp triệu|nhiều chữ số|sáu chữ số|1 000 000|số tự nhiên|giá trị (của )?chữ số|đọc, viết số/i,sk:['so'],
 tiles:[['Lớp đơn vị','Hàng đơn vị, chục, trăm','…   … 528'],['Lớp nghìn','Nghìn, chục nghìn, trăm nghìn','… 734 …'],['Lớp triệu','Triệu, chục triệu, trăm triệu','2 734 528'],['Giá trị','Chữ số 7 ở hàng trăm nghìn là 700 000','2 734 528']],
 tip:'Tách số thành từng nhóm 3 chữ số từ phải sang trái, mỗi nhóm là một lớp.'},
{id:'lamtron',t:'Làm tròn số',g:[3,5],re:/làm tròn/i,sk:['so'],p:2,
 tiles:[['Nhìn hàng bên phải','Xem chữ số ngay sau hàng cần làm tròn','làm tròn đến chục: nhìn hàng đơn vị'],['Bé hơn 5','Giữ nguyên, các hàng sau thành 0','4 723 → 4 720'],['Từ 5 trở lên','Cộng thêm 1 vào hàng cần làm tròn','4 726 → 4 730'],['Số thập phân','Làm tương tự với hàng phần mười, phần trăm','3,47 → 3,5']],
 tip:'0, 1, 2, 3, 4 thì giữ; 5, 6, 7, 8, 9 thì tiến lên.'},
{id:'lama',t:'Số La Mã',g:[3,5],re:/la mã/i,sk:['so'],p:2,
 tiles:[['Chữ số','I = 1, V = 5, X = 10','XX = 20'],['Viết sau thì cộng','Chữ nhỏ đứng sau chữ lớn: cộng','VI = 6, XII = 12'],['Viết trước thì trừ','Chữ I đứng trước V, X: trừ','IV = 4, IX = 9'],['Không quá 3 lần','Một chữ không lặp quá 3 lần liền nhau','III = 3, IV = 4']],
 tip:'Đọc từ trái sang phải, gặp chữ bé đứng trước chữ lớn thì nhớ là phép trừ.'},
{id:'chanle',t:'Số chẵn, số lẻ, dãy số',g:[2,5],re:/chẵn|\blẻ\b|dãy số tự nhiên/i,sk:['so'],p:1,
 tiles:[['Số chẵn','Tận cùng 0, 2, 4, 6, 8','34, 120'],['Số lẻ','Tận cùng 1, 3, 5, 7, 9','27, 105'],['Hai số liền nhau','Hơn kém nhau 1 đơn vị','48 và 49'],['Đếm số','Từ a đến b có (b − a) + 1 số','từ 3 đến 9 có 7 số']],
 tip:'Chỉ cần nhìn chữ số tận cùng là biết số chẵn hay lẻ.'},
/* ---- cộng, trừ ---- */
{id:'cong0',t:'Thêm vào, gộp lại',g:[0,1],re:/phép cộng|gộp|thêm vào|thêm,|bảng cộng|cộng/i,sk:['congtru'],
 tiles:[['Gộp lại','Hai nhóm gộp thành một nhóm','2 🍎 và 3 🍎 là 5 🍎'],['Thêm vào','Đang có, được thêm nữa','4 thêm 1 là 5'],['Đổi chỗ','Đổi chỗ hai số, kết quả không đổi','2 + 3 = 3 + 2'],['Cộng với 0','Số nào cộng 0 cũng bằng chính nó','5 + 0 = 5']],
 tip:'Đếm tiếp từ số lớn hơn sẽ nhanh hơn: 6 + 2 → 7, 8.'},
{id:'tru0',t:'Bớt đi, tách ra',g:[0,1],re:/phép trừ|bớt|tách|bảng trừ|trừ/i,sk:['congtru'],
 tiles:[['Bớt đi','Có bao nhiêu, bớt đi thì còn lại','5 bớt 2 còn 3'],['Tách ra','Một nhóm tách thành hai phần','6 tách thành 4 và 2'],['Trừ 0','Trừ đi 0 thì không đổi','7 − 0 = 7'],['Trừ chính nó','Số trừ chính nó bằng 0','4 − 4 = 0']],
 tip:'Cộng và trừ là hai phép ngược nhau: 3 + 2 = 5 nên 5 − 2 = 3.'},
{id:'congtru',t:'Cộng, trừ không nhớ',g:[1,2],re:/cộng|trừ|phép tính|số có (2|hai) chữ số/i,sk:['congtru'],
 tiles:[['Đặt tính','Viết thẳng cột: đơn vị dưới đơn vị, chục dưới chục','  34 + 25'],['Tính từ phải','Cộng hoặc trừ hàng đơn vị trước','4 + 5 = 9, 3 + 2 = 5 → 59'],['Số tròn chục','Chỉ cộng trừ số chục','40 + 30 = 70'],['Thử lại','Lấy hiệu cộng số trừ phải ra số bị trừ','59 − 25 = 34 vì 34 + 25 = 59']],
 tip:'Đặt tính thật thẳng cột thì không bao giờ cộng nhầm hàng.'},
{id:'conhonho',t:'Cộng, trừ có nhớ',g:[2,4],re:/có nhớ|qua 10|đặt tính|cộng, trừ|phép cộng|phép trừ|nhiều chữ số|\d+ [+−] \d+/i,sk:['congtru'],
 tiles:[['Cộng có nhớ','Hàng nào được 10 trở lên thì viết đơn vị, nhớ 1 sang hàng bên trái','38 + 25: 8 + 5 = 13, viết 3 nhớ 1'],['Trừ có nhớ','Hàng trên bé hơn thì mượn 1 chục, trả 1 vào hàng bên trái của số trừ','52 − 17: 12 − 7 = 5'],['Tách ra để cộng','Làm tròn chục cho dễ','8 + 5 = 8 + 2 + 3 = 13'],['Thử lại','Cộng thử để kiểm tra phép trừ','35 + 17 = 52 ✓']],
 tip:'Nhớ thì ghi một số 1 nhỏ lên trên hàng kế tiếp để không quên.'},
{id:'thanhphan',t:'Tìm thành phần chưa biết',g:[2,5],re:/thành phần|số hạng|số bị trừ|số trừ\b|tìm x|thừa số|số bị chia|số chưa biết|☐ [+−×:] \d|\d [+−×:] ☐ =/i,p:1,sk:['congtru','nhanchia'],
 tiles:[['Số hạng','Lấy tổng trừ số hạng kia','☐ + 245 = 600 → 600 − 245'],['Số bị trừ','Lấy hiệu cộng số trừ','☐ − 120 = 380 → 380 + 120'],['Số trừ','Lấy số bị trừ trừ hiệu','700 − ☐ = 450 → 700 − 450'],['Nhân, chia','Thừa số = tích : thừa số kia; số bị chia = thương × số chia','☐ × 6 = 42 → 42 : 6']],
 tip:'Tính xong thì thay số vừa tìm vào ô trống, tính lại xem có đúng không.'},
{id:'hondon',t:'Hơn, kém nhau bao nhiêu',g:[1,3],re:/hơn, kém|kém nhau|nhiều hơn|ít hơn|hơn bao nhiêu/i,sk:['giaitoan'],
 tiles:[['Hơn bao nhiêu','Lấy số lớn trừ số bé','9 hơn 5 là 9 − 5 = 4'],['Nhiều hơn','Biết số bé và phần hơn: cộng','Mai 7, Lan hơn 3 → 10'],['Ít hơn','Biết số lớn và phần kém: trừ','Mai 7, Lan kém 3 → 4'],['Vẽ sơ đồ','Hai đoạn thẳng, đoạn dài hơn có phần thừa','▭▭▭ + ▭']],
 tip:'"Nhiều hơn" chưa chắc là phép cộng. Đọc kĩ xem đề cho số nào, hỏi số nào.'},
/* ---- nhân, chia ---- */
{id:'nhan2',t:'Phép nhân',g:[2,3],re:/nhân|thừa số|tích\b|bảng nhân|×/i,sk:['nhanchia'],
 tiles:[['Cộng nhiều lần','Cộng các số giống nhau','5 + 5 + 5 = 5 × 3'],['Tên gọi','Thừa số × thừa số = tích','4 × 6 = 24'],['Đổi chỗ','Đổi chỗ các thừa số, tích không đổi','3 × 8 = 8 × 3'],['Nhân 1 và 0','a × 1 = a; a × 0 = 0','9 × 1 = 9']],
 tip:'Quên bảng nhân thì đếm thêm từ kết quả liền trước: 7 × 6 = 7 × 5 + 7.'},
{id:'chia2',t:'Phép chia',g:[2,3],re:/chia|bảng chia|số bị chia|thương\b|chia đều|chia thành|\d : \d/i,sk:['nhanchia'],
 tiles:[['Chia đều','Chia thành các phần bằng nhau','12 : 3 = 4'],['Tên gọi','Số bị chia : số chia = thương','20 : 4 = 5'],['Dựa vào bảng nhân','Nhân ngược lại để tìm thương','6 × 7 = 42 → 42 : 6 = 7'],['Chia 1','Chia cho 1 bằng chính nó','8 : 1 = 8']],
 tip:'Muốn kiểm tra phép chia, lấy thương nhân với số chia.'},
{id:'chiadu',t:'Chia có dư, một phần mấy',g:[3,4],re:/có dư|\bdư\b|chia hết|một phần (hai|ba|bốn|năm|sáu|bảy|tám|chín|mấy)|phần mấy|1\/\d/i,sk:['nhanchia'],p:1,
 tiles:[['Số dư','Số dư luôn bé hơn số chia','17 : 5 = 3 (dư 2)'],['Thử lại','Thương × số chia + số dư = số bị chia','3 × 5 + 2 = 17'],['Một phần mấy','Chia đều thành mấy phần, lấy 1 phần','1/4 của 20 là 20 : 4 = 5'],['Chia hết','Số dư bằng 0','18 : 6 = 3']],
 tip:'Nếu số dư lớn hơn hoặc bằng số chia thì thương còn tăng được nữa.'},
{id:'gaplan',t:'Gấp lên, giảm đi một số lần',g:[3,4],re:/gấp|giảm đi|giảm \d+ lần|mấy lần/i,sk:['nhanchia','giaitoan'],p:1,
 tiles:[['Gấp lên','Nhân với số lần','6 gấp 3 lần là 18'],['Giảm đi','Chia cho số lần','18 giảm 3 lần là 6'],['Gấp mấy lần','Số lớn chia số bé','20 gấp 4 lần 5'],['Khác với hơn','Hơn thì cộng, gấp thì nhân','5 hơn 3 là 8, gấp 3 lần là 15']],
 tip:'Gặp chữ "gấp" hãy nghĩ tới phép nhân, "giảm đi … lần" là phép chia.'},
{id:'nhan4',t:'Nhân, chia số lớn',g:[3,5],re:/nhân với|chia cho|nhân, chia|phép nhân|phép chia|10, 100|× 10\b|× 100\b|: 10\b|: 100\b/i,sk:['nhanchia'],
 tiles:[['Nhân từ phải','Nhân lần lượt từ hàng đơn vị, nhớ sang hàng tiếp','1 234 × 3 = 3 702'],['Chia từ trái','Chia từ hàng cao nhất: chia, nhân, trừ, hạ','846 : 2 = 423'],['Nhân 10, 100','Thêm 1, 2 chữ số 0 vào bên phải','45 × 100 = 4 500'],['Chia 10, 100','Bỏ bớt chữ số 0 ở tận cùng','3 600 : 100 = 36']],
 tip:'Ước lượng trước: 1 234 × 3 khoảng 3 600, kết quả xa quá là tính sai.'},
{id:'tinhchat',t:'Biểu thức và tính chất phép tính',g:[3,5],re:/biểu thức|giá trị của|tính chất|giao hoán|kết hợp|một tổng|một hiệu|tính nhanh|thuận tiện|\(/i,sk:['congtru','nhanchia'],
 tiles:[['Thứ tự','Nhân chia trước, cộng trừ sau','5 + 3 × 2 = 11'],['Có ngoặc','Tính trong ngoặc trước','(5 + 3) × 2 = 16'],['Giao hoán, kết hợp','Đổi chỗ, nhóm lại cho tròn','25 + 37 + 75 = 100 + 37'],['Nhân với tổng','a × (b + c) = a × b + a × c','7 × 98 + 7 × 2 = 7 × 100']],
 tip:'Thấy hai số cộng lại tròn chục, tròn trăm thì nhóm chúng lại trước.'},
{id:'bieuthucchu',t:'Biểu thức chứa chữ',g:[4,5],re:/biểu thức chứa chữ|chứa chữ|với a =|với m =|với n =/i,sk:['congtru'],p:2,
 tiles:[['Chữ thay số','Chữ là chỗ để thay một số','a + 5'],['Thay vào','Thay số vào chữ rồi tính','a = 3 → 3 + 5 = 8'],['Nhiều chữ','Thay đúng số vào đúng chữ','a × b với a = 4, b = 6 → 24'],['Công thức','Chu vi hình vuông P = a × 4','a = 5 → P = 20']],
 tip:'Viết lại biểu thức, thay số vào rồi mới tính để không nhầm.'},
/* ---- giải toán ---- */
{id:'loivan',t:'Bài toán có lời văn',g:[1,5],re:/lời văn|bài toán|giải toán|hai bước|ba bước|thêm, bớt|nhiều hơn, ít hơn/i,sk:['giaitoan'],
 tiles:[['Đọc đề','Tìm cái đã cho và cái phải tìm','Có 8, thêm 5. Hỏi có tất cả?'],['Chọn phép tính','Thêm, gộp: cộng · bớt, còn lại: trừ','8 + 5 = 13'],['Nhiều bước','Muốn tìm cái hỏi phải biết gì trước?','bước 1 → bước 2'],['Trả lời','Viết câu trả lời có đơn vị','Đáp số: 13 quả']],
 tip:'Gạch chân câu hỏi trước rồi mới đọc lại toàn bài.'},
{id:'rutve',t:'Rút về đơn vị',g:[3,5],re:/rút về đơn vị|như nhau|mỗi (hộp|túi|thùng|xe|bao|hàng|can|lọ|chuồng|đĩa|bàn|tổ|giỏ|bó|lớp) (có|chứa|đựng|xếp)/i,p:1,sk:['giaitoan'],
 tiles:[['Bước 1','Tìm giá trị của 1 phần (phép chia)','4 hộp có 28 bút → 1 hộp 7 bút'],['Bước 2','Tìm giá trị của nhiều phần (phép nhân)','7 hộp: 7 × 7 = 49 bút'],['Cách 2','Tìm số phần (phép chia)','35 bút xếp mỗi hộp 7 → 5 hộp'],['Kiểm tra','Số phần nhiều hơn thì kết quả nhiều hơn','7 hộp > 4 hộp ✓']],
 tip:'Luôn hỏi: 1 phần là bao nhiêu?'},
{id:'tbc',t:'Số trung bình cộng',g:[4,5],re:/trung bình/i,sk:['giaitoan'],p:1,
 tiles:[['Công thức','Tổng các số : số các số','(4 + 6 + 8) : 3 = 6'],['Tổng','Trung bình × số các số','TB 6 của 3 số → tổng 18'],['Nằm giữa','TB luôn ở giữa số bé nhất và lớn nhất','4 ≤ 6 ≤ 8'],['Dãy cách đều','TB = (số đầu + số cuối) : 2','2, 4, 6, 8 → 5']],
 tip:'Đếm kĩ có bao nhiêu số rồi mới chia.'},
{id:'tonghieu',t:'Tổng – hiệu, tổng – tỉ, hiệu – tỉ',g:[4,5],re:/tổng và hiệu|tổng và tỉ|hiệu và tỉ|tỉ số của hai số|tổng (của )?hai số là|hiệu (của )?hai số là/i,sk:['giaitoan'],p:1,
 tiles:[['Tổng – hiệu','Số lớn = (tổng + hiệu) : 2','tổng 30, hiệu 6 → 18 và 12'],['Tổng – tỉ','Tổng : tổng số phần = 1 phần','tổng 40, tỉ 1/3 → 1 phần 10'],['Hiệu – tỉ','Hiệu : hiệu số phần = 1 phần','hiệu 20, tỉ 1/3 → 1 phần 10'],['Vẽ sơ đồ','Mỗi phần là một đoạn bằng nhau','▭ | ▭▭▭']],
 tip:'Vẽ sơ đồ đoạn thẳng trước khi tính, nhìn sơ đồ là biết phải chia cho mấy.'},
{id:'tiso',t:'Tỉ số phần trăm',g:[5,5],re:/phần trăm|tỉ số|%/i,sk:['giaitoan'],p:1,
 tiles:[['Ý nghĩa','25% là 25 phần trong 100 phần','25% = 25/100'],['Tỉ số %','a : b × 100 rồi viết %','12 : 48 = 0,25 = 25%'],['Tìm % của số','Số × % : 100','20% của 150 = 30'],['Tìm số','Biết 20% là 30 → số đó = 30 : 20 × 100','150']],
 tip:'Nhớ 50% là một nửa, 25% là một phần tư, 10% là chia cho 10.'},
{id:'chuyendong',t:'Vận tốc, quãng đường, thời gian',g:[5,5],re:/vận tốc|quãng đường|chuyển động|km\/giờ/i,sk:['doluong','giaitoan'],p:1,
 tiles:[['Vận tốc','v = s : t','120 km : 3 giờ = 40 km/giờ'],['Quãng đường','s = v × t','40 × 2 = 80 km'],['Thời gian','t = s : v','80 : 40 = 2 giờ'],['Cùng đơn vị','km đi với km/giờ và giờ','45 phút = 0,75 giờ']],
 tip:'Đổi đơn vị cho khớp nhau trước khi tính.'},
/* ---- phân số, số thập phân ---- */
{id:'phanso',t:'Phân số',g:[4,5],re:/phân số|rút gọn|quy đồng|mẫu số|tử số|hỗn số|\d\/\d/i,sk:['so'],p:1,
 tiles:[['Đọc, viết','Tử số trên, mẫu số dưới','3/4: chia 4 phần, lấy 3'],['Rút gọn','Chia cả tử và mẫu cho cùng một số','6/8 = 3/4'],['Quy đồng','Nhân cả tử và mẫu để có cùng mẫu','1/2 = 2/4'],['So sánh','Cùng mẫu: tử lớn hơn thì lớn hơn','3/5 > 2/5']],
 tip:'Phân số có tử bằng mẫu thì bằng 1.'},
{id:'tinhphanso',t:'Tính với phân số',g:[4,5],re:/(cộng|trừ|nhân|chia) phân số|phân số của một số|phép (cộng|trừ|nhân|chia) phân số/i,sk:['congtru','nhanchia'],
 tiles:[['Cộng, trừ cùng mẫu','Cộng (trừ) tử, giữ mẫu','2/7 + 3/7 = 5/7'],['Khác mẫu','Quy đồng rồi cộng','1/2 + 1/3 = 3/6 + 2/6'],['Nhân','Tử nhân tử, mẫu nhân mẫu','2/3 × 4/5 = 8/15'],['Chia','Nhân với phân số đảo ngược','2/3 : 4/5 = 2/3 × 5/4']],
 tip:'Tính xong nhớ rút gọn đến tối giản.'},
{id:'thapphan',t:'Số thập phân',g:[5,5],re:/thập phân|\d,\d/i,sk:['so'],p:1,
 tiles:[['Hai phần','Phần nguyên, dấu phẩy, phần thập phân','12,345'],['Hàng','Phần mười, phần trăm, phần nghìn','0,3 = 3/10'],['So sánh','So phần nguyên, rồi từng hàng sau dấu phẩy','2,5 > 2,49'],['Thêm 0','Thêm chữ số 0 ở cuối phần thập phân, giá trị không đổi','0,5 = 0,50']],
 tip:'Khi cộng, trừ, đặt các dấu phẩy thẳng cột với nhau.'},
/* ---- đo lường ---- */
{id:'dodai',t:'Đơn vị đo độ dài',g:[1,5],re:/độ dài|xăng-ti-mét|\bcm\b|\bmm\b|\bdm\b|\bkm\b|\d m\b|mét|dài hơn|ngắn hơn|thước/i,sk:['doluong'],p:1,
 tiles:[['Bảng đơn vị','km, hm, dam, m, dm, cm, mm','mỗi đơn vị gấp 10 lần đơn vị sau'],['Hay dùng','1 m = 10 dm = 100 cm','1 cm = 10 mm'],['Xa','1 km = 1 000 m','2 km = 2 000 m'],['Cùng đơn vị','Đổi về cùng đơn vị rồi mới tính','1 m − 30 cm = 70 cm']],
 tip:'Đặt thước sao cho vạch 0 trùng đầu đồ vật.'},
{id:'khoiluong',t:'Khối lượng, dung tích, nhiệt độ',g:[2,5],re:/ki-lô-gam|\bkg\b|\bg\b|gam|lít|\bml\b|\bl\b|khối lượng|dung tích|nhiệt độ|°C|yến|tạ\b|tấn|nặng|nhẹ/i,sk:['doluong'],p:1,
 tiles:[['Khối lượng','1 kg = 1 000 g','tấn, tạ, yến, kg'],['Lớn hơn kg','1 yến = 10 kg, 1 tạ = 100 kg, 1 tấn = 1 000 kg','3 tạ = 300 kg'],['Dung tích','1 l = 1 000 ml','nửa lít = 500 ml'],['Nhiệt độ','Đo bằng nhiệt kế, đơn vị °C','cơ thể khoảng 37 °C']],
 tip:'Cân thăng bằng khi hai bên nặng bằng nhau.'},
{id:'gio',t:'Xem đồng hồ',g:[0,5],re:/giờ|đồng hồ|phút|giây|buổi (sáng|trưa|chiều|tối)/i,sk:['doluong'],p:1,
 tiles:[['Kim ngắn','Chỉ giờ','kim ngắn ở số 3 → 3 giờ'],['Kim dài','Chỉ phút, mỗi số là 5 phút','kim dài ở số 4 → 20 phút'],['Đổi','1 giờ = 60 phút, 1 phút = 60 giây','nửa giờ = 30 phút'],['Buổi','13 giờ là 1 giờ chiều','20 giờ = 8 giờ tối']],
 tip:'Đọc kim ngắn trước rồi mới đọc kim dài.'},
{id:'lich',t:'Ngày, tháng, năm',g:[0,5],re:/lịch|tháng|ngày \d|ngày (thứ|trong tuần)|thứ (Hai|Ba|Tư|Năm|Sáu|Bảy)|chủ nhật|tuần|thế kỉ|năm nhuận|năm \d{4}|ngày và đêm/i,sk:['doluong'],p:1,
 tiles:[['Tuần','1 tuần có 7 ngày','thứ Hai → Chủ nhật'],['Tháng','Tháng có 30 hoặc 31 ngày, tháng 2 có 28 hoặc 29','tháng 4, 6, 9, 11 có 30 ngày'],['Năm','1 năm có 12 tháng','365 hoặc 366 ngày'],['Thế kỉ','1 thế kỉ = 100 năm','năm 2026 thuộc thế kỉ XXI']],
 tip:'Đếm tháng trên các khớp đốt ngón tay: khớp nhô lên là tháng 31 ngày.'},
{id:'tien',t:'Tiền Việt Nam',g:[2,5],re:/tiền|\d đồng\b|nghìn đồng/i,sk:['doluong'],p:1,
 tiles:[['Đơn vị','Đồng','1 000 đồng, 5 000 đồng'],['Gộp tiền','Cộng các tờ tiền lại','2 000 + 5 000 = 7 000 đồng'],['Trả lại','Tiền đưa − tiền hàng','10 000 − 7 000 = 3 000'],['Đổi tờ','Một tờ lớn đổi được nhiều tờ nhỏ','10 000 = 5 tờ 2 000']],
 tip:'Đếm tờ có giá trị lớn trước, tờ nhỏ sau.'},
/* ---- hình học ---- */
{id:'hinh0',t:'Nhận biết hình',g:[0,2],re:/hình phẳng|nhận biết hình|hình vuông|hình tròn|tam giác|chữ nhật|tứ giác|có dạng hình|đếm hình|hình học/i,sk:['doluong'],
 tiles:[['Hình vuông','4 cạnh dài bằng nhau, 4 góc vuông','⬜'],['Hình chữ nhật','2 cạnh dài, 2 cạnh ngắn','▭'],['Hình tam giác','3 cạnh, 3 góc','🔺'],['Hình tròn','Không có cạnh, tròn đều','⚪']],
 tip:'Đếm số cạnh là biết ngay hình gì.'},
{id:'khoi',t:'Khối hình',g:[0,5],re:/khối (lập phương|hộp|trụ|cầu|chữ nhật|vuông|gì)|dạng khối|nhận biết khối|hình hộp|lập phương|thể tích|lăn được|\bcm³|\bdm³|\bm³/i,sk:['doluong'],p:1,
 tiles:[['Khối lập phương','6 mặt là hình vuông bằng nhau','🎲 xúc xắc'],['Hộp chữ nhật','6 mặt là hình chữ nhật','hộp sữa'],['Khối trụ, khối cầu','Lăn được','lon nước, quả bóng'],['Thể tích','Dài × rộng × cao','2 × 3 × 4 = 24 cm³']],
 tip:'Khối lập phương có 6 mặt, 12 cạnh, 8 đỉnh.'},
{id:'doanthang',t:'Điểm, đoạn thẳng, đường gấp khúc',g:[1,4],re:/đoạn thẳng|gấp khúc|đường thẳng|đường cong|trung điểm|thẳng hàng|điểm ở giữa/i,sk:['doluong'],p:1,
 tiles:[['Đoạn thẳng','Nối hai điểm bằng thước','A ─── B'],['Trung điểm','Điểm ở giữa, chia đoạn thành hai phần bằng nhau','AM = MB'],['Đường gấp khúc','Gồm nhiều đoạn nối tiếp','độ dài = tổng các đoạn'],['Ba điểm thẳng hàng','Cùng nằm trên một đường thẳng','A · M · B']],
 tip:'Độ dài đường gấp khúc bằng tổng độ dài các đoạn của nó.'},
{id:'chuvi',t:'Chu vi',g:[2,5],re:/chu vi/i,sk:['doluong'],p:2,
 tiles:[['Ý nghĩa','Tổng độ dài các cạnh bao quanh hình','đi một vòng quanh hình'],['Chữ nhật','(dài + rộng) × 2','(5 + 3) × 2 = 16'],['Hình vuông','cạnh × 4','6 × 4 = 24'],['Hình tròn (lớp 5)','đường kính × 3,14','d = 10 → 31,4']],
 tip:'Chu vi là đường viền, diện tích là phần bên trong.'},
{id:'dientich',t:'Diện tích',g:[3,5],re:/diện tích|cm²|dm²|m²|mm²|km²|héc-ta/i,sk:['doluong'],p:2,
 tiles:[['Ý nghĩa','Phần mặt phẳng bên trong hình','đếm số ô vuông 1 cm²'],['Chữ nhật','dài × rộng','5 × 3 = 15 cm²'],['Hình vuông','cạnh × cạnh','4 × 4 = 16 cm²'],['Đổi đơn vị','Mỗi đơn vị gấp 100 lần đơn vị bé hơn liền sau','1 m² = 100 dm²']],
 tip:'Diện tích luôn có đơn vị vuông như cm², m².'},
{id:'hinh5',t:'Tam giác, hình thang, hình tròn',g:[5,5],re:/hình thang|hình tròn|đường tròn|tam giác|bán kính|đường kính/i,sk:['doluong'],p:1,
 tiles:[['Tam giác','S = đáy × cao : 2','6 × 4 : 2 = 12'],['Hình thang','S = (đáy lớn + đáy bé) × cao : 2','(8 + 4) × 3 : 2 = 18'],['Chu vi hình tròn','C = d × 3,14','d = 2 → 6,28'],['Diện tích hình tròn','S = r × r × 3,14','r = 2 → 12,56']],
 tip:'Chiều cao luôn vuông góc với đáy.'},
{id:'goc',t:'Góc',g:[3,5],re:/góc/i,sk:['doluong'],p:1,
 tiles:[['Góc vuông','Bằng 90°, dùng ê-ke để kiểm tra','góc bàn học'],['Góc nhọn','Bé hơn góc vuông','< 90°'],['Góc tù','Lớn hơn góc vuông, bé hơn góc bẹt','90° < góc < 180°'],['Góc bẹt','Bằng hai góc vuông','180°']],
 tip:'Đặt đỉnh ê-ke trùng đỉnh góc để so với góc vuông.'},
{id:'songsong',t:'Vuông góc, song song, hình bình hành',g:[4,5],re:/vuông góc|song song|bình hành|hình thoi/i,sk:['doluong'],p:2,
 tiles:[['Vuông góc','Hai đường cắt nhau tạo 4 góc vuông','chữ thập +'],['Song song','Không bao giờ cắt nhau','hai đường ray tàu'],['Hình bình hành','Hai cặp cạnh đối song song và bằng nhau','▱'],['Hình thoi','Bốn cạnh bằng nhau','◇']],
 tip:'Hình vuông vừa là hình chữ nhật, vừa là hình thoi.'},
{id:'vitri',t:'Vị trí, định hướng',g:[0,1],re:/vị trí|định hướng|phía trên|phía dưới|trái|phải|ở giữa|bên trong|bên ngoài/i,sk:['doluong'],
 tiles:[['Trên, dưới','Cao hơn là phía trên','☁️ ở trên, 🌷 ở dưới'],['Trái, phải','Tay cầm thìa thường là tay phải','👈 trái · phải 👉'],['Ở giữa','Nằm giữa hai đồ vật','🐶 🐱 🐰: mèo ở giữa'],['Trong, ngoài','Bên trong hộp, bên ngoài hộp','🎁']],
 tip:'Giơ tay phải lên trước khi trả lời câu trái, phải.'},
{id:'quytac0',t:'Sắp xếp theo quy tắc',g:[0,1],re:/quy tắc|khác nhóm|phân nhóm|to hơn|nhỏ hơn|cao|thấp|dài|ngắn/i,sk:['so'],
 tiles:[['Lặp lại','Nhóm hình lặp đi lặp lại','🔴🔵🔴🔵'],['Tìm nhóm lặp','Khoanh nhóm đầu tiên','(🍎🍌) (🍎🍌)'],['Khác nhóm','Đồ vật không giống các bạn còn lại','🍎🍌🍇🚗'],['So sánh','To – nhỏ, cao – thấp, dài – ngắn','🐘 to hơn 🐭']],
 tip:'Đọc to dãy hình như đọc một bài hát, sẽ thấy ngay đoạn lặp lại.'},
{id:'thongke',t:'Thống kê và khả năng',g:[2,5],re:/thống kê|biểu đồ|số liệu|khả năng|xác suất|chắc chắn|có thể xảy ra|không thể|kiểm đếm|lần xuất hiện|bảng (số|thống kê)/i,sk:['doluong','so'],p:1,
 tiles:[['Kiểm đếm','Mỗi lần gặp vạch một vạch','|||| = 4'],['Biểu đồ','Đọc tên cột và số ở trục','cột cao nhất là nhiều nhất'],['Khả năng','Chắc chắn, có thể, không thể','túi toàn bi đỏ → chắc chắn ra bi đỏ'],['Số lần','Đếm số lần sự kiện xảy ra','tung đồng xu 10 lần, 6 lần sấp']],
 tip:'Đọc tiêu đề của bảng, biểu đồ trước để biết nó nói về cái gì.'},
{id:'tile',t:'Tỉ lệ bản đồ',g:[4,5],re:/tỉ lệ bản đồ|bản đồ/i,sk:['doluong'],p:2,
 tiles:[['Ý nghĩa','1 : 1 000 nghĩa là 1 cm trên bản đồ bằng 1 000 cm thật','1 cm → 10 m'],['Tìm độ dài thật','Độ dài bản đồ × số tỉ lệ','3 cm × 1 000 = 3 000 cm'],['Tìm trên bản đồ','Độ dài thật : số tỉ lệ','5 000 cm : 1 000 = 5 cm'],['Đổi đơn vị','Thường đổi ra m hoặc km','3 000 cm = 30 m']],
 tip:'Tính với cùng đơn vị cm rồi mới đổi ra m, km.'}
];
/* thẻ dự phòng theo kỹ năng khi không tìm được thẻ hợp hơn */
const KC_SKILL_FALLBACK={so:['sosanh','dem5'],congtru:['conhonho','congtru','cong0'],nhanchia:['nhan2','nhan4'],giaitoan:['loivan'],doluong:['dodai','chuvi']};
/* ---------------- TOÁN TƯ DUY: BỘ SINH ĐỀ ----------------
   Mỗi bài có hàm gen(G, lv) trả về 1 câu hỏi theo định dạng của app (mc / input / slots).
   G = lớp (0 = Lớp Lá … 5), lv = 0 cơ bản, 1 vận dụng, 2 nâng cao. Số liệu đổi mỗi lần gọi. */
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const RP=a=>a[Math.floor(Math.random()*a.length)];
const fN=n=>{const neg=n<0,s=String(Math.abs(n));const t=s.length>=5?s.replace(/\B(?=(\d{3})+(?!\d))/g,' '):s;return (neg?'−':'')+t;};
const C2=n=>n*(n-1)/2;
const NM=['An','Bình','Chi','Dũng','Hà','Khánh','Lan','Minh','Nam','Phương','Quân','Thảo','Vy','Tú','Hoa','Long','Mai','Huy','Ngọc','Sơn'];
const names=k=>shuffle(NM).slice(0,k);
const WD=['thứ Hai','thứ Ba','thứ Tư','thứ Năm','thứ Sáu','thứ Bảy','Chủ nhật'];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
/* phương án nhiễu cho đáp án số */
function numOpts(ans,cands,k){k=k||4;const set=[String(ans)];const add=v=>{v=Math.round(v);if(v>=0&&Number.isFinite(v)&&!set.includes(String(v))&&set.length<k)set.push(String(v));};
  (cands||[]).forEach(add);let t=1;while(set.length<k&&t<40){add(ans+t);add(ans-t);t++;}return shuffle(set);}
const Qmc=(prompt,answer,options,o)=>Object.assign({type:'mc',prompt,answer:String(answer),options:options.map(String)},o||{});
const Qin=(prompt,answer,o)=>Object.assign({type:'input',prompt,answer:Number(answer)},o||{});
const Qsl=(prompt,labels,vals,extra,o)=>{const chips=vals.map(String);(extra||[]).forEach(v=>{v=String(Math.round(Number(v)));if(!chips.includes(v)&&Number(v)>=0&&chips.length<Math.max(vals.length+2,4))chips.push(v);});
  return Object.assign({type:'slots',prompt,labels,vals:vals.map(String),chips:shuffle(chips),answer:labels.map((l,i)=>l+': '+fN(Number(vals[i]))).join(' · ')},o||{});};

/* ---------- hình vẽ ---------- */
const SVGW=(w,h,body,lab)=>`<div class="ht-fig"><svg viewBox="0 0 ${w} ${h}" width="${Math.min(w,320)}" role="img" aria-label="${esc(lab||'Hình minh họa')}">${body}</svg></div>`;
/* sơ đồ đoạn thẳng: rows = [{n:'Tên', parts:k, extra:0..1 (phần thêm, tính theo 1 phần), label}] */
function tapeSVG(rows,brace,opt){opt=opt||{};const U=opt.u||46,X0=62,rowH=34,H=rows.length*rowH+12;let maxW=0,b='';
  rows.forEach((r,i)=>{const y=8+i*rowH;let x=X0;b+=`<text x="${X0-8}" y="${y+17}" text-anchor="end" font-size="13" font-weight="700" fill="currentColor">${esc(r.n)}</text>`;
    for(let k=0;k<r.parts;k++){b+=`<rect x="${x}" y="${y}" width="${U}" height="24" rx="5" fill="#FFE7A3" stroke="#8A5A00" stroke-width="2"/>`;x+=U;}
    if(r.extra){const w=Math.round(U*r.extra);b+=`<rect x="${x}" y="${y}" width="${w}" height="24" rx="5" fill="#FFC9D6" stroke="#B4234A" stroke-width="2" stroke-dasharray="4 3"/>`;if(r.exLab)b+=`<text x="${x+w/2}" y="${y+17}" text-anchor="middle" font-size="12" font-weight="800" fill="#B4234A">${esc(r.exLab)}</text>`;x+=w;}
    if(r.label)b+=`<text x="${x+6}" y="${y+17}" font-size="12" font-weight="700" fill="currentColor">${esc(r.label)}</text>`;maxW=Math.max(maxW,x);});
  if(brace){const bx=maxW+8,y1=6,y2=H-8,ym=(y1+y2)/2;b+=`<path d="M${bx} ${y1} q8 0 8 8 v${ym-y1-14} q0 6 6 6 q-6 0 -6 6 v${y2-ym-14} q0 8 -8 8" fill="none" stroke="currentColor" stroke-width="2"/><text x="${bx+18}" y="${ym+5}" font-size="14" font-weight="800" fill="currentColor">${esc(brace)}</text>`;maxW=bx+18+String(brace).length*9;}
  return SVGW(Math.max(maxW+10,200),H,b,'Sơ đồ đoạn thẳng');}
function gridSVG(cells,side,lab){const S=36;let mx=0,my=0;cells.forEach(([x,y])=>{mx=Math.max(mx,x);my=Math.max(my,y);});let b='';
  cells.forEach(([x,y])=>{b+=`<rect x="${6+x*S}" y="${6+y*S}" width="${S}" height="${S}" fill="#DDF4E8" stroke="#2D3A3A" stroke-width="3"/>`;});
  return SVGW((mx+1)*S+12,(my+1)*S+12,b,lab||'Hình ghép từ ô vuông')+(side?`<div class="ht-cap">Mỗi ô vuông có cạnh ${side} cm</div>`:'');}
function polyomino(n){const key=(x,y)=>x+','+y;for(let tries=0;tries<200;tries++){const set=new Map([[key(0,0),[0,0]]]);
    while(set.size<n){const [x,y]=RP([...set.values()]);const d=RP([[1,0],[-1,0],[0,1],[0,-1]]);const nx=x+d[0],ny=y+d[1];if(!set.has(key(nx,ny)))set.set(key(nx,ny),[nx,ny]);}
    let cells=[...set.values()];const minx=Math.min(...cells.map(c=>c[0])),miny=Math.min(...cells.map(c=>c[1]));cells=cells.map(([x,y])=>[x-minx,y-miny]);
    const W=Math.max(...cells.map(c=>c[0]))+1,H=Math.max(...cells.map(c=>c[1]))+1;if(W>6||H>5)continue;
    const has=new Set(cells.map(c=>key(c[0],c[1])));
    /* loại hình có lỗ thủng (ô trống bị bao kín) */
    const seen=new Set(),st=[[-1,-1]];while(st.length){const [x,y]=st.pop();const k=key(x,y);if(seen.has(k)||has.has(k)||x<-1||y<-1||x>W||y>H)continue;seen.add(k);st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}
    let hole=false;for(let x=0;x<W;x++)for(let y=0;y<H;y++)if(!has.has(key(x,y))&&!seen.has(key(x,y)))hole=true;if(hole)continue;
    let per=0;cells.forEach(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{if(!has.has(key(x+dx,y+dy)))per++;}));
    return {cells,per,W,H};}
  return {cells:[[0,0],[1,0],[0,1]],per:8,W:2,H:2};}
function dotsLineSVG(m){const L=['A','B','C','D','E','G','H','I','K'];const gap=Math.min(56,260/(m-1));let b=`<line x1="14" y1="24" x2="${14+gap*(m-1)}" y2="24" stroke="currentColor" stroke-width="3"/>`;
  for(let i=0;i<m;i++){const x=14+i*gap;b+=`<circle cx="${x}" cy="24" r="5" fill="#E2445C"/><text x="${x}" y="50" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${L[i]}</text>`;}
  return SVGW(28+gap*(m-1),58,b,'Các điểm trên một đường thẳng');}
function fanSVG(m){const W=280,base=150,ax=W/2;let b='';const xs=[];for(let i=0;i<m;i++)xs.push(20+i*(W-40)/(m-1));
  b+=`<line x1="${xs[0]}" y1="${base}" x2="${xs[m-1]}" y2="${base}" stroke="currentColor" stroke-width="3"/>`;xs.forEach(x=>{b+=`<line x1="${ax}" y1="14" x2="${x}" y2="${base}" stroke="currentColor" stroke-width="3"/>`;});
  return SVGW(W,base+8,b,'Hình gồm nhiều tam giác chung đỉnh');}
function gridSqSVG(k){const S=Math.floor(150/k);let b='';for(let i=0;i<k;i++)for(let j=0;j<k;j++)b+=`<rect x="${6+i*S}" y="${6+j*S}" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="3"/>`;return SVGW(k*S+12,k*S+12,b,'Hình vuông được chia thành các ô vuông nhỏ');}
function stripSVG(n){const S=Math.min(48,260/n);let b='';for(let i=0;i<n;i++)b+=`<rect x="${6+i*S}" y="6" width="${S}" height="40" fill="none" stroke="currentColor" stroke-width="3"/>`;return SVGW(n*S+12,52,b,'Hình chữ nhật được chia thành các ô');}
function stairsSVG(hs){const S=30;const H=Math.max(...hs);let b='';hs.forEach((h,i)=>{for(let k=0;k<h;k++)b+=`<rect x="${6+i*S}" y="${6+(H-1-k)*S}" width="${S}" height="${S}" rx="3" fill="#CFE6FF" stroke="#1C4E80" stroke-width="2.5"/>`;});return SVGW(hs.length*S+12,H*S+12,b,'Các khối lập phương xếp sát nhau');}
const emoRow=(arr,cls)=>`<div class="ht-emo${cls?' '+cls:''}">${arr.map(e=>`<span>${e}</span>`).join('')}</div>`;
function tableSVG(rows,hideMap){return `<div class="ht-grid" style="grid-template-columns:repeat(${rows[0].length},1fr)">${rows.map((r,i)=>r.map((v,j)=>`<span class="${hideMap&&hideMap[i+','+j]?'hid':''}">${hideMap&&hideMap[i+','+j]?hideMap[i+','+j]:fN(v)}</span>`).join('')).join('')}</div>`;}
function pyramidHTML(rows,hide){return `<div class="ht-pyr">${rows.map((r,i)=>`<div class="pr">${r.map((v,j)=>`<span class="${hide===i+','+j?'hid':''}">${hide===i+','+j?'?':fN(v)}</span>`).join('')}</div>`).join('')}</div>`;}

/* phạm vi số theo lớp */
const LIM=G=>[10,100,100,1000,10000,100000][G]||1000;

/* ========== CÁC BÀI (lớp 1 → 5) ========== */
const TDG={};
/* 1. Dãy cách đều */
TDG.ap=function(G,lv){const D=[0,[1,2,5],[2,3,4,5,10],[3,4,5,6,7,8,9,10,25,50],[11,12,15,25,50,75,125,250],[12,15,25,75,125,150,250,500]][G];
  let d=RP(D.slice(0,lv===0?Math.min(3,D.length):D.length));let a=R(G===1?0:1,Math.max(2,Math.floor(LIM(G)/(G===1?5:10))));const dec=lv===2||(lv===1&&Math.random()<.4);
  const len=5;let seq=[];for(let i=0;i<len+1;i++)seq.push(a+i*d);if(dec)seq.reverse();if(seq.some(v=>v<0||v>LIM(G)))return TDG.ap(G,lv);
  const miss=lv>=1&&Math.random()<.5?R(1,3):len;const shown=miss===len?seq.slice(0,len).map(fN).concat(['?']):seq.slice(0,len+1).map((v,i)=>i===miss?'?':fN(v));const ans=seq[miss];
  return Qin(miss===len?'Tìm số tiếp theo của dãy số.':'Tìm số còn thiếu trong dãy số.',ans,{big:shown.join(', '),bigSmall:shown.join('').length>18,
    hints:['So sánh hai số đứng cạnh nhau: số sau '+(dec?'kém':'hơn')+' số trước bao nhiêu?','Mỗi lần dãy đều '+(dec?'bớt đi ':'cộng thêm ')+fN(d)+'.'],
    explain:`Hai số liền nhau ${dec?'kém':'hơn'} nhau ${fN(d)}. Số cần tìm là ${fN(ans)}.`});};
/* 2. Gấp lên, xen kẽ, tăng dần */
TDG.grow=function(G,lv){const kinds=G===1?['mul2','inc']:G===2?['mul2','inc','alt']:['mul','inc','alt','fib','sq'];let kd=lv===0?RP(kinds.slice(0,2)):RP(kinds);
  let seq,ex,h;
  if(kd==='mul2'||kd==='mul'){const k=kd==='mul2'?2:RP(G>=4?[2,3,4,5]:[2,3]);let a=R(1,G<=2?3:G===3?5:12);seq=[a];while(seq.length<5)seq.push(seq[seq.length-1]*k);if(seq[4]>LIM(G))return TDG.grow(G,lv);ex=`Mỗi số gấp ${k} lần số đứng trước: ${fN(seq[3])} × ${k} = ${fN(seq[4])}.`;h=['Số sau lớn hơn số trước rất nhanh. Thử chia số sau cho số trước xem.',`Mỗi lần đều nhân với ${k}.`];}
  else if(kd==='inc'){const st=R(1,G<=1?3:G===2?5:20),a=R(1,G<=1?5:30);seq=[a];for(let i=0;i<4;i++)seq.push(seq[i]+st*(i+1));ex=`Khoảng cách giữa hai số tăng dần: +${st}, +${2*st}, +${3*st}, +${4*st}. Số tiếp theo là ${fN(seq[3])} + ${4*st} = ${fN(seq[4])}.`;h=['Viết ra khoảng cách giữa hai số liền nhau.',`Khoảng cách tăng thêm ${st} mỗi lần.`];}
  else if(kd==='alt'){const a=R(1,9),d1=R(1,G===2?3:5),b=R(10,G===2?30:60),d2=R(2,G===2?5:10)*(Math.random()<.5?1:-1);const A=i=>a+i*d1,B=i=>b+i*d2;seq=[A(0),B(0),A(1),B(1),A(2)];if(B(1)<0)return TDG.grow(G,lv);ex=`Dãy gồm hai dãy xen kẽ: ${A(0)}, ${A(1)}, ${A(2)} (+${d1}) và ${B(0)}, ${B(1)} (${d2>0?'+':''}${d2}). Số tiếp theo thuộc dãy thứ hai: ${B(2)}.`;seq.push(B(2));if(seq[5]<0)return TDG.grow(G,lv);h=['Thử nhìn các số ở vị trí 1, 3, 5 và các số ở vị trí 2, 4 riêng ra.','Có hai dãy nhỏ đan xen nhau.'];
    return Qin('Tìm số tiếp theo của dãy số.',seq[5],{big:seq.slice(0,5).join(', ')+', ?',hints:h,explain:ex});}
  else if(kd==='fib'){let a=R(1,3),b=R(a,a+3);seq=[a,b];while(seq.length<5)seq.push(seq[seq.length-1]+seq[seq.length-2]);ex=`Mỗi số bằng tổng hai số đứng trước: ${seq[2]} + ${seq[3]} = ${seq[4]}.`;h=['Thử cộng hai số đứng cạnh nhau.','Số thứ ba = số thứ nhất + số thứ hai.'];}
  else{const a=R(1,4);seq=[];for(let i=0;i<5;i++)seq.push((a+i)*(a+i));ex=`Các số là ${a}×${a}, ${a+1}×${a+1}, …; số tiếp theo ${a+4}×${a+4} = ${seq[4]}.`;h=['Mỗi số có phải là một số nhân với chính nó không?',`${seq[0]} = ${a} × ${a}`];}
  const ans=seq[4];return Qin('Tìm số tiếp theo của dãy số.',ans,{big:seq.slice(0,4).join(', ')+', ?',hints:h,explain:ex});};
/* 3. Số hạng thứ n · hình lặp */
TDG.nth=function(G,lv){
  if(G===1||Math.random()<(lv===0?.5:.3)){const E=shuffle(['⭐','🌙','☀️','❤️','🍎','🎈','🌸','⚽']);const k=G===1?R(2,3):R(2,4);const pat=E.slice(0,k);const n=G===1?R(k+3,12):R(10,G===2?30:G===3?60:120);const ans=pat[(n-1)%k];const show=[];for(let i=0;i<k*2;i++)show.push(pat[i%k]);
    return Qmc(`Các hình được xếp lặp lại theo thứ tự. Hình thứ ${n} là hình nào?`,ans,shuffle(pat.concat(E.slice(k,k+Math.max(0,4-k))).slice(0,4)),{visual:emoRow(show.concat(['…'])),emo:true,
      hints:[`Cứ ${k} hình lại lặp lại một lần.`,`Lấy ${n} chia cho ${k}, xem số dư để biết hình ở vị trí nào trong nhóm.`],explain:`Nhóm ${k} hình lặp lại. ${n} : ${k} = ${Math.floor(n/k)} (dư ${n%k}) nên hình thứ ${n} là ${ans}.`});}
  const d=R(2,G===2?5:9),a=R(1,G===2?9:30);
  if(lv===0||(lv===1&&Math.random()<.5)){const n=R(8,G===2?12:G===3?30:100);const ans=a+(n-1)*d;return Qin(`Dãy số ${a}, ${a+d}, ${a+2*d}, ${a+3*d}, … Số thứ ${n} của dãy là bao nhiêu?`,ans,{hints:['Từ số thứ nhất đến số thứ '+n+' có bao nhiêu khoảng cách?',`Có ${n-1} khoảng, mỗi khoảng ${d}.`],explain:`Số thứ ${n} = ${a} + (${n} − 1) × ${d} = ${fN(ans)}.`});}
  const n=R(10,G===2?20:G===3?50:150);const last=a+(n-1)*d;
  if(lv===1)return Qin(`Dãy số ${a}, ${a+d}, ${a+2*d}, …, ${fN(last)} có bao nhiêu số?`,n,{hints:['Tìm số khoảng cách từ số đầu đến số cuối.',`Số khoảng = (${fN(last)} − ${a}) : ${d}. Số các số nhiều hơn số khoảng 1.`],explain:`(${fN(last)} − ${a}) : ${d} + 1 = ${n} số.`});
  return Qin(`Trong dãy số ${a}, ${a+d}, ${a+2*d}, …, số ${fN(last)} đứng ở vị trí thứ mấy?`,n,{hints:['Đếm xem từ số đầu đến số đó có bao nhiêu khoảng.',`(${fN(last)} − ${a}) : ${d} rồi cộng thêm 1.`],explain:`(${fN(last)} − ${a}) : ${d} + 1 = ${n}.`});};
/* 4. Số cách chọn */
TDG.choose=function(G,lv){const mx=[0,3,4,6,9,9][G];
  const ctx=RP([['chiếc áo','chiếc quần','một bộ quần áo gồm 1 áo và 1 quần','👕','👖'],['loại bánh','loại sữa','một phần ăn sáng gồm 1 bánh và 1 sữa','🥐','🥛'],['cây bút','quyển vở','một bộ gồm 1 bút và 1 vở','✏️','📒'],['chiếc mũ','đôi giày','1 chiếc mũ và 1 đôi giày để đi chơi','🧢','👟']]);
  if(lv===2&&G>=3){const m=R(2,4),n=R(2,4),p=R(2,3);const ans=m*n*p;return Qin(`Từ nhà đến chợ có ${m} con đường, từ chợ đến trường có ${n} con đường, từ trường đến công viên có ${p} con đường. Đi từ nhà qua chợ, qua trường đến công viên có bao nhiêu cách đi?`,ans,{hints:['Mỗi cách đi gồm 3 đoạn, mỗi đoạn chọn một con đường.',`Số cách = ${m} × ${n} × ${p}.`],explain:`${m} × ${n} × ${p} = ${ans} cách.`});}
  if(lv>=1&&Math.random()<.5){const m=R(2,mx),n=R(2,mx);const ans=m*n;return Qin(`Từ nhà đến trường có ${m} con đường, từ trường đến thư viện có ${n} con đường. Đi từ nhà qua trường đến thư viện có bao nhiêu cách đi?`,ans,{hints:['Chọn một đường đến trường trước, sau đó có bao nhiêu đường đi tiếp?',`Mỗi đường đến trường đi tiếp được ${n} cách.`],explain:`${m} × ${n} = ${ans} cách đi.`});}
  const m=R(2,mx),n=R(2,mx);const ans=m*n;
  return Qin(`Có ${m} ${ctx[0]} và ${n} ${ctx[1]}. Có bao nhiêu cách chọn ${ctx[2]}?`,ans,{visual:G<=2?emoRow(Array(m).fill(ctx[3]).concat(['·']).concat(Array(n).fill(ctx[4]))):'',
    hints:[`Chọn 1 ${ctx[0]} trước: mỗi ${ctx[0]} đi được với ${n} ${ctx[1]}.`,`Có ${m} ${ctx[0]}, mỗi ${ctx[0]} có ${n} cách → ${m} × ${n}.`],explain:G===1?`Mỗi ${ctx[0]} có ${n} cách: ${Array(m).fill(n).join(' + ')} = ${ans}.`:`${m} × ${n} = ${ans} cách.`});};
/* 5. Bắt tay, thi đấu */
TDG.shake=function(G,lv){const mx=[0,4,5,8,12,20][G];
  if(lv===2&&G>=4){const n=R(5,mx);const T=C2(n);return Qin(`Trong một giải đấu, mỗi đội gặp mỗi đội khác đúng một trận. Cả giải có ${T} trận. Hỏi có bao nhiêu đội?`,n,{hints:['Thử lần lượt: 4 đội có mấy trận? 5 đội có mấy trận?','Số trận = (số đội × (số đội − 1)) : 2.'],explain:`${n} đội: ${n} × ${n-1} : 2 = ${T} trận.`});}
  const n=R(3,mx);
  if(lv===2||(lv===1&&Math.random()<.4)){const ans=n*(n-1);return Qin(`Có ${n} bạn, mỗi bạn gửi cho mỗi bạn còn lại một tấm thiệp. Có tất cả bao nhiêu tấm thiệp?`,ans,{hints:['Mỗi bạn gửi bao nhiêu tấm thiệp?',`Mỗi bạn gửi ${n-1} tấm, có ${n} bạn.`],explain:`${n} × ${n-1} = ${ans} tấm thiệp (A gửi B và B gửi A là 2 tấm khác nhau).`});}
  const ans=C2(n);const ctx=Math.random()<.5?[`Có ${n} bạn gặp nhau, mỗi bạn bắt tay mỗi bạn khác đúng một lần. Có tất cả bao nhiêu cái bắt tay?`,'cái bắt tay']:[`Có ${n} đội bóng thi đấu, mỗi đội gặp mỗi đội khác đúng một trận. Có tất cả bao nhiêu trận đấu?`,'trận'];
  const seq=[];for(let k=n-1;k>=1;k--)seq.push(k);
  return Qin(ctx[0],ans,{hints:[`Bạn thứ nhất bắt tay ${n-1} người. Bạn thứ hai chỉ còn ${n-2} người chưa bắt tay…`,`Cộng lại: ${seq.join(' + ')}.`],explain:`${seq.join(' + ')} = ${ans} ${ctx[1]}.`});};
/* 6. Đếm số, chữ số */
TDG.count=function(G,lv){
  if(lv===2&&G>=3){const n=R(G===3?20:40,G===3?120:300);const d=Math.min(n,9)+2*Math.max(0,Math.min(n,99)-9)+3*Math.max(0,n-99);return Qin(`Để đánh số trang một quyển sách dày ${n} trang (từ trang 1) cần dùng bao nhiêu chữ số?`,d,{hints:['Chia thành nhóm: trang có 1 chữ số, 2 chữ số, 3 chữ số.',`Từ 1 đến 9: 9 chữ số. Từ 10 đến 99: 90 trang × 2 chữ số.`],explain:n<100?`9 + (${n} − 9) × 2 = ${d} chữ số.`:`9 + 90 × 2 + (${n} − 99) × 3 = ${d} chữ số.`});}
  if(lv>=1&&G>=2&&Math.random()<.5){const ds=shuffle([1,2,3,4,5,6,7,8,9]).slice(0,3);const rep=G>=3&&Math.random()<.4;const ans=rep?9:6;return Qin(`Từ ba chữ số ${ds.join(', ')} có thể viết được bao nhiêu số có hai chữ số${rep?' (các chữ số có thể giống nhau)':' khác nhau (hai chữ số trong mỗi số khác nhau)'}?`,ans,{hints:['Chọn chữ số hàng chục trước: có mấy cách?',rep?'Hàng chục 3 cách, hàng đơn vị cũng 3 cách.':'Hàng chục 3 cách, hàng đơn vị còn 2 cách.'],explain:rep?`3 × 3 = 9 số.`:`3 × 2 = 6 số: ${ds[0]}${ds[1]}, ${ds[0]}${ds[2]}, ${ds[1]}${ds[0]}, ${ds[1]}${ds[2]}, ${ds[2]}${ds[0]}, ${ds[2]}${ds[1]}.`});}
  const top=G===1?20:G===2?100:1000;let a=R(1,Math.floor(top*.6)),b=R(a+5,Math.min(top,a+(G===1?12:G===2?40:400)));
  if(lv>=1&&G>=2&&Math.random()<.5){const ev=Math.random()<.5;const cnt=Math.floor(b/2)-Math.floor((a-1)/2);const ans=ev?cnt:(b-a+1-cnt);return Qin(`Từ ${a} đến ${b} có bao nhiêu số ${ev?'chẵn':'lẻ'}?`,ans,{hints:[`Tìm số ${ev?'chẵn':'lẻ'} đầu tiên và cuối cùng trong khoảng đó.`,'Hai số chẵn (lẻ) liền nhau cách nhau 2 đơn vị.'],explain:`Có ${ans} số ${ev?'chẵn':'lẻ'}.`});}
  if(Math.random()<.5)return Qin(`Từ ${a} đến ${b} có bao nhiêu số (kể cả ${a} và ${b})?`,b-a+1,{hints:[`Thử với số nhỏ: từ 3 đến 5 có 3 số (3, 4, 5), không phải 2.`,`Lấy ${b} − ${a} rồi cộng thêm 1.`],explain:`${b} − ${a} + 1 = ${b-a+1} số.`});
  return Qin(`Có bao nhiêu số lớn hơn ${a} và bé hơn ${b}?`,b-a-1,{hints:[`Không tính ${a} và ${b}.`,`Lấy ${b} − ${a} rồi bớt đi 1.`],explain:`Các số từ ${a+1} đến ${b-1}: ${b-1} − ${a+1} + 1 = ${b-a-1} số.`});};
/* 7. Xếp hàng, thứ hạng */
TDG.line=function(G,lv){const mx=G===1?10:G===2?20:40;const [A,B,C,D]=names(4);
  if(lv===2||(lv===1&&Math.random()<.5)){const k=G>=3&&lv===2?4:3;const ord=names(k);const adj=G>=3?['cao hơn','thấp hơn']:['cao hơn','thấp hơn'];const st=[];for(let i=0;i<k-1;i++){st.push(Math.random()<.5?`${ord[i]} ${adj[0]} ${ord[i+1]}`:`${ord[i+1]} ${adj[1]} ${ord[i]}`);}
    const ask=Math.random()<.5;const ans=ask?ord[0]:ord[k-1];return Qmc(`${shuffle(st).join('. ')}. Bạn nào ${ask?'cao nhất':'thấp nhất'}?`,ans,ord,{hints:['Viết tên các bạn thành một hàng từ cao đến thấp.','Đọc từng câu và đặt bạn cao hơn lên trước.'],explain:`Xếp từ cao đến thấp: ${ord.join(', ')}. Bạn ${ask?'cao nhất':'thấp nhất'} là ${ans}.`});}
  const t=R(0,2);
  if(t===0){const a=R(2,Math.floor(mx/2)),b=R(2,Math.floor(mx/2));const n=a+b-1;return Qin(`${A} đứng thứ ${a} tính từ bên trái và thứ ${b} tính từ bên phải của một hàng. Hàng đó có bao nhiêu bạn?`,n,{visual:G===1&&n<=10?emoRow(Array(n).fill('🧒').map((e,i)=>i===a-1?'🙋':e)):'',hints:[`Bên trái ${A} có ${a-1} bạn, bên phải có ${b-1} bạn.`,`Đừng quên tính cả ${A}: đếm ${A} một lần thôi.`],explain:`${a} + ${b} − 1 = ${n} bạn (${A} được đếm hai lần nên bớt 1).`});}
  if(t===1){const n=R(5,mx),a=R(1,n);const ans=n-a+1;return Qin(`Một hàng có ${n} bạn. ${A} đứng thứ ${a} tính từ bên trái. Hỏi ${A} đứng thứ mấy tính từ bên phải?`,ans,{hints:[`Bên phải ${A} có bao nhiêu bạn?`,`Có ${n-a} bạn đứng sau ${A} (bên phải).`],explain:`${n} − ${a} + 1 = ${ans}.`});}
  const n=R(8,mx),a=R(1,n-3),b=R(a+2,n);return Qin(`Trong một hàng, ${A} đứng thứ ${a} và ${B} đứng thứ ${b} tính từ đầu hàng. Giữa ${A} và ${B} có bao nhiêu bạn?`,b-a-1,{hints:[`Các bạn ở giữa đứng từ vị trí ${a+1} đến vị trí ${b-1}.`,`Lấy ${b} − ${a} rồi bớt 1.`],explain:`${b} − ${a} − 1 = ${b-a-1} bạn.`});};
/* 8. Ai nói thật? */
TDG.truth=function(G,lv){const k=G>=4&&lv>=1?4:3;const P=names(k);const ctx=RP([['ăn mất chiếc bánh','đã ăn bánh'],['làm vỡ lọ hoa','đã làm vỡ lọ hoa'],['giấu chiếc mũ của cô giáo','đã giấu mũ']]);
  for(let tries=0;tries<400;tries++){const st=P.map((s,i)=>{const t=R(0,2);const o=RP(P.filter((_,j)=>j!==i));if(t===0)return {txt:`${s}: “${o} ${ctx[1].replace('đã ','')}.”`,f:c=>c===o};if(t===1)return {txt:`${s}: “${o} không ${ctx[1].replace('đã ','')}.”`,f:c=>c!==o};return {txt:`${s}: “Tớ không ${ctx[1].replace('đã ','')}.”`,f:c=>c!==s};});
    const mode=Math.random()<.5?1:k-1;/* số bạn nói thật */
    const sols=P.filter(c=>st.filter(x=>x.f(c)).length===mode);if(sols.length!==1)continue;const c=sols[0];
    const askTruth=lv===2&&mode===1;const truthful=P.filter((_,i)=>st[i].f(c));const ans=askTruth?truthful[0]:c;
    const rule=mode===1?'Chỉ có một bạn nói thật':'Chỉ có một bạn nói dối';
    return Qmc(`Có một bạn ${ctx[0]}. Cô hỏi ${k} bạn và nghe: ${st.map(x=>x.txt).join(' ')} ${rule}. ${askTruth?'Bạn nào nói thật?':'Ai '+ctx[1]+'?'}`,ans,P,{bigSmall:true,
      hints:[`Thử giả sử từng bạn là người ${ctx[1].replace('đã ','')}.`,`Với mỗi lần giả sử, đếm xem có mấy bạn nói thật. ${rule}.`],explain:`Nếu ${c} ${ctx[1].replace('đã ','')} thì ${truthful.length} bạn nói thật (${truthful.join(', ')}), đúng điều kiện. Thử các bạn khác đều không đúng.`});}
  return TDG.line(G,lv);};
/* 9. Ngày trong tuần, tuổi */
TDG.days=function(G,lv){
  if(lv===0||(lv===1&&Math.random()<.5)){const d0=R(0,6);
    if(G>=3&&lv>=1){const a=R(1,9),b=R(a+5,30);const dd=(d0+(b-a))%7;return Qmc(`Ngày ${a} của một tháng là ${WD[d0]}. Ngày ${b} của tháng đó là thứ mấy?`,cap(WD[dd]),shuffle([cap(WD[dd])].concat(shuffle(WD.filter((_,i)=>i!==dd)).slice(0,3).map(cap))),{hints:['Cứ sau 7 ngày lại đến cùng một thứ.',`Từ ngày ${a} đến ngày ${b} cách nhau ${b-a} ngày. Chia cho 7 xem dư mấy.`],explain:`${b-a} = 7 × ${Math.floor((b-a)/7)} + ${(b-a)%7}. ${cap(WD[d0])} thêm ${(b-a)%7} ngày là ${WD[dd]}.`});}
    const n=G===1?R(1,6):R(3,G===2?14:60);const dd=(d0+n)%7;return Qmc(`Hôm nay là ${WD[d0]}. Hỏi ${n} ngày nữa là thứ mấy?`,cap(WD[dd]),shuffle([cap(WD[dd])].concat(shuffle(WD.filter((_,i)=>i!==dd)).slice(0,3).map(cap))),{hints:['Đếm tiếp từng ngày trên các ngón tay.',n>=7?`Cứ 7 ngày là quay lại ${WD[d0]}. ${n} chia 7 dư ${n%7}.`:`Đếm thêm ${n} ngày từ ${WD[d0]}.`],explain:`${cap(WD[d0])} thêm ${n} ngày là ${WD[dd]}.`});}
  const [A]=names(1);const con=R(4,10),gap=R(20,32),me=con+gap,n=R(2,9);
  if(lv===2&&G>=3){const s=me+con;const ans=s+2*n;return Qin(`Hiện nay tổng số tuổi của mẹ và ${A} là ${s} tuổi. Hỏi ${n} năm nữa tổng số tuổi của hai mẹ con là bao nhiêu?`,ans,{hints:['Mỗi năm mỗi người thêm 1 tuổi.',`Sau ${n} năm, hai người thêm tất cả ${n} × 2 tuổi.`],explain:`${s} + ${n} × 2 = ${ans} tuổi.`});}
  return Qin(`Năm nay mẹ ${me} tuổi, ${A} ${con} tuổi. Hỏi ${n} năm nữa mẹ hơn ${A} bao nhiêu tuổi?`,gap,{hints:['Mỗi năm cả hai người đều thêm 1 tuổi.','Hiệu số tuổi không bao giờ thay đổi.'],explain:`Mẹ luôn hơn ${A}: ${me} − ${con} = ${gap} tuổi.`});};
/* 10. Tổng – hiệu */
TDG.sumdiff=function(G,lv){const top=[0,0,20,100,1000,10000][G];let b=R(2,top),dd=R(1,Math.max(2,Math.floor(top/3)));if(G===2){b=R(3,15);dd=R(1,8);}const big=b+dd,S=big+b;
  const ctx=RP([['Thùng thứ nhất','Thùng thứ hai',`Hai thùng có tất cả ${fN(S)} lít dầu. Thùng thứ nhất nhiều hơn thùng thứ hai ${fN(dd)} lít.`,'lít dầu'],['Tổ Một','Tổ Hai',`Hai tổ trồng được ${fN(S)} cây. Tổ Một trồng nhiều hơn Tổ Hai ${fN(dd)} cây.`,'cây'],['Số lớn','Số bé',`Tổng hai số là ${fN(S)}, hiệu hai số là ${fN(dd)}.`,'']]);
  const vis=tapeSVG([{n:ctx[0],parts:2,extra:.6,exLab:fN(dd)},{n:ctx[1],parts:2}],fN(S));
  const hints=['Nếu bớt phần hơn đi thì hai phần bằng nhau.',`Hai lần ${ctx[1].toLowerCase()} = ${fN(S)} − ${fN(dd)} = ${fN(S-dd)}.`];const ex=`${ctx[1]}: (${fN(S)} − ${fN(dd)}) : 2 = ${fN(b)}. ${ctx[0]}: ${fN(b)} + ${fN(dd)} = ${fN(big)}.`;
  if(lv===0&&G>=3)return Qin(ctx[2]+(ctx[3]?` Hỏi ${ctx[1].charAt(0).toLowerCase()+ctx[1].slice(1)} có bao nhiêu ${ctx[3]}?`:' Tìm số bé.'),b,{visual:vis,hints,explain:ex});
  return Qsl(ctx[2]+' Tìm mỗi phần. Chạm số rồi chạm ô.',[ctx[0],ctx[1]],[big,b],[S-dd,Math.floor(S/2),S+dd,dd],{visual:vis,hints,explain:ex});};
/* 11. Gấp lần bằng sơ đồ */
TDG.ratio=function(G,lv){const k=G===2?2:R(2,G===3?4:6);const each=R(G===2?2:3,G===2?10:G===3?30:G===4?200:1500);const [A,B]=names(2);const thing=RP(['viên bi','quyển truyện','nhãn vở','bông hoa']);
  if(lv===2&&G>=3){const D=(k-1)*each;const vis=tapeSVG([{n:B,parts:1},{n:A,parts:k,label:''}],'');return Qsl(`Số ${thing} của ${A} gấp ${k} lần số ${thing} của ${B}. ${A} có nhiều hơn ${B} ${fN(D)} ${thing}. Phần hơn gồm mấy phần bằng nhau, mỗi phần là bao nhiêu?`,['Số phần hơn','Mỗi phần'],[k-1,each],[k,k+1,Math.floor(D/k),D],{visual:vis,hints:[`${B} là 1 phần, ${A} là ${k} phần.`,`Phần hơn: ${k} − 1 = ${k-1} phần.`],explain:`${A} hơn ${B} ${k} − 1 = ${k-1} phần. Mỗi phần: ${fN(D)} : ${k-1} = ${fN(each)} ${thing}.`});}
  const S=(k+1)*each;const vis=tapeSVG([{n:B,parts:1},{n:A,parts:k}],fN(S));
  if(lv===1&&Math.random()<.5)return Qin(`Số ${thing} của ${A} gấp ${k} lần số ${thing} của ${B}. Cả hai bạn có ${fN(S)} ${thing}. Hỏi ${A} có bao nhiêu ${thing}?`,k*each,{visual:vis,hints:[`${B} 1 phần, ${A} ${k} phần, cả hai ${k+1} phần.`,`Mỗi phần: ${fN(S)} : ${k+1}.`],explain:`Mỗi phần ${fN(S)} : ${k+1} = ${fN(each)}. ${A}: ${fN(each)} × ${k} = ${fN(k*each)} ${thing}.`});
  return Qsl(`Số ${thing} của ${A} gấp ${k} lần số ${thing} của ${B}. Cả hai bạn có ${fN(S)} ${thing}. Tổng gồm mấy phần bằng nhau, mỗi phần là bao nhiêu?`,['Số phần','Mỗi phần'],[k+1,each],[k,Math.floor(S/k),each+1,k+2],{visual:vis,hints:[`${B} là 1 phần thì ${A} là ${k} phần như thế.`,`Tổng số phần: 1 + ${k}.`],explain:`Tổng có 1 + ${k} = ${k+1} phần. Mỗi phần: ${fN(S)} : ${k+1} = ${fN(each)} ${thing}.`});};
/* 12. Hơn kém, chuyển cho nhau */
TDG.give=function(G,lv){const [A,B]=names(2);const thing=RP(['cái kẹo','viên bi','quyển vở','bông hoa']);const top=G===1?20:G===2?60:200;
  if(lv===0){const b=R(1,top-10),a=R(b+1,top);return Qin(`${A} có ${a} ${thing}, ${B} có ${b} ${thing}. ${A} có nhiều hơn ${B} bao nhiêu ${thing}?`,a-b,{hints:['Muốn biết hơn bao nhiêu thì làm phép trừ.',`Lấy số lớn trừ số bé: ${a} − ${b}.`],explain:`${a} − ${b} = ${a-b} ${thing}.`});}
  if(lv===1){const x=R(1,G===1?5:15),d=2*x;const b=R(1,top-d),a=b+d;if(Math.random()<.5)return Qin(`${A} có ${a} ${thing}, ${B} có ${b} ${thing}. ${A} phải cho ${B} bao nhiêu ${thing} để hai bạn có số ${thing} bằng nhau?`,x,{hints:[`${A} hơn ${B} ${d} ${thing}.`,'Cho đi một nửa phần hơn thì hai bạn bằng nhau.'],explain:`${A} hơn ${B} ${d} ${thing}. Cho ${d} : 2 = ${x} ${thing} thì mỗi bạn có ${a-x}.`});
    const y=R(1,Math.max(1,x-1));return Qin(`${A} có nhiều hơn ${B} ${d} ${thing}. Nếu ${A} cho ${B} ${y} ${thing} thì ${A} còn nhiều hơn ${B} bao nhiêu ${thing}?`,d-2*y,{hints:[`${A} mất ${y} ${thing}, ${B} được thêm ${y} ${thing}.`,`Khoảng cách giảm đi ${y} + ${y}.`],explain:`${d} − ${y} × 2 = ${d-2*y} ${thing}.`});}
  const x=R(2,G===1?6:20);if(Math.random()<.5)return Qin(`Nếu ${A} cho ${B} ${x} ${thing} thì số ${thing} của hai bạn bằng nhau. Lúc đầu ${A} nhiều hơn ${B} bao nhiêu ${thing}?`,2*x,{hints:[`Sau khi cho, ${A} bớt ${x}, ${B} thêm ${x}.`,`Phần hơn lúc đầu = ${x} + ${x}.`],explain:`${x} × 2 = ${2*x} ${thing}.`});
  const e=R(5,top/2|0);return Qin(`${A} cho ${B} ${x} ${thing}, sau đó mỗi bạn đều có ${e} ${thing}. Lúc đầu ${A} có bao nhiêu ${thing}?`,e+x,{hints:['Đi ngược lại: trước khi cho, ' + A + ' có nhiều hơn bây giờ.',`${e} + ${x}.`],explain:`${e} + ${x} = ${e+x} ${thing}.`});};
/* 13. Tính ngược từ cuối */
TDG.back=function(G,lv){const top=G===1?20:G===2?100:G===3?1000:10000;const nOps=lv===2&&G>=3?3:2;
  for(let t=0;t<200;t++){let x=R(2,Math.floor(top/(G>=3?4:2)));let v=x;const ops=[];
    for(let i=0;i<nOps;i++){const allow=G<=2?['+','−']:['+','−','×',':'];const op=RP(allow);let k;
      if(op==='+'){k=R(1,Math.max(2,Math.floor(top/5)));v+=k;}else if(op==='−'){if(v<3){i--;continue;}k=R(1,v-1);v-=k;}else if(op==='×'){k=R(2,G===3?5:9);v*=k;}else{const dv=[2,3,4,5,6,7,8,9].filter(d=>v%d===0&&v/d>=1);if(!dv.length){i--;continue;}k=RP(dv);v/=k;}
      if(ops.length&&k===ops[ops.length-1][1]&&((op==='+'&&ops[ops.length-1][0]==='−')||(op==='−'&&ops[ops.length-1][0]==='+')||(op==='×'&&ops[ops.length-1][0]===':')||(op===':'&&ops[ops.length-1][0]==='×'))){v=-1;break;}
      ops.push([op,k]);if(v>top){break;}}
    if(v>top||ops.length<nOps||v<0)continue;
    const vi={'+':'cộng',"−":'trừ','×':'nhân với',':':'chia cho'};const inv={'+':'−','−':'+','×':':',':':'×'};
    const desc=ops.map(([o,k])=>`${vi[o]} ${fN(k)}`).join(' rồi ');
    let chain=fN(v),cur=v;const steps=[];for(let i=ops.length-1;i>=0;i--){const [o,k]=ops[i];const p=o==='+'?cur-k:o==='−'?cur+k:o==='×'?cur/k:cur*k;steps.push(`${fN(cur)} ${inv[o]} ${fN(k)} = ${fN(p)}`);cur=p;}
    if(lv===0&&G<=3&&Math.random()<.6&&ops.every(([o])=>o==='+'||o==='−')){const [A]=names(1);const thing=RP(['cái kẹo','viên bi','nhãn vở']);
      const sto=ops.map(([o,k])=>o==='+'?`được mẹ cho thêm ${k} ${thing}`:`cho bạn ${k} ${thing}`).join(', sau đó ');
      return Qin(`${A} có một số ${thing}. ${A} ${sto}, lúc này ${A} có ${fN(v)} ${thing}. Hỏi lúc đầu ${A} có bao nhiêu ${thing}?`,x,{hints:['Đi ngược từ cuối lên đầu.','Được cho thêm thì ngược lại là bớt đi; cho bạn thì ngược lại là cộng vào.'],explain:steps.join('; ')+'.'});}
    return Qin(`Tìm một số, biết rằng lấy số đó ${desc} thì được ${fN(v)}.`,x,{hints:['Đi ngược từ kết quả cuối cùng.','Cộng ↔ trừ, nhân ↔ chia: làm phép ngược lại theo thứ tự ngược lại.'],explain:steps.join('; ')+'.'});}
  return TDG.ap(G,lv);};
/* 14. Thử – chọn */
TDG.trial=function(G,lv){
  if(lv===2&&G>=4){const pr=RP([[2,3],[3,4],[2,5],[3,5],[4,5],[2,7],[3,7]]);const L=pr[0]*pr[1];const r=R(1,Math.min(...pr)-1);const ans=L+r;return Qin(`Tìm số bé nhất lớn hơn ${r} mà khi chia cho ${pr[0]} hay chia cho ${pr[1]} đều dư ${r}.`,ans,{hints:[`Số đó bớt đi ${r} thì chia hết cho cả ${pr[0]} và ${pr[1]}.`,`Số bé nhất chia hết cho cả ${pr[0]} và ${pr[1]} là ${L}.`],explain:`${L} + ${r} = ${ans}. Thử: ${ans} : ${pr[0]} dư ${r}, ${ans} : ${pr[1]} dư ${r}.`});}
  if(lv>=1&&G>=3&&Math.random()<.5){for(let t=0;t<50;t++){const tn=R(2,9),un=R(0,tn-1);const s=tn+un,d=tn-un;if(d<1)continue;const ans=tn*10+un;const cands=[];for(let x=10;x<100;x++){const a=Math.floor(x/10),b=x%10;if(a+b===s)cands.push(x);}
      return Qmc(`Tìm số có hai chữ số, biết tổng hai chữ số là ${s} và chữ số hàng chục hơn chữ số hàng đơn vị ${d}.`,ans,shuffle([ans].concat(shuffle(cands.filter(x=>x!==ans)).slice(0,3))),{hints:[`Liệt kê các số có tổng hai chữ số bằng ${s}.`,'Chọn số có chữ số hàng chục hơn hàng đơn vị đúng '+d+'.'],explain:`${tn} + ${un} = ${s}, ${tn} − ${un} = ${d}. Số cần tìm là ${ans}.`});}}
  for(let t=0;t<100;t++){const a=R(1,8),b=R(a+1,9);const S=a+b,P=a*b;const pairs=[];for(let x=1;x<=9;x++)for(let y=x+1;y<=9;y++)if(x+y===S)pairs.push([x,y]);if(pairs.length<3)continue;const useDiff=Math.random()<.3&&G>=3;
    if(useDiff){const D=b-a;const ps=[];for(let x=1;x<=9;x++)for(let y=x+1;y<=9;y++)if(y-x===D)ps.push([x,y]);if(ps.filter(p=>p[0]*p[1]===P).length!==1||ps.length<3)continue;const opts=shuffle(ps).slice(0,3);if(!opts.some(p=>p[0]===a))opts[0]=[a,b];
      return Qmc(`Tìm hai số có một chữ số, biết số lớn hơn số bé ${D} đơn vị và tích của chúng là ${P}.`,`${a} và ${b}`,shuffle(opts.map(p=>`${p[0]} và ${p[1]}`)),{hints:[`Liệt kê các cặp số hơn kém nhau ${D}.`,'Tính tích từng cặp để chọn cặp đúng.'],explain:`Các cặp hơn kém ${D}: ${ps.map(p=>p.join(' và ')).join('; ')}. Chỉ có ${a} × ${b} = ${P}.`});}
    const opts=shuffle(pairs).slice(0,4);if(!opts.some(p=>p[0]===a))opts[0]=[a,b];
    return Qmc(`Tìm hai số có một chữ số khác nhau, biết tổng của chúng là ${S} và tích của chúng là ${P}.`,`${a} và ${b}`,shuffle(opts.map(p=>`${p[0]} và ${p[1]}`)),{hints:[`Liệt kê các cặp số có tổng bằng ${S}.`,'Thử tính tích từng cặp.'],explain:`Các cặp có tổng ${S}: ${pairs.map(p=>p.join(' và ')).join('; ')}. Chỉ có ${a} × ${b} = ${P}.`});}
  return TDG.back(G,lv);};
/* 15. Gà – chó, xe đạp – xe ba bánh */
TDG.legs=function(G,lv){const H=R(G===3?5:8,G===3?12:G===4?30:50);const d=R(1,H-1),c=H-d;
  if(Math.random()<.5){const L=2*c+4*d;const askDog=lv!==0||Math.random()<.5;return Qin(`Vừa gà vừa chó có ${H} con, đếm được ${L} chân. Hỏi có bao nhiêu con ${askDog?'chó':'gà'}?`,askDog?d:c,{hints:[`Giả sử cả ${H} con đều là gà thì có ${H} × 2 = ${2*H} chân.`,`Số chân bị thiếu: ${L} − ${2*H} = ${L-2*H}. Mỗi con chó hơn gà 2 chân.`],explain:`Chó: (${L} − ${2*H}) : 2 = ${d} con. Gà: ${H} − ${d} = ${c} con.`});}
  const W=2*c+3*d;return Qin(`Trong sân có ${H} chiếc xe đạp và xe ba bánh, đếm được ${W} bánh xe. Hỏi có bao nhiêu xe ba bánh?`,d,{hints:[`Giả sử cả ${H} xe đều là xe đạp: ${H} × 2 = ${2*H} bánh.`,`Mỗi xe ba bánh hơn xe đạp 1 bánh. Số bánh thiếu: ${W} − ${2*H}.`],explain:`Xe ba bánh: ${W} − ${2*H} = ${d} chiếc. Xe đạp: ${c} chiếc.`});};
/* 16. Chu vi, diện tích hình ghép */
TDG.peri=function(G,lv){const n=G===1?R(4,7):R(lv===0?4:5,lv===2?11:9);const P=polyomino(n);
  if(G===1)return Qin('Hình dưới đây được ghép từ bao nhiêu ô vuông?',n,{visual:gridSVG(P.cells,0,'Hình ghép từ ô vuông'),hints:['Đếm từng hàng một, từ trên xuống dưới.','Đếm xong hàng nào thì cộng dồn.'],explain:`Hình có ${n} ô vuông.`});
  const side=lv===0||G===2?1:RP(G>=4?[1,2,3]:[1,2]);
  if(G>=3&&Math.random()<.35){const A=n*side*side;return Qin(`Hình dưới ghép từ các ô vuông, mỗi ô cạnh ${side} cm. Diện tích của hình là bao nhiêu xăng-ti-mét vuông?`,A,{unit:'cm²',visual:gridSVG(P.cells,side),hints:['Đếm số ô vuông của hình.',side>1?`Mỗi ô có diện tích ${side} × ${side} = ${side*side} cm².`:'Mỗi ô có diện tích 1 cm².'],explain:`${n} ô × ${side*side} cm² = ${A} cm².`});}
  const per=P.per*side;return Qin(`Hình dưới ghép từ các ô vuông, mỗi ô cạnh ${side} cm. Chu vi của hình là bao nhiêu xăng-ti-mét?`,per,{unit:'cm',visual:gridSVG(P.cells,side),hints:['Chu vi là đường bao quanh bên ngoài. Đếm các cạnh ô vuông nằm trên đường bao.','Đi một vòng quanh hình, đánh dấu từng cạnh để không đếm sót.'],explain:`Đường bao gồm ${P.per} cạnh ô vuông${side>1?`, mỗi cạnh ${side} cm: ${P.per} × ${side} = ${per} cm`:`, chu vi là ${per} cm`}.`});};
/* 17. Đếm hình */
TDG.shapes=function(G,lv){const t=G===1?RP(['seg','sq']):RP(lv===0?['seg','strip']:['seg','fan','sq','strip']);
  if(t==='seg'){const m=G===1?R(3,4):R(3,G===2?5:7);const ans=C2(m);return Qin(`Trên một đường thẳng có ${m} điểm như hình. Có bao nhiêu đoạn thẳng có hai đầu là hai trong các điểm đó?`,ans,{visual:dotsLineSVG(m),hints:['Bắt đầu từ điểm A: nối A với các điểm còn lại được mấy đoạn?',`Từ A có ${m-1} đoạn, từ B có thêm ${m-2} đoạn mới…`],explain:`${Array.from({length:m-1},(_,i)=>m-1-i).join(' + ')} = ${ans} đoạn thẳng.`});}
  if(t==='fan'){const m=R(3,G===2?4:6);const ans=C2(m);return Qin('Hình dưới đây có bao nhiêu hình tam giác?',ans,{visual:fanSVG(m),hints:['Mỗi tam giác có chung đỉnh trên cùng, khác nhau ở cạnh đáy.',`Đếm số đoạn thẳng trên cạnh đáy (có ${m} điểm).`],explain:`Cạnh đáy có ${m} điểm nên có ${ans} đoạn, mỗi đoạn tạo một tam giác: ${ans} hình.`});}
  if(t==='sq'){const k=G===1?2:R(2,G===2?3:4);let ans=0;for(let i=1;i<=k;i++)ans+=i*i;return Qin('Hình dưới đây có tất cả bao nhiêu hình vuông?',ans,{visual:gridSqSVG(k),hints:['Đếm hình vuông nhỏ nhất trước, rồi đến hình vuông lớn hơn.',`Ô nhỏ: ${k*k}, ô 2×2: ${(k-1)*(k-1)}${k>2?'…':''}, đừng quên cả hình vuông lớn nhất.`],explain:Array.from({length:k},(_,i)=>(k-i)*(k-i)).join(' + ')+` = ${ans} hình vuông.`});}
  const n=R(3,G===2?4:6);const ans=n*(n+1)/2;return Qin('Hình dưới đây có tất cả bao nhiêu hình chữ nhật?',ans,{visual:stripSVG(n),hints:['Đếm hình gồm 1 ô, rồi hình gồm 2 ô liền nhau, 3 ô…',`Có ${n} hình 1 ô, ${n-1} hình 2 ô…`],explain:Array.from({length:n},(_,i)=>n-i).join(' + ')+` = ${ans} hình chữ nhật.`});};
/* 18. Khối lập phương */
TDG.cube=function(G,lv){const t=G<=2?(lv===0?'stairs':RP(['stairs','dice'])):RP(lv===0?['stairs','dice','box']:['dice','paint','box','paint']);
  if(t==='stairs'){const k=R(2,G===1?3:5);const hs=Array.from({length:k},(_,i)=>i+1);if(Math.random()<.5)hs.reverse();const ans=hs.reduce((a,b)=>a+b,0);return Qin('Có bao nhiêu khối lập phương trong hình dưới đây? (Các khối xếp thành một lớp, không có khối bị che.)',ans,{visual:stairsSVG(hs),hints:['Đếm từng cột từ trái sang phải.',`Các cột có ${hs.join(', ')} khối.`],explain:`${hs.join(' + ')} = ${ans} khối.`});}
  if(t==='dice'){const f=R(1,6);return Qin(`Trên con xúc xắc, tổng số chấm của hai mặt đối diện luôn bằng 7. Mặt đối diện với mặt ${f} chấm có mấy chấm?`,7-f,{visual:`<div class="ht-big">🎲</div>`,hints:['Hai mặt đối diện cộng lại bằng 7.',`${f} + ? = 7`],explain:`7 − ${f} = ${7-f} chấm.`});}
  if(t==='box'){const a=R(2,4),b=R(2,4),c=R(2,G>=4?5:3);const ans=a*b*c;return Qin(`Người ta xếp các khối lập phương nhỏ thành một hình hộp chữ nhật có chiều dài ${a} khối, chiều rộng ${b} khối và chiều cao ${c} khối. Cần bao nhiêu khối lập phương nhỏ?`,ans,{hints:[`Mỗi lớp có ${a} × ${b} khối.`,`Có ${c} lớp như thế.`],explain:`${a} × ${b} × ${c} = ${ans} khối.`});}
  const n=G===3?3:R(3,G===4?4:5);const opt=RP(lv===2?[0,1,2]:[3,2,1]);const vals={3:8,2:12*(n-2),1:6*(n-2)*(n-2),0:(n-2)**3};const lab={3:'đúng 3 mặt',2:'đúng 2 mặt',1:'đúng 1 mặt',0:'không có mặt nào'};
  return Qin(`Một khối lập phương lớn được sơn kín 6 mặt rồi cắt thành các khối nhỏ: mỗi cạnh có ${n} khối (tất cả ${n*n*n} khối). Có bao nhiêu khối nhỏ được sơn ${lab[opt]}?`,vals[opt],{hints:['Khối ở đỉnh có 3 mặt sơn, khối ở cạnh (không phải đỉnh) có 2 mặt, khối giữa mỗi mặt có 1 mặt, khối bên trong không có.',opt===3?'Khối lập phương có 8 đỉnh.':opt===2?`Có 12 cạnh, mỗi cạnh có ${n} − 2 = ${n-2} khối không ở đỉnh.`:opt===1?`Có 6 mặt, giữa mỗi mặt có (${n} − 2) × (${n} − 2) khối.`:`Phần bên trong là khối lập phương cạnh ${n} − 2.`],explain:opt===3?'Có 8 đỉnh nên có 8 khối.':opt===2?`12 × ${n-2} = ${vals[2]} khối.`:opt===1?`6 × ${n-2} × ${n-2} = ${vals[1]} khối.`:`${n-2} × ${n-2} × ${n-2} = ${vals[0]} khối.`});};
/* 19. Tính nhanh */
TDG.quick=function(G,lv){
  if(G===1){const a=R(1,9),b=R(1,9);const big=`${a} + ${b} + ${10-a} + ${10-b} = ?`;return Qin('Tính nhanh.',20,{big,hints:['Tìm hai số cộng lại bằng 10.',`${a} + ${10-a} = 10 và ${b} + ${10-b} = 10.`],explain:`(${a} + ${10-a}) + (${b} + ${10-b}) = 10 + 10 = 20.`});}
  if(G===2||(lv===0&&G<=3)){const t=G===2?10:100;const a=R(t===10?11:11,t===10?49:89),b=R(11,t===10?49:89);const a2=G===2?(Math.ceil(a/10)*10-a||10):100-a,b2=G===2?(Math.ceil(b/10)*10-b||10):100-b;const ans=a+a2+b+b2;return Qin('Tính bằng cách thuận tiện nhất.',ans,{big:`${a} + ${b} + ${a2} + ${b2} = ?`,hints:['Nhóm hai số có tổng tròn chục (tròn trăm) với nhau.',`${a} + ${a2} = ${a+a2}`],explain:`(${a} + ${a2}) + (${b} + ${b2}) = ${a+a2} + ${b+b2} = ${ans}.`});}
  const t=RP(lv===2?['gauss','dist','gauss']:['dist','25','dist']);
  if(t==='dist'){const a=R(3,G===3?9:99);const b=R(11,89),c=(G>=4?100:10*Math.ceil(b/10))-b||10;const ans=a*(b+c);return Qin('Tính bằng cách thuận tiện nhất.',ans,{big:`${a} × ${b} + ${a} × ${c} = ?`,bigSmall:true,hints:[`Cả hai tích đều có thừa số ${a}.`,`${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}).`],explain:`${a} × (${b} + ${c}) = ${a} × ${b+c} = ${fN(ans)}.`});}
  if(t==='25'){const k=R(2,9),m=RP([[25,4],[5,2],[50,2],[125,8]]);const ans=m[0]*k*m[1];return Qin('Tính bằng cách thuận tiện nhất.',ans,{big:`${m[0]} × ${k} × ${m[1]} = ?`,hints:[`Đổi chỗ để nhân ${m[0]} × ${m[1]} trước.`,`${m[0]} × ${m[1]} = ${m[0]*m[1]}`],explain:`${m[0]} × ${m[1]} × ${k} = ${m[0]*m[1]} × ${k} = ${fN(ans)}.`});}
  const n=2*R(5,G===3?10:50);const ans=n*(n+1)/2;return Qin(`Tính tổng 1 + 2 + 3 + … + ${n}.`,ans,{hints:[`Ghép số đầu với số cuối: 1 + ${n} = ${n+1}, 2 + ${n-1} = ${n+1}, …`,`Có ${n/2} cặp, mỗi cặp bằng ${n+1}.`],explain:`${n/2} × ${n+1} = ${fN(ans)}.`});};
/* 20. Trồng cây, cưa gỗ */
TDG.trees=function(G,lv){const t=RP(lv===0?['both','saw']:lv===1?['both','one','saw','none']:['circle','stairs','none','saw']);
  if(t==='saw'){const n=R(3,G===2?5:9),m=R(2,G===2?5:10);const ans=(n-1)*m;return Qin(`Cưa một khúc gỗ thành ${n} đoạn, mỗi lần cưa mất ${m} phút. Hỏi cưa xong hết bao nhiêu phút?`,ans,{hints:['Cưa thành 2 đoạn chỉ cần 1 lần cưa.',`Cưa thành ${n} đoạn cần ${n} − 1 = ${n-1} lần.`],explain:`(${n} − 1) × ${m} = ${ans} phút.`});}
  if(t==='stairs'){const a=R(2,4),per=R(2,G>=4?6:4);const b=R(a+2,G>=4?12:9);const tA=(a-1)*per,ans=(b-1)*per;return Qin(`Đi từ tầng 1 lên tầng ${a} mất ${tA} giây. Hỏi đi từ tầng 1 lên tầng ${b} mất bao nhiêu giây (đi đều như nhau)?`,ans,{hints:[`Từ tầng 1 lên tầng ${a} chỉ đi ${a-1} lượt cầu thang.`,`Mỗi lượt cầu thang mất ${tA} : ${a-1} = ${per} giây.`],explain:`Mỗi lượt ${per} giây. Lên tầng ${b}: (${b} − 1) × ${per} = ${ans} giây.`});}
  const d=RP(G===2?[2,5]:[2,3,4,5,6,10]);const k=R(3,G===2?10:30);const L=d*k;
  const ttl={both:[`Dọc một bên con đường dài ${L} m, người ta trồng cây cách đều nhau ${d} m, cả hai đầu đường đều có cây. Có tất cả bao nhiêu cây?`,k+1,'Trồng cả ở hai đầu: số cây nhiều hơn số khoảng 1.'],one:[`Một hàng rào dài ${L} m, cứ ${d} m cắm một cọc, chỉ cắm ở một đầu (đầu kia là bức tường). Cần bao nhiêu cọc?`,k,'Chỉ cắm ở một đầu: số cọc bằng số khoảng.'],none:[`Giữa hai cột điện cách nhau ${L} m, người ta trồng cây cách đều nhau ${d} m (không trồng sát cột). Trồng được bao nhiêu cây?`,k-1,'Không trồng ở hai đầu: số cây ít hơn số khoảng 1.'],circle:[`Quanh một hồ nước có chu vi ${L} m, cứ ${d} m trồng một cây. Có bao nhiêu cây?`,k,'Trồng theo vòng khép kín: số cây bằng số khoảng.']}[t];
  return Qin(ttl[0],ttl[1],{hints:[`Đoạn đường được chia thành ${L} : ${d} = ${k} khoảng.`,ttl[2]],explain:`${L} : ${d} = ${k} khoảng. ${ttl[2]} → ${ttl[1]}.`});};
/* 21. Ô số kì diệu */
TDG.magic=function(G,lv){
  if(G===1||(lv===0&&G===2)){const a=R(1,G===1?4:9),b=R(1,G===1?4:9),c=R(1,G===1?4:9);const rows=[[a+2*b+c],[a+b,b+c],[a,b,c]];const cells=[[0,0],[1,0],[1,1],[2,0],[2,1],[2,2]];const [i,j]=RP(lv===0?cells.slice(0,3):cells);
    return Qin('Trong tháp số, mỗi ô bằng tổng hai ô ngay bên dưới nó. Tìm số ở ô có dấu ?',rows[i][j],{visual:pyramidHTML(rows,i+','+j),hints:['Mỗi ô = ô dưới bên trái + ô dưới bên phải.',i===2?'Ô trên trừ đi ô bên cạnh ở hàng dưới.':'Cộng hai ô ngay bên dưới.'],explain:`Ô cần tìm là ${rows[i][j]}.`});}
  const base=[[2,7,6],[9,5,1],[4,3,8]];const k=R(1,G===2?3:G===3?10:50),o=R(0,G===2?5:G===3?50:500);let sq=base.map(r=>r.map(v=>v*k+o));if(Math.random()<.5)sq=sq.map(r=>r.slice().reverse());if(Math.random()<.5)sq=sq.slice().reverse();
  const tr=R(0,2),tc=R(0,2);const hide={[tr+','+tc]:'?'};let other=null;
  if(lv===2){const opts=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==tr&&j!==tc)opts.push([i,j]);other=RP(opts);hide[other[0]+','+other[1]]='·';
    /* phải còn ít nhất một hàng hoặc cột đủ 3 số để biết tổng */}
  const S=3*(5*k+o);
  return Qin(`Điền số vào ô có dấu ? sao cho tổng các số ở mỗi hàng, mỗi cột và mỗi đường chéo đều bằng nhau.`,sq[tr][tc],{visual:tableSVG(sq,hide)+(other?'<div class="ht-cap">Ô có dấu · cũng đang bị che</div>':''),hints:['Tìm một hàng (hoặc cột) đã đủ 3 số để biết tổng bằng bao nhiêu.',`Tổng mỗi hàng là ${fN(S)}. Lấy tổng trừ hai số còn lại trong hàng (hoặc cột) có ô ?.`],explain:`Tổng mỗi hàng là ${fN(S)}. Số cần tìm là ${fN(sq[tr][tc])}.`});};

/* ========== LỚP LÁ ========== */
const LA_E=['🍎','🍌','🍇','🍓','🐱','🐶','🐰','🐻','⭐','❤️','🌸','🎈','⚽','🚗'];
TDG.la_next=function(G,lv){const E=shuffle(LA_E);const pats=lv===0?[['A','B']]:lv===1?[['A','B','B'],['A','A','B'],['A','B','C']]:[['A','B','C'],['A','B','B','C'],['A','A','B','B']];const p=RP(pats);const m={A:E[0],B:E[1],C:E[2]};const L=p.length;const shown=[];for(let i=0;i<L*2+(lv?1:0);i++)shown.push(m[p[i%L]]);const ans=m[p[shown.length%L]];
  return Qmc('Hình tiếp theo là hình nào?',ans,shuffle([E[0],E[1],E[2]].concat(lv?[E[3]]:[])),{visual:emoRow(shown.concat(['❓'])),emo:true,voice:[['vi','Các hình được xếp theo quy luật. Hình tiếp theo là hình nào?']],hints:['Đọc to từng hình, nghe xem đoạn nào lặp lại.','Tìm nhóm hình lặp lại rồi đếm tiếp.'],explain:`Nhóm ${p.map(x=>m[x]).join('')} lặp lại, nên hình tiếp theo là ${ans}.`});};
TDG.la_miss=function(G,lv){const E=shuffle(LA_E);const p=lv===0?['A','B']:RP([['A','B','C'],['A','A','B'],['A','B','B']]);const m={A:E[0],B:E[1],C:E[2]};const L=p.length;const N=L*3;const seq=[];for(let i=0;i<N;i++)seq.push(m[p[i%L]]);const k=R(1,N-2);const ans=seq[k];const show=seq.map((e,i)=>i===k?'❓':e);
  return Qmc('Hình còn thiếu là hình nào?',ans,shuffle([E[0],E[1],E[2],E[3]].slice(0,lv?4:3)),{visual:emoRow(show),emo:true,voice:[['vi','Các hình được xếp theo quy luật. Ô dấu hỏi là hình nào?']],hints:['Nhìn các hình ở hai bên dấu hỏi.','Tìm đoạn hình lặp lại.'],explain:`Ô còn thiếu là ${ans}.`});};
TDG.la_count=function(G,lv){const E=shuffle(LA_E);const a=E[0],b=E[1];const n=R(lv===0?2:4,lv===0?5:lv===1?8:10);const m=R(2,lv===0?3:6);const arr=shuffle(Array(n).fill(a).concat(Array(m).fill(b)));
  return Qin(`Có bao nhiêu ${a}?`,n,{visual:emoRow(arr,'wrap'),voice:[['vi','Đếm xem có bao nhiêu hình này nhé.']],hints:['Chạm tay vào từng hình và đếm to.','Chỉ đếm đúng một loại hình thôi.'],explain:`Có ${n} ${a}.`});};
TDG.la_more=function(G,lv){const E=shuffle(LA_E);const a=E[0],b=E[1];let n=R(2,8),m=R(2,8);while(n===m)m=R(2,8);
  if(lv===2){const big=Math.max(n,m),sm=Math.min(n,m);return Qin(`Nhóm nhiều hơn thì nhiều hơn mấy hình?`,big-sm,{visual:emoRow(Array(n).fill(a))+emoRow(Array(m).fill(b)),voice:[['vi','Hai nhóm hình. Nhóm nhiều hơn thì nhiều hơn mấy hình?']],hints:['Nối mỗi hình hàng trên với một hình hàng dưới.','Đếm số hình còn thừa.'],explain:`${Math.max(n,m)} − ${Math.min(n,m)} = ${big-sm}.`});}
  const ans=n>m?a:b;return Qmc('Nhóm nào nhiều hơn?',ans,[a,b],{visual:emoRow(Array(n).fill(a))+emoRow(Array(m).fill(b)),emo:true,voice:[['vi','Nhóm nào nhiều hơn?']],hints:['Nối mỗi hình hàng trên với một hình hàng dưới.','Hàng nào còn thừa hình là hàng nhiều hơn.'],explain:`Có ${n} ${a} và ${m} ${b}. Nhóm ${ans} nhiều hơn.`});};
TDG.la_pos=function(G,lv){const E=shuffle(['🐱','🐶','🐰','🐻','🐼','🐸','🐷','🐵']);const n=R(lv===0?3:4,lv===0?4:6);const row=E.slice(0,n);const k=R(0,n-1);const fromRight=lv===2&&Math.random()<.6;const ans=fromRight?n-k:k+1;
  return Qin(`Bạn ${row[k]} đứng thứ mấy tính từ bên ${fromRight?'phải':'trái'}?`,ans,{visual:emoRow(row),voice:[['vi',`Các bạn đứng thành hàng. Bạn này đứng thứ mấy tính từ bên ${fromRight?'phải':'trái'}?`]],hints:[`Bắt đầu đếm từ bên ${fromRight?'phải':'trái'}: 1, 2, 3…`,'Dừng lại khi đến bạn được hỏi.'],explain:`Bạn ${row[k]} đứng thứ ${ans} tính từ bên ${fromRight?'phải':'trái'}.`});};
TDG.la_add=function(G,lv){const e=RP(['🍎','🍬','🎈','⭐','🍓']);
  if(lv===2){const x=R(1,5),y=R(1,4);return Qin(`Bé có một số ${e}. Mẹ cho thêm ${y} ${e} thì bé có ${x+y} ${e}. Lúc đầu bé có mấy ${e}?`,x,{visual:emoRow(Array(x+y).fill(e)),voice:[['vi',`Bé có một số quả. Mẹ cho thêm ${y} quả thì bé có ${x+y} quả. Lúc đầu bé có mấy quả?`]],hints:['Lấy ra số quả mẹ vừa cho thêm.',`Che đi ${y} hình rồi đếm số hình còn lại.`],explain:`${x+y} bớt ${y} còn ${x}.`});}
  const a=R(1,5),b=R(1,lv===0?3:5);const sub=lv===1&&Math.random()<.5&&a>b;
  if(sub)return Qin(`Bé có ${a} ${e}, bé cho bạn ${b} ${e}. Bé còn mấy ${e}?`,a-b,{visual:emoRow(Array(a).fill(e)),voice:[['vi',`Bé có ${a} quả, bé cho bạn ${b} quả. Bé còn mấy quả?`]],hints:[`Che đi ${b} hình.`,'Đếm số hình còn lại.'],explain:`${a} bớt ${b} còn ${a-b}.`});
  return Qin(`Bé có ${a} ${e}, mẹ cho thêm ${b} ${e}. Bé có tất cả mấy ${e}?`,a+b,{visual:emoRow(Array(a).fill(e))+emoRow(Array(b).fill(e)),voice:[['vi',`Bé có ${a} quả, mẹ cho thêm ${b} quả. Bé có tất cả mấy quả?`]],hints:['Đếm hàng trên rồi đếm tiếp hàng dưới.',`Bắt đầu từ ${a}, đếm thêm ${b}.`],explain:`${a} thêm ${b} là ${a+b}.`});};
/* ---------------- TOÁN TƯ DUY: NHÓM KỸ NĂNG, BÀI HỌC, THẺ KIẾN THỨC ---------------- */
const TD_GROUPS=[
 {k:'td_quyluat',n:'Quy luật',i:'🔁',c:'#1D8CE0',cd:'#1466AB'},
 {k:'td_dem',n:'Đếm và tổ hợp',i:'🔢',c:'#16A34A',cd:'#107A37'},
 {k:'td_logic',n:'Suy luận lô-gic',i:'🕵️',c:'#7C5CF0',cd:'#5A3DC7'},
 {k:'td_sodo',n:'Sơ đồ đoạn thẳng',i:'📊',c:'#D97706',cd:'#A55A04'},
 {k:'td_nguoc',n:'Tính ngược và thử chọn',i:'↩️',c:'#F0476A',cd:'#C22D4E'},
 {k:'td_hinh',n:'Hình và không gian',i:'🧊',c:'#0D9488',cd:'#096B62'},
 {k:'td_kheo',n:'Tính nhanh, tính khéo',i:'⚡',c:'#D946A8',cd:'#A92F80'}];
const TD_GROUPS_LA=[
 {k:'td_quyluat',n:'Tìm quy luật',i:'🔁',c:'#1D8CE0',cd:'#1466AB'},
 {k:'td_dem',n:'Đếm và so sánh',i:'🔢',c:'#16A34A',cd:'#107A37'},
 {k:'td_logic',n:'Suy luận vui',i:'🕵️',c:'#7C5CF0',cd:'#5A3DC7'}];
/* g: [lớp nhỏ nhất, lớp lớn nhất] được học bài này */
const TD_ALL=[
 {id:0,gr:0,t:'Dãy số cách đều',gen:'ap',g:[1,5],card:{tiles:[['Khoảng cách','Lấy số sau trừ số trước','3, 7, 11 → cách 4'],['Cộng đều','Dãy tăng: cộng thêm khoảng cách','11 + 4 = 15'],['Bớt đều','Dãy giảm: trừ đi khoảng cách','50, 45, 40 → 35'],['Số còn thiếu','Nhìn số ở hai bên ô trống','6, ?, 12 → 9']],tip:'Viết khoảng cách nhỏ ở giữa hai số liền nhau, quy luật sẽ hiện ra.'}},
 {id:1,gr:0,t:'Gấp lên, xen kẽ, tăng dần',gen:'grow',g:[1,5],card:{tiles:[['Gấp lên','Số sau gấp số trước một số lần','1, 2, 4, 8 → × 2'],['Khoảng tăng dần','Khoảng cách tăng 1, 2, 3…','1, 2, 4, 7, 11'],['Hai dãy đan xen','Nhìn riêng vị trí lẻ, vị trí chẵn','2, 10, 4, 20, 6'],['Cộng hai số trước','Số sau = tổng hai số trước','1, 1, 2, 3, 5, 8']],tip:'Không thấy khoảng cách đều thì thử phép nhân hoặc tách thành hai dãy.'}},
 {id:2,gr:0,t:'Số thứ n, hình lặp lại',gen:'nth',g:[1,5],card:{tiles:[['Nhóm lặp','Tìm nhóm hình lặp lại','⭐🌙☀️ ⭐🌙☀️'],['Chia lấy dư','Vị trí : số hình trong nhóm','hình 10, nhóm 3 → dư 1'],['Số thứ n','Số đầu + (n − 1) × khoảng cách','2, 5, 8… số thứ 10 = 2 + 9 × 3'],['Đếm số hạng','(Số cuối − số đầu) : khoảng cách + 1','1, 3, …, 21 → 11 số']],tip:'Dư 0 nghĩa là hình cuối cùng của nhóm.'}},
 {id:3,gr:1,t:'Số cách chọn',gen:'choose',g:[1,5],card:{tiles:[['Chọn lần lượt','Chọn món thứ nhất, rồi món thứ hai','áo rồi quần'],['Nhân số cách','m cách × n cách','3 áo, 2 quần → 6 bộ'],['Đường đi','Qua mỗi chặng thì nhân thêm','2 × 3 = 6 đường'],['Vẽ cây','Vẽ nhánh cho từng lựa chọn để đếm','A–1, A–2, B–1, B–2']],tip:'Mỗi lựa chọn của bước trước đi được với mọi lựa chọn của bước sau.'}},
 {id:4,gr:1,t:'Bắt tay, thi đấu',gen:'shake',g:[2,5],card:{tiles:[['Bắt tay','Mỗi cặp bắt tay một lần','4 bạn → 3 + 2 + 1 = 6'],['Thi đấu vòng tròn','Mỗi đội gặp mỗi đội một trận','5 đội → 10 trận'],['Công thức','n × (n − 1) : 2','6 × 5 : 2 = 15'],['Gửi thiệp','A gửi B và B gửi A là 2 tấm','n × (n − 1)']],tip:'Bắt tay thì A–B và B–A chỉ là một lần, nên phải chia đôi.'}},
 {id:5,gr:1,t:'Đếm số, đếm chữ số',gen:'count',g:[1,5],card:{tiles:[['Kể cả hai đầu','Từ a đến b có b − a + 1 số','từ 3 đến 7: 5 số'],['Không kể hai đầu','Có b − a − 1 số','giữa 3 và 7: 3 số'],['Lập số','Chọn hàng chục trước, hàng đơn vị sau','3 chữ số khác nhau → 6 số'],['Đánh số trang','Trang 1–9: 1 chữ số, 10–99: 2 chữ số','trang 1 đến 20: 31 chữ số']],tip:'Thử với số nhỏ trước để kiểm tra mình có quên cộng 1 không.'}},
 {id:6,gr:2,t:'Xếp hàng, thứ hạng',gen:'line',g:[1,5],card:{tiles:[['Hai phía','Thứ từ trái + thứ từ phải − 1','thứ 3 trái, thứ 4 phải → 6 bạn'],['Đổi phía','Số người − vị trí + 1','hàng 10, thứ 3 → thứ 8 từ phải'],['Ở giữa','Hiệu hai vị trí − 1','thứ 2 và thứ 7 → 4 bạn'],['So sánh','Xếp tất cả thành một hàng','A > B > C']],tip:'Vẽ các bạn thành hình tròn nhỏ trên giấy rồi đếm.'}},
 {id:7,gr:2,t:'Ai nói thật?',gen:'truth',g:[2,5],card:{tiles:[['Giả sử','Lần lượt giả sử từng bạn là người làm','nếu An làm thì…'],['Kiểm tra','Đếm số câu nói đúng','đúng 1 câu?'],['Loại bỏ','Giả sử sai điều kiện thì loại','An không phải'],['Chỉ một đáp án','Chỉ một trường hợp đúng điều kiện','chính là người cần tìm']],tip:'Lập bảng: mỗi hàng là một lần giả sử, mỗi cột là lời của một bạn.'}},
 {id:8,gr:2,t:'Ngày trong tuần, tuổi',gen:'days',g:[1,5],card:{tiles:[['7 ngày','Sau 7 ngày lại đến cùng thứ','thứ Hai + 7 ngày = thứ Hai'],['Chia cho 7','Số ngày : 7, xem số dư','10 ngày → dư 3'],['Hiệu số tuổi','Không thay đổi theo năm','mẹ luôn hơn con 26 tuổi'],['Tổng số tuổi','Mỗi năm tăng thêm số người','2 người: +2 mỗi năm']],tip:'Tuổi ai cũng tăng như nhau, nên hai người cách nhau bao nhiêu tuổi thì mãi như thế.'}},
 {id:9,gr:3,t:'Tổng và hiệu',gen:'sumdiff',g:[2,5],card:{tiles:[['Vẽ sơ đồ','Đoạn dài hơn có thêm phần hơn','▭▭+ | ▭▭'],['Bớt phần hơn','Tổng − hiệu = 2 lần số bé','30 − 6 = 24'],['Số bé','(Tổng − hiệu) : 2','24 : 2 = 12'],['Số lớn','Số bé + hiệu','12 + 6 = 18']],tip:'Thử lại: cộng hai số phải bằng tổng, trừ phải bằng hiệu.'}},
 {id:10,gr:3,t:'Gấp lần bằng sơ đồ',gen:'ratio',g:[2,5],card:{tiles:[['Một phần','Số bé là 1 phần','Hà ▭'],['Nhiều phần','Gấp k lần thì là k phần','An ▭▭▭'],['Tổng số phần','1 + k phần','1 + 3 = 4 phần'],['Mỗi phần','Tổng : số phần','112 : 4 = 28']],tip:'Các ô trong sơ đồ phải dài bằng nhau thì mới gọi là phần bằng nhau.'}},
 {id:11,gr:3,t:'Hơn kém, cho nhau',gen:'give',g:[1,5],card:{tiles:[['Hơn bao nhiêu','Số lớn − số bé','12 − 8 = 4'],['Cho để bằng nhau','Cho đi một nửa phần hơn','hơn 6 → cho 3'],['Cho đi x','Khoảng cách giảm 2 × x','hơn 10, cho 2 → hơn 6'],['Ngược lại','Sau khi cho bằng nhau, lúc đầu hơn 2 × x','cho 4 → hơn 8']],tip:'Người cho bị bớt, người nhận được thêm: khoảng cách thay đổi gấp đôi.'}},
 {id:12,gr:4,t:'Tính ngược từ cuối',gen:'back',g:[1,5],card:{tiles:[['Bắt đầu từ cuối','Lấy kết quả cuối cùng','… = 20'],['Phép ngược','Cộng ↔ trừ, nhân ↔ chia','+5 → −5'],['Ngược thứ tự','Bước cuối làm trước','×2 rồi +4 → −4 rồi :2'],['Thử lại','Làm xuôi từ số tìm được','8 × 2 + 4 = 20 ✓']],tip:'Viết các bước thành mũi tên, rồi đi ngược mũi tên.'}},
 {id:13,gr:4,t:'Thử và chọn',gen:'trial',g:[2,5],card:{tiles:[['Liệt kê','Viết ra mọi khả năng theo thứ tự','1 và 11, 2 và 10…'],['Loại dần','Mỗi điều kiện gạch bớt khả năng sai','tích phải bằng 35'],['Bắt đầu chặt nhất','Chọn điều kiện ít khả năng nhất trước','tích trước, tổng sau'],['Thử lại','Đáp án phải đúng mọi điều kiện','5 + 7 = 12, 5 × 7 = 35']],tip:'Liệt kê có thứ tự thì không bỏ sót, không trùng lặp.'}},
 {id:14,gr:4,t:'Gà và chó, bánh xe',gen:'legs',g:[3,5],card:{tiles:[['Giả sử tất cả','Coi tất cả là gà (2 chân)','10 con → 20 chân'],['Phần thiếu','Số chân thật − số chân giả sử','28 − 20 = 8'],['Mỗi con chó','Hơn gà 2 chân','8 : 2 = 4 con chó'],['Còn lại','Tổng số con − số chó','10 − 4 = 6 con gà']],tip:'Giả sử xong nhớ tính xem mỗi con khác nhau bao nhiêu chân.'}},
 {id:15,gr:5,t:'Chu vi, diện tích hình ghép',gen:'peri',g:[1,5],card:{tiles:[['Chu vi','Đếm các cạnh nằm trên đường bao','đi một vòng quanh hình'],['Không đếm bên trong','Cạnh chung giữa hai ô không tính','ô ghép sát nhau'],['Diện tích','Đếm số ô vuông','8 ô × 1 cm² = 8 cm²'],['Cạnh dài hơn','Nhân với độ dài một cạnh ô','14 cạnh × 2 cm = 28 cm']],tip:'Đánh dấu điểm xuất phát rồi đi vòng quanh, đếm đến khi quay lại điểm đó.'}},
 {id:16,gr:5,t:'Đếm hình',gen:'shapes',g:[1,5],card:{tiles:[['Đoạn thẳng','n điểm trên một đường: (n − 1) + … + 1','4 điểm → 6 đoạn'],['Tam giác chung đỉnh','Đếm số đoạn trên cạnh đáy','4 điểm đáy → 6 tam giác'],['Hình vuông','Đếm ô nhỏ, rồi hình 2 × 2, 3 × 3…','lưới 3 × 3 → 14'],['Hình chữ nhật','Dải n ô: n + (n − 1) + … + 1','4 ô → 10']],tip:'Đếm theo kích thước từ nhỏ đến lớn để không sót.'}},
 {id:17,gr:5,t:'Khối lập phương',gen:'cube',g:[1,5],card:{tiles:[['6 mặt','Hình lập phương có 6 mặt, 12 cạnh, 8 đỉnh','6 – 12 – 8'],['Xúc xắc','Hai mặt đối diện cộng lại bằng 7','2 đối diện 5'],['Sơn mặt','Đỉnh 3 mặt, cạnh 2 mặt, giữa mặt 1 mặt','bên trong không sơn'],['Xếp hộp','Dài × rộng × cao','2 × 3 × 4 = 24 khối']],tip:'Tưởng tượng bóc từng lớp khối ra để đếm.'}},
 {id:18,gr:6,t:'Tính nhanh',gen:'quick',g:[1,5],card:{tiles:[['Nhóm tròn chục','Ghép hai số cộng lại tròn chục, tròn trăm','37 + 63 = 100'],['Đặt thừa số chung','a × b + a × c = a × (b + c)','7 × 6 + 7 × 4 = 70'],['Cặp đặc biệt','25 × 4 = 100, 125 × 8 = 1 000','25 × 7 × 4 = 700'],['Dãy liên tiếp','Ghép đầu với cuối','1 + … + 10 = 5 × 11']],tip:'Nhìn hết cả phép tính trước, tìm cặp số "đẹp" rồi mới tính.'}},
 {id:19,gr:6,t:'Trồng cây, cưa gỗ',gen:'trees',g:[2,5],card:{tiles:[['Số khoảng','Độ dài : khoảng cách','20 m : 5 m = 4 khoảng'],['Hai đầu có cây','Số cây = số khoảng + 1','4 + 1 = 5 cây'],['Vòng khép kín','Số cây = số khoảng','quanh hồ'],['Cưa gỗ','Số lần cưa = số đoạn − 1','5 đoạn → 4 lần']],tip:'Vẽ một đoạn ngắn với 2–3 cây để kiểm tra trước.'}},
 {id:20,gr:6,t:'Ô số kì diệu',gen:'magic',g:[1,5],card:{tiles:[['Tháp số','Mỗi ô = tổng hai ô ngay dưới','3 và 5 → 8'],['Tìm ô dưới','Ô trên − ô bên cạnh','8 − 3 = 5'],['Ô vuông kì diệu','Mỗi hàng, cột, chéo có tổng bằng nhau','tổng 15'],['Tìm tổng','Dùng hàng đã đủ 3 số','2 + 7 + 6 = 15']],tip:'Bắt đầu từ chỗ chỉ thiếu một ô.'}}];
const TD_LA=[
 {id:0,gr:0,t:'Hình tiếp theo',gen:'la_next',g:[0,0],card:{tiles:[['Đọc to','Đọc tên từng hình','táo, chuối, táo, chuối'],['Nhóm lặp','Tìm nhóm lặp lại','(🍎🍌) (🍎🍌)'],['Đếm tiếp','Hình sau là hình đầu nhóm','🍎'],['Kiểm tra','Đọc lại cả dãy','nghe có đều không']],tip:'Vỗ tay theo dãy hình như hát một bài hát.'}},
 {id:1,gr:0,t:'Hình còn thiếu',gen:'la_miss',g:[0,0],card:{tiles:[['Nhìn hai bên','Xem hình trước và sau ô trống','🍎 ❓ 🍎'],['Nhóm lặp','Tìm nhóm hình lặp lại','🐱🐶 🐱🐶'],['Điền vào','Chọn hình đúng nhóm','🐶'],['Đọc lại','Đọc cả dãy xem có đều không','🐱🐶🐱🐶']],tip:'Che dấu hỏi lại và đọc to dãy hình.'}},
 {id:2,gr:1,t:'Đếm cho đúng',gen:'la_count',g:[0,0],card:{tiles:[['Chỉ tay','Chạm vào từng hình','1, 2, 3…'],['Một loại','Chỉ đếm loại được hỏi','chỉ đếm 🍎'],['Đánh dấu','Đếm hình nào thì nhớ hình đó','không đếm 2 lần'],['Số cuối','Số đếm cuối cùng là đáp án','🍎🍎🍎 → 3']],tip:'Đếm theo hàng từ trái sang phải.'}},
 {id:3,gr:1,t:'Nhóm nào nhiều hơn',gen:'la_more',g:[0,0],card:{tiles:[['Nối cặp','Nối mỗi hình hàng trên với một hình hàng dưới','🍎–🍌'],['Còn thừa','Hàng còn thừa là hàng nhiều hơn','🍎🍎 thừa'],['Đếm','Đếm mỗi hàng rồi so','5 > 3'],['Nhiều hơn mấy','Đếm số hình thừa','thừa 2']],tip:'Nối bằng ngón tay từng cặp một.'}},
 {id:4,gr:2,t:'Đứng thứ mấy',gen:'la_pos',g:[0,0],card:{tiles:[['Bên trái','Bàn tay không cầm thìa','👈'],['Bên phải','Bàn tay cầm thìa','👉'],['Đếm từ đầu','Bắt đầu đếm từ phía được hỏi','1, 2, 3'],['Dừng lại','Đến bạn được hỏi thì dừng','thứ 3']],tip:'Giơ tay phải lên trước khi đếm từ bên phải.'}},
 {id:5,gr:2,t:'Thêm và bớt',gen:'la_add',g:[0,0],card:{tiles:[['Thêm vào','Có thêm thì nhiều hơn','3 thêm 2 là 5'],['Bớt đi','Cho đi thì ít hơn','5 bớt 2 còn 3'],['Đếm tiếp','Bắt đầu từ số đang có','3 … 4, 5'],['Che bớt','Che các hình bị lấy đi','đếm hình còn lại']],tip:'Dùng ngón tay để thêm, gập ngón tay để bớt.'}}];
const TD_LIST=()=>GRADE===0?TD_LA:TD_ALL.filter(l=>GRADE>=l.g[0]&&GRADE<=l.g[1]);
const TD_GR=()=>GRADE===0?TD_GROUPS_LA:TD_GROUPS;
const tdLesson=id=>(GRADE===0?TD_LA:TD_ALL).find(l=>l.id===id);
/* tạo 1 câu hỏi: gắn mã bộ sinh để ôn lại bằng câu cùng dạng nhưng đổi số */
function tdMake(L,lv){let q=null;for(let t=0;t<6&&!q;t++){try{q=TDG[L.gen](GRADE,lv);}catch(e){q=null;}}
  if(!q)q=Qin('Tính.',2,{big:'1 + 1 = ?'});const G=TD_GR()[L.gr];
  return Object.assign(q,{skill:G.k,gen:L.gen,lv,td:L.id,secLab:'🧩 '+L.t,hard:lv===2});}
function tdBuild(L,n){n=n||10;const lvs=[0,0,0,0,1,1,1,1,2,2].slice(0,n);const out=[],keys=new Set();
  lvs.forEach(lv=>{let q,i=0;do{q=tdMake(L,lv);i++;}while(keys.has(q.prompt+'|'+(q.big||'')+'|'+q.answer)&&i<12);keys.add(q.prompt+'|'+(q.big||'')+'|'+q.answer);out.push(q);});return out;}
/* ---------------- DỮ LIỆU TRÊN MÁY ---------------- */
function htInit(){S.tdSt=S.tdSt||{};S.srs=S.srs||{};S.qlog=Array.isArray(S.qlog)?S.qlog:[];S.pg=S.pg||{list:[],log:[]};if(!Array.isArray(S.pg.list))S.pg.list=[];if(!Array.isArray(S.pg.log))S.pg.log=[];
  if(!S.goalMin)S.goalMin=15;S.htDaily=S.htDaily||{};
  /* chỉ giữ nhật ký câu hỏi 35 ngày gần nhất, tối đa 600 câu */
  const lim=dayStr(-35);S.qlog=S.qlog.filter(x=>x&&x.d>=lim).slice(-600);}
htInit();
/* tên kỹ năng tư duy cho báo cáo (tính vào môn Toán) */
TD_GROUPS.forEach(g=>{try{SKILLS[g.k]='Tư duy: '+g.n;if(Array.isArray(TOAN)&&!TOAN.includes(g.k))TOAN.push(g.k);}catch(e){}});

/* ---------------- THÔNG TIN BÀI ---------------- */
function lessonTitle(w,d){try{const W=WEEKS[w];if(W.ls&&W.ls[d])return W.ls[d];if(W.lv&&W.lv[d])return W.lv[d][0];return (LEVEL_INFO[d]&&LEVEL_INFO[d].n)||'';}catch(e){return '';}}
function chapterText(w){try{const W=WEEKS[w];return (W.t||'')+' '+(W.s||'');}catch(e){return '';}}
const isMainQ=()=>!!Q&&Q.td==null&&!Q.daily&&!Q.mode&&typeof Q.level==='number';
const isTdQ=()=>!!Q&&(Q.td!=null||!!Q.daily);
const curLk=()=>!Q?'':Q.daily?'td_daily':Q.td!=null?'td_'+Q.td:Q.mode==='en'?'en_'+Q.level:Q.mode==='tv'?'tv_'+Q.level:Q.mode?'':'main_'+Q.level;
const _levelName=typeof levelName==='function'?levelName:null;
if(_levelName)levelName=function(k){const m=/^td_(\d+)$/.exec(k||'');if(m){const L=tdLesson(+m[1]);if(L)return `Tư duy · ${TD_GR()[L.gr].n} · ${L.t}`;}if(k==='td_daily')return 'Tư duy · Thử thách hôm nay';return _levelName.apply(this,arguments);};
if(typeof keySubj==='function'){const _ks=keySubj;keySubj=function(k){return /^td_/.test(k||'')?'toan':_ks.apply(this,arguments);};}
if(typeof localReportData==='function'){const _lr=localReportData;localReportData=function(){const d=_lr.apply(this,arguments);try{Object.keys(S.tdSt||{}).forEach(i=>d.progress.push({level_key:'td_'+i,stars:S.tdSt[i],best_stars:S.tdSt[i],points:(S.lastPts||{})['td_'+i]||0}));}catch(e){}return d;};}
/* lấy số sao bài Tư duy từ máy chủ (trang chủ tải /student/me/home) */
if(typeof apiCall==='function'){const _ac=apiCall;apiCall=async function(method,path){const r=await _ac.apply(this,arguments);
  try{if(method==='GET'&&path==='/student/me/home'&&r&&Array.isArray(r.progress)){S.tdSt={};r.progress.forEach(p=>{if(/^td_\d+$/.test(p.level_key))S.tdSt[+p.level_key.slice(3)]=Number(p.stars)||0;});save();}}catch(e){}return r;};}

/* ---------------- TÌM THẺ KIẾN THỨC ---------------- */
/* \b của JavaScript không hiểu chữ có dấu (ví dụ \bl\b khớp chữ "L" trong "Lớp") → đổi sang ranh giới từ Unicode */
const UB='(?:(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}])|(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}]))';
KC.forEach(c=>{try{c.re=new RegExp(c.re.source.replace(/\\b/g,UB),'iu');}catch(e){}});
const kcById=id=>KC.find(c=>c.id===id);
const kcOk=c=>GRADE>=c.g[0]&&GRADE<=c.g[1];
/* điểm khớp: nội dung câu hỏi quan trọng nhất, rồi tên bài, tên chặng, kỹ năng; thẻ chuyên biệt (p) được ưu tiên khi bằng điểm */
function kcScore(c,title,qtext,chap,skill){let s=0,hit=false;if(qtext&&c.re.test(qtext)){s+=3;hit=true;}if(title&&c.re.test(title)){s+=2;hit=true;}if(chap&&c.re.test(chap)){s+=1;hit=true;}if(!hit)return 0;if(skill&&c.sk&&c.sk.includes(skill))s+=1;return s+(c.p||0)*0.3;}
function kcFor(title,qtext,chap,skill){let best=null,bs=0;KC.forEach(c=>{if(!kcOk(c))return;const s=kcScore(c,title,qtext,chap,skill);if(s>bs){bs=s;best=c;}});
  if(bs>=2)return best;const fb=(KC_SKILL_FALLBACK[skill]||[]).map(kcById).find(c=>c&&kcOk(c));return fb||best;}
/* tên bài riêng (lớp 3 chỉ có tên chung theo thứ trong tuần thì bỏ qua) */
function lessonTitleSpecific(w,d){try{const W=WEEKS[w];if(W.ls&&W.ls[d])return W.ls[d];if(W.lv&&W.lv[d])return W.lv[d][0];}catch(e){}return '';}
function bankQs(w,d){try{if(typeof MATH_BANK==='undefined'||!MATH_BANK||!MATH_BANK[w])return [];const B=MATH_BANK[w];const nested=Array.isArray(B[0]);if(d==null)return nested?[].concat(...B):B;return nested?(B[d]||[]):B;}catch(e){return [];}}
/* các thẻ của một chặng: dựa vào tên bài, tên chặng và chính các câu hỏi trong ngân hàng đề của chặng */
function kcForChapter(w){const W=WEEKS[w]||{};const chap=(W.t||'')+' '+String(W.s||'').split(/Tiếng Việt:/)[0];const sc={},at={};
  const qs=bankQs(w,null);const nq=qs.length||1;const cnt={};qs.forEach(q=>{const t=(q.prompt||'')+' '+(q.big||'');KC.forEach(c=>{if(kcOk(c)&&c.re.test(t))cnt[c.id]=(cnt[c.id]||0)+1;});});
  Object.keys(cnt).forEach(id=>{if(cnt[id]>=Math.max(2,nq*0.08))sc[id]=(sc[id]||0)+cnt[id]/nq*8;});
  for(let d=0;d<6;d++){const t=lessonTitleSpecific(w,d);if(!t)continue;KC.forEach(c=>{if(kcOk(c)&&c.re.test(t)){sc[c.id]=(sc[c.id]||0)+3;if(at[c.id]==null)at[c.id]=d;}});}
  KC.forEach(c=>{if(kcOk(c)&&c.re.test(chap))sc[c.id]=(sc[c.id]||0)+2;});
  return Object.keys(sc).sort((a,b)=>sc[b]-sc[a]).slice(0,6).map(id=>[kcById(id),at[id]]);}
function cardForQ(q){if(!q)return null;
  if(q.td!=null){const L=tdLesson(q.td);return L?{t:L.t,tiles:L.card.tiles,tip:L.card.tip}:null;}
  if(isMainQ()){const w=Math.floor(Q.level/6),d=Q.level%6;return kcFor(lessonTitleSpecific(w,d),(q.prompt||'')+' '+(q.big||'')+' '+(q.secLab||''),String(chapterText(w)).split(/Tiếng Việt:/)[0],q.skill);}
  return null;}
function showCard(c,opt){opt=opt||{};if(!c)return;sfx.tap();
  const m=modal(`<div class="ht-kc"><button class="x" id="kcX" aria-label="Đóng">✕</button><h2>📘 ${H(c.t)}</h2><div class="tiles">${c.tiles.map((t,i)=>`<div class="tl t${i%4}"><b>${H(t[0])}</b><span>${H(t[1])}</span>${t[2]?`<em>${H(t[2])}</em>`:''}</div>`).join('')}</div>
   <div class="tip"><span class="ow" aria-hidden="true">🦉</span><div><small>Mẹo nhớ của Cú Bông</small><p>${H(c.tip)}</p></div></div><button class="btn btn-go" id="kcOk">${opt.back||'Đã hiểu'}</button></div>`);
  const close=()=>{m.remove();stopVoice();};m.querySelector('#kcX').onclick=close;m.querySelector('#kcOk').onclick=close;
  sayVi(c.t+'. '+c.tiles.map(t=>t[0]+': '+t[1]).join('. ')+'. Mẹo nhớ: '+c.tip);}

/* ---------------- ÔN LẠI THEO LỊCH (1 – 3 – 7 ngày) ---------------- */
const SRS_GAP=[1,3,7];
function srsUpdate(k,name,acc){if(!k)return;const it=S.srs[k];const t=todayStr();
  if(acc<0.8){S.srs[k]={due:dayStr(1),step:0,n:name,w:(it&&it.w||0)+1};return;}
  if(it&&it.due<=t){const st=(it.step||0)+1;if(st>=SRS_GAP.length)delete S.srs[k];else S.srs[k]=Object.assign(it,{step:st,due:dayStr(SRS_GAP[st]),n:name});}}
function srsDue(filter){const t=todayStr();return Object.keys(S.srs||{}).filter(k=>S.srs[k].due<=t&&(!filter||filter(k))).sort((a,b)=>S.srs[a].due<S.srs[b].due?-1:1);}
function srsOpen(k){let m;if((m=/^main_(\d+)$/.exec(k))){openLevel(+m[1]);return;}if((m=/^td_(\d+)$/.exec(k))){openTd(+m[1]);return;}if((m=/^tv_(\d+)$/.exec(k))&&typeof openTv==='function'){openTv(+m[1]);return;}if((m=/^en_(\d+)$/.exec(k))&&typeof openEn==='function'){openEn(+m[1]);}}
function srsShort(k){const it=S.srs[k];let m;if((m=/^td_(\d+)$/.exec(k))){const L=tdLesson(+m[1]);return L?L.t:k;}if((m=/^main_(\d+)$/.exec(k))){const i=+m[1];const t=lessonTitle(Math.floor(i/6),i%6);return t||(it&&it.n)||k;}return (it&&it.n)||k;}
function dueCardHTML(keys,full,title){if(!keys.length)return '';const more=keys.length-3;
  return `<section class="ht-due${full?' full':''}"><h3>🔁 ${title||'Cần ôn lại hôm nay'}<small>Cú Bông nhắc lịch ôn</small></h3>${keys.slice(0,3).map(k=>`<div class="it"><i></i><span>${H(srsShort(k))}</span><button data-htsrs="${H(k)}">Ôn ngay ›</button></div>`).join('')}${more>0?`<p>Còn ${more} bài nữa, Cú Bông sẽ xếp vào các ngày sau.</p>`:''}</section>`;}
function bindDue(root){(root||app).querySelectorAll('[data-htsrs]').forEach(b=>b.onclick=()=>{sfx.tap();srsOpen(b.dataset.htsrs);});}

/* ---------------- NHẬT KÝ CÂU HỎI (cho báo cáo phụ huynh) ---------------- */
let QID=0;
function chosenText(q){try{if(q.type==='mc'||q.type==='match'||q.type==='bank')return Q.sel!=null&&Q.sel!=='\u0000'?String(Q.sel):'';if(q.type==='input')return String(Q.typed||'');if(q.type==='text')return String(Q.typed||'');if(q.type==='order')return (Q.placed||[]).map(k=>q.items[k]).join(' ');if(q.type==='slots')return (Q.slot||[]).map((k,i)=>q.labels[i]+': '+(k==null?'':q.chips[k])).join(' · ');}catch(e){}return '';}
function logQ(q,ok,chosen){const lk=curLk();if(!lk||Q.mode==='exam')return;
  S.qlog.push({d:todayStr(),k:lk,s:q.skill||'',ok:ok?1:0,rv:Q.review?1:0,id:q._qid||'',p:String(q.prompt||'').slice(0,140)+(q.big?' '+String(q.big).slice(0,60):''),a:String(typeof ansText==='function'?ansText(q):q.answer).slice(0,80),c:String(chosen||'').slice(0,80)});
  if(S.qlog.length>600)S.qlog=S.qlog.slice(-600);}

/* ---------------- CÂU CÙNG DẠNG, ĐỔI SỐ (vòng ôn lại câu sai) ---------------- */
function similarQ(q){
  if(q.gen&&TDG[q.gen]){const L=q.td!=null?tdLesson(q.td):null;if(L)return tdMake(L,q.lv||0);try{const n=TDG[q.gen](GRADE,q.lv||0);return Object.assign(n,{skill:q.skill,gen:q.gen,lv:q.lv,secLab:q.secLab,hard:q.hard,td:q.td});}catch(e){return null;}}
  if(isMainQ()&&typeof MATH_BANK!=='undefined'&&MATH_BANK&&!q.hard){try{const w=Math.floor(Q.level/6),d=Q.level%6;const nested=Array.isArray(MATH_BANK[w][0]);const pool=nested?MATH_BANK[w][d]:MATH_BANK[w];
    const used=new Set((Q.orig||Q.qs).map(x=>qKey(x)));const cands=pool.filter(x=>x&&x.skill===q.skill&&x.type===q.type&&!used.has(qKey(x))&&qKey(x)!==qKey(q));
    if(cands.length){const n=JSON.parse(JSON.stringify(pick(cands)));if(n.type==='order'&&n.items)n.items=shuffle(n.answer.slice());return n;}}catch(e){}}
  return null;}
/* ---------------- DẠNG BÀI "KÉO SỐ VÀO Ô" (slots) ---------------- */
function renderSlots(q){const ans=$('#ans');Q.slot=q.labels.map(()=>null);Q.slotAct=0;
  const draw=()=>{const used=new Set(Q.slot.filter(k=>k!=null));
    ans.innerHTML=`<div class="ht-slots" id="htSl">${q.labels.map((l,i)=>`<div class="sr"><span>${H(l)}:</span><button type="button" class="sb${Q.slot[i]!=null?' fill':''}${Q.slotAct===i&&Q.slot[i]==null?' on':''}" data-i="${i}" aria-label="Ô ${H(l)}">${Q.slot[i]!=null?H(fN(Number(q.chips[Q.slot[i]]))):''}</button></div>`).join('')}</div>
    <div class="ht-chips">${q.chips.map((c,k)=>`<button type="button" class="chip${used.has(k)?' used':''}" data-k="${k}">${H(fN(Number(c)))}</button>`).join('')}</div><p class="ht-cap">Chạm một số để điền vào ô đang chọn. Chạm vào ô đã điền để xóa.</p>`;
    ans.querySelectorAll('.sb').forEach(b=>b.onclick=()=>{if(Q.locked)return;sfx.tap();const i=+b.dataset.i;if(Q.slot[i]!=null)Q.slot[i]=null;Q.slotAct=i;draw();});
    ans.querySelectorAll('.ht-chips .chip').forEach(b=>b.onclick=()=>{if(Q.locked)return;sfx.tap();const k=+b.dataset.k;let i=Q.slotAct;if(i==null||Q.slot[i]!=null)i=Q.slot.findIndex(x=>x==null);if(i<0)return;Q.slot[i]=k;const nx=Q.slot.findIndex(x=>x==null);Q.slotAct=nx<0?null:nx;draw();});
    const c=$('#check');if(c)c.disabled=Q.slot.some(x=>x==null);};
  draw();}
const slotsOk=q=>!!Q.slot&&Q.slot.every((k,i)=>k!=null&&String(q.chips[k])===String(q.vals[i]));

const _renderAnswer=renderAnswer;
renderAnswer=function(q){if(q&&q.type==='slots')return renderSlots(q);return _renderAnswer.apply(this,arguments);};

/* ---------------- GỢI Ý ---------------- */
function hintsFor(q){if(Q&&Q.mode==='exam')return null;if(q.hints&&q.hints.length)return q.hints;if(isMainQ()){const c=cardForQ(q);if(c)return [c.tip];}return null;}
function showHint(q){const hs=hintsFor(q);if(!hs)return;q._hn=Math.min(hs.length,(q._hn||0)+1);q._hint=1;sfx.tap();
  const body=document.querySelector('.quiz .qbody');if(!body)return;let b=$('#htBub');if(!b){b=document.createElement('div');b.className='ht-bub';b.id='htBub';const head=body.querySelector('.qhead');if(head&&head.nextSibling)body.insertBefore(b,head.nextSibling);else body.insertBefore(b,body.firstChild);}
  const card=cardForQ(q);b.innerHTML=`<span class="ow" aria-hidden="true">🦉</span><div>${hs.slice(0,q._hn).map(h=>H(h)).join('<br>')}${card?'<br><a id="htOpenKc">Mở thẻ kiến thức →</a>':''}</div>`;
  const ok=$('#htOpenKc');if(ok)ok.onclick=()=>showCard(card,{back:'Quay lại bài làm'});
  sayVi(hs[q._hn-1]);drawHintBtn(q);}
function drawHintBtn(q){const hs=hintsFor(q);const btn=$('#htHint');if(!btn||!hs)return;const n=q._hn||0;
  if(n===0)btn.textContent='💡 Xem gợi ý';else if(n<hs.length)btn.textContent=`💡 Gợi ý thêm (${n+1}/${hs.length})`;else{btn.textContent='💡 Đã xem hết gợi ý';btn.disabled=true;}
  const nt=$('#htNote');if(nt)nt.textContent=n?'Đã xem gợi ý: câu này không được thưởng xu "đúng ngay lần đầu".':'';}

/* ---------------- BỌC renderQ ---------------- */
const _renderQ=renderQ;
renderQ=function(){
  try{if(Q&&Q.qs&&Q.qs[Q.i]){let q=Q.qs[Q.i];
    if(Q.review&&q._rg!==Q.round){const n=similarQ(q);if(n){n._qid=q._qid;n._rg=Q.round;Q.qs[Q.i]=n;q=n;}else q._rg=Q.round;q._rvNew=!!n;}
    if(!q._qid)q._qid=(curLk()||'q')+'.'+(++QID)+'.'+Date.now().toString(36);}}catch(e){}
  const r=_renderQ.apply(this,arguments);
  try{const q=Q&&Q.qs&&Q.qs[Q.i];if(!q)return r;
    const pr=document.querySelector('.quiz .prompt');if(pr&&(isTdQ()||isMainQ())){const L=String(q.prompt||'').length;if(L>150)pr.classList.add('ht-long');else if(L>90)pr.classList.add('ht-mid');}
    if(Q.review&&q._rvNew){const head=document.querySelector('.quiz .qhead');if(head){const t=document.createElement('div');t.className='ht-rvnote';t.textContent='Câu cùng dạng với câu con vừa sai, số đã đổi';head.parentNode.insertBefore(t,head);}}
    const hs=(isTdQ()||isMainQ())?hintsFor(q):null;
    if(hs){const foot=document.querySelector('.quiz .qfoot');if(foot&&!$('#htHint')){const w=document.createElement('div');w.innerHTML=`<div class="ht-tools"><button type="button" class="ht-hint" id="htHint">💡 Xem gợi ý</button></div><div class="ht-note" id="htNote"></div>`;foot.appendChild(w);$('#htHint').onclick=()=>{if(!Q.locked)showHint(q);};}
      if(q._hn){const n=q._hn;q._hn=0;for(let k=0;k<n;k++)showHint(q);}}}catch(e){}
  return r;};

/* ---------------- BỌC check ---------------- */
const _check=check;
check=function(){const q=Q&&Q.qs&&Q.qs[Q.i];if(!q||Q.locked)return _check.apply(this,arguments);
  const chosen=chosenText(q);let r;
  if(q.type==='slots'){const ok=slotsOk(q);q.type='mc';Q.sel=ok?q.answer:'\u0000';try{r=_check.apply(this,arguments);}finally{q.type='slots';}const sl=$('#htSl');if(sl&&ok)sl.classList.add('ok');}
  else r=_check.apply(this,arguments);
  try{const sh=$('#sheet');const bad=!!sh&&sh.classList.contains('bad');
    if(!bad&&q._hint&&!Q.review){Q.coins=Math.max(0,(Q.coins||0)-2);const fc=sh&&sh.querySelector('.fb-coin');if(fc)fc.textContent='💡 Đã xem gợi ý nên không có xu câu này';}
    logQ(q,!bad,chosen);save();
    if(sh){const card=cardForQ(q);const box=document.createElement('div');box.className='ht-fbx';
      box.innerHTML=`${card&&bad?'<button type="button" id="htKc">📘 Xem thẻ kiến thức</button>':''}<button type="button" class="rp" id="htRep">⚑ Báo câu sai</button>`;
      const nb=sh.querySelector('.btn');if(nb)sh.insertBefore(box,nb);else sh.appendChild(box);
      const kb=$('#htKc');if(kb)kb.onclick=()=>showCard(card,{back:'Quay lại bài làm'});$('#htRep').onclick=()=>reportQ(q,chosen);}}catch(e){}
  return r;};

/* ---------------- BÁO CÂU SAI ---------------- */
function reportQ(q,chosen){sfx.tap();const R0=[['wrong','Đáp án của app bị sai'],['unclear','Đề khó hiểu, thiếu dữ kiện'],['display','Hình hoặc chữ hiển thị lỗi'],['other','Lỗi khác']];
  const m=modal(`<div class="ht-rep"><h2 style="text-align:center">⚑ Báo câu sai</h2><p class="lead" style="margin:0 0 6px">Cảm ơn con và bố mẹ! Câu hỏi sẽ được gửi cho thầy cô quản trị kiểm tra.</p>${R0.map((x,i)=>`<label><input type="radio" name="htr" value="${x[0]}"${i===0?' checked':''}> ${x[1]}</label>`).join('')}<textarea id="htRn" maxlength="300" placeholder="Ghi chú thêm (không bắt buộc)"></textarea></div><button class="btn btn-go" id="htRs">Gửi báo lỗi</button><button class="btn btn-soft" id="htRc">Hủy</button>`);
  m.querySelector('#htRc').onclick=()=>m.remove();
  m.querySelector('#htRs').onclick=async()=>{const reason=(m.querySelector('input[name="htr"]:checked')||{}).value||'other',note=m.querySelector('#htRn').value.trim();
    const body={level_key:curLk()||'',level_name:(typeof levelName==='function'?levelName(curLk()||''):''),grade:GRADE,prompt:String(q.prompt||'').slice(0,500),big:String(q.big||'').slice(0,200),options:Array.isArray(q.options)?q.options.slice(0,8).map(String):(q.chips||[]).map(String),answer:String(typeof ansText==='function'?ansText(q):q.answer).slice(0,200),chosen:String(chosen||'').slice(0,200),explain:String(q.explain||'').slice(0,400),reason,note};
    m.remove();
    if(LOGGED()){try{await apiPost('/x/student/report',body);toast('Đã gửi báo lỗi. Cảm ơn con!');return;}catch(e){}}
    try{const k='ht_reports';const a=JSON.parse(localStorage.getItem(k)||'[]');a.push(Object.assign({at:new Date().toISOString()},body));localStorage.setItem(k,JSON.stringify(a.slice(-50)));}catch(e){}
    toast('Đã ghi lại báo lỗi. Cảm ơn con!');};}
/* gửi các báo lỗi đã lưu trên máy khi có đăng nhập */
function flushReports(){if(!LOGGED())return;let a=[];try{a=JSON.parse(localStorage.getItem('ht_reports')||'[]');}catch(e){}if(!a.length)return;
  try{localStorage.setItem('ht_reports','[]');}catch(e){}a.forEach(b=>{apiPost('/x/student/report',b).catch(()=>{});});}
setTimeout(flushReports,8000);

/* ---------------- BỌC confirmQuit / finish ---------------- */
const _confirmQuit=confirmQuit;
confirmQuit=function(){if(!isTdQ())return _confirmQuit.apply(this,arguments);
  const m=modal(`<div class="big-ic">🦉</div><h2>Dừng bài này?</h2><p>Kết quả bài đang làm sẽ không được tính.</p><button class="btn btn-go" id="stay">Học tiếp</button><button class="btn btn-soft" id="leave">Thoát bài</button>`);
  m.querySelector('#stay').onclick=()=>m.remove();m.querySelector('#leave').onclick=()=>{m.remove();try{stopGame();}catch(e){}Q=null;renderTd();};};
const _finish=finish;
finish=function(){
  if(Q&&Q.daily)return finishDaily();
  if(Q&&Q.td!=null)return finishTd();
  try{if(isMainQ()){const k='main_'+Q.level;const n=Q.qs.length;const acc=n?Q.correct/n:1;const w=Math.floor(Q.level/6),d=Q.level%6;srsUpdate(k,lessonTitle(w,d),acc);save();}
    else if(Q&&(Q.mode==='tv'||Q.mode==='en')&&typeof Q.level==='number'){const k=Q.mode+'_'+Q.level;const n=Q.qs.length;srsUpdate(k,levelName(k).split(' · ').slice(1).join(' · '),n?Q.correct/n:1);save();}}catch(e){}
  return _finish.apply(this,arguments);};
function finishTd(){const id=Q.td,L=tdLesson(id);const n=Q.qs.length,c=Math.min(n,Q.correct),r=n?c/n:0,stars=r>=.9?3:r>=.7?2:r>=.5?1:0;
  const lk='td_'+id,pts=c*10+(stars===3?20:0);const rb=beatBest(lk,pts);const coins=rb.rec?Math.max(0,Q.coins)+(stars===3?4:0):0;
  S.tdSt[id]=stars;markPass(lk,stars);const prev=applyAttempt(lk,pts);const secs=Math.round((Date.now()-Q.start)/1000);
  S.coins+=coins;logDay(secs,stars>=1);if(stars>=1)bumpStreak();srsUpdate(lk,L.t,r);save();syncRewards();
  syncAttempt({level_key:lk,stars,points:pts,correct:c,total:n,skills:Q.skillDelta||{}});syncSession(secs);Q=null;
  app.innerHTML=`<div class="result"><div class="res-owl" aria-hidden="true">${stars===3?'🥳':stars>=1?'🦉':'🤗'}</div><h1>${stars===3?'Xuất sắc!':stars>=1?'Hoàn thành!':'Cố thêm chút nữa nhé!'}</h1>
  <div class="res-stars" aria-label="${stars} sao">${[1,2,3].map(k=>`<span class="${k<=stars?'on':''}">★</span>`).join('')}</div>
  <p>🧩 ${H(L.t)}: con làm đúng ${c}/${n} câu.</p><p>⭐ Điểm bài này: <b>${pts}</b> · Tổng điểm: <b>${S.totalPoints}</b></p>${attemptNote(prev,pts)}${coinNote(rb)}
  <div class="rewards"><div class="reward"><span class="em">🪙</span>+${coins}<small>xu</small></div>${stars>=1?`<div class="reward"><span class="em">🔥</span>${streakNow()}<small>ngày liên tiếp</small></div>`:''}</div>
  <div class="actions"><button class="btn btn-go" id="toTd">Về Toán tư duy</button><button class="btn btn-soft" id="tdKc">📘 Xem thẻ kiến thức</button><button class="btn btn-soft" id="again">Làm lại bài này</button></div></div>`;
  $('#toTd').onclick=()=>renderTd();$('#again').onclick=()=>startTd(id);$('#tdKc').onclick=()=>showCard({t:L.t,tiles:L.card.tiles,tip:L.card.tip});
  if(stars>=1){sfx.win();confetti();}sayVi((stars===3?'Xuất sắc! ':stars>=1?'Hoàn thành! ':'Cố thêm chút nữa nhé! ')+'Con làm đúng '+c+' trên '+n+' câu.');}

/* ---------------- THỬ THÁCH HÔM NAY ---------------- */
function seeded(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function dailyQ(){const t=todayStr();let h=GRADE*7919;for(const ch of t)h=(h*31+ch.charCodeAt(0))>>>0;const rr=Math.random;Math.random=seeded(h);
  try{const L=TD_LIST();const ls=L[Math.floor(Math.random()*L.length)];const q=tdMake(ls,GRADE<=1?1:2);q.hard=false;q.secLab='⭐ Thử thách hôm nay · '+ls.t;return q;}finally{Math.random=rr;}}
function startDaily(){const d=S.htDaily||{};if(d.d===todayStr()&&d.done){toast(d.ok?'Hôm nay con đã giải đúng thử thách rồi. Mai quay lại nhé!':'Hôm nay con đã làm thử thách rồi. Mai có câu mới nhé!');return;}
  stopVoice();Q={daily:true,level:-1,qs:[dailyQ()],i:0,correct:0,coins:0,start:Date.now(),gamePlayed:true};renderQ();}
function finishDaily(){const ok=Q.correct>=1;const secs=Math.round((Date.now()-Q.start)/1000);const first=!(S.htDaily&&S.htDaily.d===todayStr()&&S.htDaily.done);
  const bonus=ok&&first?4:0;S.htDaily={d:todayStr(),done:true,ok};S.coins+=bonus;logDay(secs,false);save();if(bonus)syncRewards();syncSession(secs);Q=null;
  app.innerHTML=`<div class="result"><div class="res-owl" aria-hidden="true">${ok?'🌟':'🤗'}</div><h1>${ok?'Giải được rồi!':'Mai thử lại nhé!'}</h1><p>${ok?'Con đã giải đúng thử thách hôm nay ngay lần đầu.':'Con đã làm lại đến khi đúng. Cố gắng lần sau đúng ngay từ đầu nhé!'}</p>
  <div class="rewards"><div class="reward"><span class="em">🪙</span>+${bonus}<small>xu</small></div></div><div class="actions"><button class="btn btn-go" id="toTd">Về Toán tư duy</button></div></div>`;
  $('#toTd').onclick=()=>renderTd();if(ok){sfx.win();confetti();}}
/* ---------------- THANH TAB: thêm "Tư duy" ---------------- */
const _tabbar=tabbar;
tabbar=function(a){let h=_tabbar.apply(this,arguments);try{const btn=`<button class="tab${a==='td'?' on':''}" data-act="httab" data-t="td" ${a==='td'?'aria-current="page"':''}><span aria-hidden="true">🧩</span>Tư duy</button>`;
  const sp=h.search(/<button class="tab[^"]*" data-act="tab" data-t="speed"/);
  h=h.replace('<div class="tabs">','<div class="tabs ht7">');h=sp>=0?h.replace(/<button class="tab[^"]*" data-act="tab" data-t="speed"/,m=>btn+m):h.replace('</div></nav>',btn+'</div></nav>');}catch(e){}return h;};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="httab"],[data-act="htkc"],[data-act="httd"]');if(!b)return;sfx.tap();
  if(b.dataset.act==='httab')renderTd();else if(b.dataset.act==='htkc')renderKc(b.dataset.s||'toan');else renderTd();});

/* ---------------- MÀN TOÁN TƯ DUY ---------------- */
function tdStars(id){return Number((S.tdSt||{})[id])||0;}
function renderTd(){Q=null;try{stopSpeed();}catch(e){}stopVoice();const L=TD_LIST(),G=TD_GR();const d=S.htDaily||{};const doneToday=d.d===todayStr()&&d.done;
  const due=srsDue(k=>/^td_/.test(k));
  let h=`<div class="screen">${topbar()}<div class="page ht-page"><h1>🧩 Toán tư duy</h1><p class="lead">${GRADE===0?'Câu đố vui cho bé Lớp Lá: tìm quy luật, đếm, so sánh, đứng thứ mấy, thêm bớt. Mỗi lần chơi lại, hình đổi mới.':GRADE===1?'Câu đố rèn tư duy cho lớp 1: tìm quy luật, đếm, xếp hàng, tính ngược, đếm hình, tính nhanh. Mỗi lần làm lại, đề đổi số mới.':'Câu đố rèn tư duy cho '+GNAME+': tìm quy luật, đếm, suy luận, vẽ sơ đồ, tính ngược, hình khối. Mỗi lần làm lại, đề đổi số mới.'}</p>
  <button class="ht-row ht-daily" data-htdaily="1" style="--c:#D99A00"><span class="n">⭐</span><span class="tx"><b>Thử thách hôm nay</b><small>${doneToday?(d.ok?'Con đã giải đúng hôm nay 🎉 · mai có câu mới':'Đã làm hôm nay · mai có câu mới'):'Một câu đố mỗi ngày · +4 xu nếu đúng ngay lần đầu'}</small></span><span class="go">›</span></button>
  <button class="exam-banner ht-banner full" data-act="htkc" data-s="td" style="--c:#7C5CF0;--cd:#5A3DC7"><span class="eb-ic">📘</span><span><b>Thẻ kiến thức</b><small>Cách giải từng dạng bài và mẹo nhớ của Cú Bông</small></span><span class="eb-go">›</span></button>
  ${dueCardHTML(due,true)}`;
  G.forEach((g,gi)=>{const ls=L.filter(l=>l.gr===gi);if(!ls.length)return;const st=ls.reduce((a,l)=>a+tdStars(l.id),0),mx=ls.length*3;
    h+=`<div class="ht-gh"><span class="ic" aria-hidden="true">${g.i}</span><h2>${H(g.n)}</h2><small>${st}/${mx} ⭐</small></div>`;
    ls.forEach(l=>{const s=tdStars(l.id),done=(S.lastPts||{})['td_'+l.id]!=null;
      h+=`<button class="ht-row" data-httd="${l.id}" style="--c:${g.c}"><span class="n">${g.i}</span><span class="tx"><b>${H(l.t)}</b><small>${done?'Lần gần nhất: '+(S.lastPts['td_'+l.id])+' điểm':'10 câu · có gợi ý từng bước'}</small><div class="ht-bar"><i style="width:${Math.round(s/3*100)}%"></i></div></span><span class="ht-stars">${'★'.repeat(s)}<i>${'★'.repeat(3-s)}</i></span></button>`;});});
  h+=`<p class="map-end">Mỗi bài 10 câu: 4 câu cơ bản, 4 câu vận dụng, 2 câu ⭐ nâng cao.</p></div></div>${tabbar('td')}`;
  app.innerHTML=h;
  app.querySelectorAll('[data-httd]').forEach(b=>b.onclick=()=>openTd(+b.dataset.httd));
  const dl=app.querySelector('[data-htdaily]');if(dl)dl.onclick=()=>{sfx.tap();startDaily();};bindDue(app);}
function openTd(id){const L=tdLesson(id);if(!L)return;sfx.tap();const s=tdStars(id),lp=(S.lastPts||{})['td_'+id];const g=TD_GR()[L.gr];
  const m=modal(`<div class="big-ic">${g.i}</div><h2>${H(L.t)}</h2><p>${H(g.n)} · 10 câu (có 2 câu ⭐ nâng cao)${lp!=null?`<br>Lần làm gần nhất: ${'★'.repeat(s)}${'☆'.repeat(3-s)} · ${lp} điểm (làm lại sẽ thay điểm này)`:''}</p><button class="btn btn-go" id="go">${lp!=null?'Làm lại':'Bắt đầu'}</button><button class="btn btn-soft" id="kc">📘 Xem thẻ kiến thức</button><button class="btn btn-soft" id="cancel">Để sau</button>`);
  m.querySelector('#go').onclick=()=>{m.remove();startTd(id);};m.querySelector('#cancel').onclick=()=>m.remove();
  m.querySelector('#kc').onclick=()=>{m.remove();showCard({t:L.t,tiles:L.card.tiles,tip:L.card.tip});};}
function startTd(id){const L=tdLesson(id);stopVoice();Q={td:id,level:-1,qs:tdBuild(L,10),i:0,correct:0,coins:0,start:Date.now(),gamePlayed:true};renderQ();}

/* ---------------- KHO THẺ KIẾN THỨC ---------------- */
function renderKc(tab){Q=null;try{stopSpeed();}catch(e){}stopVoice();tab=tab==='td'?'td':'toan';
  let h=`<div class="screen">${topbar()}<div class="page ht-page"><h1>📘 Thẻ kiến thức</h1><div class="seg" role="tablist"><button role="tab" aria-selected="${tab==='toan'}" data-kct="toan">🔢 Toán ${GRADE?GRADE:'Lá'}</button><button role="tab" aria-selected="${tab==='td'}" data-kct="td">🧩 Toán tư duy</button></div>`;
  const items=[];
  if(tab==='toan'){try{WEEKS.forEach((W,w)=>{const cs=kcForChapter(w);
      h+=`<div class="ht-gh"><span class="ic" aria-hidden="true">${['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][w]||'📗'}</span><h2>${H(W.t)}</h2><small>${cs.length} thẻ</small></div>`;
      cs.forEach(([c,d])=>{items.push(c);h+=`<button class="ht-row" data-kci="${items.length-1}"><span class="n">📘</span><span class="tx"><b>${H(c.t)}</b><small>Chặng ${w+1}${d!=null&&lessonTitleSpecific(w,d)?' · '+H(lessonTitleSpecific(w,d)):''}</small></span><span class="go">›</span></button>`;});});}catch(e){}
    h+=dueCardHTML(srsDue(k=>!/^td_/.test(k)),true,'Cần ôn lại');}
  else{const L=TD_LIST();TD_GR().forEach((g,gi)=>{const ls=L.filter(l=>l.gr===gi);if(!ls.length)return;h+=`<div class="ht-gh"><span class="ic" aria-hidden="true">${g.i}</span><h2>${H(g.n)}</h2><small>${ls.length} thẻ</small></div>`;
      ls.forEach(l=>{items.push({t:l.t,tiles:l.card.tiles,tip:l.card.tip});h+=`<button class="ht-row" data-kci="${items.length-1}" style="--c:${g.c}"><span class="n">${g.i}</span><span class="tx"><b>${H(l.t)}</b><small>${H(l.card.tiles.map(t=>t[0]).join(' · '))}</small></span><span class="go">›</span></button>`;});});
    h+=dueCardHTML(srsDue(k=>/^td_/.test(k)),true,'Cần ôn lại');}
  h+=`</div></div>${tabbar(tab==='td'?'td':'map')}`;app.innerHTML=h;
  app.querySelectorAll('[data-kct]').forEach(b=>b.onclick=()=>{sfx.tap();renderKc(b.dataset.kct);});
  app.querySelectorAll('[data-kci]').forEach(b=>b.onclick=()=>showCard(items[+b.dataset.kci]));bindDue(app);}

/* ---------------- TRANG CHỦ TOÁN: ôn lại, thẻ kiến thức, mục tiêu phút ---------------- */
const _renderHome=renderHome;
renderHome=function(){const r=_renderHome.apply(this,arguments);
  try{const hello=app.querySelector('.hello');if(hello){
      const td=S.days[todayStr()]||{sec:0};const mins=Math.floor((td.sec||0)/60),goal=S.goalMin||15;const gb=hello.querySelector('.goal');
      if(gb){gb.innerHTML=`<div class="goal-bar"><i style="width:${Math.min(1,mins/goal)*100}%"></i></div><small>Mục tiêu hôm nay: ${Math.min(mins,goal)}/${goal} phút${(td.n||0)>=1?' · đã xong '+td.n+' bài':''}</small>`;}
      const div=document.createElement('div');div.innerHTML=`<button class="exam-banner ht-banner" data-act="htkc" data-s="toan" style="--c:#7C5CF0;--cd:#5A3DC7"><span class="eb-ic">📘</span><span><b>Thẻ kiến thức Toán</b><small>Ôn nhanh cách làm từng dạng bài</small></span><span class="eb-go">›</span></button>${dueCardHTML(srsDue(k=>/^main_/.test(k)))}`;
      const after=app.querySelector('.exam-banner')||hello;after.parentNode.insertBefore(div,after.nextSibling);bindDue(div);}}catch(e){}
  return r;};
/* ---------------- GÓC PHỤ HUYNH: nhận xét tuần, dạng bài hay sai, mục tiêu, quà ---------------- */
function weekStart(off){const d=new Date();const wd=(d.getDay()+6)%7;d.setDate(d.getDate()-wd+7*(off||0));return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function addDays(ds,n){const [y,m,dd]=ds.split('-').map(Number);const d=new Date(y,m-1,dd);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
const dmy=ds=>{const [y,m,d]=ds.split('-');return +d+'/'+ +m;};
function daysStudied(from,to){return Object.keys(S.days||{}).filter(k=>k>=from&&k<=to&&((S.days[k].sec||0)>=60||(S.days[k].n||0)>0)).length;}
function lastNDaysStudied(n){return daysStudied(dayStr(-(n-1)),todayStr());}
function lkName(k){try{return levelName(k);}catch(e){return k;}}
function weeklyHTML(){const ws=weekStart(0),we=addDays(ws,6),ps=weekStart(-1),pe=addDays(ps,6),t=todayStr();
  let elapsed=0;for(let i=0;i<7;i++)if(addDays(ws,i)<=t)elapsed++;
  const dd=daysStudied(ws,we);let sec=0;Object.keys(S.days||{}).forEach(k=>{if(k>=ws&&k<=we)sec+=S.days[k].sec||0;});const avg=dd?Math.round(sec/60/dd):0;
  const first=x=>!x.rv;const W=S.qlog.filter(x=>x.d>=ws&&x.d<=we&&first(x)),P=S.qlog.filter(x=>x.d>=ps&&x.d<=pe&&first(x));
  const acc=a=>a.length?Math.round(a.filter(x=>x.ok).length/a.length*100):null;const aw=acc(W),ap=acc(P);
  const byK={};W.forEach(x=>{const o=byK[x.k]||(byK[x.k]={c:0,t:0});o.t++;if(x.ok)o.c++;});const weak=Object.keys(byK).filter(k=>byK[k].t>=3).sort((a,b)=>byK[a].c/byK[a].t-byK[b].c/byK[b].t)[0];
  const lines=[];lines.push(`Con học <b>${dd}/${elapsed}</b> ngày${dd?`, trung bình <b>${avg} phút</b> mỗi ngày học (mục tiêu ${S.goalMin||15} phút)`:''}.`);
  if(aw!=null)lines.push(ap!=null?`Tỉ lệ làm đúng ngay lần đầu: <b>${aw}%</b> ${aw>=ap?`<span style="color:var(--leaf-d)">▲ tăng ${aw-ap}%</span>`:`<span style="color:var(--berry-d)">▼ giảm ${ap-aw}%</span>`} so với tuần trước.`:`Tỉ lệ làm đúng ngay lần đầu: <b>${aw}%</b> (${W.length} câu).`);
  else lines.push('Tuần này con chưa làm câu hỏi nào trên máy này.');
  if(weak&&byK[weak].c/byK[weak].t<.8)lines.push(`Bài “${H(lkName(weak).split(' · ').slice(-1)[0])}” còn yếu (đúng ${byK[weak].c}/${byK[weak].t} câu) – app sẽ ưu tiên nhắc con ôn bài này.`);
  else if(W.length)lines.push('Con làm khá đều tay. Bố mẹ có thể cho con thử phần 🧩 Toán tư duy để nâng cao.');
  return `<div class="card ht-wk"><h2>📝 Nhận xét tuần <small>${dmy(ws)} – ${dmy(we)}</small></h2>${lines.map(l=>`<p>${l}</p>`).join('')}
   <div class="stats"><div class="stat"><b>${dd}/${elapsed}</b><small>ngày học</small></div><div class="stat"><b>${aw!=null?aw+'%':'–'}</b><small>tỉ lệ đúng</small></div><div class="stat"><b>${W.length}</b><small>số câu đã làm</small></div><div class="stat"><b>${Math.round(sec/60)} phút</b><small>thời gian học</small></div></div></div>`;}
function mistakesHTML(){const from=dayStr(-6);const L=S.qlog.filter(x=>x.d>=from);const wrong=L.filter(x=>!x.ok&&!x.rv);if(!wrong.length)return `<div class="card"><h2>🎯 Dạng bài con hay sai</h2><p class="lead" style="margin:0">7 ngày qua con chưa làm sai câu nào trên máy này. Tuyệt vời!</p></div>`;
  const fixed=id=>!!id&&L.some(x=>x.id===id&&x.ok&&x.rv);const grp={};wrong.forEach(x=>{const g=grp[x.k]||(grp[x.k]=[]);g.push(x);});
  const keys=Object.keys(grp).sort((a,b)=>grp[b].length-grp[a].length).slice(0,10);
  return `<div class="card ht-mis"><h2>🎯 Dạng bài con hay sai</h2><p class="lead" style="margin:0 0 6px">Các câu sai trong 7 ngày qua, gom theo bài. “Đã sửa” = câu đó (hoặc câu cùng dạng) được hỏi lại cuối bài và con làm đúng. Chạm để xem đề.</p>
   ${keys.map(k=>{const g=grp[k];const nf=g.filter(x=>fixed(x.id)).length;return `<details><summary><span>${H(lkName(k))}</span><b class="${nf===g.length?'ok':''}">sai ${g.length}${nf===g.length?' · đã sửa hết':nf?' · đã sửa '+nf:''}</b></summary>${g.slice(-5).reverse().map(x=>`<div class="q">${H(x.p)}<small>Con trả lời: ${H(x.c||'(bỏ trống)')} · Đáp án: ${H(x.a)}</small></div>`).join('')}</details>`;}).join('')}</div>`;}
/* quà do bố mẹ đặt */
const GIFT_IC=['📺','🍦','📚','🎡','🧸','🎮','🍕','⚽','🎨','🚲','🎁','🌳'];
function pgSave(){save();if(LOGGED())apiPut('/x/student/gifts',{gifts:S.pg}).catch(()=>{});}
let PG_AT=0;
async function pgLoad(){if(!LOGGED()||Date.now()-PG_AT<60000)return false;PG_AT=Date.now();try{const r=await apiGet('/x/student/gifts');if(r&&r.gifts&&Array.isArray(r.gifts.list)){S.pg={list:r.gifts.list,log:Array.isArray(r.gifts.log)?r.gifts.log:[]};save();return true;}}catch(e){}return false;}
function giftParentHTML(){const L=S.pg.list;return `<div class="card"><h2>🎁 Phần thưởng của bố mẹ</h2><p class="lead" style="margin:0 0 8px">Bố mẹ đặt quà thật (xem phim, đi chơi, mua truyện…). Con dùng 🪙 xu kiếm được khi học để đổi, ở mục Thành tích → 🎁 Quà. Con cần học ít nhất <b>3 ngày trong 7 ngày gần nhất</b> mới đổi được.</p>
  ${L.length?L.map((g,i)=>`<div class="ht-gift"><span class="gi">${H(g.i||'🎁')}</span><span class="gt"><b>${H(g.n)}</b><small>🪙 ${g.p} xu</small></span><button class="small-btn danger" data-pgdel="${i}">Xóa</button></div>`).join(''):'<p>Chưa có phần thưởng nào.</p>'}
  <div class="ht-icons" id="pgIc">${GIFT_IC.map((e,i)=>`<button type="button" data-ic="${e}" aria-pressed="${i===0}">${e}</button>`).join('')}</div>
  <div class="ht-mini"><input class="field" id="pgN" maxlength="40" placeholder="Tên quà, ví dụ: 30 phút xem TV"><input class="field" id="pgP" type="number" min="5" max="5000" placeholder="Số xu" style="max-width:110px"></div><button class="btn btn-go" id="pgAdd" style="margin-top:10px">➕ Thêm phần thưởng</button>
  ${S.pg.log.length?`<p class="lead" style="margin:12px 0 4px">Đã đổi gần đây:</p>${S.pg.log.slice(-5).reverse().map(x=>`<div class="row"><div>${H(x.i||'🎁')} ${H(x.n)}<small>${H(x.d)} · 🪙 ${x.p} xu</small></div></div>`).join('')}`:''}</div>`;}
function goalHTML(){return `<div class="card"><h2>⏱️ Mục tiêu mỗi ngày</h2><div class="row"><div>Thời gian học mỗi ngày<small>Hiện trên trang chủ Toán để con tự theo dõi</small></div><select class="small-btn sel" id="htGoal">${[5,10,15,20,30,45,60].map(m=>`<option value="${m}"${(S.goalMin||15)===m?' selected':''}>${m} phút</option>`).join('')}</select></div></div>`;}
const _renderParent=typeof renderParent==='function'?renderParent:null;
if(_renderParent)renderParent=function(){const r=_renderParent.apply(this,arguments);try{htParentInject();}catch(e){}
  pgLoad().then(ch=>{if(ch&&document.getElementById('htParent'))htParentInject();});return r;};
function htParentInject(){let box=$('#htParent');const rep=$('#pReport');if(!rep)return;if(!box){box=document.createElement('div');box.id='htParent';rep.parentNode.insertBefore(box,rep);}
  box.innerHTML=weeklyHTML()+mistakesHTML()+goalHTML()+giftParentHTML();
  const g=$('#htGoal');if(g)g.onchange=e=>{S.goalMin=+e.target.value;save();toast('Đã đặt mục tiêu '+S.goalMin+' phút mỗi ngày.');};
  let ic=GIFT_IC[0];box.querySelectorAll('#pgIc button').forEach(b=>b.onclick=()=>{ic=b.dataset.ic;box.querySelectorAll('#pgIc button').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  $('#pgAdd').onclick=()=>{const n=$('#pgN').value.trim(),p=Math.round(Number($('#pgP').value));if(!n){toast('Bố mẹ nhập tên phần thưởng nhé.');return;}if(!(p>=5&&p<=5000)){toast('Số xu từ 5 đến 5000.');return;}
    if(S.pg.list.length>=12){toast('Tối đa 12 phần thưởng.');return;}S.pg.list.push({id:Date.now().toString(36),n,i:ic,p});pgSave();htParentInject();toast('Đã thêm phần thưởng.');};
  box.querySelectorAll('[data-pgdel]').forEach(b=>b.onclick=()=>{S.pg.list.splice(+b.dataset.pgdel,1);pgSave();htParentInject();});}

/* ---------------- THÀNH TÍCH: mục 🎁 Quà và bảng xếp hạng Tuần / Chăm chỉ ---------------- */
function giftChildHTML(){const L=S.pg.list,c=S.coins||0,dd=lastNDaysStudied(7);
  return `<div class="ht-wallet"><span style="font-size:40px">🪙</span><div><small>Ví xu của con</small><b>${c} xu</b></div></div>
  <div class="ht-gh" style="margin-top:4px"><h2>Đổi quà của bố mẹ</h2><small>Bố mẹ đặt ở Góc phụ huynh</small></div>
  ${dd<3?`<div class="ht-warn">🔥 Để đổi quà, con cần học ít nhất 3 ngày trong 7 ngày gần nhất · con đã học ${dd}/3 ngày.</div>`:''}
  ${L.length?L.map((g,i)=>{const pct=Math.min(100,Math.round(c/g.p*100));const can=c>=g.p&&dd>=3;return `<div class="ht-gift"><span class="gi">${H(g.i||'🎁')}</span><span class="gt"><b>${H(g.n)}</b><div class="ht-bar"><i style="width:${pct}%"></i></div><small>${Math.min(c,g.p)} / ${g.p} xu${c<g.p?' · còn '+(g.p-c):''}</small></span>${can?`<button class="small-btn" data-pgget="${i}">Đổi quà</button>`:''}</div>`;}).join(''):`<div class="card empty"><div class="big-ic">🎁</div><h2>Chưa có quà</h2><p>Nhờ bố mẹ vào Góc phụ huynh để đặt phần thưởng cho con nhé!</p></div>`}`;}
function redeemGift(i){const g=S.pg.list[i];if(!g)return;const a=rnd(6,9),b=rnd(6,9);
  const m=modal(`<div class="big-ic">${H(g.i||'🎁')}</div><h2>Đổi “${H(g.n)}”?</h2><p>Con sẽ dùng <b>🪙 ${g.p}</b> trong ${S.coins} xu. Nhờ bố mẹ xác nhận: ${a} × ${b} = ?</p><input class="field" id="rgA" type="number" inputmode="numeric" aria-label="Kết quả"><div style="height:12px"></div><button class="btn btn-go" id="rgY">Bố mẹ đồng ý</button><button class="btn btn-soft" id="rgN">Để dành thêm</button>`);
  m.querySelector('#rgN').onclick=()=>m.remove();
  m.querySelector('#rgY').onclick=()=>{if(Number(m.querySelector('#rgA').value)!==a*b){toast('Chưa đúng, nhờ bố mẹ thử lại nhé.');return;}if(S.coins<g.p){toast('Con chưa đủ xu.');m.remove();return;}
    S.coins-=g.p;S.pg.log.push({n:g.n,i:g.i,p:g.p,d:todayStr()});S.pg.log=S.pg.log.slice(-30);save();syncRewards();pgSave();m.remove();sfx.win();confetti();toast('Đã đổi quà! Con nhớ nhắc bố mẹ nhé 🎉');renderAchieve('gift');};}
let RANK2=null,RANK2_AT=0,RANK2_LOAD=null;
function loadRank2(force){if(!LOGGED())return Promise.resolve();if(RANK2_LOAD)return RANK2_LOAD;if(!force&&RANK2&&Date.now()-RANK2_AT<60000)return Promise.resolve();
  RANK2_LOAD=apiGet('/x/student/rank2').then(d=>{RANK2=d;RANK2_AT=Date.now();}).catch(()=>{}).finally(()=>{RANK2_LOAD=null;});return RANK2_LOAD;}
function board2HTML(mode){if(!LOGGED())return `<div class="card empty"><div class="big-ic">🏆</div><h2>Đăng nhập để xem xếp hạng</h2></div>`;
  if(!RANK2)return `<div class="card empty"><div class="big-ic">⏳</div><h2>Đang tải bảng xếp hạng...</h2></div>`;
  const val=k=>mode==='week'?Number(k.week_points)||0:Number(k.month_days)||0;
  const list=(RANK2.students||[]).slice().sort((a,b)=>val(b)-val(a)||(mode==='week'?(Number(b.total_points)||0)-(Number(a.total_points)||0):(Number(b.streak)||0)-(Number(a.streak)||0))||String(a.name).localeCompare(String(b.name),'vi'));
  const me=list.find(k=>k.me),idx=me?list.indexOf(me):-1;const unit=k=>mode==='week'?`🏅 ${val(k)}`:`${val(k)} ngày`;const sub=k=>mode==='week'?'':` <small>🔥 ${Number(k.streak)||0}</small>`;
  const top=list.slice(0,3),ord=[1,0,2].filter(i=>top[i]),med=['🥇','🥈','🥉'];
  const ws=weekStart(0);const head=mode==='week'?`Tuần ${dmy(ws)} – ${dmy(addDays(ws,6))} · điểm các bài làm trong tuần`:`Tháng ${new Date().getMonth()+1} · số ngày có học (mỗi ngày ít nhất 1 phút)`;
  return `<div class="card rank-card"><h2>${mode==='week'?'🗓️ Xếp hạng tuần này':'🔥 Bảng chăm chỉ'}</h2><p class="lead" style="margin:0 0 6px">${head}</p>
   ${me?`<div class="me-rank">Hạng của con: <b>#${idx+1}</b> / ${list.length} · ${unit(me)}${mode==='dili'?` · chuỗi 🔥 ${Number(me.streak)||0} ngày`:''}<br><small>${mode==='week'?(idx<10?'Trong top 10, cố lên!':'Làm thêm vài bài là lên hạng!'):'Học đều mỗi ngày là lên hạng!'}</small></div>`:''}
   ${top.length?`<div class="podium">${ord.map(i=>{const k=top[i];return `<div class="pd pd${i+1}${k.me?' pd-me':''}"><div class="pd-ava">${H(k.avatar||'🙂')}</div><div class="pd-name">${H(k.name)}${k.me?' <small>(con)</small>':''}</div><div class="pd-pts">${unit(k)}</div><div class="pd-block">${med[i]}<b>${i+1}</b></div></div>`;}).join('')}</div>`:''}
   ${list.length>3?`<ol class="rank">${list.slice(3).map((k,r)=>`<li class="${k.me?'me-row':''}"><span class="rk">${r+4}</span><span class="ra">${H(k.avatar||'🙂')}</span><span class="rn">${H(k.name)}${k.me?' <small>(con)</small>':''}</span><span class="rs">${unit(k)}${sub(k)}</span></li>`).join('')}</ol>`:''}
   <button class="btn btn-soft" id="rk2Reload">🔄 Cập nhật bảng xếp hạng</button></div>`;}
let RANK_MODE='all';
if(typeof drawAchieve==='function'){const _da=drawAchieve;drawAchieve=function(tab){const r=_da.apply(this,arguments);try{htAchDecorate(tab);}catch(e){}return r;};}
function htAchDecorate(tab){const seg=app.querySelector('.ach-page .seg');if(!seg)return;
  if(!seg.querySelector('[data-seg="gift"]')){const b=document.createElement('button');b.setAttribute('role','tab');b.dataset.seg='gift';b.textContent='🎁 Quà';b.setAttribute('aria-selected',tab==='gift');seg.appendChild(b);seg.classList.add('ht4');b.onclick=()=>{sfx.tap();renderAchieve('gift');};}
  const page=app.querySelector('.ach-page');
  if(tab==='gift'){seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x.dataset.seg==='gift'));while(seg.nextSibling)seg.nextSibling.remove();const d=document.createElement('div');d.innerHTML=giftChildHTML();page.appendChild(d);
    d.querySelectorAll('[data-pgget]').forEach(b=>b.onclick=()=>redeemGift(+b.dataset.pgget));
    pgLoad().then(ch=>{if(ch&&ACH_TAB==='gift'&&app.querySelector('.ach-page'))drawAchieve('gift',true);});return;}
  if(tab==='rank'){const sub=document.createElement('div');sub.className='ht-subseg';sub.setAttribute('role','tablist');sub.innerHTML=[['week','Tuần này'],['all','Tất cả'],['dili','Chăm chỉ']].map(([k,l])=>`<button role="tab" data-rk="${k}" aria-selected="${RANK_MODE===k}">${l}</button>`).join('');
    seg.parentNode.insertBefore(sub,seg.nextSibling);
    if(RANK_MODE!=='all'){while(sub.nextSibling)sub.nextSibling.remove();const d=document.createElement('div');d.innerHTML=board2HTML(RANK_MODE);page.appendChild(d);
      const rl=$('#rk2Reload');if(rl)rl.onclick=()=>{sfx.tap();RANK2=null;drawAchieve('rank');loadRank2(true).then(()=>{if(ACH_TAB==='rank')drawAchieve('rank');});};
      if(!RANK2||Date.now()-RANK2_AT>60000)loadRank2().then(()=>{if(ACH_TAB==='rank'&&RANK_MODE!=='all'&&app.querySelector('.ach-page'))drawAchieve('rank',true);});}
    sub.querySelectorAll('[data-rk]').forEach(b=>b.onclick=()=>{sfx.tap();RANK_MODE=b.dataset.rk;drawAchieve('rank');});}}
/* renderAchieve gốc chỉ biết rank/st/shop: với 'gift' vẫn vẽ (rơi vào nhánh sticker) rồi lớp này thay nội dung */

/* ---------------- QUẢN TRỊ: danh sách báo câu sai ---------------- */
if(typeof renderAdminPortal==='function'){const _ap=renderAdminPortal;renderAdminPortal=async function(tab){const r=await _ap.apply(this,arguments);try{htAdminDecorate();}catch(e){}return r;};}
function htAdminDecorate(){const seg=app.querySelector('.seg[role="tablist"]');const body=$('#adminBody');if(!seg||!body||seg.querySelector('[data-htrep]'))return;
  const b=document.createElement('button');b.setAttribute('role','tab');b.dataset.htrep='1';b.setAttribute('aria-selected','false');b.textContent='⚑ Báo lỗi';seg.appendChild(b);seg.classList.add('ht5');
  seg.querySelectorAll('[data-atab]').forEach(x=>x.addEventListener('click',()=>b.setAttribute('aria-selected','false')));
  let all=false;
  const draw=async()=>{seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x===b));body.innerHTML='<div class="card"><p>Đang tải báo lỗi...</p></div>';
    let L=[];try{const d=await apiGet('/x/admin/reports'+(all?'?all=1':''));L=d.reports||[];}catch(e){body.innerHTML=`<div class="card"><p>${H(e.message)}</p></div>`;return;}
    const RS={wrong:'Đáp án sai',unclear:'Đề khó hiểu',display:'Lỗi hiển thị',other:'Khác'};
    body.innerHTML=`<div class="card ht-adm"><h2>⚑ Học sinh báo câu sai (${L.length})</h2><div class="row"><div>Hiện cả báo lỗi đã xử lý</div><button class="switch" role="switch" aria-checked="${all}" id="htAll"></button></div>
     ${L.length?L.map(x=>`<div class="rq${x.resolved?' done':''}"><b>${H(x.level_name||x.level_key||'')}</b><small>${H(x.student_name||'')} · ${H(fmtTime(x.created_at))} · ${H(RS[x.reason]||x.reason||'')}</small><div>${H(x.prompt||'')}${x.big?' <b style="display:inline">'+H(x.big)+'</b>':''}</div>${x.options&&x.options.length?`<small>Lựa chọn: ${H(x.options.join(' | '))}</small>`:''}<small>Đáp án của app: <b style="display:inline">${H(x.answer||'')}</b> · Học sinh chọn: ${H(x.chosen||'(trống)')}</small>${x.note?`<small>Ghi chú: ${H(x.note)}</small>`:''}<div class="acts">${x.resolved?'':`<button class="small-btn" data-rsv="${x.id}">✓ Đã xử lý</button>`}<button class="small-btn danger" data-rdel="${x.id}">Xóa</button></div></div>`).join(''):'<p>Chưa có báo lỗi nào.</p>'}</div>`;
    $('#htAll').onclick=()=>{all=!all;draw();};
    body.querySelectorAll('[data-rsv]').forEach(x=>x.onclick=async()=>{try{await apiPut('/x/admin/reports/'+x.dataset.rsv,{resolved:true});draw();}catch(e){toast(e.message);}});
    body.querySelectorAll('[data-rdel]').forEach(x=>x.onclick=async()=>{try{await apiCall('DELETE','/x/admin/reports/'+x.dataset.rdel);draw();}catch(e){toast(e.message);}});};
  b.onclick=()=>{sfx.tap();draw();};}
/* màn hình đầu tiên đã vẽ trước khi lớp này chạy → vẽ lại để có tab Tư duy và các mục mới */
try{if(document.querySelector('#scr')&&document.querySelector('.tab[data-t="map"].on'))renderHome();
  else{const tb=document.querySelector('nav.tabbar');if(tb){const on=tb.querySelector('.tab.on');const t=on?on.dataset.t:'';const d=document.createElement('div');d.innerHTML=tabbar(t);if(d.firstElementChild)tb.replaceWith(d.firstElementChild);}}}catch(e){}
window.HT={TDG,TD_ALL,TD_LA,KC,tdBuild,tdMake,kcFor,kcForChapter,bankQs,cardForQ,GRADE,similarQ,polyomino};
})();
