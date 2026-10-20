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
/* ================= BỘ ĐỀ TOÁN MỚI (máy tự sinh) — phần A: tiện ích, số, cộng trừ =================
   Mỗi dạng: MG.ten(G, lv, P) → câu hỏi. G = lớp (0 = Lá), lv = 0 cơ bản · 1 vận dụng · 2 thử thách,
   P = tham số của bài (phạm vi số, bảng nhân…). Lời giải viết từng bước, cách nhau bằng xuống dòng. */
const MG={};
/* kỹ năng: dùng đúng mã kỹ năng có trong app của từng lớp */
const SK_FB={hinhhoc:['hinhhoc','doluong'],thongke:['thongke','xacsuat','doluong','so'],xacsuat:['xacsuat','thongke','so'],phanso:['phanso','so'],stp:['stp','so'],tiso:['tiso','giaitoan'],quyluat:['quyluat','so'],thoigian:['thoigian','doluong'],congtru:['congtru','stp','so'],nhanchia:['nhanchia','stp','so'],giaitoan:['giaitoan','so'],doluong:['doluong','hinhhoc','so'],so:['so']};
function skOf(k){const L=SK_FB[k]||[k];for(const x of L){try{if(SKILLS&&SKILLS[x])return x;}catch(e){}}return 'so';}
const fD=(x,dp)=>{let s=dp==null?String(+(+x).toFixed(6)):(+x).toFixed(dp);let [a,b]=s.split('.');a=fN(+a);return b?a+','+b:a;};
const r6=x=>Math.round(x*1e6)/1e6;
const pickK=(a,k)=>shuffle(a).slice(0,k);
const SIGNS=['>','<','='];
const sgn=(a,b)=>a>b?'>':a<b?'<':'=';
const Qsign=(prompt,big,a,b,o)=>Qmc(prompt,sgn(a,b),SIGNS,Object.assign({big,fixed:SIGNS.slice()},o||{}));
function Qord(prompt,answer,o){let items=shuffle(answer.map(String));let t=0;while(items.join('|')===answer.join('|')&&t<10){items=shuffle(answer.map(String));t++;}return Object.assign({type:'order',prompt,answer:answer.map(String),items},o||{});}
const ops={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,':':(a,b)=>a/b};
/* đọc số tiếng Việt */
const DGV=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
function read3(n,full){const h=Math.floor(n/100),t=Math.floor(n/10)%10,u=n%10;const out=[];
  if(full||h>0)out.push(DGV[h]+' trăm');
  if(t===0){if(u>0&&(full||h>0))out.push('linh '+DGV[u]);else if(u>0)out.push(DGV[u]);}
  else{out.push(t===1?'mười':DGV[t]+' mươi');if(u===1&&t>1)out.push('mốt');else if(u===5)out.push('lăm');else if(u===4&&t>1)out.push('tư');else if(u>0)out.push(DGV[u]);}
  return out.join(' ');}
function vnRead(n){if(n===0)return 'không';const parts=[[1e9,'tỉ'],[1e6,'triệu'],[1e3,'nghìn'],[1,'']];let out=[],started=false;
  for(const [v,name] of parts){const g=Math.floor(n/v)%1000;if(g===0){continue;}out.push(read3(g,started)+(name?' '+name:''));started=true;}
  return out.join(' ').replace(/\s+/g,' ').trim();}
/* SGK lớp 4–5 đọc “tư” (24: hai mươi tư) — các lớp nhỏ đọc “bốn”; cả hai đều đúng, dùng “tư” khi đứng sau mươi */
/* tên đồ vật cho bài toán có lời văn */
const THG=[['quả cam','quả'],['cái kẹo','cái'],['quyển vở','quyển'],['bông hoa','bông'],['viên bi','viên'],['cây bút chì','cây'],['quả táo','quả'],['con gà','con'],['quyển truyện','quyển'],['chiếc bánh','chiếc']];
const thing=()=>RP(THG);
const lim=(G,P)=>P&&P.max?P.max:[10,100,1000,100000,1000000,1000000][G];
/* giải thích phép tính trong ô */
const expl=(...lines)=>lines.filter(Boolean).join('\n');

/* -------- SỐ -------- */
MG.count=function(G,lv,P){const mx=P.max||10;const E=shuffle(['🍎','🐟','⭐','🌸','🎈','🐥','🍓','🚗','⚽','🐞']);const n=R(lv?Math.ceil(mx/2):1,mx);
  if(lv===2&&G<=1){const m=R(1,Math.max(1,mx-n));const arr=shuffle(Array(n).fill(E[0]).concat(Array(m).fill(E[1])));return Qin(`Có bao nhiêu ${E[0]}?`,n,{visual:emoRow(arr,'wrap'),voice:[['vi','Đếm xem có bao nhiêu hình này.']],sk:'so',hints:['Chạm tay vào từng hình và đếm to.','Chỉ đếm đúng một loại hình.'],explain:`Có ${n} ${E[0]}.`});}
  return Qin(`Có bao nhiêu ${E[0]}?`,n,{visual:emoRow(Array(n).fill(E[0]),'wrap'),voice:[['vi','Đếm xem có bao nhiêu hình.']],sk:'so',hints:['Chạm tay vào từng hình và đếm to.','Số đếm cuối cùng là số lượng.'],explain:`Đếm lần lượt 1, 2, … , ${n}. Có ${n} ${E[0]}.`});};
MG.groups=function(G,lv,P){const mx=P.max||10;const E=shuffle(['🍎','🐟','⭐','🌸','🎈','🐥','🍓','🚗']);let a=R(1,mx),b=R(1,mx);while(b===a)b=R(1,mx);
  if(lv>=1){const big=Math.max(a,b),sm=Math.min(a,b);return Qin('Nhóm nhiều hơn thì nhiều hơn mấy hình?',big-sm,{visual:emoRow(Array(a).fill(E[0]))+emoRow(Array(b).fill(E[1])),sk:'so',hints:['Nối mỗi hình hàng trên với một hình hàng dưới.','Đếm số hình còn thừa.'],explain:expl(`Hàng trên ${a}, hàng dưới ${b}.`,`${big} − ${sm} = ${big-sm}.`)});}
  const ans=a>b?E[0]:E[1];return Qmc('Nhóm nào nhiều hơn?',ans,[E[0],E[1]],{emo:true,visual:emoRow(Array(a).fill(E[0]))+emoRow(Array(b).fill(E[1])),sk:'so',hints:['Nối từng cặp một hình trên với một hình dưới.','Hàng còn thừa là hàng nhiều hơn.'],explain:`Có ${a} ${E[0]} và ${b} ${E[1]}, nhóm ${ans} nhiều hơn.`});};
MG.split=function(G,lv,P){const n=R(2,P.max||10),a=R(1,n-1);if(lv===2){return Qin(`${n} gồm ${a} và mấy?`,n-a,{big:`${n} = ${a} + ?`,sk:'so',hints:[`Đếm thêm từ ${a} đến ${n}.`,`${a} + mấy = ${n}?`],explain:`${n} gồm ${a} và ${n-a} vì ${a} + ${n-a} = ${n}.`});}
  return Qin(`${n} gồm ${a} và mấy?`,n-a,{visual:emoRow(Array(a).fill('🔵').concat(Array(n-a).fill('⚪'))),sk:'so',hints:['Đếm số chấm trắng.',`${a} chấm xanh, còn lại là chấm trắng.`],explain:`${n} gồm ${a} và ${n-a}.`});};
MG.readNum=function(G,lv,P){const mx=lim(G,P);let n=R(lv===0?Math.max(10,Math.floor(mx/20)):Math.floor(mx/10),mx-1);if(lv===2){const s=String(n).split('');const k=R(1,s.length-1);s[k]='0';if(s.length>3)s[s.length-2]='0';n=+s.join('');}
  const ask=Math.random()<.5;const w=vnRead(n);
  if(ask){const wr=new Set();const sw=String(n);for(let t=0;t<30&&wr.size<3;t++){let s=sw.split('');const i=R(0,s.length-1);s[i]=String((+s[i]+R(1,9))%10);if(s[0]==='0')continue;const m=+s.join('');if(m!==n)wr.add(vnRead(m));}
    return Qmc(`Số ${fN(n)} đọc là:`,w,[w,...wr].slice(0,4),{sk:'so',bigSmall:true,hints:['Đọc từ trái sang phải theo từng lớp: nghìn, rồi trăm, chục, đơn vị.','Hàng chục là 0 thì đọc “linh”, hàng trăm là 0 thì đọc “không trăm”.'],explain:`${fN(n)} đọc là: ${w}.`});}
  return Qin(`Viết số: ${w}`,n,{sk:'so',hints:['Viết từng lớp: nghìn trước, rồi trăm, chục, đơn vị.','Hàng nào không đọc tới thì viết 0.'],explain:`“${w}” viết là ${fN(n)}.`});};
const HANG=['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn'];
MG.place=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=R(Math.max(10,Math.floor(mx/10)),mx-1);const s=String(n);const k=R(lv===1?1:0,s.length-1);const d=+s[s.length-1-k];
  if(lv===0||d===0){return Qmc(`Trong số ${fN(n)}, chữ số ở hàng ${HANG[k]} là chữ số nào?`,String(d),numOpts(d,[+s[0],+s[s.length-1],(d+1)%10]).map(String),{sk:'so',hints:['Đếm hàng từ phải sang trái: đơn vị, chục, trăm, nghìn…',`Hàng ${HANG[k]} là chữ số thứ ${k+1} từ phải sang.`],explain:`${fN(n)}: hàng ${HANG[k]} là chữ số ${d}.`});}
  const v=d*Math.pow(10,k);if(lv===1)return Qmc(`Chữ số ${d} ở hàng ${HANG[k]} trong số ${fN(n)} có giá trị là bao nhiêu?`,fN(v),[fN(v),fN(d),fN(d*Math.pow(10,k+1)),fN(d*Math.pow(10,Math.max(0,k-1)))].filter((x,i,a)=>a.indexOf(x)===i),{sk:'so',hints:['Giá trị = chữ số × giá trị của hàng.',`Hàng ${HANG[k]} có giá trị ${fN(Math.pow(10,k))}.`],explain:`${d} × ${fN(Math.pow(10,k))} = ${fN(v)}.`});
  return Qin(`Viết số gồm: ${s.split('').map((c,i)=>+c?`${c} ${HANG[s.length-1-i]}`:'').filter(Boolean).join(', ')}.`,n,{sk:'so',hints:['Viết các chữ số theo hàng từ cao xuống thấp.','Hàng không được nhắc tới thì viết chữ số 0.'],explain:`Số đó là ${fN(n)}.`});};
MG.decomp=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=R(Math.max(11,Math.floor(mx/10)),mx-1);const s=String(n);const parts=s.split('').map((c,i)=>+c*Math.pow(10,s.length-1-i)).filter(x=>x>0);if(parts.length<2)return MG.decomp(G,lv,P);
  const k=R(0,parts.length-1);if(lv===2){return Qin('Điền số thích hợp vào ô trống.',n,{big:`? = ${parts.map(fN).join(' + ')}`,sk:'so',hints:['Cộng các số tròn lại với nhau.','Mỗi số nằm ở một hàng.'],explain:`${parts.map(fN).join(' + ')} = ${fN(n)}.`});}
  return Qin('Điền số thích hợp vào ô trống.',parts[k],{big:`${fN(n)} = ${parts.map((p,i)=>i===k?'?':fN(p)).join(' + ')}`,bigSmall:true,sk:'so',hints:['Tách số theo từng hàng.',`Chữ số tương ứng là ${String(parts[k])[0]}.`],explain:`${fN(n)} = ${parts.map(fN).join(' + ')}.`});};
MG.tens=function(G,lv,P){const n=R(10,99);const t=Math.floor(n/10),u=n%10;if(lv===0)return Qin(`Số gồm ${t} chục và ${u} đơn vị là số nào?`,n,{sk:'so',hints:['Viết số chục trước, số đơn vị sau.',`${t} chục là ${t*10}.`],explain:`${t} chục và ${u} đơn vị là ${n}.`});
  return Qin(`Số ${n} gồm mấy chục?`,t,{sk:'so',hints:['Chữ số bên trái là số chục.','Chữ số bên phải là số đơn vị.'],explain:`${n} gồm ${t} chục và ${u} đơn vị.`});};
MG.neighbor=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=R(G<=1?1:Math.floor(mx/10),mx-2);const after=Math.random()<.5;const tr=G<=0?(after?'đứng sau':'đứng trước'):(after?'liền sau':'liền trước');
  if(lv===2&&G>=2){const a=n,b=n+2;return Qin(`Số nào nằm giữa ${fN(a)} và ${fN(b)}?`,a+1,{sk:'so',hints:['Hai số cách nhau 2 đơn vị.','Số ở giữa hơn số bé 1 đơn vị.'],explain:`${fN(a)}, ${fN(a+1)}, ${fN(b)}.`});}
  const r=after?n+1:n-1;if(r<0)return MG.neighbor(G,lv,P);return Qin(`Số ${tr} ${fN(n)} là số nào?`,r,{sk:'so',hints:[after?'Số liền sau hơn số đã cho 1 đơn vị.':'Số liền trước kém số đã cho 1 đơn vị.',after?`${fN(n)} + 1`:`${fN(n)} − 1`],explain:`${fN(n)} ${after?'+':'−'} 1 = ${fN(r)}.`});};
MG.seq=function(G,lv,P){const mx=lim(G,P);const st=P.step?RP(P.step):RP(G<=1?[1,2,5,10]:G===2?[2,5,10,100]:G===3?[5,10,100,1000]:[100,1000,10000]);const len=5;let a=R(0,Math.max(0,Math.floor(mx/st)-len-1))*st+(lv===2&&st>=10?0:0);if(lv>=1)a+=R(0,st-1)*(st<10?1:0);
  const dec=lv===2&&Math.random()<.5;let s=[];for(let i=0;i<len;i++)s.push(a+i*st);if(dec)s.reverse();if(s.some(v=>v>mx||v<0))return MG.seq(G,lv,P);const k=R(1,len-1);
  return Qin('Viết số thích hợp vào ô trống.',s[k],{big:s.map((v,i)=>i===k?'?':fN(v)).join(', '),bigSmall:true,sk:'so',hints:['Hai số liền nhau hơn kém nhau bao nhiêu?',`Mỗi lần ${dec?'bớt':'thêm'} ${fN(st)}.`],explain:`Dãy ${dec?'giảm':'tăng'} đều ${fN(st)}: ${s.map(fN).join(', ')}.`});};
MG.compare=function(G,lv,P){const mx=lim(G,P);
  if(G===0){const a=R(0,mx);let b=R(0,mx);while(b===a)b=R(0,mx);const big=Math.random()<.5;const ans=big?Math.max(a,b):Math.min(a,b);return Qmc(`Số nào ${big?'lớn':'bé'} hơn?`,String(ans),[String(a),String(b)],{visual:emoRow([String(a),'  ',String(b)]),sk:'so',hints:['Đếm xem số nào đứng sau khi đếm 1, 2, 3…','Số đếm sau thì lớn hơn.'],explain:`${Math.max(a,b)} lớn hơn ${Math.min(a,b)}.`});}
  if(lv===0||G===0){let a=R(0,mx),b=Math.random()<.2?a:R(Math.max(0,a-Math.ceil(mx/10)),Math.min(mx,a+Math.ceil(mx/10)));if(G>=3&&Math.random()<.5){const s=String(a).split('');if(s.length>2){s[R(1,s.length-1)]=String(R(0,9));b=+s.join('');}}
    return Qsign('Chọn dấu thích hợp điền vào ô trống.',`${fN(a)} ☐ ${fN(b)}`,a,b,{sk:'so',hints:['Số nào có nhiều chữ số hơn thì lớn hơn.','Cùng số chữ số: so từng hàng từ trái sang phải.'],explain:`${fN(a)} ${sgn(a,b)} ${fN(b)}.`});}
  const L=Math.min(mx,G<=1?10:mx);if(lv===1){const a=R(1,Math.floor(L/2)),b=R(1,Math.floor(L/2));const s=a+b;const c=RP([s,s+R(1,3),Math.max(0,s-R(1,3))]);
    return Qsign('Chọn dấu thích hợp điền vào ô trống.',`${fN(a)} + ${fN(b)} ☐ ${fN(c)}`,s,c,{sk:'so',hints:['Tính vế bên trái trước.',`${fN(a)} + ${fN(b)} = ?`],explain:`${fN(a)} + ${fN(b)} = ${fN(s)}, mà ${fN(s)} ${sgn(s,c)} ${fN(c)}.`});}
  const t=G>=2&&Math.random()<.4&&P.mul?'div':'add';
  if(t==='div'){const n=RP(P.tables||[2,3,4,5]);const k=RP(P.tables||[2,3,4,5].filter(x=>x!==n));const N=n*k*R(1,2);if(N%n||N%k)return MG.compare(G,lv,P);return Qsign('Điền dấu >, <, = (không cần tính hết cũng được).',`${N} : ${n} ☐ ${N} : ${k}`,N/n,N/k,{sk:'nhanchia',hints:['Cùng số bị chia: chia cho số lớn hơn thì được kết quả bé hơn.',`${N} : ${n} và ${N} : ${k}`],explain:`${N} : ${n} = ${N/n}; ${N} : ${k} = ${N/k}. Vậy ${N/n} ${sgn(N/n,N/k)} ${N/k}.`});}
  const a=R(1,Math.floor(L/2)),b=R(1,Math.floor(L/2));const d=R(-3,3);const c=Math.max(1,a+d),dd=a+b-c+R(-1,1);if(dd<0)return MG.compare(G,lv,P);
  return Qsign('Điền dấu >, <, = (không cần tính hết cũng được).',`${fN(a)} + ${fN(b)} ☐ ${fN(c)} + ${fN(dd)}`,a+b,c+dd,{sk:'congtru',hints:['So sánh từng số hạng ở hai vế.','Hoặc tính tổng mỗi vế rồi so sánh.'],explain:`${fN(a)} + ${fN(b)} = ${fN(a+b)}; ${fN(c)} + ${fN(dd)} = ${fN(c+dd)}. Vậy ${fN(a+b)} ${sgn(a+b,c+dd)} ${fN(c+dd)}.`});};
MG.maxmin=function(G,lv,P){const mx=Math.min(lim(G,P),999999);
  if(lv===2&&G>=2){const ds=pickK([1,2,3,4,5,6,7,8,9].concat(G>=3?[0]:[]),G>=4?4:3);const big=Math.random()<.5;const sorted=ds.slice().sort((a,b)=>big?b-a:a-b);if(!big&&sorted[0]===0){const i=sorted.findIndex(x=>x>0);[sorted[0],sorted[i]]=[sorted[i],sorted[0]];}const ans=+sorted.join('');
    return Qin(`Từ các chữ số ${ds.join(', ')}, viết số ${big?'lớn':'bé'} nhất có ${ds.length} chữ số khác nhau.`,ans,{sk:'so',hints:[big?'Chữ số lớn nhất đặt ở hàng cao nhất.':'Chữ số bé nhất (khác 0) đặt ở hàng cao nhất.','Lần lượt đặt các chữ số còn lại.'],explain:`Số ${big?'lớn':'bé'} nhất là ${fN(ans)}.`});}
  const base=R(Math.floor(mx/10),mx-1);const arr=new Set([base]);while(arr.size<4){const v=G>=3?+String(base).split('').map((c,i)=>i===R(0,String(base).length-1)?R(0,9):c).join(''):R(Math.max(0,base-20),Math.min(mx,base+20));if(v>0&&v<=mx)arr.add(v);}
  const L=[...arr];const big=Math.random()<.5;const ans=big?Math.max(...L):Math.min(...L);return Qmc(`Số ${big?'lớn':'bé'} nhất trong các số dưới đây là:`,fN(ans),L.map(fN),{sk:'so',hints:['So số chữ số trước.','Cùng số chữ số thì so từng hàng từ trái sang.'],explain:`Số ${big?'lớn':'bé'} nhất là ${fN(ans)}.`});};
MG.order=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=lv===2?5:4;const arr=new Set();while(arr.size<n){arr.add(R(G<=1?0:Math.floor(mx/10),mx));}const L=[...arr];const up=Math.random()<.5;const ans=L.slice().sort((a,b)=>up?a-b:b-a).map(fN);
  return Qord(`Xếp các số theo thứ tự từ ${up?'bé đến lớn':'lớn đến bé'}.`,ans,{sk:'so',hints:[up?'Tìm số bé nhất đặt trước.':'Tìm số lớn nhất đặt trước.','So sánh từng cặp số.'],explain:ans.join(up?' < ':' > ')});};
MG.round=function(G,lv,P){const units=P.units||(G===3?[10,100,1000]:[100,1000,10000,100000]);const u=RP(units);const n=R(u*2,Math.min(999999,u*1000))+R(1,u-1);const r=Math.round(n/u)*u;if(r>999999)return MG.round(G,lv,P);const nm={10:'chục',100:'trăm',1000:'nghìn',10000:'chục nghìn',100000:'trăm nghìn'}[u];
  return Qin(`Làm tròn số ${fN(n)} đến hàng ${nm}.`,r,{sk:'so',hints:[`Nhìn chữ số ngay bên phải hàng ${nm}.`,'Bé hơn 5 thì giữ nguyên, từ 5 trở lên thì tiến thêm 1.'],explain:expl(`Chữ số bên phải hàng ${nm} là ${Math.floor((n%u)/(u/10))}.`,`${fN(n)} làm tròn đến hàng ${nm} được ${fN(r)}.`)});};
const ROM=n=>{const T=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,c] of T)while(n>=v){s+=c;n-=v;}return s;};
MG.roman=function(G,lv,P){const n=R(1,lv===0?12:20);if(Math.random()<.5)return Qin(`Chữ số La Mã ${ROM(n)} là số mấy?`,n,{sk:'so',hints:['I = 1, V = 5, X = 10.','Chữ bé đứng trước chữ lớn thì trừ, đứng sau thì cộng.'],explain:`${ROM(n)} = ${n}.`});
  const w=new Set([ROM(n)]);[n+1,n-1,n+5,n-4,n+10].forEach(x=>{if(x>0&&x<=30&&w.size<4)w.add(ROM(x));});return Qmc(`Số ${n} viết bằng chữ số La Mã là:`,ROM(n),[...w],{sk:'so',hints:['I = 1, V = 5, X = 10.','Viết phần chục trước, rồi phần đơn vị.'],explain:`${n} = ${ROM(n)}.`});};
MG.evenOdd=function(G,lv,P){const mx=Math.min(lim(G,P),99999);if(lv===0){const ev=Math.random()<.5;const par=x=>(x%2===0)===ev;let ans=R(10,mx);if(!par(ans))ans=ans+1>mx?ans-1:ans+1;const others=new Set();while(others.size<3){let x=R(10,mx);if(par(x))x=x+1>mx?x-1:x+1;if(x!==ans)others.add(x);}
    return Qmc(`Số nào là số ${ev?'chẵn':'lẻ'}?`,fN(ans),[ans,...others].map(fN),{sk:'so',hints:['Chỉ cần nhìn chữ số tận cùng.','Tận cùng 0, 2, 4, 6, 8 là số chẵn; 1, 3, 5, 7, 9 là số lẻ.'],explain:`${fN(ans)} có chữ số tận cùng là ${ans%10} nên là số ${ev?'chẵn':'lẻ'}.`});}
  const a=R(1,200),b=a+R(5,40);const ev=Math.random()<.5;let c=0;for(let x=a;x<=b;x++)if((x%2===0)===ev)c++;return Qin(`Từ ${a} đến ${b} có bao nhiêu số ${ev?'chẵn':'lẻ'}?`,c,{sk:'so',hints:[`Tìm số ${ev?'chẵn':'lẻ'} đầu tiên và cuối cùng.`,'Hai số chẵn (lẻ) liền nhau cách nhau 2.'],explain:`Có ${c} số ${ev?'chẵn':'lẻ'}.`});};

/* -------- CỘNG, TRỪ -------- */
function pickAdd(G,P,lv){const mx=lim(G,P);const carry=P.carry||'any';for(let t=0;t<200;t++){let a,b;const dig=P.k||0;
    if(dig===1){a=R(10,Math.min(mx,99));b=R(1,9);}else if(P.small){a=R(0,mx);b=R(0,mx-a);}else{a=R(Math.floor(mx/10),mx-1);b=R(1,mx-a);}
    if(a+b>mx)continue;const c=hasCarry(a,b);if(carry==='none'&&c)continue;if(carry==='yes'&&!c)continue;return [a,b];}return [Math.floor(mx/4),Math.floor(mx/5)];}
function pickSub(G,P){const mx=lim(G,P);const carry=P.carry||'any';for(let t=0;t<200;t++){let a,b;if(P.k===1){a=R(10,Math.min(mx,99));b=R(1,9);}else if(P.small){a=R(0,mx);b=R(0,a);}else{a=R(Math.floor(mx/5),mx);b=R(1,a);}
    const c=hasBorrow(a,b);if(carry==='none'&&c)continue;if(carry==='yes'&&!c)continue;return [a,b];}return [Math.floor(mx/2),Math.floor(mx/5)];}
function hasCarry(a,b){while(a>0||b>0){if(a%10+b%10>=10)return true;a=Math.floor(a/10);b=Math.floor(b/10);}return false;}
function hasBorrow(a,b){while(b>0){if(a%10<b%10)return true;a=Math.floor(a/10);b=Math.floor(b/10);}return false;}
MG.addsub=function(G,lv,P){const opsL=P.ops||['+','−'];const op=RP(opsL);
  if(lv===2&&G>=1){const mx=lim(G,P);const a=R(1,Math.floor(mx/3)),b=R(1,Math.floor(mx/3));const c=R(1,Math.min(a+b,Math.floor(mx/3)));const o2=Math.random()<.5;const v=o2?a+b-c:a+b+c;if(v>mx||v<0)return MG.addsub(G,1,P);
    return Qin('Tính.',v,{big:`${fN(a)} + ${fN(b)} ${o2?'−':'+'} ${fN(c)} = ?`,sk:'congtru',hints:['Tính lần lượt từ trái sang phải.',`${fN(a)} + ${fN(b)} = ${fN(a+b)}`],explain:expl(`${fN(a)} + ${fN(b)} = ${fN(a+b)}`,`${fN(a+b)} ${o2?'−':'+'} ${fN(c)} = ${fN(v)}`)});}
  if(op==='+'){const [a,b]=pickAdd(G,P,lv);const col=lv===1&&G>=2&&a>=10&&b>=10;return Qin(col?'Đặt tính rồi tính.':'Tính.',a+b,{big:`${fN(a)} + ${fN(b)} = ?`,visual:col?colHTMLx(a,'+',b):'',sk:'congtru',hints:[G>=2?'Cộng từ hàng đơn vị, sang hàng chục…':'Đếm thêm từ số lớn hơn.',hasCarry(a,b)?'Hàng nào được 10 trở lên thì viết đơn vị, nhớ 1 sang hàng bên trái.':'Cộng từng hàng thẳng cột.'],explain:addSteps(a,b)});}
  const [a,b]=pickSub(G,P);const col=lv===1&&G>=2&&a>=10&&b>=10;return Qin(col?'Đặt tính rồi tính.':'Tính.',a-b,{big:`${fN(a)} − ${fN(b)} = ?`,visual:col?colHTMLx(a,'−',b):'',sk:'congtru',hints:[G>=2?'Trừ từ hàng đơn vị, sang hàng chục…':'Bớt đi rồi đếm số còn lại.',hasBorrow(a,b)?'Hàng nào không trừ được thì mượn 1 chục, rồi trả 1 vào hàng bên trái của số trừ.':'Trừ từng hàng thẳng cột.'],explain:subSteps(a,b)});};
function colHTMLx(a,op,b){const w=Math.max(String(a).length,String(b).length)+1;const pad=s=>String(s).padStart(w,' ');return `<div class="ht-col"><div>${pad(a)}</div><div><i>${op}</i>${pad(b).slice(1)}</div><div class="ln"></div></div>`;}
function addSteps(a,b){if(a<10&&b<10||a+b<20&&b<10&&a<20)return `${fN(a)} + ${fN(b)} = ${fN(a+b)}.`;const L=[];let x=a,y=b,c=0,pos=0;const H=['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn'];
  while(x>0||y>0||c){const s=x%10+y%10+c;if(x>0||y>0||c)L.push(`Hàng ${H[pos]}: ${x%10} + ${y%10}${c?' + 1 (nhớ)':''} = ${s}${s>=10?`, viết ${s%10} nhớ 1`:''}`);c=s>=10?1:0;x=Math.floor(x/10);y=Math.floor(y/10);pos++;if(pos>6)break;}
  return expl(...(L.length<=4?L:[]),`${fN(a)} + ${fN(b)} = ${fN(a+b)}.`);}
function subSteps(a,b){if(a<20&&b<10)return `${fN(a)} − ${fN(b)} = ${fN(a-b)}. Thử lại: ${fN(a-b)} + ${fN(b)} = ${fN(a)}.`;return expl(hasBorrow(a,b)?'Hàng nào không trừ được thì mượn 1 ở hàng bên trái.':'',`${fN(a)} − ${fN(b)} = ${fN(a-b)}.`,`Thử lại: ${fN(a-b)} + ${fN(b)} = ${fN(a)}.`);}
MG.missing=function(G,lv,P){const mx=lim(G,P);const mul=P.mulOnly||(P.mul&&Math.random()<.5);
  if(mul){const T=P.tables||[2,3,4,5,6,7,8,9];const a=RP(T),b=R(2,G<=2?5:10),c=a*b;const t=R(0,3);
    const forms=[[`? × ${a} = ${c}`,b,`Thừa số chưa biết = tích : thừa số kia: ${c} : ${a} = ${b}.`],[`${a} × ? = ${c}`,b,`${c} : ${a} = ${b}.`],[`? : ${a} = ${b}`,c,`Số bị chia = thương × số chia: ${b} × ${a} = ${c}.`],[`${c} : ? = ${b}`,a,`Số chia = số bị chia : thương: ${c} : ${b} = ${a}.`]][t];
    return Qin('Tìm số thích hợp.',forms[1],{big:forms[0],sk:'nhanchia',hints:['Dùng quan hệ giữa phép nhân và phép chia.',t<2?'Lấy tích chia cho thừa số đã biết.':t===2?'Lấy thương nhân với số chia.':'Lấy số bị chia chia cho thương.'],explain:forms[2]});}
  let a=R(1,Math.floor(mx/2)),b=R(1,Math.floor(mx/2));if(P.small){a=R(0,mx);b=R(0,mx-a);}const c=a+b;const t=R(0,3);
  const forms=[[`? + ${fN(b)} = ${fN(c)}`,a,`Số hạng = tổng − số hạng kia: ${fN(c)} − ${fN(b)} = ${fN(a)}.`,'Lấy tổng trừ số hạng đã biết.'],[`${fN(a)} + ? = ${fN(c)}`,b,`${fN(c)} − ${fN(a)} = ${fN(b)}.`,'Lấy tổng trừ số hạng đã biết.'],[`? − ${fN(b)} = ${fN(a)}`,c,`Số bị trừ = hiệu + số trừ: ${fN(a)} + ${fN(b)} = ${fN(c)}.`,'Lấy hiệu cộng số trừ.'],[`${fN(c)} − ? = ${fN(a)}`,b,`Số trừ = số bị trừ − hiệu: ${fN(c)} − ${fN(a)} = ${fN(b)}.`,'Lấy số bị trừ trừ hiệu.']][t];
  if(lv===2&&G>=2){const k=R(1,Math.floor(mx/4));const tt=R(0,1);if(tt===0){const v=a+b+k;return Qin('Tìm số thích hợp.',a,{big:`? + ${fN(b)} = ${fN(v)} − ${fN(k)}`,bigSmall:true,sk:'congtru',hints:['Tính vế phải trước.',`${fN(v)} − ${fN(k)} = ${fN(c)}`],explain:expl(`${fN(v)} − ${fN(k)} = ${fN(c)}`,`? = ${fN(c)} − ${fN(b)} = ${fN(a)}`)});}
    return Qin('Tìm số thích hợp.',c,{big:`? − ${fN(b)} = ${fN(a-k>=0?a-k:a)} + ${fN(a-k>=0?k:0)}`,bigSmall:true,sk:'congtru',hints:['Tính vế phải trước.','Số bị trừ = hiệu + số trừ.'],explain:expl(`Vế phải = ${fN(a)}`,`? = ${fN(a)} + ${fN(b)} = ${fN(c)}`)});}
  return Qin('Tìm số thích hợp.',forms[1],{big:forms[0],sk:'congtru',hints:['Nhớ tên các thành phần: số hạng, tổng, số bị trừ, số trừ, hiệu.',forms[3]],explain:forms[2]});};
/* điền số không cần tính (giữ nguyên tổng / hiệu / tích) */
MG.keep=function(G,lv,P){const mx=lim(G,P);const t=lv===2&&G>=3?RP(['mul+','mul−']):lv===0?'add':RP(['add','sub']);
  if(t==='add'){const a=R(Math.floor(mx/10),Math.floor(mx/2)),b=R(Math.floor(mx/10),Math.floor(mx/2)),k=R(1,Math.min(b-1,Math.max(1,Math.floor(mx/10))));if(b-k<=0)return MG.keep(G,lv,P);
    return Qin('Điền số thích hợp (không cần tính tổng).',b-k,{big:`${fN(a)} + ${fN(b)} = ${fN(a+k)} + ?`,bigSmall:true,sk:'congtru',hints:['Số hạng thứ nhất tăng thêm bao nhiêu?',`Số hạng thứ nhất tăng ${k} thì số hạng thứ hai phải giảm ${k} để tổng không đổi.`],explain:expl(`${fN(a+k)} hơn ${fN(a)} là ${k}.`,`Để tổng không đổi: ${fN(b)} − ${k} = ${fN(b-k)}.`)});}
  if(t==='sub'){const a=R(Math.floor(mx/3),mx-Math.floor(mx/10)),b=R(1,Math.floor(a/2)),k=R(1,Math.max(1,Math.floor(mx/10)));if(a+k>mx)return MG.keep(G,lv,P);
    return Qin('Điền số thích hợp (không cần tính hiệu).',b+k,{big:`${fN(a)} − ${fN(b)} = ${fN(a+k)} − ?`,bigSmall:true,sk:'congtru',hints:['Số bị trừ tăng thêm bao nhiêu?',`Số bị trừ tăng ${k} thì số trừ cũng phải tăng ${k} để hiệu không đổi.`],explain:expl(`${fN(a+k)} hơn ${fN(a)} là ${k}.`,`Để hiệu không đổi: ${fN(b)} + ${k} = ${fN(b+k)}.`)});}
  const a=RP(P.tables||[2,3,4,5,6,7,8,9]),b=R(2,9);const plus=t==='mul+';
  return Qin('Điền số thích hợp (không cần tính).',plus?b+1:b-1,{big:`${a} × ${b} ${plus?'+':'−'} ${a} = ${a} × ?`,sk:'nhanchia',hints:[`${a} × ${b} là ${b} lần ${a}.`,plus?`Thêm 1 lần ${a} nữa.`:`Bớt đi 1 lần ${a}.`],explain:`${a} × ${b} là ${b} lần ${a}; ${plus?'thêm':'bớt'} 1 lần ${a} được ${plus?b+1:b-1} lần ${a}: ${a} × ${plus?b+1:b-1}.`});};
MG.mental=function(G,lv,P){const u=P.round||(G<=1?10:G===2?100:1000);const n=lv===0?2:3;const xs=[];for(let i=0;i<n;i++)xs.push(R(1,9)*u);const plus=Math.random()<.5||xs[0]<xs[1];let v=plus?xs[0]+xs[1]:xs[0]-xs[1];if(n===3&&v+xs[2]>Math.max(lim(G,P),u*10))return MG.mental(G,lv,P);if(plus&&v>Math.max(lim(G,P),u*10))return MG.mental(G,lv,P);let big=`${fN(xs[0])} ${plus?'+':'−'} ${fN(xs[1])}`;
  if(n===3){v+=xs[2];big+=` + ${fN(xs[2])}`;}if(v<0)return MG.mental(G,lv,P);
  return Qin('Tính nhẩm.',v,{big:big+' = ?',sk:'congtru',hints:[`Đếm theo ${fN(u)}: coi mỗi ${fN(u)} là 1 đơn vị.`,`${xs[0]/u} ${plus?'+':'−'} ${xs[1]/u}${n===3?' + '+xs[2]/u:''}`],explain:`${xs.slice(0,n).map(x=>x/u+' '+({10:'chục',100:'trăm',1000:'nghìn'}[u]||'')).join(plus?' + ':' − ')} → ${fN(v)}.`});};
MG.expr=function(G,lv,P){const T=G>=4?[2,3,4,5,6,7,8,9,12,15,25]:[2,3,4,5,6,7,8,9];const t=lv===0?RP(['a+bc','a-bc']):lv===1?RP(['(a+b)c','(a-b):c','a:b+c']):RP(['a+bc-d','(a+b)c-d','abc']);
  for(let k=0;k<50;k++){let big,v,ex;const a=R(10,G>=4?999:99),b=R(2,9),c=RP(T),d=R(1,50);
    if(t==='a+bc'){v=a+b*c;big=`${a} + ${b} × ${c}`;ex=expl('Nhân trước, cộng sau.',`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${v}`);}
    else if(t==='a-bc'){if(a<b*c)continue;v=a-b*c;big=`${a} − ${b} × ${c}`;ex=expl('Nhân trước, trừ sau.',`${b} × ${c} = ${b*c}`,`${a} − ${b*c} = ${v}`);}
    else if(t==='(a+b)c'){const x=R(2,30),y=R(2,30);v=(x+y)*b;big=`(${x} + ${y}) × ${b}`;ex=expl('Trong ngoặc trước.',`${x} + ${y} = ${x+y}`,`${x+y} × ${b} = ${v}`);}
    else if(t==='(a-b):c'){const q=R(2,20);const y=R(1,40);const x=q*b+y;v=q;big=`(${x} − ${y}) : ${b}`;ex=expl('Trong ngoặc trước.',`${x} − ${y} = ${x-y}`,`${x-y} : ${b} = ${q}`);}
    else if(t==='a:b+c'){const q=R(2,20);v=q+d;big=`${q*b} : ${b} + ${d}`;ex=expl('Chia trước, cộng sau.',`${q*b} : ${b} = ${q}`,`${q} + ${d} = ${v}`);}
    else if(t==='a+bc-d'){if(a+b*c<d)continue;v=a+b*c-d;big=`${a} + ${b} × ${c} − ${d}`;ex=expl('Nhân trước.',`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${a+b*c}`,`${a+b*c} − ${d} = ${v}`);}
    else if(t==='(a+b)c-d'){const x=R(2,30),y=R(2,30);if((x+y)*b<d)continue;v=(x+y)*b-d;big=`(${x} + ${y}) × ${b} − ${d}`;ex=expl(`${x} + ${y} = ${x+y}`,`${x+y} × ${b} = ${(x+y)*b}`,`${(x+y)*b} − ${d} = ${v}`);}
    else{v=b*c*2;big=`${b} × ${c} × 2`;ex=expl(`${b} × ${c} = ${b*c}`,`${b*c} × 2 = ${v}`);}
    if(v<0||v>999999)continue;return Qin('Tính giá trị của biểu thức.',v,{big:big+' = ?',bigSmall:big.length>16,sk:'congtru',hints:['Trong ngoặc trước; nhân, chia trước; cộng, trừ sau.','Làm từng bước, viết kết quả từng bước ra giấy.'],explain:ex});}
  return MG.addsub(G,0,P);};
MG.quicksum=function(G,lv,P){if(G>=3&&lv===2)return TDG.quick(Math.max(3,G),2);if(G<=1)return Object.assign(TDG.quick(1,0),{sk:skOf('congtru')});return Object.assign(TDG.quick(G,lv),{sk:skOf('congtru')});};
MG.letter=function(G,lv,P){const a=R(2,50),b=R(2,9),c=R(1,99);const t=R(0,2);const big=[`a + b × c`,`(a + b) × c`,`a × b − c`][t];const v=[a+b*c,(a+b)*c,a*b-c][t];if(v<0)return MG.letter(G,lv,P);
  return Qin(`Tính giá trị của biểu thức ${big} với a = ${a}, b = ${b}, c = ${c}.`,v,{sk:'congtru',hints:['Thay số vào chữ.','Làm theo thứ tự: trong ngoặc, nhân chia, cộng trừ.'],explain:[`${a} + ${b} × ${c} = ${a} + ${b*c} = ${v}`,`(${a} + ${b}) × ${c} = ${a+b} × ${c} = ${v}`,`${a} × ${b} − ${c} = ${a*b} − ${c} = ${v}`][t]});};
/* ================= BỘ ĐỀ TOÁN MỚI — phần B: nhân, chia, toán có lời văn ================= */
MG.table=function(G,lv,P){const T=P.tables||[2,3,4,5,6,7,8,9];const a=RP(T),b=R(1,10);const t=P.noDiv?(lv===0?'mul':lv===1?RP(['mul2','missM','mul']):RP(['mix','miss2'])):lv===0?RP(['mul','div']):lv===1?RP(['miss','div','mul2']):RP(['mix','miss2']);
  if(t==='mul')return Qin('Tính.',a*b,{big:`${a} × ${b} = ?`,sk:'nhanchia',hints:[`Bảng nhân ${a}.`,`${a} × ${b} là ${b} lần ${a}.`],explain:b<=5?`${a} × ${b} = ${Array(b).fill(a).join(' + ')} = ${a*b}.`:`${a} × ${b} = ${a*b} (bảng nhân ${a}).`});
  if(t==='div')return Qin('Tính.',b,{big:`${a*b} : ${a} = ?`,sk:'nhanchia',hints:[`Nhớ lại bảng nhân ${a}.`,`${a} nhân mấy bằng ${a*b}?`],explain:`Vì ${a} × ${b} = ${a*b} nên ${a*b} : ${a} = ${b}.`});
  if(t==='mul2'){const k=R(2,5);if(G<=2)return Qin('Viết thành phép nhân rồi tính.',a*k,{big:`${Array(k).fill(a).join(' + ')} = ${a} × ${k} = ?`,bigSmall:true,sk:'nhanchia',hints:[`${a} được lấy ${k} lần.`,`${a} × ${k}`],explain:`${Array(k).fill(a).join(' + ')} = ${a} × ${k} = ${a*k}.`});
    return Qin('Tính.',a*b*k,{big:`${a} × ${b} × ${k} = ?`,sk:'nhanchia',hints:['Nhân lần lượt từ trái sang phải.',`${a} × ${b} = ${a*b}`],explain:expl(`${a} × ${b} = ${a*b}`,`${a*b} × ${k} = ${a*b*k}`)});}
  if(t==='missM'){const c=a*b;return Qin('Tìm số thích hợp.',b,{big:`${a} × ? = ${c}`,sk:'nhanchia',hints:[`Bảng nhân ${a}: ${a} nhân mấy bằng ${c}?`,''],explain:`${a} × ${b} = ${c}.`});}
  if(t==='miss')return MG.missing(G,lv,Object.assign({},P,{mulOnly:true,tables:T}));
  if(t==='miss2'){const c=R(1,a*2);return Qin('Tìm số thích hợp.',b,{big:`${a} × ? + ${c} = ${a*b+c}`,sk:'nhanchia',hints:[`Bớt ${c} ở vế phải trước.`,`${a} × ? = ${a*b}`],explain:expl(`${a*b+c} − ${c} = ${a*b}`,`${a*b} : ${a} = ${b}`)});}
  const c=R(1,20);const plus=Math.random()<.5||a*b<c;return Qin('Tính giá trị của biểu thức.',plus?a*b+c:a*b-c,{big:`${a} × ${b} ${plus?'+':'−'} ${c} = ?`,sk:'nhanchia',hints:['Nhân trước, cộng trừ sau.',`${a} × ${b} = ${a*b}`],explain:expl(`${a} × ${b} = ${a*b}`,`${a*b} ${plus?'+':'−'} ${c} = ${plus?a*b+c:a*b-c}`)});};
MG.mulBig=function(G,lv,P){const d2=P.d2||1;let a,b;if(d2===1){a=R(lv===0?11:101,G>=4?(lv===2?99999:9999):lv===2?9999:999);b=R(2,9);}else{a=R(lv===0?12:101,lv===2?999:99);b=R(11,99);}const v=a*b;if(v>999999)return MG.mulBig(G,lv,P);
  return Qin(lv===0?'Tính.':'Đặt tính rồi tính.',v,{big:`${fN(a)} × ${b} = ?`,visual:lv>=1?colHTMLx(a,'×',b):'',sk:'nhanchia',hints:[d2===1?'Nhân lần lượt từ hàng đơn vị, nhớ sang hàng tiếp theo.':'Nhân với chữ số hàng đơn vị, rồi hàng chục (viết lùi sang trái một cột), cuối cùng cộng lại.',`Ước lượng: khoảng ${fN(Math.round(a/Math.pow(10,String(a).length-1))*Math.pow(10,String(a).length-1)*b)}.`],explain:d2===1?`${fN(a)} × ${b} = ${fN(v)}.`:expl(`${fN(a)} × ${b%10} = ${fN(a*(b%10))}`,`${fN(a)} × ${Math.floor(b/10)*10} = ${fN(a*Math.floor(b/10)*10)}`,`${fN(a*(b%10))} + ${fN(a*Math.floor(b/10)*10)} = ${fN(v)}`)});};
MG.divBig=function(G,lv,P){const d2=P.d2||1;const b=d2===1?R(2,9):R(11,G>=4?99:50);const q=R(lv===0?11:101,d2===1?(lv===2?9999:999):(lv===2?999:99));const a=b*q;if(a>999999)return MG.divBig(G,lv,P);
  if(lv===2){const r=R(1,b-1);return Qsl(`Đặt tính rồi tính: ${fN(a+r)} : ${b}`,['Thương','Số dư'],[q,r],[q+1,r+1,b-r,Math.max(0,q-1)],{sk:'nhanchia',hints:['Chia lần lượt từ hàng cao nhất: chia, nhân, trừ, hạ.','Số dư phải bé hơn số chia.'],explain:expl(`${fN(a+r)} : ${b} = ${fN(q)} (dư ${r})`,`Thử lại: ${fN(q)} × ${b} + ${r} = ${fN(a+r)}`)});}
  return Qin(lv===0?'Tính.':'Đặt tính rồi tính.',q,{big:`${fN(a)} : ${b} = ?`,sk:'nhanchia',hints:['Chia lần lượt từ hàng cao nhất: chia, nhân, trừ, hạ.',`Thử lại bằng phép nhân: thương × ${b}.`],explain:expl(`${fN(a)} : ${b} = ${fN(q)}`,`Thử lại: ${fN(q)} × ${b} = ${fN(a)}`)});};
MG.divRem=function(G,lv,P){const b=R(lv===2?4:2,9),q=R(1,lv===0?9:lv===1?30:200),r=R(1,b-1),a=b*q+r;
  if(lv===0){return Qin(`Trong phép chia ${a} : ${b}, số dư là bao nhiêu?`,r,{sk:'nhanchia',hints:[`${b} nhân mấy gần ${a} nhất mà không vượt quá?`,`${b} × ${q} = ${b*q}`],explain:expl(`${a} : ${b} = ${q} (dư ${r})`,`vì ${b} × ${q} = ${b*q} và ${a} − ${b*q} = ${r}`)});}
  if(lv===2){return Qin(`Số dư lớn nhất có thể có trong phép chia cho ${b} là bao nhiêu?`,b-1,{sk:'nhanchia',hints:['Số dư luôn bé hơn số chia.',`Số lớn nhất bé hơn ${b}.`],explain:`Số dư bé hơn ${b} nên lớn nhất là ${b-1}.`});}
  return Qsl(`Thực hiện phép chia ${a} : ${b}.`,['Thương','Số dư'],[q,r],[q+1,r+1,b,Math.max(0,q-1)],{sk:'nhanchia',hints:['Tìm thương trước, rồi số dư.','Số dư bé hơn số chia.'],explain:expl(`${a} : ${b} = ${q} (dư ${r})`,`Thử lại: ${q} × ${b} + ${r} = ${a}`)});};
MG.times10=function(G,lv,P){const k=RP([10,100,1000]);const mul=Math.random()<.5;if(mul){const a=R(2,lv===2?999:99);return Qin('Tính nhẩm.',a*k,{big:`${a} × ${fN(k)} = ?`,sk:'nhanchia',hints:[`Nhân với ${fN(k)}: thêm ${String(k).length-1} chữ số 0 vào bên phải.`,''],explain:`${a} × ${fN(k)} = ${fN(a*k)}.`});}
  const a=R(2,lv===2?999:99)*k;return Qin('Tính nhẩm.',a/k,{big:`${fN(a)} : ${fN(k)} = ?`,sk:'nhanchia',hints:[`Chia cho ${fN(k)}: bỏ bớt ${String(k).length-1} chữ số 0 ở tận cùng.`,''],explain:`${fN(a)} : ${fN(k)} = ${fN(a/k)}.`});};
MG.mulProp=function(G,lv,P){const a=R(3,G>=4?99:9),b=R(11,89),c=(lv===2?100:10*Math.ceil(b/10))-b||10;const t=R(0,2);
  if(t===0)return Qin('Điền số thích hợp (không cần tính).',c,{big:`${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ?)`,bigSmall:true,sk:'nhanchia',hints:['Nhân một số với một tổng.','a × b + a × c = a × (b + c)'],explain:`${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}).`});
  if(t===1)return Qin('Tính bằng cách thuận tiện.',a*(b+c),{big:`${a} × ${b} + ${a} × ${c} = ?`,bigSmall:true,sk:'nhanchia',hints:[`Cùng nhân với ${a}.`,`${a} × (${b} + ${c})`],explain:`${a} × (${b} + ${c}) = ${a} × ${b+c} = ${fN(a*(b+c))}.`});
  const m=RP([[25,4],[5,2],[50,2],[125,8],[20,5]]);const k=R(3,19);return Qin('Tính bằng cách thuận tiện.',m[0]*m[1]*k,{big:`${m[0]} × ${k} × ${m[1]} = ?`,sk:'nhanchia',hints:['Đổi chỗ các thừa số để được số tròn.',`${m[0]} × ${m[1]} = ${m[0]*m[1]}`],explain:`(${m[0]} × ${m[1]}) × ${k} = ${m[0]*m[1]} × ${k} = ${fN(m[0]*m[1]*k)}.`});};
MG.gap=function(G,lv,P){const a=R(2,lv===2?50:12),k=R(2,9);const t=lv===0?RP(['up','down']):RP(['up','down','how','mixed']);
  if(t==='up')return Qin(`Gấp ${a} lên ${k} lần được bao nhiêu?`,a*k,{sk:'nhanchia',hints:['Gấp lên nhiều lần thì làm phép nhân.',`${a} × ${k}`],explain:`${a} × ${k} = ${a*k}.`});
  if(t==='down')return Qin(`Giảm ${a*k} đi ${k} lần được bao nhiêu?`,a,{sk:'nhanchia',hints:['Giảm đi nhiều lần thì làm phép chia.',`${a*k} : ${k}`],explain:`${a*k} : ${k} = ${a}.`});
  if(t==='how')return Qin(`Số ${a*k} gấp mấy lần số ${a}?`,k,{sk:'nhanchia',hints:['Lấy số lớn chia cho số bé.',`${a*k} : ${a}`],explain:`${a*k} : ${a} = ${k} (lần).`});
  const c=R(1,9);return Qin(`Gấp ${a} lên ${k} lần rồi thêm ${c} thì được bao nhiêu?`,a*k+c,{sk:'nhanchia',hints:['Gấp lên trước (nhân), rồi thêm (cộng).',`${a} × ${k} = ${a*k}`],explain:expl(`${a} × ${k} = ${a*k}`,`${a*k} + ${c} = ${a*k+c}`)});};
MG.partOf=function(G,lv,P){const n=R(2,9),q=R(2,lv===2?20:10);const N=n*q;const nm={2:'hai',3:'ba',4:'bốn',5:'năm',6:'sáu',7:'bảy',8:'tám',9:'chín'}[n];const t=thing();
  if(lv===2)return Qin(`Mẹ có ${N} ${t[0]}, mẹ cho em 1/${n} số ${t[0]} đó. Hỏi mẹ còn lại bao nhiêu ${t[0]}?`,N-q,{sk:'nhanchia',hints:[`1/${n} của ${N} là ${N} : ${n}.`,'Lấy số lúc đầu trừ phần đã cho.'],explain:expl(`1/${n} của ${N} là ${N} : ${n} = ${q}`,`Còn lại: ${N} − ${q} = ${N-q}`)});
  return Qin(`Tìm một phần ${nm} của ${N}.`,q,{big:`1/${n} của ${N} = ?`,sk:'nhanchia',hints:[`Chia ${N} thành ${n} phần bằng nhau.`,`${N} : ${n}`],explain:`1/${n} của ${N} là ${N} : ${n} = ${q}.`});};
MG.repAdd=function(G,lv,P){return MG.table(G,1,Object.assign({},P,{}));};

/* -------- TOÁN CÓ LỜI VĂN -------- */
const NMS=()=>names(2);
MG.wp1=function(G,lv,P){const mx=lim(G,P);const t=thing();const [A,B]=NMS();const kind=RP(['them','gop','bot','con']);const sub=kind==='bot'||kind==='con';
  const a=sub?R(G<=1?3:10,mx):R(G<=1?1:10,Math.max(2,mx-1)),b=sub?R(1,a-1):R(1,Math.max(1,mx-a));if(b<1||(!sub&&a+b>mx))return MG.wp1(G,lv,P);
  if(kind==='them')return Qin(`${A} có ${fN(a)} ${t[0]}, ${B} cho ${A} thêm ${fN(b)} ${t[0]}. Hỏi ${A} có tất cả bao nhiêu ${t[0]}?`,a+b,{sk:'giaitoan',hints:['Được cho thêm thì số lượng tăng lên.','Làm phép cộng.'],explain:expl(`${A} có tất cả: ${fN(a)} + ${fN(b)} = ${fN(a+b)} (${t[1]})`)});
  if(kind==='gop')return Qin(`Rổ thứ nhất có ${fN(a)} ${t[0]}, rổ thứ hai có ${fN(b)} ${t[0]}. Cả hai rổ có bao nhiêu ${t[0]}?`,a+b,{sk:'giaitoan',hints:['Gộp hai rổ lại.','Làm phép cộng.'],explain:`Cả hai rổ: ${fN(a)} + ${fN(b)} = ${fN(a+b)} (${t[1]}).`});
  if(kind==='bot')return Qin(`${A} có ${fN(a)} ${t[0]}, ${A} cho bạn ${fN(b)} ${t[0]}. Hỏi ${A} còn lại bao nhiêu ${t[0]}?`,a-b,{sk:'giaitoan',hints:['Cho đi thì số lượng giảm.','Làm phép trừ.'],explain:`${A} còn lại: ${fN(a)} − ${fN(b)} = ${fN(a-b)} (${t[1]}).`});
  return Qin(`Cửa hàng có ${fN(a)} ${t[0]}, đã bán ${fN(b)} ${t[0]}. Hỏi cửa hàng còn lại bao nhiêu ${t[0]}?`,a-b,{sk:'giaitoan',hints:['Đã bán đi thì còn lại ít hơn.','Làm phép trừ.'],explain:`Còn lại: ${fN(a)} − ${fN(b)} = ${fN(a-b)} (${t[1]}).`});};
MG.wpMore=function(G,lv,P){const mx=lim(G,P);const t=thing();const [A,B]=NMS();const a=R(G<=1?3:10,Math.floor(mx/2)),d=R(1,Math.max(2,Math.min(a-1,Math.floor(mx/4))));const kind=lv===0?RP(['more','less']):RP(['more','less','diff','diff']);
  if(kind==='more')return Qin(`${A} có ${fN(a)} ${t[0]}. ${B} có nhiều hơn ${A} ${fN(d)} ${t[0]}. Hỏi ${B} có bao nhiêu ${t[0]}?`,a+d,{sk:'giaitoan',hints:[`${B} có nhiều hơn nên lấy số của ${A} cộng thêm.`,`${fN(a)} + ${fN(d)}`],explain:`${B} có: ${fN(a)} + ${fN(d)} = ${fN(a+d)} (${t[1]}).`});
  if(kind==='less')return Qin(`${A} có ${fN(a)} ${t[0]}. ${B} có ít hơn ${A} ${fN(d)} ${t[0]}. Hỏi ${B} có bao nhiêu ${t[0]}?`,a-d,{sk:'giaitoan',hints:[`${B} có ít hơn nên lấy số của ${A} trừ đi.`,`${fN(a)} − ${fN(d)}`],explain:`${B} có: ${fN(a)} − ${fN(d)} = ${fN(a-d)} (${t[1]}).`});
  const b=a-d;return Qin(`${A} có ${fN(a)} ${t[0]}, ${B} có ${fN(b)} ${t[0]}. Hỏi ${A} có nhiều hơn ${B} bao nhiêu ${t[0]}?`,d,{sk:'giaitoan',hints:['Muốn biết nhiều hơn bao nhiêu, lấy số lớn trừ số bé.',`${fN(a)} − ${fN(b)}`],explain:`${fN(a)} − ${fN(b)} = ${fN(d)} (${t[1]}).`});};
MG.wp2=function(G,lv,P){const mx=lim(G,P);const t=thing();const a=R(10,Math.floor(mx/3)),d=R(2,Math.floor(mx/5));const kind=RP(lv===2&&G>=3?['buygive','threestep']:['moreTot','lessTot','sellLeft']);
  if(kind==='moreTot')return Qin(`Buổi sáng bán được ${fN(a)} ${t[0]}, buổi chiều bán được nhiều hơn buổi sáng ${fN(d)} ${t[0]}. Hỏi cả hai buổi bán được bao nhiêu ${t[0]}?`,2*a+d,{sk:'giaitoan',hints:['Muốn biết cả hai buổi, phải biết buổi chiều bán bao nhiêu trước.',`Buổi chiều: ${fN(a)} + ${fN(d)}.`],explain:expl(`Buổi chiều: ${fN(a)} + ${fN(d)} = ${fN(a+d)} (${t[1]})`,`Cả hai buổi: ${fN(a)} + ${fN(a+d)} = ${fN(2*a+d)} (${t[1]})`)});
  if(kind==='lessTot'){if(d>=a)return MG.wp2(G,lv,P);return Qin(`Thùng thứ nhất có ${fN(a)} ${t[0]}, thùng thứ hai có ít hơn thùng thứ nhất ${fN(d)} ${t[0]}. Hỏi cả hai thùng có bao nhiêu ${t[0]}?`,2*a-d,{sk:'giaitoan',hints:['Tìm số trong thùng thứ hai trước.',`Thùng thứ hai: ${fN(a)} − ${fN(d)}.`],explain:expl(`Thùng thứ hai: ${fN(a)} − ${fN(d)} = ${fN(a-d)} (${t[1]})`,`Cả hai thùng: ${fN(a)} + ${fN(a-d)} = ${fN(2*a-d)} (${t[1]})`)});}
  if(kind==='sellLeft'){const b=R(1,Math.floor(a/2)),c=R(1,Math.floor(a/2));if(b+c>=a)return MG.wp2(G,lv,P);return Qin(`Một cửa hàng có ${fN(a)} ${t[0]}. Buổi sáng bán ${fN(b)} ${t[0]}, buổi chiều bán ${fN(c)} ${t[0]}. Hỏi cửa hàng còn lại bao nhiêu ${t[0]}?`,a-b-c,{sk:'giaitoan',hints:['Tính số đã bán cả ngày trước, hoặc trừ lần lượt.',`${fN(b)} + ${fN(c)} = ${fN(b+c)}`],explain:expl(`Cả ngày bán: ${fN(b)} + ${fN(c)} = ${fN(b+c)} (${t[1]})`,`Còn lại: ${fN(a)} − ${fN(b+c)} = ${fN(a-b-c)} (${t[1]})`)});}
  if(kind==='buygive'){const n=R(3,9),k=R(4,12),g=R(2,n*k-1);return Qin(`Mẹ mua ${n} hộp bánh, mỗi hộp có ${k} chiếc. Mẹ biếu bà ${g} chiếc. Hỏi mẹ còn lại bao nhiêu chiếc bánh?`,n*k-g,{sk:'giaitoan',hints:['Tính số bánh mẹ mua trước (phép nhân).',`${n} × ${k} = ${n*k}`],explain:expl(`Mẹ mua: ${n} × ${k} = ${n*k} (chiếc)`,`Còn lại: ${n*k} − ${g} = ${n*k-g} (chiếc)`)});}
  const n=R(3,8),p=R(2,9)*1000,m=R(1,4)*10000+p*n;return Qin(`An mua ${n} quyển vở, mỗi quyển giá ${fN(p)} đồng. An đưa cô bán hàng ${fN(m)} đồng. Hỏi cô trả lại An bao nhiêu tiền?`,m-n*p,{unit:'đồng',sk:'giaitoan',hints:['Tính số tiền mua vở trước.',`${n} × ${fN(p)} = ${fN(n*p)}`],explain:expl(`Tiền mua vở: ${n} × ${fN(p)} = ${fN(n*p)} (đồng)`,`Trả lại: ${fN(m)} − ${fN(n*p)} = ${fN(m-n*p)} (đồng)`)});};
MG.wpMul=function(G,lv,P){const T=P.tables||[2,3,4,5,6,7,8,9];const k=RP(T),n=R(2,G<=2?5:10);const ctx=RP([['hộp','cái bút','cái'],['đĩa','quả cam','quả'],['túi','cái kẹo','cái'],['hàng','bạn','bạn'],['bàn','học sinh','học sinh'],['chuồng','con thỏ','con']]);const kind=lv===0?'mul':RP(['mul','div','group']);
  if(kind==='mul')return Qin(`Mỗi ${ctx[0]} có ${k} ${ctx[1]}. Hỏi ${n} ${ctx[0]} như thế có bao nhiêu ${ctx[1]}?`,k*n,{sk:'giaitoan',hints:[`${k} ${ctx[1]} được lấy ${n} lần.`,`${k} × ${n}`],explain:`${k} × ${n} = ${k*n} (${ctx[2]}).`});
  if(kind==='div')return Qin(`Có ${k*n} ${ctx[1]} chia đều vào ${n} ${ctx[0]}. Hỏi mỗi ${ctx[0]} có bao nhiêu ${ctx[1]}?`,k,{sk:'giaitoan',hints:['Chia đều thì làm phép chia.',`${k*n} : ${n}`],explain:`${k*n} : ${n} = ${k} (${ctx[2]}).`});
  if(lv===2){const r=R(1,k-1);const N=k*n+r;return Qin(`Có ${N} ${ctx[1]}, xếp vào các ${ctx[0]}, mỗi ${ctx[0]} ${k} ${ctx[1]}. Cần ít nhất bao nhiêu ${ctx[0]} để xếp hết?`,n+1,{sk:'giaitoan',hints:[`${N} : ${k} được bao nhiêu, dư bao nhiêu?`,`Còn dư thì cần thêm 1 ${ctx[0]} nữa.`],explain:expl(`${N} : ${k} = ${n} (dư ${r})`,`Còn ${r} ${ctx[1]} nên cần thêm 1 ${ctx[0]}: ${n} + 1 = ${n+1}.`)});}
  return Qin(`Có ${k*n} ${ctx[1]}, xếp mỗi ${ctx[0]} ${k} ${ctx[1]}. Hỏi xếp được mấy ${ctx[0]}?`,n,{sk:'giaitoan',hints:[`Mỗi ${ctx[0]} ${k} ${ctx[1]}: chia thành nhóm ${k}.`,`${k*n} : ${k}`],explain:`${k*n} : ${k} = ${n} (${ctx[0]}).`});};
MG.wpUnit=function(G,lv,P){const n=R(2,9),u=R(3,G>=4?120:30),m=R(2,12);const ctx=RP([['thùng','lít dầu','l'],['bao','ki-lô-gam gạo','kg'],['hộp','cái bánh','cái'],['xe','bao xi măng','bao']]);
  if(lv===2&&G>=4){const tot=u*m;return Qin(`${n} ${ctx[0]} như nhau chứa ${fN(n*u)} ${ctx[1]}. Hỏi ${fN(tot)} ${ctx[1]} thì cần bao nhiêu ${ctx[0]} như thế?`,m,{sk:'giaitoan',hints:[`Tìm 1 ${ctx[0]} chứa bao nhiêu.`,`${fN(n*u)} : ${n} = ${u}`],explain:expl(`1 ${ctx[0]}: ${fN(n*u)} : ${n} = ${u} (${ctx[2]})`,`Số ${ctx[0]}: ${fN(tot)} : ${u} = ${m}`)});}
  return Qin(`${n} ${ctx[0]} như nhau chứa ${fN(n*u)} ${ctx[1]}. Hỏi ${m} ${ctx[0]} như thế chứa bao nhiêu ${ctx[1]}?`,u*m,{sk:'giaitoan',hints:[`Bước 1: tìm 1 ${ctx[0]} chứa bao nhiêu (chia).`,`Bước 2: nhân với ${m}.`],explain:expl(`1 ${ctx[0]}: ${fN(n*u)} : ${n} = ${u} (${ctx[2]})`,`${m} ${ctx[0]}: ${u} × ${m} = ${fN(u*m)} (${ctx[2]})`)});};
MG.wpAvg=function(G,lv,P){const n=lv===0?3:R(3,5);const avg=R(10,G>=5?500:200);const xs=[];let s=0;for(let i=0;i<n-1;i++){const x=avg+R(-9,9)*(G>=5?5:1);xs.push(x);s+=x;}const last=avg*n-s;if(last<=0)return MG.wpAvg(G,lv,P);xs.push(last);
  if(lv===2)return Qin(`Trung bình cộng của ${n} số là ${avg}. Biết ${n-1} số đầu là ${xs.slice(0,-1).join(', ')}. Tìm số còn lại.`,last,{sk:'giaitoan',hints:['Tổng các số = trung bình cộng × số các số.',`Tổng = ${avg} × ${n} = ${avg*n}`],explain:expl(`Tổng: ${avg} × ${n} = ${avg*n}`,`Số còn lại: ${avg*n} − ${s} = ${last}`)});
  return Qin(`Tìm số trung bình cộng của các số: ${xs.join(', ')}.`,avg,{sk:'giaitoan',hints:['Cộng tất cả các số lại.',`Rồi chia cho ${n}.`],explain:expl(`Tổng: ${xs.join(' + ')} = ${avg*n}`,`Trung bình cộng: ${avg*n} : ${n} = ${avg}`)});};
MG.wpSumDiff=function(G,lv,P){const q=TDG.sumdiff(Math.max(3,G),lv===2?2:0);q.sk='giaitoan';return q;};
MG.wpRatio=function(G,lv,P){const k=R(2,G>=5?7:5),each=R(3,G>=5?300:80);const [A,B]=NMS();const t=thing();
  if(P.kind?P.kind==='sum':Math.random()<.5){const S=(k+1)*each;return Qin(`Tổng số ${t[0]} của ${A} và ${B} là ${fN(S)}. Số ${t[0]} của ${B} bằng 1/${k} số ${t[0]} của ${A}. Hỏi ${A} có bao nhiêu ${t[0]}?`,k*each,{visual:tapeSVG([{n:B,parts:1},{n:A,parts:k}],fN(S)),sk:'giaitoan',hints:[`${B} 1 phần, ${A} ${k} phần, tổng ${k+1} phần.`,`Mỗi phần: ${fN(S)} : ${k+1}.`],explain:expl(`Tổng số phần: 1 + ${k} = ${k+1}`,`Mỗi phần: ${fN(S)} : ${k+1} = ${fN(each)}`,`${A}: ${fN(each)} × ${k} = ${fN(k*each)} (${t[1]})`)});}
  const D=(k-1)*each;return Qin(`${A} có nhiều hơn ${B} ${fN(D)} ${t[0]}. Số ${t[0]} của ${A} gấp ${k} lần số ${t[0]} của ${B}. Hỏi ${B} có bao nhiêu ${t[0]}?`,each,{visual:tapeSVG([{n:B,parts:1},{n:A,parts:k}],''),sk:'giaitoan',hints:[`Hiệu số phần: ${k} − 1 = ${k-1}.`,`Mỗi phần: ${fN(D)} : ${k-1}.`],explain:expl(`Hiệu số phần: ${k} − 1 = ${k-1}`,`${B}: ${fN(D)} : ${k-1} = ${fN(each)} (${t[1]})`)});};
MG.wp3=function(G,lv,P){const n=R(3,9),p=R(5,30)*1000,m=R(2,5),q=R(2,9)*1000;const tot=n*p+m*q;return Qin(`Mẹ mua ${n} kg táo, mỗi ki-lô-gam giá ${fN(p)} đồng và ${m} kg cam, mỗi ki-lô-gam giá ${fN(q)} đồng. Hỏi mẹ phải trả tất cả bao nhiêu tiền?`,tot,{unit:'đồng',sk:'giaitoan',hints:['Tính tiền táo, tiền cam riêng rồi cộng lại.',`Tiền táo: ${n} × ${fN(p)}.`],explain:expl(`Tiền táo: ${n} × ${fN(p)} = ${fN(n*p)} (đồng)`,`Tiền cam: ${m} × ${fN(q)} = ${fN(m*q)} (đồng)`,`Tất cả: ${fN(n*p)} + ${fN(m*q)} = ${fN(tot)} (đồng)`)});};
/* ================= BỘ ĐỀ TOÁN MỚI — phần C: đo lường, thời gian, tiền, hình học, thống kê ================= */
/* đổi đơn vị: bảng [tên, hệ số so với đơn vị nhỏ nhất] */
const UNITS={len:[['mm',1],['cm',10],['dm',100],['m',1000],['km',1000000]],mass:[['g',1],['kg',1000],['yến',10000],['tạ',100000],['tấn',1000000]],vol:[['ml',1],['l',1000]],
  area:[['mm²',1],['cm²',100],['dm²',10000],['m²',1000000]],area5:[['m²',1],['dam²',100],['ha',10000],['km²',1000000]],time:[['giây',1],['phút',60],['giờ',3600],['ngày',86400]]};
function convPair(kind,allow){const U=UNITS[kind].filter(u=>!allow||allow.includes(u[0]));for(let t=0;t<50;t++){const a=RP(U),b=RP(U);if(a===b)continue;const big=a[1]>b[1]?a:b,sm=a[1]>b[1]?b:a;const ratio=big[1]/sm[1];if(ratio>100000)continue;return [big,sm,ratio];}return [U[1],U[0],U[1][1]/U[0][1]];}
MG.conv=function(G,lv,P){const kind=P.kind||'len';const [big,sm,ratio]=convPair(kind,P.units);const n=R(2,lv===0?9:lv===1?99:20);
  if(lv===0)return Qin('Điền số thích hợp vào ô trống.',n*ratio,{big:`${n} ${big[0]} = ? ${sm[0]}`,sk:'doluong',hints:[`1 ${big[0]} = ${fN(ratio)} ${sm[0]}.`,`${n} × ${fN(ratio)}`],explain:`1 ${big[0]} = ${fN(ratio)} ${sm[0]} nên ${n} ${big[0]} = ${fN(n*ratio)} ${sm[0]}.`});
  if(lv===1){if(Math.random()<.5)return Qin('Điền số thích hợp vào ô trống.',n,{big:`${fN(n*ratio)} ${sm[0]} = ? ${big[0]}`,sk:'doluong',hints:[`1 ${big[0]} = ${fN(ratio)} ${sm[0]}.`,`${fN(n*ratio)} : ${fN(ratio)}`],explain:`${fN(n*ratio)} ${sm[0]} = ${n} ${big[0]} (vì 1 ${big[0]} = ${fN(ratio)} ${sm[0]}).`});
    const m=R(1,ratio-1);if(ratio>1000||ratio<2)return MG.conv(G,0,P);return Qin('Điền số thích hợp vào ô trống.',n*ratio+m,{big:`${n} ${big[0]} ${fN(m)} ${sm[0]} = ? ${sm[0]}`,sk:'doluong',hints:[`Đổi ${n} ${big[0]} ra ${sm[0]} trước.`,`${n} ${big[0]} = ${fN(n*ratio)} ${sm[0]}`],explain:`${n} ${big[0]} = ${fN(n*ratio)} ${sm[0]}; ${fN(n*ratio)} + ${fN(m)} = ${fN(n*ratio+m)} ${sm[0]}.`});}
  const a=n*ratio+R(-ratio+1,ratio-1),b=n;return Qsign('Chọn dấu thích hợp điền vào ô trống.',`${fN(a)} ${sm[0]} ☐ ${b} ${big[0]}`,a,b*ratio,{sk:'doluong',hints:['Đổi về cùng một đơn vị rồi so sánh.',`${b} ${big[0]} = ${fN(b*ratio)} ${sm[0]}`],explain:`${b} ${big[0]} = ${fN(b*ratio)} ${sm[0]}, mà ${fN(a)} ${sgn(a,b*ratio)} ${fN(b*ratio)}.`});};
MG.measOp=function(G,lv,P){const u=P.unit||RP(G<=1?['cm']:G===2?['cm','kg','l','dm','m']:['mm','cm','m','g','kg','ml','l']);const mx=G<=1?99:G===2?100:1000;const a=R(5,mx-10),b=R(1,Math.min(a-1,mx-a));const plus=Math.random()<.5;
  if(lv===2){const t=thing();const ctx={cm:['Sợi dây thứ nhất dài','sợi dây thứ hai','dài','sợi dây'],dm:['Tấm vải xanh dài','tấm vải đỏ','dài','tấm vải'],m:['Cuộn dây thứ nhất dài','cuộn dây thứ hai','dài','cuộn dây'],kg:['Bao gạo thứ nhất nặng','bao gạo thứ hai','nặng','bao'],g:['Gói kẹo thứ nhất nặng','gói kẹo thứ hai','nặng','gói'],l:['Can thứ nhất đựng','can thứ hai','đựng','can'],ml:['Chai thứ nhất đựng','chai thứ hai','đựng','chai'],mm:['Đoạn thẳng AB dài','đoạn thẳng CD','dài','đoạn']}[u];
    return Qin(`${ctx[0]} ${a} ${u}, ${ctx[1]} ${ctx[2]} hơn ${b} ${u}. Hỏi cả hai ${ctx[3]} ${ctx[2]} bao nhiêu ${u}?`,2*a+b,{unit:u,sk:'doluong',hints:[`Tìm ${ctx[1]} trước: ${a} + ${b}.`,'Rồi cộng cả hai.'],explain:expl(`${cap(ctx[1])}: ${a} + ${b} = ${a+b} (${u})`,`Cả hai: ${a} + ${a+b} = ${2*a+b} (${u})`)});}
  return Qin('Tính.',plus?a+b:a-b,{big:`${a} ${u} ${plus?'+':'−'} ${b} ${u} = ? ${u}`,sk:'doluong',hints:['Tính như số thường, rồi viết đơn vị.',`${a} ${plus?'+':'−'} ${b}`],explain:`${a} ${plus?'+':'−'} ${b} = ${plus?a+b:a-b}, viết kèm đơn vị: ${plus?a+b:a-b} ${u}.`});};
/* đồng hồ */
function clkSVG(h,m){const cx=70,cy=70,R0=60;let b=`<circle cx="${cx}" cy="${cy}" r="${R0}" fill="#fff" stroke="#1E3A8A" stroke-width="5"/>`;
  for(let i=1;i<=12;i++){const a=i*Math.PI/6;b+=`<text x="${cx+Math.sin(a)*47}" y="${cy-Math.cos(a)*47+5}" text-anchor="middle" font-size="14" font-weight="800" fill="#1E293B">${i}</text>`;}
  for(let i=0;i<60;i++){if(i%5)continue;const a=i*Math.PI/30;b+=`<line x1="${cx+Math.sin(a)*56}" y1="${cy-Math.cos(a)*56}" x2="${cx+Math.sin(a)*52}" y2="${cy-Math.cos(a)*52}" stroke="#94A3B8" stroke-width="2"/>`;}
  const ha=((h%12)+m/60)*Math.PI/6,ma=m*Math.PI/30;b+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(ha)*28}" y2="${cy-Math.cos(ha)*28}" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${cx+Math.sin(ma)*44}" y2="${cy-Math.cos(ma)*44}" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="#1E293B"/>`;
  return SVGW(140,140,b,'Đồng hồ');}
const tStr=(h,m)=>m===0?`${h} giờ`:`${h} giờ ${m} phút`;
MG.clock=function(G,lv,P){const step=G<=1?60:G===2?(lv?15:30):G===3?5:1;const h=R(1,12);const m=step===60?0:R(0,59/step|0)*step%60;
  if(lv===2&&G>=2){const add=G===2?RP([30,60,15]):RP([15,20,25,30,35,40,45,50,90]);const t=h*60+m+add;const h2=Math.floor(t/60)%12||12,m2=t%60;const opts=new Set([tStr(h2,m2)]);[[h2,(m2+5)%60],[h2%12+1,m2],[h,m],[h2,(m2+55)%60]].forEach(([a,b])=>opts.add(tStr(a,b)));
    return Qmc(`Đồng hồ đang chỉ mấy giờ? Sau ${add>=60?Math.floor(add/60)+' giờ'+(add%60?' '+add%60+' phút':''):add+' phút'} nữa là mấy giờ?`,tStr(h2,m2),[...opts].slice(0,4),{visual:clkSVG(h,m),sk:'doluong',hints:[`Đọc giờ trên đồng hồ: kim ngắn chỉ giờ, kim dài chỉ phút.`,`Bây giờ là ${tStr(h,m)}.`],explain:expl(`Đồng hồ chỉ ${tStr(h,m)}.`,`Thêm ${add} phút được ${tStr(h2,m2)}.`)});}
  const opts=new Set([tStr(h,m)]);const cands=[[h%12+1,m],[h===1?12:h-1,m],[m/5||12,h*5%60],[h,(m+step)%60],[h,(m+30)%60]];cands.forEach(([a,b])=>{if(opts.size<4&&a>=1&&a<=12)opts.add(tStr(a,b));});while(opts.size<4)opts.add(tStr(R(1,12),m));
  return Qmc('Đồng hồ chỉ mấy giờ?',tStr(h,m),[...opts],{visual:clkSVG(h,m),sk:'doluong',hints:['Kim ngắn chỉ giờ, kim dài chỉ phút.','Mỗi số trên mặt đồng hồ ứng với 5 phút của kim dài.'],explain:m===0?`Kim dài chỉ số 12, kim ngắn chỉ số ${h}: ${h} giờ.`:`Kim ngắn ở giữa số ${h} và ${h%12+1}, kim dài chỉ ${m} phút: ${tStr(h,m)}.`});};
MG.timeConv=function(G,lv,P){const t=G<=2?RP(['h-m','d-h','w-d']):G===3?RP(['h-m','m-s','d-h','y-m']):RP(['m-s','h-m','c-y','h-m2','m-s2']);const n=R(2,lv?9:5);
  const D={'h-m':['giờ','phút',60],'d-h':['ngày','giờ',24],'w-d':['tuần','ngày',7],'m-s':['phút','giây',60],'y-m':['năm','tháng',12],'c-y':['thế kỉ','năm',100]};
  if(t==='h-m2'||t==='m-s2'){const [A,B,k]=t==='h-m2'?['giờ','phút',60]:['phút','giây',60];const m=R(5,55);return Qin('Điền số thích hợp vào ô trống.',n*k+m,{big:`${n} ${A} ${m} ${B} = ? ${B}`,sk:'doluong',hints:[`1 ${A} = ${k} ${B}.`,`${n} × ${k} + ${m}`],explain:`${n} ${A} = ${n*k} ${B}; ${n*k} + ${m} = ${n*k+m} ${B}.`});}
  const [A,B,k]=D[t];if(lv===1&&Math.random()<.5)return Qin('Điền số thích hợp vào ô trống.',n,{big:`${n*k} ${B} = ? ${A}`,sk:'doluong',hints:[`1 ${A} = ${k} ${B}.`,`${n*k} : ${k}`],explain:`${n*k} ${B} = ${n} ${A}.`});
  return Qin('Điền số thích hợp vào ô trống.',n*k,{big:`${n} ${A} = ? ${B}`,sk:'doluong',hints:[`1 ${A} = ${k} ${B}.`,`${n} × ${k}`],explain:`1 ${A} = ${k} ${B} nên ${n} ${A} = ${n*k} ${B}.`});};
const MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
MG.calendar=function(G,lv,P){const t=G<=1?RP(['next','after']):RP(['after','month','date','after2']);const d0=R(0,6);
  if(t==='next'){const next=Math.random()<.5;const ans=WD[(d0+(next?1:6))%7];return Qmc(`Hôm nay là ${WD[d0]}. ${next?'Ngày mai':'Hôm qua'} là thứ mấy?`,cap(ans),shuffle([cap(ans),cap(WD[(d0+3)%7]),cap(WD[d0]),cap(WD[(d0+(next?6:1))%7])]),{sk:'doluong',hints:['Thứ tự: thứ Hai, thứ Ba, thứ Tư, thứ Năm, thứ Sáu, thứ Bảy, Chủ nhật.',next?'Ngày mai là ngày ngay sau hôm nay.':'Hôm qua là ngày ngay trước hôm nay.'],explain:`${next?'Ngày mai':'Hôm qua'} là ${ans}.`});}
  if(t==='month'){const mo=R(1,12);return Qin(`Tháng ${mo} có bao nhiêu ngày? (năm không nhuận)`,MDAYS[mo-1],{sk:'doluong',hints:['Đếm trên các khớp ngón tay: khớp nhô lên là tháng 31 ngày.','Tháng 2 có 28 hoặc 29 ngày.'],explain:`Tháng ${mo} có ${MDAYS[mo-1]} ngày.`});}
  if(t==='date'){const mo=R(1,12),dd=R(1,MDAYS[mo-1]-7);const k=RP([7,14]);return Qin(`Hôm nay là ngày ${dd} tháng ${mo}. ${k===7?'Một tuần':'Hai tuần'} sau là ngày bao nhiêu của tháng ${mo}?`,dd+k,{sk:'doluong',hints:[`1 tuần có 7 ngày.`,`${dd} + ${k}`],explain:`${dd} + ${k} = ${dd+k}: ngày ${dd+k} tháng ${mo}.`});}
  const n=t==='after2'?R(8,40):R(2,G<=1?6:13);const ans=WD[(d0+n)%7];return Qmc(`Hôm nay là ${WD[d0]}. ${n} ngày nữa là thứ mấy?`,cap(ans),shuffle([cap(ans)].concat(shuffle(WD.filter(x=>x!==ans)).slice(0,3).map(cap))),{sk:'doluong',hints:['Cứ 7 ngày lại quay về cùng một thứ.',n>=7?`${n} : 7 dư ${n%7}.`:`Đếm thêm ${n} ngày.`],explain:`${cap(WD[d0])} thêm ${n} ngày là ${ans}.`});};
MG.money=function(G,lv,P){const notes=G<=2?[1000,2000,5000,10000]:[1000,2000,5000,10000,20000,50000];
  if(lv===0){const k=R(2,3);const ns=[];for(let i=0;i<k;i++)ns.push(RP(notes));const s=ns.reduce((a,b)=>a+b,0);return Qin(`Có các tờ tiền: ${ns.map(x=>fN(x)+' đồng').join(', ')}. Có tất cả bao nhiêu tiền?`,s,{unit:'đồng',sk:'doluong',hints:['Cộng giá trị các tờ tiền lại.','Cộng tờ lớn trước.'],explain:`${ns.map(fN).join(' + ')} = ${fN(s)} (đồng).`});}
  const price=R(2,G<=2?9:49)*1000,pay=Math.ceil((price+1)/10000)*10000+(G>=3&&lv===2?10000:0);return Qin(`Mua một món đồ giá ${fN(price)} đồng, đưa người bán ${fN(pay)} đồng. Người bán trả lại bao nhiêu tiền?`,pay-price,{unit:'đồng',sk:'doluong',hints:['Tiền trả lại = tiền đưa − giá tiền.',`${fN(pay)} − ${fN(price)}`],explain:`${fN(pay)} − ${fN(price)} = ${fN(pay-price)} (đồng).`});};
MG.temp=function(G,lv,P){const a=R(15,35),d=R(2,10);const up=Math.random()<.5;return Qin(`Buổi sáng nhiệt độ là ${a} °C. Đến trưa nhiệt độ ${up?'tăng':'giảm'} ${d} °C. Hỏi buổi trưa nhiệt độ là bao nhiêu độ C?`,up?a+d:a-d,{unit:'°C',sk:'doluong',hints:[up?'Tăng thì cộng thêm.':'Giảm thì trừ đi.',`${a} ${up?'+':'−'} ${d}`],explain:`${a} ${up?'+':'−'} ${d} = ${up?a+d:a-d} (°C).`});};

/* -------- HÌNH HỌC -------- */
MG.shapeId=function(G,lv,P){const S=[['hình tam giác','3 cạnh, 3 góc','🔺'],['hình vuông','4 cạnh bằng nhau, 4 góc vuông','🟦'],['hình chữ nhật','2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau, 4 góc vuông','▬'],['hình tròn','không có cạnh, tròn đều','⚪']];
  const obj=RP([['Chiếc đồng hồ treo tường','hình tròn'],['Mặt bàn cờ vua','hình vuông'],['Quyển sách','hình chữ nhật'],['Biển báo cấm (tròn)','hình tròn'],['Miếng bánh mì sandwich cắt chéo','hình tam giác'],['Cửa ra vào','hình chữ nhật'],['Viên gạch bông vuông','hình vuông'],['Cái đĩa','hình tròn'],['Mặt bánh xe đạp','hình tròn'],['Lá cờ đuôi nheo','hình tam giác'],['Bảng đen trong lớp','hình chữ nhật'],['Chiếc khăn tay vuông','hình vuông'],['Mặt chiếc bánh chưng','hình vuông'],['Miếng dưa hấu bổ','hình tam giác'],['Màn hình ti vi','hình chữ nhật'],['Mặt trăng ngày rằm','hình tròn']]);
  if(lv===0&&Math.random()<.4){const s=RP(S.slice(0,3));const n=s[0]==='hình tam giác'?3:4;const ask=RP(['cạnh','góc']);return Qin(`${cap(s[0])} có mấy ${ask}?`,n,{sk:'hinhhoc',hints:['Đếm từng cạnh của hình.',''],explain:`${cap(s[0])} có ${n} ${ask}.`});}
  if(lv===0){const s=RP(S);return Qmc(`Hình có ${s[1]} là hình gì?`,cap(s[0]),S.map(x=>cap(x[0])),{sk:'hinhhoc',hints:['Đếm số cạnh của hình.','Hình vuông có 4 cạnh bằng nhau.'],explain:`${cap(s[0])} có ${s[1]}.`});}
  return Qmc(`${obj[0]} có dạng hình gì?`,cap(obj[1]),S.map(x=>cap(x[0])),{sk:'hinhhoc',hints:['Tưởng tượng nhìn thẳng vào mặt đồ vật.','Đếm số cạnh và xem các cạnh có bằng nhau không.'],explain:`${obj[0]} có dạng ${obj[1]}.`});};
MG.solid=function(G,lv,P){const L=G<=1?[['Quả bóng','khối cầu'],['Hộp phấn','khối hộp chữ nhật'],['Con xúc xắc','khối lập phương'],['Lon nước ngọt','khối trụ'],['Viên bi','khối cầu'],['Thùng các-tông','khối hộp chữ nhật'],['Quả cam','khối cầu'],['Hộp sữa','khối hộp chữ nhật'],['Khúc gỗ tròn','khối trụ'],['Hộp quà vuông','khối lập phương'],['Cái trống','khối trụ'],['Viên đá lạnh vuông','khối lập phương']]:[['Quả địa cầu','khối cầu'],['Hộp sữa giấy','khối hộp chữ nhật'],['Rubik 3×3','khối lập phương'],['Ống nước','khối trụ'],['Quả cam','khối cầu'],['Hộp bút','khối hộp chữ nhật'],['Cây nến tròn','khối trụ']];
  const it=RP(L);if(lv===2){const roll=Math.random()<.5;return Qmc(roll?'Khối nào lăn được?':'Khối nào có 6 mặt là hình vuông bằng nhau?',roll?'Khối cầu':'Khối lập phương',['Khối cầu','Khối lập phương','Khối hộp chữ nhật'],{sk:'hinhhoc',hints:roll?['Khối có mặt cong thì lăn được.','Khối lập phương có các mặt phẳng.']:['Nghĩ tới con xúc xắc.','Khối hộp chữ nhật có các mặt là hình chữ nhật.'],explain:roll?'Khối cầu có mặt cong nên lăn được.':'Khối lập phương có 6 mặt là hình vuông bằng nhau.'});}
  return Qmc(`${it[0]} có dạng khối gì?`,cap(it[1]),['Khối cầu','Khối trụ','Khối lập phương','Khối hộp chữ nhật'],{sk:'hinhhoc',hints:['Khối lập phương có 6 mặt là hình vuông bằng nhau.','Khối trụ có hai mặt đáy là hình tròn.'],explain:`${it[0]} có dạng ${it[1]}.`});};
MG.position=function(G,lv,P){const E=shuffle(['🐱','🐶','🐰','🐻','🐼','🐸','🐷','🐵']);const row=E.slice(0,lv===0?3:5);const k=R(1,row.length-2);
  const t=RP(['left','right','mid']);if(t==='mid'&&row.length===3)return Qmc('Bạn nào đứng ở giữa?',row[1],row.slice(),{emo:true,visual:emoRow(row),sk:'hinhhoc',hints:['Bạn ở giữa có bạn đứng ở cả hai bên.',''],explain:`Bạn ${row[1]} đứng ở giữa.`});
  const ans=t==='left'?row[k-1]:row[k+1];return Qmc(`Bạn nào đứng ngay bên ${t==='left'?'trái':'phải'} bạn ${row[k]}?`,ans,row.filter(x=>x!==row[k]),{emo:true,visual:emoRow(row),sk:'hinhhoc',hints:['Bên trái là phía tay không cầm bút (tay trái).','Nhìn sát cạnh bạn được hỏi.'],explain:`Ngay bên ${t==='left'?'trái':'phải'} bạn ${row[k]} là bạn ${ans}.`});};
MG.sizeCmp=function(G,lv,P){const pairs=[['🐘','🐭','to hơn','nhỏ hơn'],['🦒','🐶','cao hơn','thấp hơn'],['🌳','🌷','cao hơn','thấp hơn'],['🚌','🚲','to hơn','nhỏ hơn'],['🐋','🐟','to hơn','nhỏ hơn'],['🏠','🐕','to hơn','nhỏ hơn'],['🐄','🐔','to hơn','nhỏ hơn'],['🏢','🏠','cao hơn','thấp hơn'],['🐍','🐛','dài hơn','ngắn hơn'],['🚂','🚗','dài hơn','ngắn hơn'],['🦓','🐇','cao hơn','thấp hơn'],['🍉','🍒','to hơn','nhỏ hơn']];const p=RP(pairs);const big=Math.random()<.5;
  return Qmc(`Con vật/đồ vật nào ${big?p[2]:p[3]}?`,big?p[0]:p[1],shuffle([p[0],p[1]]),{emo:true,sk:'doluong',hints:['Nghĩ tới con vật, đồ vật đó ngoài đời thật.',''],explain:`${p[0]} ${p[2]} ${p[1]}.`});};
MG.oddOne=function(G,lv,P){const groups=[['🍎','🍌','🍇','🍓'],['🐱','🐶','🐰','🐻'],['🚗','🚌','🚲','🚂'],['⚽','🏀','🎾','🏐'],['🌸','🌻','🌷','🌹']];const gi=R(0,groups.length-1);const g=pickK(groups[gi],3);const odd=RP(groups[(gi+R(1,groups.length-1))%groups.length]);const opts=shuffle(g.concat([odd]));
  return Qmc('Hình nào khác nhóm?',odd,opts,{emo:true,visual:emoRow(opts),sk:'so',hints:['Ba hình giống nhau ở một điểm (cùng là quả, con vật, xe…).','Tìm hình không giống ba hình kia.'],explain:`${odd} không cùng nhóm với ${g.join(' ')}.`});};
MG.pattern=function(G,lv,P){return Object.assign(TDG.la_next(0,lv),{sk:'quyluat'});};
MG.dayPart=function(G,lv,P){if(lv===2&&Math.random()<.5){const n=Math.random()<.5;return Qmc(n?'Lúc nào trời tối, có trăng sao?':'Lúc nào có mặt trời chiếu sáng?',n?'Ban đêm':'Ban ngày',['Ban ngày','Ban đêm'],{visual:`<div class="ht-big">${n?'🌙⭐':'☀️'}</div>`,sk:'thoigian',hints:['Mặt trời chiếu sáng vào ban ngày.',''],explain:n?'Ban đêm trời tối, có trăng sao.':'Ban ngày có mặt trời.'});}
  const L=[['Bé thức dậy, đánh răng, ăn sáng','buổi sáng'],['Cả nhà ăn cơm trưa','buổi trưa'],['Tan học, bé đá bóng ở sân','buổi chiều'],['Cả nhà ăn tối, xem ti vi','buổi tối'],['Mặt trời mọc','buổi sáng'],['Bé đi ngủ','buổi tối'],['Bố mẹ đưa bé đến trường','buổi sáng'],['Bé ngủ trưa ở lớp','buổi trưa'],['Mặt trời lặn','buổi chiều'],['Bé tập thể dục buổi đầu ngày','buổi sáng'],['Bé nghe bà kể chuyện trước khi ngủ','buổi tối'],['Bé ăn quà chiều sau giờ ngủ trưa','buổi chiều']];const it=RP(L);
  return Qmc(`“${it[0]}” thường diễn ra vào buổi nào?`,cap(it[1]),['Buổi sáng','Buổi trưa','Buổi chiều','Buổi tối'],{sk:'thoigian',hints:['Một ngày có: sáng, trưa, chiều, tối.','Nghĩ xem ở nhà mình việc đó làm lúc nào.'],explain:`Việc đó thường diễn ra vào ${it[1]}.`});};
MG.polyline=function(G,lv,P){const n=R(3,lv===2?5:4);const xs=[];for(let i=0;i<n;i++)xs.push(R(G<=2?2:10,G<=2?9:99));const s=xs.reduce((a,b)=>a+b,0);const u=G<=3?'cm':'mm';const L='ABCDEF'.slice(0,n+1);
  let pts=[],x=10,y=60;const b=[];for(let i=0;i<=n;i++){pts.push([x,y]);x+=60;y=i%2?60:15;}let svg=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#1E3A8A" stroke-width="3"/>`;
  pts.forEach((p,i)=>{svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#2563EB"/><text x="${p[0]}" y="${p[1]+(p[1]>40?18:-8)}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${L[i]}</text>`;if(i<n){const q=pts[i+1];svg+=`<text x="${(p[0]+q[0])/2+(i%2?8:-8)}" y="${(p[1]+q[1])/2}" text-anchor="middle" font-size="12" font-weight="700" fill="#B45309">${xs[i]}</text>`;}});
  if(lv===2){const miss=R(0,n-1);return Qin(`Đường gấp khúc ${L} dài ${s} ${u}. Đoạn ${L[miss]}${L[miss+1]} dài bao nhiêu ${u}?`,xs[miss],{unit:u,visual:SVGW(n*60+20,80,svg.replace(new RegExp(`>${xs[miss]}</text>`),'>?</text>'),'Đường gấp khúc'),sk:'hinhhoc',hints:['Độ dài đường gấp khúc = tổng các đoạn.','Lấy cả đường trừ các đoạn đã biết.'],explain:`${s} − (${xs.filter((_,i)=>i!==miss).join(' + ')}) = ${xs[miss]} (${u}).`});}
  return Qin(`Tính độ dài đường gấp khúc ${L}.`,s,{unit:u,visual:SVGW(n*60+20,80,svg,'Đường gấp khúc'),sk:'hinhhoc',hints:['Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng.',xs.join(' + ')],explain:`${xs.join(' + ')} = ${s} (${u}).`});};
function rectSVGx(a,b,la,lb){const W=Math.min(220,40+a*12),Hh=Math.min(120,30+b*10);return SVGW(W+60,Hh+40,`<rect x="30" y="10" width="${W}" height="${Hh}" fill="#DBEAFE" stroke="#1E3A8A" stroke-width="3"/><text x="${30+W/2}" y="${Hh+30}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${la}</text><text x="${W+36}" y="${10+Hh/2+4}" font-size="13" font-weight="800" fill="currentColor">${lb}</text>`,'Hình chữ nhật');}
MG.perimeter=function(G,lv,P){const u=G>=4?RP(['cm','m','dm']):'cm';
  if(G<=2){const n=R(3,4);const xs=[];for(let i=0;i<n;i++)xs.push(R(2,15));const s=xs.reduce((a,b)=>a+b,0);return Qin(`Hình ${n===3?'tam giác':'tứ giác'} có độ dài các cạnh là ${xs.join(' cm, ')} cm. Tính chu vi hình đó.`,s,{unit:'cm',sk:'hinhhoc',hints:['Chu vi là tổng độ dài các cạnh.',xs.join(' + ')],explain:`${xs.join(' + ')} = ${s} (cm).`});}
  const sq=Math.random()<.4;const a=R(3,G>=4?60:25),b=sq?a:R(2,a-1);
  if(lv===2){if(sq){return Qin(`Một hình vuông có chu vi ${4*a} ${u}. Tính độ dài cạnh hình vuông đó.`,a,{unit:u,sk:'hinhhoc',hints:['Chu vi hình vuông = cạnh × 4.','Lấy chu vi chia cho 4.'],explain:`${4*a} : 4 = ${a} (${u}).`});}
    return Qin(`Hình chữ nhật có chu vi ${2*(a+b)} ${u}, chiều dài ${a} ${u}. Tính chiều rộng.`,b,{unit:u,sk:'hinhhoc',hints:['Nửa chu vi = dài + rộng.',`${2*(a+b)} : 2 = ${a+b}`],explain:expl(`Nửa chu vi: ${2*(a+b)} : 2 = ${a+b} (${u})`,`Chiều rộng: ${a+b} − ${a} = ${b} (${u})`)});}
  if(sq)return Qin(`Tính chu vi hình vuông có cạnh ${a} ${u}.`,4*a,{unit:u,sk:'hinhhoc',hints:['Chu vi hình vuông = cạnh × 4.',`${a} × 4`],explain:`${a} × 4 = ${4*a} (${u}).`});
  return Qin(`Tính chu vi hình chữ nhật có chiều dài ${a} ${u}, chiều rộng ${b} ${u}.`,2*(a+b),{unit:u,visual:rectSVGx(a,b,a+' '+u,b+' '+u),sk:'hinhhoc',hints:['Chu vi hình chữ nhật = (dài + rộng) × 2.',`(${a} + ${b}) × 2`],explain:`(${a} + ${b}) × 2 = ${2*(a+b)} (${u}).`});};
MG.area=function(G,lv,P){const u=G>=4?RP(['cm','m','dm']):'cm';const sq=Math.random()<.4;const a=R(2,G>=4?40:12),b=sq?a:R(2,a);
  if(lv===2){if(sq)return Qin(`Một hình vuông có diện tích ${a*a} ${u}². Tính độ dài cạnh.`,a,{unit:u,sk:'hinhhoc',hints:['Diện tích hình vuông = cạnh × cạnh.','Số nào nhân với chính nó bằng diện tích?'],explain:`${a} × ${a} = ${a*a} nên cạnh là ${a} ${u}.`});
    return Qin(`Hình chữ nhật có diện tích ${a*b} ${u}², chiều rộng ${b} ${u}. Tính chiều dài.`,a,{unit:u,sk:'hinhhoc',hints:['Diện tích = dài × rộng.',`${a*b} : ${b}`],explain:`${a*b} : ${b} = ${a} (${u}).`});}
  if(lv===1&&!sq&&G>=3){const per=2*(a+b);return Qin(`Hình chữ nhật có chiều dài ${a} ${u}, chu vi ${per} ${u}. Tính diện tích hình chữ nhật.`,a*b,{unit:u+'²',sk:'hinhhoc',hints:['Tìm chiều rộng trước: nửa chu vi trừ chiều dài.',`${per} : 2 − ${a} = ${b}`],explain:expl(`Chiều rộng: ${per} : 2 − ${a} = ${b} (${u})`,`Diện tích: ${a} × ${b} = ${a*b} (${u}²)`)});}
  if(sq)return Qin(`Tính diện tích hình vuông có cạnh ${a} ${u}.`,a*a,{unit:u+'²',sk:'hinhhoc',hints:['Diện tích hình vuông = cạnh × cạnh.',`${a} × ${a}`],explain:`${a} × ${a} = ${a*a} (${u}²).`});
  return Qin(`Tính diện tích hình chữ nhật có chiều dài ${a} ${u}, chiều rộng ${b} ${u}.`,a*b,{unit:u+'²',visual:rectSVGx(a,b,a+' '+u,b+' '+u),sk:'hinhhoc',hints:['Diện tích hình chữ nhật = dài × rộng.',`${a} × ${b}`],explain:`${a} × ${b} = ${a*b} (${u}²).`});};
function angleSVG(deg){const cx=30,cy=100,L=110;const r=deg*Math.PI/180;return SVGW(170,120,`<line x1="${cx}" y1="${cy}" x2="${cx+L}" y2="${cy}" stroke="#1E3A8A" stroke-width="4"/><line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(r)*L}" y2="${cy-Math.sin(r)*L}" stroke="#1E3A8A" stroke-width="4"/><path d="M${cx+22} ${cy} A22 22 0 0 0 ${cx+Math.cos(r)*22} ${cy-Math.sin(r)*22}" fill="none" stroke="#F97316" stroke-width="3"/>`,'Góc');}
MG.angle=function(G,lv,P){if(G<=3){const right=Math.random()<.5;const deg=right?90:RP([40,60,120,140]);return Qmc('Góc dưới đây có phải góc vuông không?',right?'Góc vuông':'Không phải góc vuông',['Góc vuông','Không phải góc vuông'],{visual:angleSVG(deg),sk:'hinhhoc',hints:['Dùng ê-ke để kiểm tra.','Góc vuông giống góc của trang vở.'],explain:right?'Đây là góc vuông.':'Góc này không vuông.'});}
  const k=RP(['nhọn','vuông','tù','bẹt']);const deg={nhọn:R(20,80),vuông:90,tù:R(100,170),bẹt:180}[k];if(lv>=1){return Qmc(`Góc có số đo ${deg}° là góc gì?`,'Góc '+k,['Góc nhọn','Góc vuông','Góc tù','Góc bẹt'],{sk:'hinhhoc',hints:['Góc vuông = 90°, góc bẹt = 180°.','Nhọn < 90° < tù < 180°.'],explain:`${deg}° là góc ${k}.`});}
  return Qmc('Góc dưới đây là góc gì?','Góc '+k,['Góc nhọn','Góc vuông','Góc tù','Góc bẹt'],{visual:k==='bẹt'?SVGW(170,60,'<line x1="10" y1="40" x2="160" y2="40" stroke="#1E3A8A" stroke-width="4"/><circle cx="85" cy="40" r="5" fill="#F97316"/>','Góc bẹt'):angleSVG(deg),sk:'hinhhoc',hints:['So với góc vuông (góc trang vở).','Bé hơn góc vuông là góc nhọn, lớn hơn là góc tù.'],explain:`Đây là góc ${k}.`});};
MG.lines=function(G,lv,P){const L=[['Hai đường thẳng cắt nhau tạo thành bốn góc vuông.','Vuông góc'],['Hai đường thẳng không bao giờ cắt nhau dù kéo dài mãi.','Song song'],['Hai cạnh đối diện của hình chữ nhật.','Song song'],['Hai cạnh kề nhau của hình vuông.','Vuông góc'],['Hai mép đối diện của trang vở.','Song song'],['Hai mép kề nhau của mặt bàn hình chữ nhật.','Vuông góc'],['Hai thanh ray của đường tàu hỏa.','Song song'],['Cột cờ và mặt sân phẳng.','Vuông góc'],['Hai cạnh đáy của hình thang.','Song song'],['Hai cạnh góc vuông của ê-ke.','Vuông góc']];
  if(lv===1&&Math.random()<.5){const n=RP([[4,'hình chữ nhật'],[4,'hình vuông']]);return Qin(`Hình chữ nhật có mấy cặp cạnh song song?`,2,{sk:'hinhhoc',hints:['Hai cạnh đối diện của hình chữ nhật song song với nhau.','Có 2 cặp cạnh đối diện.'],explain:'Hình chữ nhật có 2 cặp cạnh song song.'});}const it=RP(L);
  if(lv===2){const s=RP([['Hình có hai cặp cạnh đối diện song song và bằng nhau.','Hình bình hành'],['Hình có bốn cạnh bằng nhau và hai cặp cạnh đối diện song song.','Hình thoi']]);return Qmc(s[0]+' Đó là hình gì?',s[1],['Hình bình hành','Hình thoi','Hình tam giác','Hình tròn'],{sk:'hinhhoc',hints:['Hình thoi có 4 cạnh bằng nhau.','Hình bình hành có 2 cặp cạnh đối song song.'],explain:`${s[0]} → ${s[1].toLowerCase()}.`});}
  return Qmc(it[0]+' Hai đường thẳng (đoạn thẳng) đó như thế nào với nhau?',it[1],['Vuông góc','Song song','Không vuông góc, không song song'],{sk:'hinhhoc',hints:['Vuông góc: cắt nhau tạo góc vuông.','Song song: không bao giờ cắt nhau.'],explain:`Đó là hai đường ${it[1].toLowerCase()}.`});};
MG.midpoint=function(G,lv,P){const a=R(2,20);if(Math.random()<.5)return Qin(`M là trung điểm của đoạn thẳng AB. Đoạn AM dài ${a} cm. Đoạn AB dài bao nhiêu xăng-ti-mét?`,2*a,{unit:'cm',sk:'hinhhoc',hints:['Trung điểm chia đoạn thẳng thành hai phần bằng nhau.',`AB = AM × 2`],explain:`AB = ${a} × 2 = ${2*a} (cm).`});
  return Qin(`M là trung điểm của đoạn thẳng AB dài ${2*a} cm. Đoạn MB dài bao nhiêu xăng-ti-mét?`,a,{unit:'cm',sk:'hinhhoc',hints:['Trung điểm chia đôi đoạn thẳng.',`${2*a} : 2`],explain:`MB = ${2*a} : 2 = ${a} (cm).`});};
MG.countShapes=function(G,lv,P){return Object.assign(TDG.shapes(Math.max(1,G),lv),{sk:'hinhhoc'});};
MG.circle=function(G,lv,P){const d=R(2,20)*(Math.random()<.5?1:2);const r=d/2;const t=P.kind==='C'?(lv===0?RP(['C','rd']):RP(['C','Cr'])):P.kind==='S'?(lv===0?RP(['S','rd']):'S'):lv===0?RP(['C','rd']):RP(['C','S','Cr']);
  if(t==='rd')return Qin(`Hình tròn có bán kính ${r} cm. Đường kính dài bao nhiêu xăng-ti-mét?`,d,{unit:'cm',sk:'hinhhoc',hints:['Đường kính gấp 2 lần bán kính.',`${r} × 2`],explain:`${r} × 2 = ${d} (cm).`});
  const C=r6(d*3.14),S=r6(r*r*3.14);const val=t==='S'?S:C;const opts=[val,r6(val*2),r6(t==='S'?d*3.14:r*r*3.14),r6(val+3.14)].map(x=>fD(x)+(t==='S'?' cm²':' cm'));
  return Qmc(t==='S'?`Tính diện tích hình tròn có bán kính ${r} cm.`:t==='Cr'?`Tính chu vi hình tròn có bán kính ${r} cm.`:`Tính chu vi hình tròn có đường kính ${d} cm.`,opts[0],opts.filter((x,i,a)=>a.indexOf(x)===i),{sk:'hinhhoc',hints:[t==='S'?'S = bán kính × bán kính × 3,14.':'C = đường kính × 3,14.',t==='Cr'?`Đường kính = ${r} × 2 = ${d}.`:''],explain:t==='S'?`${r} × ${r} × 3,14 = ${fD(S)} (cm²).`:`${d} × 3,14 = ${fD(C)} (cm).`});};
MG.triTrap=function(G,lv,P){const tri=P.kind?P.kind==='tri':Math.random()<.5;if(tri){const a=R(2,30),h=R(2,30)*2/2;let S=a*h/2;return Qmc(`Tính diện tích hình tam giác có độ dài đáy ${a} cm và chiều cao ${h} cm.`,fD(S)+' cm²',[S,a*h,(a+h)*2,S+a].map(x=>fD(r6(x))+' cm²').filter((x,i,ar)=>ar.indexOf(x)===i),{sk:'hinhhoc',hints:['S = đáy × chiều cao : 2.',`${a} × ${h} : 2`],explain:`${a} × ${h} : 2 = ${fD(S)} (cm²).`});}
  const a=R(5,30),b=R(2,a-1),h=R(2,20);const S=(a+b)*h/2;return Qmc(`Tính diện tích hình thang có đáy lớn ${a} cm, đáy bé ${b} cm, chiều cao ${h} cm.`,fD(S)+' cm²',[S,(a+b)*h,a*b*h/2,S+h].map(x=>fD(r6(x))+' cm²').filter((x,i,ar)=>ar.indexOf(x)===i),{sk:'hinhhoc',hints:['S = (đáy lớn + đáy bé) × chiều cao : 2.',`(${a} + ${b}) × ${h} : 2`],explain:`(${a} + ${b}) × ${h} : 2 = ${fD(S)} (cm²).`});};
MG.volume=function(G,lv,P){const t=P.kind?RP(P.kind):lv===0?RP(['box','cube','conv']):RP(['box','cube','sxq','stp','conv']);const a=R(2,12),b=R(2,10),c=R(2,10);
  if(t==='box')return Qin(`Tính thể tích hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm.`,a*b*c,{unit:'cm³',sk:'hinhhoc',hints:['V = dài × rộng × cao.',`${a} × ${b} × ${c}`],explain:`${a} × ${b} × ${c} = ${a*b*c} (cm³).`});
  if(t==='cube')return Qin(`Tính thể tích hình lập phương có cạnh ${a} cm.`,a*a*a,{unit:'cm³',sk:'hinhhoc',hints:['V = cạnh × cạnh × cạnh.',`${a} × ${a} × ${a}`],explain:`${a} × ${a} × ${a} = ${a*a*a} (cm³).`});
  if(t==='sxq')return Qin(`Tính diện tích xung quanh hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm.`,2*(a+b)*c,{unit:'cm²',sk:'hinhhoc',hints:['Sxq = chu vi đáy × chiều cao.',`(${a} + ${b}) × 2 × ${c}`],explain:expl(`Chu vi đáy: (${a} + ${b}) × 2 = ${2*(a+b)} (cm)`,`Sxq: ${2*(a+b)} × ${c} = ${2*(a+b)*c} (cm²)`)});
  if(t==='stp')return Qin(`Tính diện tích toàn phần hình lập phương có cạnh ${a} cm.`,6*a*a,{unit:'cm²',sk:'hinhhoc',hints:['Stp = diện tích một mặt × 6.',`${a} × ${a} × 6`],explain:`${a} × ${a} × 6 = ${6*a*a} (cm²).`});
  const pr=RP([['dm³','cm³',1000],['m³','dm³',1000]]);const n=R(2,30);if(lv>=1&&Math.random()<.5){const m=R(1,999);return Qin('Điền số thích hợp vào ô trống.',n*pr[2]+m,{big:`${n} ${pr[0]} ${m} ${pr[1]} = ? ${pr[1]}`,sk:'doluong',hints:[`1 ${pr[0]} = 1000 ${pr[1]}.`,`${n} × 1000 + ${m}`],explain:`${n} ${pr[0]} = ${fN(n*1000)} ${pr[1]}; ${fN(n*1000)} + ${m} = ${fN(n*1000+m)} ${pr[1]}.`});}
  if(Math.random()<.4)return Qin('Điền số thích hợp vào ô trống.',n,{big:`${fN(n*pr[2])} ${pr[1]} = ? ${pr[0]}`,sk:'doluong',hints:[`1 ${pr[0]} = 1000 ${pr[1]}.`,`${fN(n*1000)} : 1000`],explain:`${fN(n*1000)} ${pr[1]} = ${n} ${pr[0]}.`});
  return Qin('Điền số thích hợp vào ô trống.',n*pr[2],{big:`${n} ${pr[0]} = ? ${pr[1]}`,sk:'doluong',hints:[`1 ${pr[0]} = 1000 ${pr[1]}.`,`${n} × 1000`],explain:`${n} ${pr[0]} = ${fN(n*pr[2])} ${pr[1]}.`});};

/* -------- THỐNG KÊ, KHẢ NĂNG -------- */
function barSVG(labels,vals,unit){const W=Math.max(220,labels.length*56+40),Hh=150,mx=Math.max(...vals);let b=`<line x1="30" y1="10" x2="30" y2="${Hh}" stroke="#64748B"/><line x1="30" y1="${Hh}" x2="${W}" y2="${Hh}" stroke="#64748B"/>`;
  labels.forEach((l,i)=>{const h=Math.round(vals[i]/mx*(Hh-30));const x=44+i*56;b+=`<rect x="${x}" y="${Hh-h}" width="34" height="${h}" rx="4" fill="${['#2563EB','#0EA5E9','#1E3A8A','#14B8A6','#6366F1'][i%5]}"/><text x="${x+17}" y="${Hh-h-5}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${vals[i]}</text><text x="${x+17}" y="${Hh+16}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${l}</text>`;});
  return SVGW(W,Hh+24,b,'Biểu đồ cột')+(unit?`<div class="ht-cap">${unit}</div>`:'');}
MG.chart=function(G,lv,P){const labels=G<=2?['3A','3B','3C','3D'].map(x=>x.replace('3',String(G+1))):['T2','T3','T4','T5','T6'];const n=G<=2?4:5;const vals=[];for(let i=0;i<n;i++)vals.push(R(2,G<=2?10:40)*(G<=2?1:5));
  const vis=barSVG(labels.slice(0,n),vals,G<=2?'Số cây mỗi lớp trồng được':'Số sách thư viện cho mượn mỗi ngày');const t=lv===0?'max':RP(['diff','sum','max','min']);
  if(t==='max'||t==='min'){const v=t==='max'?Math.max(...vals):Math.min(...vals);if(vals.filter(x=>x===v).length>1)return MG.chart(G,lv,P);const ans=labels[vals.indexOf(v)];return Qmc(`Theo biểu đồ, ${G<=2?'lớp':'ngày'} nào ${t==='max'?'nhiều':'ít'} nhất?`,ans,labels.slice(0,n),{visual:vis,sk:'thongke',hints:['So sánh độ cao các cột.',t==='max'?'Cột cao nhất là nhiều nhất.':'Cột thấp nhất là ít nhất.'],explain:`${ans}: ${v} là ${t==='max'?'nhiều':'ít'} nhất.`});}
  if(t==='sum'){const s=vals.reduce((a,b)=>a+b,0);return Qin(`Theo biểu đồ, tổng cộng là bao nhiêu?`,s,{visual:vis,sk:'thongke',hints:['Đọc số trên từng cột.','Cộng tất cả lại.'],explain:`${vals.join(' + ')} = ${s}.`});}
  const i=R(0,n-1);let j=R(0,n-1);while(j===i)j=R(0,n-1);const big=vals[i]>=vals[j]?i:j,sm=big===i?j:i;return Qin(`Theo biểu đồ, ${labels[big]} nhiều hơn ${labels[sm]} bao nhiêu?`,vals[big]-vals[sm],{visual:vis,sk:'thongke',hints:['Đọc số trên hai cột cần so sánh.','Lấy số lớn trừ số bé.'],explain:`${vals[big]} − ${vals[sm]} = ${vals[big]-vals[sm]}.`});};
MG.tally=function(G,lv,P){const n=R(3,18);const g=Math.floor(n/5),r=n%5;return Qin('Các vạch kiểm đếm dưới đây ứng với số nào? (mỗi nhóm có gạch chéo là 5)',n,{visual:`<div class="ht-big" style="font-size:34px;letter-spacing:3px">${'<s>||||</s> '.repeat(g)}${'|'.repeat(r)}</div>`,sk:'thongke',hints:['Mỗi nhóm có gạch chéo là 5.',`Có ${g} nhóm 5 và ${r} vạch lẻ.`],explain:`${g} × 5 + ${r} = ${n}.`});};
MG.chance=function(G,lv,P){if(G>=5){const n=R(10,40),k=R(1,n-1);if(2*k===n)return MG.chance(G,lv,P);return Qmc(`Tung một đồng xu ${n} lần, có ${k} lần xuất hiện mặt sấp. Tỉ số của số lần xuất hiện mặt sấp và tổng số lần tung là:`,`${k}/${n}`,[`${k}/${n}`,`${n-k}/${n}`,`${k}/${n-k}`,`${n}/${k}`],{sk:'xacsuat',hints:['Tỉ số = số lần xuất hiện : tổng số lần.',`${k} : ${n}`],explain:`${k} lần trên ${n} lần tung: ${k}/${n}.`});}
  const colors=[['đỏ','🔴'],['xanh','🔵'],['vàng','🟡']];const bag=RP([[3,0],[2,1],[0,3]]);const c1=colors[0],c2=colors[1];const ask=RP([c1,c2,colors[2]]);
  const has=ask===c1?bag[0]>0:ask===c2?bag[1]>0:false;const all=(ask===c1&&bag[1]===0)||(ask===c2&&bag[0]===0);const ans=all?'Chắc chắn':has?'Có thể':'Không thể';
  return Qmc(`Trong hộp có ${bag[0]} bi đỏ và ${bag[1]} bi xanh. Lấy ra 1 viên bi mà không nhìn. Khả năng lấy được bi ${ask[0]} là:`,ans,['Chắc chắn','Có thể','Không thể'],{sk:'xacsuat',hints:['Trong hộp có bi màu đó không?','Nếu chỉ toàn bi màu đó thì là chắc chắn.'],explain:`${ans} lấy được bi ${ask[0]}.`});};
/* ================= BỘ ĐỀ TOÁN MỚI — phần D: phân số, số thập phân, tỉ số, chuyển động ================= */
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const lcm=(a,b)=>a/gcd(a,b)*b;
const fr=(n,d)=>{const g=gcd(n,d);return [n/g,d/g];};
const fS=(n,d)=>d===1?String(n):`${n}/${d}`;
const fRed=(n,d)=>{const [a,b]=fr(n,d);return fS(a,b);};
function fracOpts(ans,cands){const set=[ans];cands.forEach(c=>{if(c&&!set.includes(c)&&set.length<4)set.push(c);});let t=1;while(set.length<4){const [n,d]=ans.split('/').map(Number);const c=fS(n+t,d||1);if(!set.includes(c))set.push(c);t++;}return set;}
function barFracSVG(k,n){const W=Math.min(260,n*34);const w=W/n;let b='';for(let i=0;i<n;i++)b+=`<rect x="${6+i*w}" y="6" width="${w}" height="40" fill="${i<k?'#3B82F6':'#fff'}" stroke="#1E3A8A" stroke-width="2.5"/>`;return SVGW(W+12,52,b,'Hình được chia thành các phần bằng nhau');}
MG.fracConcept=function(G,lv,P){const n=R(2,G>=5?12:9),k=R(1,n-1);const t=lv===0?'shade':RP(['shade','div','read']);
  if(t==='shade')return Qmc('Phân số chỉ phần đã tô màu của hình là:',`${k}/${n}`,fracOpts(`${k}/${n}`,[`${n-k}/${n}`,`${k}/${n-k}`,`${n}/${k}`]),{visual:barFracSVG(k,n),sk:'phanso',hints:['Mẫu số: hình được chia thành bao nhiêu phần bằng nhau.','Tử số: số phần được tô màu.'],explain:`Hình chia ${n} phần bằng nhau, tô ${k} phần: ${k}/${n}.`});
  if(t==='div'){const a=R(1,20),b=R(2,12);return Qmc(`Viết thương ${a} : ${b} dưới dạng phân số.`,`${a}/${b}`,fracOpts(`${a}/${b}`,[`${b}/${a}`,`${a}/${b+1}`,`${a+b}/${b}`]),{sk:'phanso',hints:['Số bị chia là tử số, số chia là mẫu số.',''],explain:`${a} : ${b} = ${a}/${b}.`});}
  return Qmc(`Phân số “${vnRead(k)} phần ${vnRead(n)}” viết là:`,`${k}/${n}`,fracOpts(`${k}/${n}`,[`${n}/${k}`,`${k}/${n+1}`,`${k+1}/${n}`]),{sk:'phanso',hints:['Đọc tử số trước, mẫu số sau.',''],explain:`${vnRead(k)} phần ${vnRead(n)}: ${k}/${n}.`});};
MG.fracSimplify=function(G,lv,P){const d=R(2,12),n=R(1,d-1);const [a,b]=fr(n,d);const k=R(2,lv===2?9:5);const N=a*k,D=b*k;
  if(lv===0||Math.random()<.5)return Qmc(`Rút gọn phân số ${N}/${D} đến tối giản.`,fS(a,b),fracOpts(fS(a,b),[`${b}/${a}`,`${a}/${b+1}`,k>2&&N%2===0&&D%2===0?fS(N/2,D/2):`${a+1}/${b}`]),{sk:'phanso',hints:['Chia cả tử số và mẫu số cho cùng một số.',`Chia cả hai cho ${gcd(N,D)}.`],explain:`Chia cả tử số và mẫu số cho ${gcd(N,D)}: ${N}/${D} = ${fS(a,b)}.`});
  return Qin('Điền số thích hợp vào ô trống.',a*k,{big:`${a}/${b} = ?/${D}`,sk:'phanso',hints:[`${b} nhân mấy được ${D}?`,`Nhân cả tử với ${k}.`],explain:`${D} : ${b} = ${k}; ${a} × ${k} = ${a*k}. Vậy ${a}/${b} = ${a*k}/${D}.`});};
MG.fracCompare=function(G,lv,P){let a,b,c,d;const t=lv===0?'same':lv===1?RP(['same','num','one']):'diff';
  if(t==='same'){d=b=R(3,12);a=R(1,b-1);c=R(1,b-1);}else if(t==='num'){a=c=R(1,9);b=R(a+1,15);d=R(a+1,15);}else if(t==='one'){b=R(2,9);a=R(1,2*b);if(a===b)a++;c=d=1;}else{b=R(2,9);d=R(2,9);a=R(1,b*2-1);c=R(1,d*2-1);}
  const va=a/b,vc=c/d;const L=t==='one'?'1':`${c}/${d}`;
  return Qsign('Chọn dấu thích hợp.',`${a}/${b} ☐ ${L}`,a*d,c*b,{sk:'phanso',hints:[t==='same'?'Cùng mẫu số: tử số lớn hơn thì phân số lớn hơn.':t==='num'?'Cùng tử số: mẫu số bé hơn thì phân số lớn hơn.':t==='one'?'Tử số lớn hơn mẫu số thì phân số lớn hơn 1.':'Quy đồng mẫu số rồi so sánh tử số.',''],explain:`${a}/${b} ${sgn(a*d,c*b)} ${L}${t==='diff'?` (vì ${a}/${b} = ${a*d}/${b*d}, ${c}/${d} = ${c*b}/${b*d})`:''}.`});};
MG.fracOp=function(G,lv,P){const op=P.op?RP(P.op):RP(['+','−','×',':']);let a,b,c,d;
  if(op==='+'||op==='−'){if(lv===0){b=d=R(3,12);a=R(1,b-1);c=R(1,b-1);if(op==='−'&&a<c)[a,c]=[c,a];if(a===c&&op==='−')a++;}else{b=R(2,8);d=R(2,8);while(d===b)d=R(2,8);a=R(1,b-1);c=R(1,d-1);if(op==='−'&&a*d<c*b){[a,b,c,d]=[c,d,a,b];}}}
  else{b=R(2,9);d=R(2,9);a=R(1,b-1);c=R(1,d-1);}
  let n,m;if(op==='+'){n=a*d+c*b;m=b*d;}else if(op==='−'){n=a*d-c*b;m=b*d;}else if(op==='×'){n=a*c;m=b*d;}else{n=a*d;m=b*c;}
  if(n<=0)return MG.fracOp(G,lv,P);const ans=fRed(n,m);const wrong=op==='+'?[fRed(a+c,b+d),fS(n,m),fRed(a*c,b*d)]:op==='−'?[fRed(Math.abs(a-c),Math.abs(b-d)||1),fS(n,m),fRed(a*c,b*d)]:op==='×'?[fRed(a*d,b*c),fRed(a+c,b+d),fS(n,m)]:[fRed(a*c,b*d),fRed(b*c,a*d),fS(n,m)];
  const ex=op==='+'||op==='−'?(b===d?`Cùng mẫu: ${op==='+'?'cộng':'trừ'} tử số, giữ mẫu số: ${fS(op==='+'?a+c:a-c,b)}${fS(op==='+'?a+c:a-c,b)!==ans?' = '+ans:''}.`:`Quy đồng: ${a}/${b} = ${a*d}/${b*d}; ${c}/${d} = ${c*b}/${b*d}.\n${a*d}/${b*d} ${op} ${c*b}/${b*d} = ${fS(n,m)}${fS(n,m)!==ans?' = '+ans:''}.`):op==='×'?`Tử nhân tử, mẫu nhân mẫu: ${a} × ${c} / ${b} × ${d} = ${fS(n,m)}${fS(n,m)!==ans?' = '+ans:''}.`:`Nhân với phân số đảo ngược: ${a}/${b} × ${d}/${c} = ${fS(n,m)}${fS(n,m)!==ans?' = '+ans:''}.`;
  return Qmc('Tính (rút gọn kết quả nếu được).',ans,fracOpts(ans,wrong),{big:`${a}/${b} ${op} ${c}/${d} = ?`,sk:'phanso',hints:[op==='+'||op==='−'?(b===d?'Cùng mẫu số: cộng (trừ) tử số, giữ nguyên mẫu số.':'Quy đồng mẫu số trước.'):op==='×'?'Tử nhân tử, mẫu nhân mẫu.':'Nhân phân số thứ nhất với phân số thứ hai đảo ngược.','Rút gọn kết quả đến tối giản.'],explain:ex});};
MG.fracOf=function(G,lv,P){const d=R(2,9);let n=R(1,d-1);while(gcd(n,d)>1)n=R(1,d-1);const k=R(2,lv===2?30:12);const N=d*k;const t=thing();
  if(lv===0)return Qin(`Tìm ${n}/${d} của ${N}.`,n*k,{sk:'phanso',hints:['Lấy số đó nhân với phân số.',`${N} : ${d} × ${n}`],explain:`${N} × ${n}/${d} = ${N} : ${d} × ${n} = ${n*k}.`});
  return Qin(`Lớp có ${N} học sinh, trong đó ${n}/${d} số học sinh là nữ. Hỏi lớp có bao nhiêu học sinh nam?`,N-n*k,{sk:'phanso',hints:[`Tìm số học sinh nữ: ${N} × ${n}/${d}.`,'Lấy tổng trừ số học sinh nữ.'],explain:expl(`Nữ: ${N} × ${n}/${d} = ${n*k} (bạn)`,`Nam: ${N} − ${n*k} = ${N-n*k} (bạn)`)});};
MG.mixed=function(G,lv,P){const d=R(2,9),w=R(1,9),n=R(1,d-1);const imp=`${w*d+n}/${d}`,mix=`${w} ${n}/${d}`;
  if(Math.random()<.5)return Qmc(`Chuyển hỗn số ${mix} thành phân số.`,imp,fracOpts(imp,[`${w*n+d}/${d}`,`${w+n}/${d}`,`${w*d+n}/${n}`]),{sk:'phanso',hints:['Phần nguyên × mẫu số + tử số, giữ mẫu số.',`${w} × ${d} + ${n}`],explain:`${w} × ${d} + ${n} = ${w*d+n} → ${imp}.`});
  const o=[mix,`${w+1} ${n}/${d}`,`${w} ${Math.max(1,n-1)}/${d}`,`${n} ${w}/${d}`].filter((x,i,a)=>a.indexOf(x)===i);return Qmc(`Viết phân số ${imp} thành hỗn số.`,mix,o,{sk:'phanso',hints:[`Lấy ${w*d+n} chia cho ${d}.`,'Thương là phần nguyên, số dư là tử số.'],explain:`${w*d+n} : ${d} = ${w} (dư ${n}) → ${mix}.`});};
/* số thập phân: làm việc với số nguyên đã nhân 10^dp để tránh sai số */
const dS=(i,dp)=>{const neg=i<0;i=Math.abs(i);let s=String(i).padStart(dp+1,'0');return (neg?'−':'')+(dp?s.slice(0,-dp)+','+s.slice(-dp):s).replace(/^(\d+)/,m=>fN(+m));};
const dTrim=s=>s.includes(',')?s.replace(/0+$/,'').replace(/,$/,''):s;
function decOpts(ans,cands){const set=[ans];cands.forEach(c=>{if(c&&!set.includes(c)&&set.length<4)set.push(c);});let t=1;while(set.length<4){const c=ans+t;if(!set.includes(String(c)))set.push(dTrim(String(c)));t++;}return set;}
MG.decRead=function(G,lv,P){const dp=R(1,lv===2?3:2);const i=R(Math.pow(10,dp),Math.pow(10,dp+2));const s=dS(i,dp);const t=RP(['place','frac','read']);
  if(t==='place'){const k=R(1,dp);const dig=+String(i).slice(-dp)[k-1];const nm=['phần mười','phần trăm','phần nghìn'][k-1];return Qmc(`Trong số ${s}, chữ số ở hàng ${nm} là:`,String(dig),numOpts(dig,[+String(i).slice(-1),Math.floor(i/Math.pow(10,dp))%10]).map(String),{sk:'stp',hints:['Sau dấu phẩy: hàng phần mười, phần trăm, phần nghìn.',''],explain:`${s}: hàng ${nm} là chữ số ${dig}.`});}
  if(t==='frac'){const den=Math.pow(10,dp);const n=R(1,den*3);return Qmc(`Viết phân số thập phân ${n}/${den} dưới dạng số thập phân.`,dTrim(dS(n,dp)),decOpts(dTrim(dS(n,dp)),[dTrim(dS(n,Math.max(0,dp-1))),dTrim(dS(n,dp+1)),String(n)]),{sk:'stp',hints:[`Mẫu số ${den} có ${dp} chữ số 0 → phần thập phân có ${dp} chữ số.`,''],explain:`${n}/${den} = ${dTrim(dS(n,dp))}.`});}
  const w=Math.floor(i/Math.pow(10,dp)),f=i%Math.pow(10,dp);const rd=`${vnRead(w)} phẩy ${String(f).padStart(dp,'0').startsWith('0')?String(f).padStart(dp,'0').split('').map(c=>DGV[+c]).join(' '):vnRead(f)}`;
  return Qmc(`Số “${rd}” viết là:`,s,decOpts(s,[dS(i,dp-1>=0?dp-1:0),dS(i,dp+1),dS(i+1,dp)]),{sk:'stp',hints:['Đọc phần nguyên, rồi “phẩy”, rồi phần thập phân.',''],explain:`${rd}: ${s}.`});};
MG.decCompare=function(G,lv,P){const a=R(100,9999),dp1=R(1,3),dp2=R(1,3);let b=a+R(-30,30);if(lv===2){b=a*Math.pow(10,dp2-dp1);}const va=a/Math.pow(10,dp1),vb=b/Math.pow(10,dp2);
  return Qsign('Chọn dấu thích hợp.',`${dS(a,dp1)} ☐ ${dS(b,dp2)}`,Math.round(va*1e6),Math.round(vb*1e6),{sk:'stp',hints:['So sánh phần nguyên trước.','Phần nguyên bằng nhau thì so lần lượt từng hàng sau dấu phẩy.'],explain:`${dS(a,dp1)} ${sgn(Math.round(va*1e6),Math.round(vb*1e6))} ${dS(b,dp2)}.`});};
MG.decRound=function(G,lv,P){const dp=R(2,3);const i=R(Math.pow(10,dp),Math.pow(10,dp+2));const to=lv===0?0:R(0,dp-1);const r=Math.round(i/Math.pow(10,dp-to));const ans=dS(r,to);const nm=['số tự nhiên gần nhất','hàng phần mười','hàng phần trăm'][to];
  return Qmc(`Làm tròn số ${dS(i,dp)} đến ${nm}.`,ans,decOpts(ans,[dS(Math.floor(i/Math.pow(10,dp-to)),to),dS(r+1,to),dS(i,dp-1)]),{sk:'stp',hints:['Nhìn chữ số ngay bên phải hàng cần làm tròn.','Từ 5 trở lên thì tăng thêm 1.'],explain:`${dS(i,dp)} ≈ ${ans}.`});};
MG.decOp=function(G,lv,P){const op=P.op?RP(P.op):RP(['+','−','×',':']);let A,B,da,db,ans,ex;
  if(op==='+'||op==='−'){da=R(1,2);db=R(1,2);A=R(100,9999);B=R(10,999);const dp=Math.max(da,db);const a=A*Math.pow(10,dp-da),b=B*Math.pow(10,dp-db);if(op==='−'&&a<b)return MG.decOp(G,lv,P);const v=op==='+'?a+b:a-b;ans=dTrim(dS(v,dp));ex=`Đặt các dấu phẩy thẳng cột, ${op==='+'?'cộng':'trừ'} như số tự nhiên: ${dS(A,da)} ${op} ${dS(B,db)} = ${ans}.`;
    return Qmc('Tính.',ans,decOpts(ans,[dTrim(dS(op==='+'?A+B:Math.abs(A-B),Math.max(da,db))),dTrim(dS(v,dp+1)),dTrim(dS(v+1,dp))]),{big:`${dS(A,da)} ${op} ${dS(B,db)} = ?`,sk:'stp',hints:['Đặt tính sao cho các dấu phẩy thẳng cột.','Tính như số tự nhiên rồi đặt dấu phẩy thẳng cột.'],explain:ex});}
  if(op==='×'){da=R(1,2);A=R(11,999);const nat=lv===0||Math.random()<.4;db=nat?0:1;B=nat?R(2,9):R(11,99);const v=A*B;const dp=da+db;ans=dTrim(dS(v,dp));
    return Qmc('Tính.',ans,decOpts(ans,[dTrim(dS(v,Math.max(0,dp-1))),dTrim(dS(v,dp+1)),dTrim(dS(v+1,dp))]),{big:`${dS(A,da)} × ${dS(B,db)} = ?`,sk:'stp',hints:['Nhân như số tự nhiên.',`Đếm tổng số chữ số ở phần thập phân của hai thừa số (${dp}) rồi đặt dấu phẩy.`],explain:`${A} × ${B} = ${v}; có ${dp} chữ số thập phân → ${ans}.`});}
  const b=R(2,lv===2?25:9),q=R(11,999),dq=R(1,2);const a=b*q;ans=dTrim(dS(q,dq));
  return Qmc('Tính.',ans,decOpts(ans,[dTrim(dS(q,dq+1)),dTrim(dS(q,Math.max(0,dq-1))),dTrim(dS(q+1,dq))]),{big:`${dS(a,dq)} : ${b} = ?`,sk:'stp',hints:['Chia như số tự nhiên.','Chia đến phần thập phân thì viết dấu phẩy vào thương.'],explain:`${dS(a,dq)} : ${b} = ${ans} (thử lại: ${ans} × ${b} = ${dS(a,dq)}).`});};
MG.decTimes10=function(G,lv,P){const k=RP([10,100,1000]);const e=String(k).length-1;const mul=Math.random()<.5;const dp=R(1,3);const i=R(10,99999);const a=dS(i,dp);
  const resDp=mul?dp-e:dp+e;const ans=dTrim(resDp>=0?dS(i,resDp):fN(i*Math.pow(10,-resDp)));const big=`${a} ${mul?'×':':'} ${fN(k)} = ?`;
  return Qmc('Tính nhẩm.',ans,decOpts(ans,[dTrim(dS(i,Math.max(0,dp+(mul?e:-e)))),dTrim(dS(i,Math.max(0,resDp+1))),dTrim(dS(i,Math.max(0,resDp-1)))]),{big,sk:'stp',hints:[mul?`Nhân với ${fN(k)}: dời dấu phẩy sang phải ${e} chữ số.`:`Chia cho ${fN(k)}: dời dấu phẩy sang trái ${e} chữ số.`,''],explain:`${a} ${mul?'×':':'} ${fN(k)} = ${ans}.`});};
MG.decUnit=function(G,lv,P){const kind=RP(['len','mass']);const pr=kind==='len'?RP([['m','cm',100],['km','m',1000],['m','dm',10]]):RP([['kg','g',1000],['tấn','kg',1000],['tạ','kg',100]]);const e=String(pr[2]).length-1;const i=R(pr[2]+1,pr[2]*20);const ans=dTrim(dS(i,e));
  return Qmc('Viết số đo dưới dạng số thập phân.',`${ans} ${pr[0]}`,decOpts(ans,[dTrim(dS(i,e+1)),dTrim(dS(i,Math.max(0,e-1))),dTrim(dS(i+1,e))]).map(x=>`${x} ${pr[0]}`),{big:`${fN(i)} ${pr[1]} = ? ${pr[0]}`,sk:'doluong',hints:[`1 ${pr[0]} = ${fN(pr[2])} ${pr[1]}.`,`Chia cho ${fN(pr[2])}: dời dấu phẩy sang trái ${e} chữ số.`],explain:`${fN(i)} ${pr[1]} = ${ans} ${pr[0]}.`});};
MG.ratio=function(G,lv,P){const t=P.kind?RP(P.kind):lv===0?'pct':RP(['pct','pctOf','find','map']);
  if(t==='pct'){const b=RP([20,25,40,50,80,200,400]);const a=R(1,b-1);const p=a*100/b;if(!Number.isInteger(p))return MG.ratio(G,lv,P);return Qin(`Tìm tỉ số phần trăm của ${a} và ${b}.`,p,{unit:'%',sk:'tiso',hints:[`Lấy ${a} : ${b}.`,'Nhân thương với 100 rồi viết thêm %.'],explain:`${a} : ${b} = ${fD(a/b)} = ${p}%.`});}
  if(t==='pctOf'){const p=RP([5,10,15,20,25,30,40,50,60,75]),N=R(2,40)*20;const v=N*p/100;return Qin(`Tìm ${p}% của ${fN(N)}.`,v,{sk:'tiso',hints:[`Lấy ${fN(N)} : 100 × ${p}.`,''],explain:`${fN(N)} : 100 × ${p} = ${fN(v)}.`});}
  if(t==='find'){const p=RP([10,20,25,40,50]),N=R(2,40)*20;const v=N*p/100;return Qin(`${p}% của một số là ${fN(v)}. Tìm số đó.`,N,{sk:'tiso',hints:[`Lấy ${fN(v)} : ${p} × 100.`,''],explain:`${fN(v)} : ${p} × 100 = ${fN(N)}.`});}
  const sc=RP([1000,2000,5000,10000,500]);const cm=R(2,15);return Qin(`Trên bản đồ tỉ lệ 1 : ${fN(sc)}, quãng đường dài ${cm} cm. Độ dài thật là bao nhiêu mét?`,cm*sc/100,{unit:'m',sk:'tiso',hints:[`Độ dài thật = ${cm} × ${fN(sc)} (cm).`,'Đổi xăng-ti-mét ra mét: chia cho 100.'],explain:`${cm} × ${fN(sc)} = ${fN(cm*sc)} cm = ${fN(cm*sc/100)} m.`});};
MG.motion=function(G,lv,P){const v=R(4,60)*(Math.random()<.5?1:5),t=R(1,6);const s=v*t;const k=P.kind?RP(P.kind):RP(['v','s','t']);
  if(k==='v')return Qin(`Một ô tô đi quãng đường ${s} km trong ${t} giờ. Tính vận tốc của ô tô.`,v,{unit:'km/giờ',sk:'giaitoan',hints:['v = s : t','Quãng đường chia cho thời gian.'],explain:`${s} : ${t} = ${v} (km/giờ).`});
  if(k==='s')return Qin(`Một người đi xe máy với vận tốc ${v} km/giờ trong ${t} giờ. Tính quãng đường người đó đi được.`,s,{unit:'km',sk:'giaitoan',hints:['s = v × t',`${v} × ${t}`],explain:`${v} × ${t} = ${s} (km).`});
  return Qin(`Quãng đường dài ${s} km, một xe đi với vận tốc ${v} km/giờ. Hỏi xe đi hết quãng đường mất bao nhiêu giờ?`,t,{unit:'giờ',sk:'giaitoan',hints:['t = s : v',`${s} : ${v}`],explain:`${s} : ${v} = ${t} (giờ).`});};
MG.timeOp=function(G,lv,P){const h1=R(1,8),m1=R(5,55),h2=R(1,5),m2=R(5,55);const add=Math.random()<.5;let H,M,ex;
  if(add){M=m1+m2;H=h1+h2;ex=`${h1} giờ ${m1} phút + ${h2} giờ ${m2} phút = ${H} giờ ${M} phút`;if(M>=60){ex+=` = ${H+1} giờ ${M-60} phút`;H++;M-=60;}}
  else{const T=(h1+h2)*60+m1-(h2*60+m2);if(T<=0)return MG.timeOp(G,lv,P);H=Math.floor(T/60);M=T%60;ex=`Đổi ra phút rồi trừ: ${h1+h2} giờ ${m1} phút − ${h2} giờ ${m2} phút = ${H} giờ ${M} phút`;}
  return Qsl('Tính.',['Giờ','Phút'],[H,M],[H+1,M+10,Math.max(0,H-1),(M+60)%100],{big:add?`${h1} giờ ${m1} phút + ${h2} giờ ${m2} phút`:`${h1+h2} giờ ${m1} phút − ${h2} giờ ${m2} phút`,bigSmall:true,sk:'doluong',hints:['Cộng (trừ) giờ với giờ, phút với phút.','Số phút từ 60 trở lên thì đổi 60 phút = 1 giờ.'],explain:ex+'.'});};
/* ================= BỘ ĐỀ TOÁN MỚI — dạng bổ sung cho Lớp Lá và bảng bài học từng lớp ================= */
MG.addPic=function(G,lv,P){const mx=P.max||10;const e=RP(['🍎','🍬','🎈','⭐','🍓','🐥']);const kind=P.kind||RP(['gop','them','bot']);
  if(lv===2){const x=R(1,Math.max(1,mx-3)),y=R(1,Math.min(3,mx-x));return Qin(`Bé có một số ${e}. Mẹ cho thêm ${y} ${e} thì bé có ${x+y} ${e}. Lúc đầu bé có mấy ${e}?`,x,{visual:emoRow(Array(x+y).fill(e)),voice:[['vi',`Bé có một số đồ vật. Mẹ cho thêm ${y} thì bé có ${x+y}. Lúc đầu bé có mấy?`]],sk:'congtru',hints:['Bớt đi số mẹ vừa cho thêm.',`Che đi ${y} hình rồi đếm.`],explain:`${x+y} bớt ${y} còn ${x}.`});}
  const a=R(1,mx-1),b=R(1,Math.max(1,(kind==='bot'?a:mx-a)));if(kind==='bot'){if(b>a)return MG.addPic(G,lv,P);return Qin(`Có ${a} ${e}, bớt đi ${b} ${e}. Còn lại mấy ${e}?`,a-b,{visual:emoRow(Array(a-b).fill(e).concat(Array(b).fill('✖️'))),voice:[['vi',`Có ${a}, bớt đi ${b}. Còn lại mấy?`]],sk:'congtru',hints:['Đếm các hình không bị gạch.',`${a} bớt ${b}.`],explain:`${a} bớt ${b} còn ${a-b}.`});}
  if(a+b>mx)return MG.addPic(G,lv,P);return Qin(kind==='gop'?`Gộp ${a} ${e} và ${b} ${e}. Có tất cả mấy ${e}?`:`Có ${a} ${e}, thêm ${b} ${e}. Có tất cả mấy ${e}?`,a+b,{visual:emoRow(Array(a).fill(e))+emoRow(Array(b).fill(e)),voice:[['vi',kind==='gop'?`Gộp ${a} và ${b}. Có tất cả mấy?`:`Có ${a}, thêm ${b}. Có tất cả mấy?`]],sk:'congtru',hints:['Đếm hàng trên rồi đếm tiếp hàng dưới.',`Bắt đầu từ ${a}, đếm thêm ${b}.`],explain:`${a} và ${b} là ${a+b}.`});};
MG.zero=function(G,lv,P){const e=RP(['🍎','🐟','🌸','🎈']);const t=R(0,2);if(t===0)return Qin(`Trong đĩa có mấy ${e}?`,0,{visual:'<div class="ht-big">🍽️</div>',voice:[['vi','Trong đĩa có mấy quả?']],sk:'so',hints:['Đĩa có đồ vật nào không?','Không có gì thì viết số 0.'],explain:'Đĩa trống, có 0 đồ vật.'});
  const a=R(1,9);if(t===1)return Qin(`Có ${a} ${e}, bớt đi ${a} ${e}. Còn lại mấy ${e}?`,0,{visual:emoRow(Array(a).fill('✖️')),sk:'so',hints:['Bớt hết thì còn lại bao nhiêu?',''],explain:`${a} bớt ${a} còn 0.`});
  return Qmc('Số nào bé nhất?','0',shuffle(['0',String(a),String(R(1,9)===a?a+1:R(1,9))]).filter((x,i,ar)=>ar.indexOf(x)===i),{sk:'so',hints:['0 là số bé nhất.',''],explain:'0 là số bé nhất.'});};
MG.updown=function(G,lv,P){const L=[['Con chim bay','phía trên','cái cây','🐦','🌳'],['Con mèo nằm','phía dưới','cái bàn','🐱','🪑'],['Mặt trời ở','phía trên','ngôi nhà','☀️','🏠'],['Con cá bơi','bên trong','bể nước','🐟','🫙'],['Bạn thỏ đứng','bên ngoài','hàng rào','🐰','🚧'],['Quả bóng ở','phía dưới','gầm giường','⚽','🛏️']];const it=RP(L);
  const opts=it[1].startsWith('bên')?['Bên trong','Bên ngoài']:['Phía trên','Phía dưới'];return Qmc(`${it[0]} ở phía nào của ${it[2]}?`,cap(it[1]),opts,{visual:`<div class="ht-big" style="font-size:52px">${it[3]} ${it[4]}</div>`,sk:'hinhhoc',hints:['Tưởng tượng cảnh đó ngoài đời thật.',''],explain:`${it[0]} ${it[1]} ${it[2]}.`});};
MG.blocks=function(G,lv,P){const n=R(2,lv?9:6);const it=RP(['✏️ Bút chì','🖍️ Bút màu','📏 Thước','🥢 Đôi đũa']);return Qin(`${it.split(' ').slice(1).join(' ')} dài bằng mấy ô vuông?`,n,{visual:`<div class="ht-big" style="font-size:30px">${it.split(' ')[0]}</div><div class="ht-emo" style="gap:2px">${Array(n).fill('<span style="display:inline-block;width:26px;height:26px;border:2px solid #1E3A8A;background:#DBEAFE"></span>').join('')}</div>`,sk:'doluong',hints:['Đếm số ô vuông nằm dưới đồ vật.',''],explain:`Dài bằng ${n} ô vuông.`});};
MG.countEmo=function(G,lv,P){const sets=[['🔺','⬜','⚪'],['🍎','🍌','🍐'],['🚗','🚲','🚌']];const s=RP(sets);const target=s[0];const n=R(1,lv?7:4);const others=Array.from({length:R(2,5)},()=>RP(s.slice(1)));const arr=shuffle(Array(n).fill(target).concat(others));
  return Qin(`Có bao nhiêu ${target}?`,n,{visual:emoRow(arr,'wrap'),sk:G===0?'hinhhoc':'so',hints:['Chỉ đếm đúng loại hình được hỏi.','Chạm vào từng hình để đếm.'],explain:`Có ${n} ${target}.`});};
MG.ordinal=function(G,lv,P){return Object.assign(TDG.la_pos(0,lv),{sk:'so'});};

/* ---------- bảng bài: PLAN[lớp][chặng][bài] = các dạng đề [tên, tham số]; 'mix' = ôn tổng hợp cả chặng ---------- */
const g=(n,p)=>[n,p||{}];
const MIX='mix';
const PLAN={
0:[
 [[g('count',{max:5})],[g('count',{max:5}),g('neighbor',{max:5})],[g('groups',{max:5})],[g('split',{max:5}),g('groups',{max:5})],[g('addPic',{max:5})],MIX],
 [[g('count',{max:10})],[g('count',{max:10}),g('neighbor',{max:10})],[g('zero'),g('count',{max:10}),g('neighbor',{max:10})],[g('groups',{max:10}),g('compare',{max:10})],[g('ordinal')],MIX],
 [[g('seq',{max:10,step:[1]}),g('count',{max:10})],[g('neighbor',{max:10}),g('seq',{max:10,step:[1]})],[g('compare',{max:10})],[g('maxmin',{max:10})],[g('order',{max:10})],MIX],
 [[g('addPic',{max:10,kind:'gop'})],[g('addPic',{max:10,kind:'them'})],[g('addPic',{max:10,kind:'bot'})],[g('split',{max:10})],[g('split',{max:10})],MIX],
 [[g('shapeId')],[g('shapeId')],[g('countEmo')],[g('solid')],[g('solid')],MIX],
 [[g('updown'),g('position')],[g('position')],[g('position')],[g('position')],[g('updown'),g('position')],MIX],
 [[g('sizeCmp')],[g('sizeCmp')],[g('blocks')],[g('pattern')],[g('oddOne')],MIX],
 [[g('dayPart')],[g('dayPart')],[g('calendar'),g('dayPart')],[g('clock'),g('dayPart')],[g('count',{max:10}),g('compare',{max:10})],MIX]],
1:[
 [[g('count',{max:5}),g('neighbor',{max:5})],[g('count',{max:10}),g('neighbor',{max:10}),g('seq',{max:10,step:[1]})],[g('groups',{max:10})],[g('compare',{max:10}),g('maxmin',{max:10})],[g('split',{max:10})],MIX],
 [[g('shapeId')],[g('countShapes'),g('countEmo')],[g('addsub',{ops:['+'],max:10,small:1})],[g('addsub',{ops:['+'],max:10,small:1}),g('missing',{max:10,small:1})],[g('wp1',{max:10})],MIX],
 [[g('addsub',{ops:['−'],max:10,small:1})],[g('split',{max:10}),g('addsub',{ops:['−'],max:10,small:1})],[g('addsub',{max:10,small:1}),g('missing',{max:10,small:1})],[g('compare',{max:10})],[g('wp1',{max:10})],MIX],
 [[g('solid')],[g('position')],[g('count',{max:10}),g('compare',{max:10}),g('seq',{max:10,step:[1]})],[g('addsub',{max:10,small:1}),g('missing',{max:10,small:1})],[g('shapeId'),g('solid')],MIX],
 [[g('tens')],[g('readNum',{max:100}),g('tens')],[g('compare',{max:100})],[g('seq',{max:100}),g('neighbor',{max:100})],[g('order',{max:100}),g('maxmin',{max:100})],MIX],
 [[g('blocks'),g('sizeCmp')],[g('measOp',{unit:'cm'})],[g('blocks')],[g('measOp',{unit:'cm'})],[g('measOp',{unit:'cm'})],MIX],
 [[g('addsub',{ops:['+'],max:99,k:1,carry:'none'})],[g('addsub',{ops:['+'],max:99,carry:'none'})],[g('addsub',{ops:['−'],max:99,k:1,carry:'none'})],[g('addsub',{ops:['−'],max:99,carry:'none'})],[g('wp1',{max:99}),g('wpMore',{max:99})],MIX],
 [[g('clock'),g('calendar')],[g('calendar')],[g('calendar'),g('clock')],[g('addsub',{max:10,small:1}),g('missing',{max:10,small:1})],[g('addsub',{max:99,carry:'none'}),g('compare',{max:100})],MIX]],
2:[
 [[g('readNum',{max:100}),g('compare',{max:100}),g('order',{max:100})],[g('seq',{max:100}),g('neighbor',{max:100})],[g('missing',{max:100})],[g('wpMore',{max:100})],[g('addsub',{max:100,carry:'none'})],MIX],
 [[g('addsub',{ops:['+'],max:20,carry:'yes'})],[g('addsub',{ops:['+'],max:20,carry:'yes'}),g('keep',{max:20})],[g('wp1',{max:20})],[g('addsub',{ops:['−'],max:20,carry:'yes'})],[g('wpMore',{max:20})],MIX],
 [[g('measOp',{unit:'kg'})],[g('measOp',{unit:'l'})],[g('measOp',{unit:'kg'}),g('measOp',{unit:'l'})],[g('addsub',{ops:['+'],max:100,k:1,carry:'yes'})],[g('addsub',{ops:['+'],max:100,carry:'yes'})],MIX],
 [[g('addsub',{ops:['−'],max:100,k:1,carry:'yes'})],[g('addsub',{ops:['−'],max:100,carry:'yes'})],[g('wp2',{max:100}),g('wp1',{max:100})],[g('countShapes'),g('shapeId')],[g('polyline'),g('perimeter')],MIX],
 [[g('timeConv'),g('clock')],[g('calendar')],[g('clock'),g('calendar')],[g('addsub',{max:100}),g('missing',{max:100}),g('compare',{max:100})],[g('polyline'),g('measOp'),g('perimeter')],MIX],
 [[g('table',{tables:[2,5],noDiv:1})],[g('table',{tables:[2],noDiv:1})],[g('table',{tables:[5],noDiv:1})],[g('table',{tables:[2,5]}),g('missing',{mulOnly:1,tables:[2,5]})],[g('table',{tables:[2,5]}),g('wpMul',{tables:[2,5]}),g('compare',{max:100,mul:1,tables:[2,5]})],MIX],
 [[g('solid'),g('shapeId'),g('countShapes')],[g('mental',{round:100}),g('readNum',{max:1000})],[g('readNum',{max:1000}),g('place',{max:1000}),g('decomp',{max:1000})],[g('compare',{max:1000}),g('order',{max:1000}),g('maxmin',{max:1000})],[g('conv',{kind:'len',units:['cm','dm','m','km']})],[g('money')]],
 [[g('addsub',{ops:['+'],max:1000})],[g('addsub',{ops:['−'],max:1000})],[g('tally'),g('chart')],[g('chance'),g('tally')],[g('readNum',{max:1000}),g('addsub',{max:1000}),g('missing',{max:1000})],MIX]],
3:[
 [[g('readNum',{max:1000}),g('compare',{max:1000}),g('order',{max:1000}),g('seq',{max:1000})],[g('addsub',{max:1000}),g('missing',{max:1000}),g('keep',{max:1000})],[g('table',{tables:[2,5]}),g('missing',{mulOnly:1,tables:[2,5]})],[g('wp1',{max:1000}),g('wpMore',{max:1000}),g('wp2',{max:1000})],[g('polyline'),g('perimeter'),g('conv',{kind:'len',units:['cm','dm','m']})],MIX],
 [[g('readNum',{max:1000}),g('maxmin',{max:1000}),g('seq',{max:1000,step:[3,4,6]})],[g('addsub',{max:1000,carry:'yes'}),g('expr')],[g('table',{tables:[3,4,6]}),g('keep',{tables:[3,4,6]})],[g('wpMul',{tables:[3,4,6]}),g('wp2',{max:1000})],[g('measOp'),g('clock')],MIX],
 [[g('seq',{max:1000,step:[7,8,9]}),g('compare',{max:100,mul:1,tables:[7,8,9]})],[g('addsub',{max:1000}),g('missing',{max:1000}),g('mental',{round:100})],[g('table',{tables:[7,8,9]}),g('gap')],[g('gap'),g('wpMul',{tables:[7,8,9]}),g('wp2',{max:1000})],[g('conv',{kind:'len',units:['mm','cm','dm','m']}),g('measOp')],MIX],
 [[g('compare',{max:1000}),g('evenOdd',{max:1000})],[g('addsub',{max:1000}),g('expr')],[g('divRem'),g('partOf')],[g('wp2',{max:1000}),g('wpMul',{tables:[2,3,4,5,6,7,8,9]})],[g('money'),g('clock')],MIX],
 [[g('readNum',{max:1000}),g('round',{units:[10,100]})],[g('addsub',{max:1000,carry:'yes'})],[g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('wpUnit'),g('wp2',{max:1000})],[g('midpoint'),g('angle'),g('perimeter'),g('area')],MIX],
 [[g('roman'),g('seq',{max:1000})],[g('measOp')],[g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('measOp'),g('money')],[g('conv',{kind:'len',units:['mm','cm','m','km']}),g('conv',{kind:'mass',units:['g','kg']}),g('conv',{kind:'vol'}),g('clock'),g('calendar'),g('timeConv'),g('temp')],MIX],
 [[g('readNum',{max:100000}),g('place',{max:100000}),g('compare',{max:100000}),g('round',{units:[10,100,1000,10000]}),g('order',{max:100000})],[g('addsub',{max:100000}),g('mental',{round:1000})],[g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('wpUnit'),g('wp2',{max:100000})],[g('area'),g('perimeter'),g('money')],MIX],
 [[g('readNum',{max:100000}),g('compare',{max:100000}),g('maxmin',{max:100000})],[g('expr'),g('keep',{max:1000}),g('quicksum')],[g('table'),g('divRem'),g('gap')],[g('wp2',{max:1000}),g('wpUnit'),g('wpMul')],[g('chance'),g('chart'),g('area'),g('conv',{kind:'mass',units:['g','kg']})],MIX]],
4:[
 [[g('readNum',{max:100000}),g('place',{max:100000}),g('compare',{max:100000}),g('order',{max:100000})],[g('addsub',{max:100000}),g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('evenOdd')],[g('letter')],[g('wp3'),g('wp2',{max:100000})],MIX],
 [[g('angle')],[g('readNum',{max:999999}),g('place',{max:999999})],[g('place',{max:999999}),g('decomp',{max:999999})],[g('readNum',{max:999999}),g('compare',{max:999999})],[g('round',{units:[100,1000,10000,100000]}),g('compare',{max:999999})],[g('seq',{max:999999}),g('evenOdd'),g('maxmin',{max:999999})]],
 [[g('conv',{kind:'mass',units:['kg','yến','tạ','tấn']})],[g('conv',{kind:'area'})],[g('timeConv')],[g('addsub',{max:999999})],[g('quicksum'),g('keep',{max:10000})],[g('wpSumDiff')]],
 [[g('lines'),g('angle')],[g('lines'),g('angle')],[g('lines'),g('perimeter'),g('area')],[g('addsub',{max:999999}),g('mulBig',{d2:1}),g('divBig',{d2:1}),g('expr')],[g('conv',{kind:'mass',units:['kg','yến','tạ','tấn']}),g('area'),g('angle')],MIX],
 [[g('mulBig',{d2:1})],[g('divBig',{d2:1})],[g('times10')],[g('mulProp')],[g('mulProp')],MIX],
 [[g('mulBig',{d2:2})],[g('divBig',{d2:2})],[g('wpAvg')],[g('wpUnit')],[g('chart')],[g('tally'),g('chart')]],
 [[g('fracConcept')],[g('fracConcept')],[g('fracSimplify')],[g('fracSimplify')],[g('fracCompare')],MIX],
 [[g('fracOp',{op:['+']})],[g('fracOp',{op:['−']})],[g('fracOp',{op:['×']})],[g('fracOp',{op:[':']})],[g('fracOf')],MIX]],
5:[
 [[g('readNum',{max:999999}),g('place',{max:999999}),g('expr'),g('missing',{max:100000})],[g('fracSimplify'),g('fracCompare'),g('fracOf')],[g('decRead')],[g('fracOp',{op:['+','−']}),g('fracOp',{op:['×',':']})],[g('mixed')],[g('angle'),g('lines'),g('conv',{kind:'len'}),g('timeConv')]],
 [[g('decRead')],[g('decCompare')],[g('decUnit')],[g('decRound')],[g('conv',{kind:'area5'})],[g('conv',{kind:'area'}),g('conv',{kind:'area5'}),g('decUnit')]],
 [[g('decOp',{op:['+']})],[g('decOp',{op:['−']})],[g('decOp',{op:['×']})],[g('decOp',{op:[':']})],[g('decTimes10')],[g('decOp'),g('wpAvg')]],
 [[g('triTrap',{kind:'tri'})],[g('triTrap',{kind:'trap'})],[g('circle',{kind:'C'})],[g('circle',{kind:'S'})],[g('decOp'),g('decCompare'),g('decRound')],[g('triTrap'),g('circle'),g('conv',{kind:'area'}),g('decUnit')]],
 [[g('ratio',{kind:['pct']})],[g('ratio',{kind:['map']})],[g('wpRatio',{kind:'sum'})],[g('wpRatio',{kind:'diff'})],[g('ratio',{kind:['pct']})],[g('ratio',{kind:['pctOf','find']})]],
 [[g('countShapes'),g('volume',{kind:['box','cube']})],[g('volume',{kind:['conv']})],[g('volume',{kind:['conv','box']})],[g('volume',{kind:['sxq']})],[g('volume',{kind:['stp']})],[g('volume',{kind:['box','cube']})]],
 [[g('timeConv')],[g('timeOp')],[g('timeOp')],[g('motion',{kind:['v']})],[g('motion',{kind:['s','t']})],[g('motion'),g('timeOp')]],
 [[g('chart')],[g('chart')],[g('chance')],[g('readNum',{max:999999}),g('decCompare'),g('fracOp'),g('decOp')],[g('ratio'),g('triTrap'),g('circle'),g('volume'),g('conv',{kind:'area'})],MIX]]};
/* ================= BỘ ĐỀ TOÁN MỚI — tạo bài 15 câu: 6 cơ bản, 6 vận dụng, 3 thử thách ================= */
function planFor(w,d){const C=(PLAN[GRADE]||[])[w];if(!C)return null;let L=C[d];if(L===MIX||!L){const all=[];C.forEach((x,i)=>{if(i!==d&&Array.isArray(x))x.forEach(s=>{if(!all.some(y=>y[0]===s[0]&&JSON.stringify(y[1])===JSON.stringify(s[1])))all.push(s);});});L=all;}return L&&L.length?L:null;}
function mgMake(spec,lv){const [name,P]=spec;let q=null;for(let t=0;t<8&&!q;t++){try{q=MG[name](GRADE,lv,P||{});}catch(e){q=null;}}if(!q)return null;
  const sk=skOf(q.sk||'so');delete q.sk;return Object.assign(q,{skill:sk,mg:name,mp:P||{},lv,hard:lv===2});}
const qk=q=>q.prompt+'|'+(q.big||'')+'|'+q.answer+'|'+(q.visual||'')+'|'+(q.options||[]).slice().sort().join(',');
const MATH_LV=[0,0,0,0,0,0,1,1,1,1,1,1,2,2,2];
function buildMathNew(w,d){const L=planFor(w,d);if(!L)return null;const out=[],keys=new Set();let order=shuffle(L.slice());let k=0;
  for(const lv of MATH_LV){let q=null,tries=0;while(tries<12){const spec=order[k%order.length];k++;if(k%order.length===0)order=shuffle(L.slice());q=mgMake(spec,lv);tries++;if(q&&!keys.has(qk(q)))break;}
    if(!q||keys.has(qk(q)))continue;keys.add(qk(q));out.push(q);}
  /* câu thử thách để cuối bài */
  return out.filter(q=>!q.hard).concat(out.filter(q=>q.hard));}
if(typeof buildLevel==='function'){const _bl=buildLevel;buildLevel=function(w,d){try{const qs=buildMathNew(w,d);if(qs&&qs.length>=10)return qs;}catch(e){}return _bl.apply(this,arguments);};}
window.__HT_MATH__=1;
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
  if(q.mg&&MG[q.mg]){const n=mgMake([q.mg,q.mp||{}],q.lv||0);if(n)return n;}
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
  const body=document.querySelector('.quiz .qbody');if(!body)return;const mb=document.querySelector('.quiz .ht-mascot .bb');let b=mb||$('#htBub');if(!b){b=document.createElement('div');b.className='ht-bub';b.id='htBub';const head=body.querySelector('.qhead');if(head&&head.nextSibling)body.insertBefore(b,head.nextSibling);else body.insertBefore(b,body.firstChild);}
  const card=cardForQ(q);const inner=`${hs.slice(0,q._hn).map((h,i)=>(i===0?'💡 ':'')+H(h)).join('<br>')}${card?'<br><a id="htOpenKc">Mở thẻ kiến thức →</a>':''}`;b.innerHTML=mb?inner:`<span class="ow" aria-hidden="true">🦉</span><div>${inner}</div>`;if(mb)b.id='htBub';
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
  try{const q0=Q&&Q.qs&&Q.qs[Q.i];if(q0)htRestyleQuiz(q0);}catch(e){}
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
    Q._lastBad=bad;if(sh){const card=cardForQ(q);htRestyleSheet(q,bad,card,chosen);}}catch(e){}
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
  /* bỏ tab Siêu tốc, đặt tab Tư duy vào chỗ đó */
  const re=/<button class="tab[^"]*" data-act="tab" data-t="speed"[^>]*>[\s\S]*?<\/button>/;h=re.test(h)?h.replace(re,btn):h.replace('</div></nav>',btn+'</div></nav>');}catch(e){}return h;};
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
/* xác nhận của bố mẹ: có tài khoản thì nhập mật khẩu đăng nhập; dùng không đăng nhập thì làm phép nhân */
let PG_OK_UNTIL=0;
function parentConfirm(o){o=o||{};if(LOGGED()&&o.remember!==false&&Date.now()<PG_OK_UNTIL){o.ok();return;}
  if(!LOGGED()){const a=rnd(6,9),b=rnd(6,9);const m=modal(`<div class="big-ic">${o.icon||'👪'}</div><h2>${o.title||'Góc phụ huynh'}</h2>${o.body||''}<p>Bố mẹ nhập kết quả của ${a} × ${b}</p><input class="field" id="pcA" type="number" inputmode="numeric" aria-label="Kết quả"><div style="height:12px"></div><button class="btn btn-go" id="pcY">${o.okText||'Vào'}</button><button class="btn btn-soft" id="pcN">Quay lại</button>`);
    const f=m.querySelector('#pcA');setTimeout(()=>f.focus(),50);const go=()=>{if(Number(f.value)===a*b){m.remove();o.ok();}else{f.value='';toast('Chưa đúng, thử lại nhé.');}};m.querySelector('#pcY').onclick=go;f.addEventListener('keydown',e=>{if(e.key==='Enter')go();});m.querySelector('#pcN').onclick=()=>m.remove();return;}
  const m=modal(`<div class="big-ic">${o.icon||'👪'}</div><h2>${o.title||'Góc phụ huynh'}</h2>${o.body||''}<p>Bố mẹ nhập <b>mật khẩu đăng nhập</b> của tài khoản ${H(S.name||'')} để tiếp tục.</p><input class="field" id="pcP" type="password" autocomplete="current-password" aria-label="Mật khẩu"><div id="pcE" class="ht-pcerr"></div><button class="btn btn-go" id="pcY">${o.okText||'Vào'}</button><button class="btn btn-soft" id="pcN">Quay lại</button>`);
  const f=m.querySelector('#pcP'),er=m.querySelector('#pcE'),bt=m.querySelector('#pcY');setTimeout(()=>f.focus(),50);
  const go=async()=>{const pw=f.value;if(!pw){er.textContent='Nhập mật khẩu nhé.';return;}bt.disabled=true;er.textContent='';
    try{await apiPost('/x/student/verify-password',{password:pw});PG_OK_UNTIL=Date.now()+10*60*1000;m.remove();o.ok();}
    catch(e){bt.disabled=false;f.value='';er.textContent=e&&e.message||'Mật khẩu chưa đúng.';f.focus();}};
  bt.onclick=go;f.addEventListener('keydown',e=>{if(e.key==='Enter')go();});m.querySelector('#pcN').onclick=()=>m.remove();}
if(typeof parentGate==='function')parentGate=function(){parentConfirm({ok:()=>renderParent()});};
function redeemGift(i){const g=S.pg.list[i];if(!g)return;
  parentConfirm({icon:H(g.i||'🎁'),title:`Đổi “${H(g.n)}”?`,body:`<p>Con sẽ dùng <b>🪙 ${g.p}</b> trong ${S.coins} xu.</p>`,okText:'Bố mẹ đồng ý',remember:false,ok:()=>{
    if(S.coins<g.p){toast('Con chưa đủ xu.');return;}
    S.coins-=g.p;S.pg.log.push({n:g.n,i:g.i,p:g.p,d:todayStr()});S.pg.log=S.pg.log.slice(-30);save();syncRewards();pgSave();sfx.win();confetti();toast('Đã đổi quà! Con nhớ nhắc bố mẹ nhé 🎉');renderAchieve('gift');}});}
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
/* ================= GIAO DIỆN MỚI: tông navy – xanh dương, màn làm bài kiểu thẻ (giữ nguyên font) ================= */
const THEME_CSS=`
:root{--sky:#2563EB;--sky-d:#1E40AF;--berry:#EA580C;--berry-d:#C2410C;--hv-pri:#2563EB;--hv-pri-d:#1E40AF;--hv-navy:#1E3A8A;--hv-ok:#16A34A;--hv-bad:#EA580C;--hv-tag:#DBEAFE;--hv-tagt:#1E40AF;--hv-shadow:#C9D7EA}
:root:not([data-theme="dark"]){--paper:#EEF4FB;--grid:#DCE6F3;--margin:#C3D5EE;--ink:#0F1E3D;--muted:#5B6B86;--line:#D6E2F0;--soft:#E3ECF8;--lock:#CBD5E1;--lock-d:#94A3B8;
  --dln:#D6E2F0;--dln-d:#B8C8DE;--dsel-bg:#DBEAFE;--dsel-tx:#1E40AF;--dok-bg:#DCFCE7;--dok-tx:#166534;--dbad-bg:#FFEDD5;--dbad-tx:#9A3412;--db:#2563EB;--db-d:#1E40AF}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--hv-tag:#1E3A5F;--hv-tagt:#BFDBFE;--hv-shadow:#0B1530}}
:root[data-theme="dark"]{--hv-tag:#1E3A5F;--hv-tagt:#BFDBFE;--hv-shadow:#0B1530}
body .btn-go{--c:var(--hv-pri);--cd:var(--hv-pri-d)}
body .btn-bad{--c:var(--hv-bad);--cd:#C2410C}
body .btn-soft{color:var(--hv-pri)}
body .tab.on{color:var(--hv-pri)}
body .tab.on span{filter:none;opacity:1}
.topbar{background:var(--paper)}
.pill{border-color:var(--line)}
/* ---- màn làm bài ---- */
.quiz{background:var(--paper)}
.quiz .qtop{gap:12px;padding:14px 16px 8px}
.quiz .qtop .icon-btn{flex:none;width:52px;height:52px;border-radius:16px;background:var(--card);border:0;box-shadow:0 4px 0 var(--hv-shadow);display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--muted);padding:0}
.quiz .qtop .icon-btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--hv-shadow)}
.quiz .bar{height:14px;border-radius:99px;background:var(--line)}
.quiz .bar i{background:#10B981;border-radius:99px}
.quiz .bar i::after{display:none}
.quiz .qcount{font-weight:800;color:var(--muted);font-size:16px;min-width:44px;text-align:right}
.quiz .qbody{padding:4px 16px 12px}
.quiz .qhead{justify-content:flex-start;gap:8px;flex-wrap:wrap;margin:2px 0 10px}
.quiz .qhead .tag{background:var(--hv-tag);color:var(--hv-tagt);text-transform:none;letter-spacing:0;font-size:14px;font-weight:800;padding:5px 12px;border-radius:999px}
.quiz .qhead .tag-hard{background:#FEF3C7;color:#92400E}
.ht-mascot{display:flex;align-items:center;gap:12px;margin:0 0 12px}
.ht-mascot .ow{font-size:44px;line-height:1;flex:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.06))}
html body .ht-mascot .bb a{display:inline-block;margin-top:6px;color:var(--hv-pri-d);font-weight:800;cursor:pointer}
.ht-mascot .bb{flex:1;background:var(--card);border-radius:18px;padding:12px 16px;font-weight:700;font-size:16px;box-shadow:0 4px 0 var(--hv-shadow);color:var(--ink)}
.ht-card{background:var(--card);border-radius:24px;padding:18px 18px 16px;box-shadow:0 5px 0 var(--hv-shadow);margin:0 0 14px}
.ht-card .prompt{margin:0 0 6px;font-size:20px;line-height:1.45;font-weight:700}
.ht-card.lab .prompt{text-align:center;color:var(--muted);font-size:17px;font-weight:700}
.ht-card .big{font-size:44px;margin:6px 0 4px;color:var(--ink);word-spacing:2px}
.ht-card .ht-fig{margin-top:8px}
.ht-card .inputbox{margin-top:10px}
.quiz .slot{display:inline-flex;align-items:center;justify-content:center;min-width:1.6em;min-height:1.25em;padding:0 .25em;border:3px dashed #93A9C9;border-radius:16px;color:transparent;background:var(--paper);vertical-align:middle;line-height:1.1}
.quiz .slot.filled{border:3px solid var(--hv-pri);color:var(--hv-pri-d);background:var(--card)}
.quiz .inputbox .slot{min-width:3.2em;min-height:1.5em;font-size:40px}
.quiz .opts{grid-template-columns:1fr 1fr;gap:12px}
.quiz .opts.short{grid-template-columns:1fr 1fr}
.quiz .opts.ht-1col{grid-template-columns:1fr}
.quiz .opt{min-height:68px;font-size:26px;font-weight:800;text-align:center;border-radius:20px;background:var(--card);border:2.5px solid var(--line);box-shadow:0 4px 0 var(--hv-shadow);color:var(--ink);display:flex;align-items:center;justify-content:center;padding:8px 10px;line-height:1.25}
.quiz .opts.ht-1col .opt{font-size:18px;text-align:left;justify-content:flex-start;min-height:56px;padding:10px 16px}
.quiz .opts.ht-mid .opt{font-size:19px}
.quiz .opt.sel{border-color:var(--hv-pri);background:var(--dsel-bg);color:var(--dsel-tx);box-shadow:0 4px 0 var(--hv-pri)}
.quiz .opt.right{border-color:#10B981;background:var(--dok-bg);color:var(--dok-tx);box-shadow:0 4px 0 #10B981}
.quiz .opt.wrong{border-color:var(--hv-bad);background:var(--dbad-bg);color:var(--dbad-tx);box-shadow:0 4px 0 var(--hv-bad)}
.quiz .qfoot{border-top:0;padding:8px 16px calc(12px + env(safe-area-inset-bottom,0px));background:var(--paper)}
.quiz .pad.ht5{grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:10px}
.quiz .pad.ht5 .key{height:62px;border-radius:18px;font-size:30px;border:2px solid var(--line);box-shadow:0 4px 0 var(--hv-shadow);background:var(--card);color:var(--ink)}
.quiz .ht-padrow{display:grid;grid-template-columns:2fr 3fr;gap:10px}
.quiz .ht-padrow .key{height:62px;border-radius:18px;font-size:26px;border:2px solid var(--line);box-shadow:0 4px 0 var(--hv-shadow);background:var(--card);color:var(--muted)}
.quiz .ht-padrow #check{margin:0;height:62px;padding:0}
.quiz #check{border-radius:18px}
.quiz #check:disabled{background:#BFD3F2;box-shadow:0 4px 0 #A7C0E6;color:#fff;opacity:1}
.quiz .ht-tools{margin-top:8px}
.ht-hint{color:var(--hv-pri-d)}
/* ---- thanh kết quả ---- */
.quiz .sheet{border-radius:26px 26px 0 0;padding:18px 18px calc(16px + env(safe-area-inset-bottom,0px));box-shadow:0 -6px 24px rgba(15,30,61,.12)}
.quiz .sheet.good{background:#E3F7EC;color:#14532D}
.quiz .sheet.bad{background:#FFEFE3;color:#9A3412}
.quiz .sheet .ht-fbh{display:flex;align-items:center;gap:12px}
.quiz .sheet .fb-title{flex:1;font-size:24px;line-height:1.2}
.quiz .sheet .fb-title::before{background:#16A34A;color:#fff;width:42px;height:42px;font-size:24px}
.quiz .sheet.bad .fb-title::before{content:"!";background:var(--hv-bad);color:#fff;font-weight:900}
.quiz .sheet .fb-coin{margin:0;font-weight:800;font-size:18px;color:#15803D;white-space:nowrap}
.quiz .sheet .ht-fbtext{font-size:16px;line-height:1.5;margin:12px 0 4px;white-space:pre-line;font-weight:600}
.quiz .sheet .ht-fbtext b{font-weight:800}
.quiz .sheet .ht-fbtext .more{display:block;margin-top:6px;font-weight:800}
.quiz .sheet .fb-ans,.quiz .sheet .fb-exp{display:none}
.quiz .sheet .ht-rep{display:inline-flex;align-items:center;gap:6px;border:0;background:none;color:inherit;opacity:.85;font-weight:800;font-size:14px;padding:6px 0;margin:2px 0 8px}
.quiz .sheet .ht-rep i{font-style:normal;display:inline-flex;width:20px;height:20px;border-radius:50%;background:currentColor;align-items:center;justify-content:center}
.quiz .sheet .ht-rep i::after{content:"!";color:#fff;font-size:13px;font-weight:900}
.quiz .sheet .ht-btns{display:flex;gap:12px}
.quiz .sheet .ht-btns .btn{flex:1;margin:0;font-size:16px;letter-spacing:.2px;text-transform:none;border-radius:18px;padding:14px 8px}
.quiz .sheet .ht-btns .ht-kcb{--c:var(--card);--cd:var(--hv-shadow);background:var(--card);color:var(--hv-pri-d);border:0}
.quiz .sheet .fb-combo{margin:0 0 8px}
.quiz .sheet .ht-fbx{display:none}
.ht-col{display:inline-block;font-variant-numeric:tabular-nums;font-weight:800;font-size:28px;line-height:1.25;text-align:right;margin:6px auto 0;padding:6px 18px;border-radius:14px;background:var(--paper)}
.ht-col i{font-style:normal;color:var(--hv-pri);margin-right:6px}
.ht-col .ln{border-top:3px solid var(--ink);margin-top:2px}
.ht-card .ht-col{display:table;margin:8px auto 0}
.ht-pcerr{color:var(--berry-d);font-weight:700;min-height:20px;margin:6px 0}
/* ---- bản đồ, trang khác ---- */
.notebook::before{background:var(--margin)}
.hello .say{box-shadow:0 4px 0 var(--hv-shadow)}
.ht-due{border-color:var(--hv-pri)}
.ht-due .it i{background:var(--hv-pri)}
.ht-due .it button{color:var(--hv-pri-d)}
.ht-subseg button[aria-selected="true"]{background:var(--hv-pri)}
.ht-row .n{color:var(--c,var(--hv-pri))}
.ht-bar i{background:var(--c,var(--hv-pri))}
.duo-combo{color:var(--hv-pri)}
`;
const thEl=document.createElement('style');thEl.id='ht-theme';thEl.textContent=THEME_CSS.replace(/(^|\n)\.quiz/g,'$1html body .quiz');document.head.appendChild(thEl);
/* màu các chặng / bản đồ: dải navy – xanh dương – xanh ngọc */
const MASC=[['#1E3A8A','#172554'],['#2563EB','#1E40AF'],['#0F766E','#115E59'],['#4338CA','#3730A3'],['#0369A1','#075985'],['#334155','#1E293B'],['#0891B2','#0E7490'],['#15803D','#166534'],['#1D4ED8','#1E3A8A'],['#0E7490','#155E75']];
function recolor(arr){try{if(Array.isArray(arr))arr.forEach((c,i)=>{if(Array.isArray(c)){const m=MASC[i%MASC.length];c[0]=m[0];c[1]=m[1];}});}catch(e){}}
try{if(typeof WCOL!=='undefined')recolor(WCOL);}catch(e){}
try{if(typeof ECOL!=='undefined')recolor(ECOL);}catch(e){}
try{if(typeof TCOL!=='undefined')recolor(TCOL);}catch(e){}
try{if(typeof EXAM_SUBJ!=='undefined'){let i=0;Object.keys(EXAM_SUBJ).forEach(k=>{const E=EXAM_SUBJ[k];if(E&&E.c){const m=[['#1D4ED8','#1E3A8A'],['#0F766E','#115E59'],['#4338CA','#3730A3'],['#0369A1','#075985']][i++%4];E.c=m[0];E.cd=m[1];}});}}catch(e){}
TD_GROUPS.forEach((g,i)=>{const m=MASC[i%MASC.length];g.c=m[0];g.cd=m[1];});TD_GROUPS_LA.forEach((g,i)=>{const m=MASC[i%MASC.length];g.c=m[0];g.cd=m[1];});

/* bàn phím số 5 cột, nút xóa và nút Kiểm tra cùng hàng */
if(typeof keypadHTML==='function')keypadHTML=function(){return `<div class="pad ht5">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button class="key" data-k="${n}">${n}</button>`).join('')}</div><div class="ht-padrow"><button class="key fn" data-k="B" aria-label="Xóa một số">⌫</button><span class="ht-chk"></span></div>`;};

/* lời Cú Bông theo tình huống */
const MAS_VI={start:['Mình cùng làm nhé!','Đọc kỹ đề rồi trả lời nha!','Con làm từ từ, không vội nhé!'],after:['Không sao, câu này mình cẩn thận hơn nhé!','Từ từ suy nghĩ nào!','Đọc lại đề thật kỹ nha!'],combo:['Con đang làm rất tốt!','Giỏi quá, tiếp tục nào!','Đúng liền mấy câu rồi đó!'],end:['Sắp về đích rồi, cố lên!','Chỉ còn vài câu nữa thôi!'],review:['Câu cùng dạng với câu con vừa sai, thử lại nhé!'],hard:['Câu thử thách đây, con dám thử không?']};
const MAS_EN={start:['You can do it!','Read carefully!','Take your time!'],after:['No worries, try this one!','Think it through!'],combo:['Great streak!','Awesome, keep going!'],end:['Almost there!','Just a few more!'],review:['Same type as before. Try again!'],hard:['Challenge time!']};
function mascotLine(q){const M=(typeof isEnQ==='function'&&isEnQ())?MAS_EN:MAS_VI;let k='start';
  if(Q.review)k='review';else if(q.hard)k='hard';else if((Q.combo||0)>=3)k='combo';else if(Q._lastBad)k='after';else if(Q.i>=Q.qs.length-3&&Q.i>2)k='end';return RP(M[k]);}
function lessonPill(q){try{if(Q.daily)return '⭐ Thử thách hôm nay';if(Q.td!=null){const L=tdLesson(Q.td);return L?L.t:'';}
  if(isMainQ()){const w=Math.floor(Q.level/6),d=Q.level%6;const t=lessonTitleSpecific(w,d);return t?`Bài ${d+1} · ${t}`:`Chặng ${w+1} · ${(LEVEL_INFO[d]&&LEVEL_INFO[d].n)||''}`;}}catch(e){}return null;}
/* sắp xếp lại màn làm bài sau khi app vẽ xong */
function htRestyleQuiz(q){const quiz=document.querySelector('.quiz');if(!quiz||quiz.classList.contains('mg'))return;const body=quiz.querySelector('.qbody'),head=quiz.querySelector('.qhead'),top=quiz.querySelector('.qtop');if(!body||!head)return;
  const sp=head.querySelector('#speakQ');if(sp&&top){top.appendChild(sp);sp.textContent='🔊';}
  const pill=lessonPill(q);const tag=head.querySelector('.tag');if(pill&&tag)tag.textContent=pill;
  if(!quiz.querySelector('.ht-mascot')){const m=document.createElement('div');m.className='ht-mascot';m.innerHTML=`<span class="ow" aria-hidden="true">🦉</span><div class="bb">${H(mascotLine(q))}</div>`;head.parentNode.insertBefore(m,head.nextSibling);}
  /* thẻ đề: gom câu hỏi, phép tính, hình vẽ */
  const pr=body.querySelector('.prompt');if(pr&&!body.querySelector('.ht-card')){const card=document.createElement('div');card.className='ht-card';pr.parentNode.insertBefore(card,pr);
    let n=pr;const move=[];while(n&&n.id!=='ans'){move.push(n);n=n.nextElementSibling;}move.forEach(x=>card.appendChild(x));
    const shortP=String(q.prompt||'').length<=70;if(q.big||(q.visual&&shortP&&q.type!=='slots'))card.classList.add('lab');
    const ib=body.querySelector('#ans .inputbox');if(ib)card.appendChild(ib);}
  /* cỡ chữ phép tính theo độ dài để không bị xuống dòng */
  const bg=body.querySelector('.ht-card .big');if(bg&&q.big){const L=String(q.big).replace(/\s+/g,' ').length;bg.style.fontSize=(L<=9?46:L<=13?38:L<=17?32:L<=24?26:22)+'px';}
  /* lựa chọn dài thì 1 cột */
  const opts=body.querySelector('.opts');if(opts&&Array.isArray(q.options)){const L=Math.max(...q.options.map(o=>String(o).length));if(L>16)opts.classList.add('ht-1col');else if(L>8)opts.classList.add('ht-mid');}
  /* nút Kiểm tra cạnh nút xóa */
  const slot=quiz.querySelector('.ht-chk'),chk=quiz.querySelector('#check');if(slot&&chk){slot.replaceWith(chk);}}
/* thanh kết quả: tiêu đề + xu, lời giải, báo câu sai, 2 nút */
function htRestyleSheet(q,bad,card,chosen){const sh=$('#sheet');if(!sh)return;const title=sh.querySelector('.fb-title'),coin=sh.querySelector('.fb-coin'),ans=sh.querySelector('.fb-ans'),exp=sh.querySelector('.fb-exp'),nb=sh.querySelector('#next');if(!title||!nb)return;
  const hd=document.createElement('div');hd.className='ht-fbh';sh.insertBefore(hd,title);hd.appendChild(title);if(coin)hd.appendChild(coin);
  const EN=typeof isEnQ==='function'&&isEnQ();const txt=document.createElement('div');txt.className='ht-fbtext';
  let html='';if(bad&&ans)html+=(EN?ans.innerHTML:ans.innerHTML.replace(/:\s*/,' là '))+'. ';if(exp)html+=H(exp.textContent);
  if(bad&&!Q.review&&q.type!=='speak'&&(q.mg||q.gen||isMainQ()))html+=`<span class="more">${EN?'You will get a similar question at the end.':'Cuối bài sẽ có một câu cùng dạng (đổi số) để con luyện lại nhé.'}</span>`;
  if(html){txt.innerHTML=html;sh.insertBefore(txt,nb);}
  const rp=document.createElement('button');rp.type='button';rp.className='ht-rep';rp.innerHTML=`<i></i>${EN?'Report this question':'Báo câu sai'}`;rp.onclick=()=>reportQ(q,chosen);sh.insertBefore(rp,nb);
  const row=document.createElement('div');row.className='ht-btns';sh.insertBefore(row,nb);
  if(card&&bad){const kb=document.createElement('button');kb.type='button';kb.className='btn ht-kcb';kb.textContent='📘 Xem thẻ kiến thức';kb.onclick=()=>showCard(card,{back:'Quay lại bài làm'});row.appendChild(kb);}
  row.appendChild(nb);const cb=sh.querySelector('.fb-combo');if(cb)sh.insertBefore(cb,row);}
const moveCss=()=>{document.head.appendChild(stEl);document.head.appendChild(thEl);};setTimeout(moveCss,0);window.addEventListener('load',moveCss);
/* màn hình đầu tiên đã vẽ trước khi lớp này chạy → vẽ lại để có tab Tư duy và các mục mới */
try{if(document.querySelector('#scr')&&document.querySelector('.tab[data-t="map"].on'))renderHome();
  else{const tb=document.querySelector('nav.tabbar');if(tb){const on=tb.querySelector('.tab.on');const t=on?on.dataset.t:'';const d=document.createElement('div');d.innerHTML=tabbar(t);if(d.firstElementChild)tb.replaceWith(d.firstElementChild);}}}catch(e){}
window.HT={TDG,TD_ALL,TD_LA,KC,tdBuild,tdMake,kcFor,kcForChapter,bankQs,cardForQ,GRADE,similarQ,polyomino};
})();
