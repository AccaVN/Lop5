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
/* ---------------- TOÁN TƯ DUY: BỘ SINH ĐỀ MỞ RỘNG (10/2026, lần 3) ---------------- */
const tdEq=lines=>`<div class="ht-eqs">${lines.map(l=>`<div class="ht-eq">${l}</div>`).join('')}</div>`;
const tdTab=(rows,hid)=>`<div class="ht-grid ht-mach" style="grid-template-columns:repeat(${rows[0].length},1fr)">${rows.map((r,i)=>r.map((v,j)=>{const h=hid&&hid[0]===i&&hid[1]===j;return `<span class="${h?'hid':j===0?'hd':''}">${h?'?':typeof v==='number'?fN(v):esc(v)}</span>`;}).join('')).join('')}</div>`;
const binom=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);};

/* 21. Que diêm xếp hình */
function matchSVG(kind,k){const U=34;let b='',x0=6,W=0;const ln=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>`;
  for(let f=1;f<=3;f++){let w=0;if(kind==='sq'){for(let i=0;i<f;i++){const x=x0+i*U;b+=ln(x,10,x+U,10)+ln(x,10+U,x+U,10+U)+ln(x,10,x,10+U);}b+=ln(x0+f*U,10,x0+f*U,10+U);w=f*U;}
    else{const h=30;for(let i=0;i<f;i++){const x=x0+i*U/2;if(i%2===0)b+=ln(x,10+h,x+U/2,10)+ln(x+U/2,10,x+U,10+h)+ln(x,10+h,x+U,10+h);else b+=ln(x,10,x+U,10);}w=(f+1)*U/2;}
    b+=`<text x="${x0+w/2}" y="${10+U+18}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">Hình ${f}</text>`;x0+=w+26;W=x0;}
  return SVGW(W,10+U+26,b,'Que diêm xếp hình');}
TDG.matchSeq=function(G,lv){const kind=RP(['sq','tri']);const a=kind==='sq'?4:3,d=kind==='sq'?3:2;const shape=kind==='sq'?'hình vuông':'hình tam giác';
  const vis=matchSVG(kind,3);const head=`An xếp que diêm thành các ${shape} như hình. Hình 1 dùng ${a} que, Hình 2 dùng ${a+d} que, Hình 3 dùng ${a+2*d} que.`;
  const nMax=G===1?6:G===2?10:G===3?20:40;
  if(lv===2&&G>=2){const n=R(5,nMax);const T=a+(n-1)*d;return Qin(`${head} Với ${T} que diêm, An xếp được đúng hình thứ mấy?`,n,{visual:vis,hints:[`Mỗi hình sau thêm ${d} que.`,`Bớt ${a} que của Hình 1: ${T} − ${a} = ${T-a}. Chia cho ${d} để biết đã thêm mấy lần.`],explain:`(${T} − ${a}) : ${d} = ${(T-a)/d}. Thêm ${(T-a)/d} lần sau Hình 1 nên là Hình ${n}.`});}
  const n=lv===0?R(4,G===1?5:6):R(G===1?5:7,nMax);const T=a+(n-1)*d;
  return Qin(`${head} Hình ${n} dùng bao nhiêu que?`,T,{visual:vis,hints:[`Mỗi hình sau thêm ${d} que: ${a}, ${a+d}, ${a+2*d}, …`,G===1?`Đếm thêm ${d} que cho đến Hình ${n}.`:`Hình ${n} = ${a} + (${n} − 1) × ${d}.`],explain:G===1?`${Array.from({length:n},(_,i)=>a+i*d).join(', ')}. Hình ${n} dùng ${T} que.`:`${a} + (${n} − 1) × ${d} = ${a} + ${(n-1)*d} = ${T} que.`});};

/* 22. Máy biến số */
TDG.machine=function(G,lv){const rules=G===1?['add','sub']:G===2?['add','sub','mul']:['mul','muladd','mulsub','add'];
  for(let t=0;t<40;t++){const k=lv===0?rules[R(0,Math.min(1,rules.length-1))]:RP(rules);const a=k==='add'||k==='sub'?1:R(2,G<=2?5:G===3?9:12),b=k==='mul'?0:R(1,G===1?9:G===2?20:G===3?30:50);
    const f=x=>k==='add'?x+b:k==='sub'?x-b:k==='mul'?a*x:k==='muladd'?a*x+b:a*x-b;const xmax=G===1?20:G===2?30:G===3?50:100;
    const xs=new Set();while(xs.size<4)xs.add(R(k==='sub'||k==='mulsub'?Math.ceil((b+1)/a):1,xmax));const X=[...xs];const Y=X.map(f);
    if(Y.some(y=>y<0||y>(G===1?100:999999)))continue;const desc=k==='add'?`cộng ${b}`:k==='sub'?`trừ ${b}`:k==='mul'?`nhân ${a}`:k==='muladd'?`nhân ${a} rồi cộng ${b}`:`nhân ${a} rồi trừ ${b}`;
    const back=lv===2&&G>=2;const hid=back?[0,4]:[1,4];const vis=tdTab([['Số vào',...X],['Số ra',...Y]],hid);const ans=back?X[3]:Y[3];
    return Qin(back?'Máy biến số làm cùng một phép tính với mọi số cho vào. Số nào đã được cho vào?':'Máy biến số làm cùng một phép tính với mọi số cho vào. Số ra còn thiếu là bao nhiêu?',ans,{visual:vis,hints:['So sánh số vào và số ra ở từng cột: thêm, bớt hay gấp lên?',`Máy ${desc}.`],explain:back?`Máy ${desc}. Làm ngược lại với ${fN(Y[3])}: được ${fN(X[3])}.`:`Máy ${desc}: ${fN(X[3])} → ${fN(Y[3])}.`});}
  return null;};

/* 23. Quy luật chữ cái */
const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
TDG.letters=function(G,lv){const kind=lv===0?'step':lv===1?RP(G===1?['step','num']:['step','num','back']):RP(G===1?['num','step']:['alt','num2','back']);
  let seq=[],ans,why;
  if(kind==='step'||kind==='back'){const d=R(1,G===1?2:3)*(kind==='back'?-1:1);const len=G===1?12:26;const st=d>0?R(0,len-1-4*d):R(-4*d,25);for(let i=0;i<4;i++)seq.push(ABC[st+i*d]);ans=ABC[st+4*d];why=d>0?`Mỗi chữ cách nhau ${d} chữ cái (nhảy ${d}).`:`Dãy đi ngược bảng chữ cái, mỗi lần lùi ${-d} chữ.`;}
  else if(kind==='num'){const d=R(1,2),e=R(1,G===1?2:3);const st=R(0,10),n0=R(1,5);for(let i=0;i<4;i++)seq.push(ABC[st+i*d]+(n0+i*e));ans=ABC[st+4*d]+(n0+4*e);why=`Chữ cái nhảy ${d}, số tăng thêm ${e} mỗi lần.`;}
  else if(kind==='num2'){const d=R(1,2);const st=R(0,12),m=R(2,3);for(let i=0;i<4;i++)seq.push(ABC[st+i*d]+(m*(i+1)));ans=ABC[st+4*d]+(m*5);why=`Chữ cái nhảy ${d}, số là bảng nhân ${m}.`;}
  else{const st=R(0,6);for(let i=0;i<3;i++){seq.push(ABC[st+i]);seq.push(ABC[25-st-i]);}seq=seq.slice(0,5);ans=ABC[25-st-2];why='Hai dãy đan xen: một dãy đi xuôi từ đầu bảng chữ cái, một dãy đi ngược từ cuối.';}
  const wrong=new Set();const near=c=>{const m=/^([A-Z])(\d*)$/.exec(c);const i=ABC.indexOf(m[1]);const alt=[ABC[(i+1)%26],ABC[(i+25)%26],ABC[(i+2)%26]];return m[2]?[alt[0]+m[2],m[1]+(+m[2]+1),alt[1]+m[2],m[1]+Math.max(0,+m[2]-1)]:alt;};
  near(ans).forEach(x=>{if(x!==ans&&wrong.size<3)wrong.add(x);});
  return Qmc('Chữ (hoặc chữ và số) tiếp theo là gì?',ans,shuffle([ans,...wrong]),{big:seq.join(', ')+', ?',hints:['Viết bảng chữ cái A B C D E… ra giấy rồi đánh dấu các chữ trong dãy.',why],explain:`${why} Đáp án: ${ans}.`});};

/* 24. Đếm đường đi trên lưới */
function pathSVG(m,n){const U=40,X=24,Y=18;let b='';for(let i=0;i<=m;i++)b+=`<line x1="${X}" y1="${Y+i*U}" x2="${X+n*U}" y2="${Y+i*U}" stroke="#334155" stroke-width="3"/>`;for(let j=0;j<=n;j++)b+=`<line x1="${X+j*U}" y1="${Y}" x2="${X+j*U}" y2="${Y+m*U}" stroke="#334155" stroke-width="3"/>`;
  b+=`<circle cx="${X}" cy="${Y}" r="7" fill="#2563EB"/><text x="${X-12}" y="${Y-4}" font-size="15" font-weight="800" fill="#2563EB">A</text><circle cx="${X+n*U}" cy="${Y+m*U}" r="7" fill="#DC2626"/><text x="${X+n*U+6}" y="${Y+m*U+18}" font-size="15" font-weight="800" fill="#DC2626">B</text>`;
  return SVGW(X+n*U+28,Y+m*U+26,b,'Lưới ô vuông từ A đến B');}
TDG.paths=function(G,lv){const P=lv===0?[[1,1],[1,2],[1,3],[2,2]]:lv===1?(G<=3?[[2,2],[1,4],[2,3]]:[[2,3],[3,3],[1,5],[2,4]]):(G<=3?[[2,3],[3,3]]:[[3,3],[2,4],[3,4],[2,5]]);let [m,n]=RP(P);if(Math.random()<.5)[m,n]=[n,m];
  const c=binom(m+n,m);return Qin(`Kiến đi từ A đến B theo các cạnh của lưới (${m} hàng, ${n} cột ô vuông). Mỗi bước kiến chỉ đi sang phải hoặc đi xuống. Có bao nhiêu đường đi khác nhau?`,c,{visual:pathSVG(m,n),hints:['Ở mỗi điểm trên cạnh trên cùng và cạnh bên trái chỉ có 1 cách đi tới.','Số cách đi tới một điểm = số cách tới điểm bên trái nó + số cách tới điểm phía trên nó.'],explain:`Ghi số cách đi tới từng điểm, cộng dần từ A. Tới B có ${c} đường.`});};

/* 25. Số cách trả tiền */
function waysPay(N,vals){let c=0;const go=(i,left)=>{if(i===vals.length){if(left===0)c++;return;}for(let k=0;k*vals[i]<=left;k++)go(i+1,left-k*vals[i]);};go(0,N);return c;}
TDG.coins=function(G,lv){const sets=lv===0?[[1,2]]:lv===1?[[1,2,5],[2,5],[1,5]]:[[1,2,5],[2,5,10],[1,2,10]];for(let t=0;t<30;t++){const V=RP(sets);const N=lv===0?R(4,G<=2?8:10):lv===1?R(G<=2?6:8,G<=2?10:14):R(10,G<=3?15:20);
  const c=waysPay(N,V);if(c<2||c>30)continue;const list=V.join(' nghìn, ')+' nghìn đồng';
  return Qin(`Mẹ có rất nhiều tờ tiền loại ${list}. Có bao nhiêu cách lấy ra đúng ${N} nghìn đồng? (Chỉ quan tâm mỗi loại lấy mấy tờ.)`,c,{hints:[`Bắt đầu từ tờ mệnh giá lớn nhất (${V[V.length-1]} nghìn): lấy 0 tờ, 1 tờ, 2 tờ…`,'Với mỗi cách lấy tờ lớn, đếm số cách lấy phần còn lại bằng tờ nhỏ hơn.'],explain:`Liệt kê lần lượt theo số tờ ${V[V.length-1]} nghìn, ta được ${c} cách.`});}return null;};

/* 26. Đếm số theo chữ số */
TDG.digitSum=function(G,lv){const two=[];for(let n=10;n<=99;n++)two.push(n);
  if(lv===2&&G>=3){const S=R(2,G===3?5:8);let c=0;for(let n=100;n<=999;n++){const s=String(n).split('').reduce((a,x)=>a+ +x,0);if(s===S)c++;}return Qin(`Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng ${S}?`,c,{hints:['Chữ số hàng trăm phải khác 0.','Lần lượt cho hàng trăm là 1, 2, 3… rồi đếm cách chọn hai chữ số còn lại.'],explain:`Đếm theo chữ số hàng trăm, cộng lại được ${c} số.`});}
  const kind=lv===0?'sum':RP(G===1?['sum','diff']:['sum','diff','prod']);
  if(kind==='sum'){const S=R(lv?9:3,lv?17:10);const L=two.filter(n=>Math.floor(n/10)+n%10===S);return Qin(`Có bao nhiêu số có hai chữ số mà tổng hai chữ số bằng ${S}?`,L.length,{hints:['Chữ số hàng chục phải khác 0.','Thử lần lượt chữ số hàng chục là 1, 2, 3…'],explain:`Đó là các số ${L.join(', ')}: có ${L.length} số.`});}
  if(kind==='diff'){const d=R(1,7);const L=two.filter(n=>Math.floor(n/10)-n%10===d);return Qin(`Có bao nhiêu số có hai chữ số mà chữ số hàng chục hơn chữ số hàng đơn vị ${d}?`,L.length,{hints:['Hàng đơn vị nhỏ nhất là 0.',`Hàng chục = hàng đơn vị + ${d}, không được quá 9.`],explain:`Đó là các số ${L.join(', ')}: có ${L.length} số.`});}
  const Pp=RP([6,8,12,18,24,36]);const L=two.filter(n=>Math.floor(n/10)*(n%10)===Pp);return Qin(`Có bao nhiêu số có hai chữ số mà tích hai chữ số bằng ${Pp}?`,L.length,{hints:[`Tìm các cặp chữ số nhân với nhau bằng ${Pp}.`,'Mỗi cặp hai chữ số khác nhau cho ta 2 số (đổi chỗ).'],explain:`Đó là các số ${L.join(', ')}: có ${L.length} số.`});};

/* 27. Cân bằng hình — mỗi hình là một số */
const FRU=['🍎','🍌','🍇','🍐','🍓','🍊','🥝'];
function eqSolve(eqs,syms,max){const out=[];const val={};const go=i=>{if(out.length>1)return;if(i===syms.length){if(eqs.every(e=>e.l.reduce((a,s)=>a+(typeof s==='number'?s:val[s]),0)===e.r.reduce((a,s)=>a+(typeof s==='number'?s:val[s]),0)))out.push({...val});return;}for(let v=1;v<=max;v++){val[syms[i]]=v;go(i+1);}};go(0);return out;}
TDG.balance=function(G,lv){const E=shuffle(FRU);const mx=G===1?10:G===2?20:G===3?50:100;
  for(let t=0;t<40;t++){let eqs,ask,vals;
    if(lv===0){const k=R(2,G===1?3:4),v=R(2,Math.floor((G===1?20:mx*2)/k));eqs=[{l:Array(k).fill(E[0]),r:[k*v]}];ask=E[0];vals={[E[0]]:v};}
    else if(lv===1){const v=R(2,Math.floor(mx/3));eqs=[{l:[E[0],E[0]],r:[E[1]]},{l:[E[1],E[0]],r:[3*v]}];vals={[E[0]]:v,[E[1]]:2*v};ask=RP([E[0],E[1]]);}
    else{const a=R(2,mx/2|0),b=R(2,mx/2|0),c=R(2,mx/2|0);if(new Set([a,b,c]).size<3)continue;if(G<=2){eqs=[{l:[E[0],E[1]],r:[a+b]},{l:[E[0]],r:[E[1],a-b]}];if(a<=b)continue;vals={[E[0]]:a,[E[1]]:b};}else{eqs=[{l:[E[0],E[1]],r:[a+b]},{l:[E[1],E[2]],r:[b+c]},{l:[E[0],E[2]],r:[a+c]}];vals={[E[0]]:a,[E[1]]:b,[E[2]]:c};}ask=RP(Object.keys(vals));}
    const syms=Object.keys(vals);if(syms.length<3&&eqSolve(eqs,syms,lv===2?mx:mx*2).length!==1)continue;
    const show=s=>s.map(x=>typeof x==='number'?fN(x):x).join(' + ');const lines=eqs.map(e=>`${show(e.l)} = ${show(e.r)}`);
    const hints=lv===0?[`${eqs[0].l.length} hình ${ask} bằng nhau có tổng ${eqs[0].r[0]}.`,`Lấy ${eqs[0].r[0]} chia cho ${eqs[0].l.length}.`]:lv===1?[`Thay ${E[1]} ở dòng 2 bằng ${E[0]} + ${E[0]}.`,`Ba hình ${E[0]} có tổng ${3*vals[E[0]]}.`]:syms.length===3?['Cộng cả ba dòng: mỗi hình được tính hai lần.','Tổng ba hình bằng một nửa tổng ba dòng; trừ đi dòng không chứa hình cần tìm.']:[`Dòng 2: ${E[0]} hơn ${E[1]} ${a_of(eqs)}.`,'Đây là bài toán tổng và hiệu.'];
    return Qin(`Mỗi hình thay cho một số (hình giống nhau là số giống nhau). Tìm số của ${ask}.`,vals[ask],{visual:tdEq(lines),hints,explain:`${syms.map(s=>s+' = '+fN(vals[s])).join(', ')}. Thử lại: các dòng đều đúng.`});}
  return null;};
const a_of=eqs=>eqs[1].r[1];

/* 28. Ai thích gì (bảng suy luận) */
function perms(a){if(a.length<=1)return[a];const out=[];a.forEach((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>out.push([x,...p])));return out;}
TDG.whoWhat=function(G,lv){const T=RP([['nuôi',['con mèo','con chó','con thỏ','con vẹt']],['thích màu',['đỏ','xanh','vàng','tím']],['chơi',['cờ vua','bóng đá','cầu lông','bơi lội']],['học đàn',['piano','ghi-ta','trống','sáo']]]);
  const k=lv===2&&G>=4?4:3;const P=names(k),I=shuffle(T[1]).slice(0,k);const sol=shuffle(I.slice());
  for(let t=0;t<60;t++){const cands=[];P.forEach((p,i)=>I.forEach(it=>{if(sol[i]===it)cands.push({p,it,pos:true});else cands.push({p,it,pos:false});}));
    const pool=shuffle(cands.filter(c=>!c.pos)).concat(shuffle(cands.filter(c=>c.pos)).slice(0,lv===0?1:0));const chosen=[];const ok=cl=>perms(I).filter(pm=>cl.every(c=>(pm[P.indexOf(c.p)]===c.it)===c.pos));
    for(const c of shuffle(pool)){if(ok(chosen).length===1)break;chosen.push(c);}
    while(chosen.length>1){let removed=false;for(let i=0;i<chosen.length;i++){const tr=chosen.slice(0,i).concat(chosen.slice(i+1));if(ok(tr).length===1){chosen.splice(i,1);removed=true;break;}}if(!removed)break;}
    if(ok(chosen).length!==1)continue;const askI=shuffle(P.map((_,i)=>i)).find(i=>!chosen.some(c=>c.pos&&c.p===P[i]));if(askI==null)continue;
    const text=shuffle(chosen).map(c=>`${c.p} ${c.pos?'':'không '}${T[0]} ${c.it}.`).join(' ');
    return Qmc(`${P.join(', ')} mỗi bạn ${T[0]} một thứ khác nhau: ${I.join(', ')}. ${text} Hỏi ${P[askI]} ${T[0]} gì?`,sol[askI],shuffle(I.slice()),{hints:['Kẻ bảng: hàng là tên bạn, cột là các thứ. Điều “không” thì đánh dấu ✗.','Hàng hoặc cột nào chỉ còn một ô trống thì đó là ✓.'],explain:P.map((p,i)=>`${p} ${T[0]} ${sol[i]}`).join('; ')+'.'});}
  return null;};

/* 29. Lấy ít nhất để chắc chắn */
TDG.pigeon=function(G,lv){const C=['đỏ','xanh','vàng','trắng'];const kind=lv===0?RP(['one','both']):lv===1?RP(['both','pair','one']):(G>=4?'k':RP(['pair','both']));
  const a=R(3,12),b=R(3,12);let p,ans,ex;
  if(kind==='one'){p=`Trong hộp có ${a} viên bi đỏ và ${b} viên bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có ít nhất 1 viên bi đỏ?`;ans=b+1;ex=`Xui nhất là lấy hết ${b} viên xanh trước. Lấy thêm 1 viên nữa chắc chắn là đỏ: ${b} + 1 = ${ans}.`;}
  else if(kind==='both'){if(a===b)return null;p=`Trong hộp có ${a} viên bi đỏ và ${b} viên bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có đủ cả hai màu?`;ans=Math.max(a,b)+1;ex=`Xui nhất là lấy hết ${Math.max(a,b)} viên ${a>b?'đỏ':'xanh'} trước. Thêm 1 viên nữa thì có đủ hai màu: ${ans}.`;}
  else if(kind==='pair'){const c=R(2,G>=4?4:3);const cs=C.slice(0,c);p=`Trong túi có rất nhiều viên bi các màu ${cs.join(', ')}. Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?`;ans=c+1;ex=`Xui nhất là ${c} viên đầu mỗi viên một màu. Viên thứ ${c+1} chắc chắn trùng màu một viên đã lấy.`;}
  else{const c=R(2,4),k=R(3,5);const cs=C.slice(0,c);p=`Trong túi có rất nhiều viên bi các màu ${cs.join(', ')} (mỗi màu nhiều hơn ${k} viên). Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có ${k} viên cùng màu?`;ans=c*(k-1)+1;ex=`Xui nhất là mỗi màu lấy được ${k-1} viên: ${c} × ${k-1} = ${c*(k-1)} viên. Thêm 1 viên nữa: ${ans}.`;}
  return Qin(p,ans,{hints:['Hãy nghĩ đến trường hợp xui xẻo nhất.','Sau trường hợp xui nhất, lấy thêm 1 viên là chắc chắn.'],explain:ex});};

/* 30. Bài toán tuổi */
TDG.age=function(G,lv){const [A]=names(1);const pr=RP([['mẹ','con'],['bố','con'],['ông','cháu']]);
  if(lv===0){const a=R(5,10),D=pr[0]==='ông'?R(50,60):R(24,34),n=R(2,9);return Qin(`Năm nay ${A} ${a} tuổi, ${pr[0]} của ${A} ${a+D} tuổi. Hỏi khi ${A} ${a+n} tuổi thì ${pr[0]} bao nhiêu tuổi?`,a+D+n,{hints:['Mỗi năm ai cũng thêm 1 tuổi.',`${pr[0]} luôn hơn ${A} ${D} tuổi.`],explain:`${pr[0]} hơn ${A}: ${a+D} − ${a} = ${D} tuổi. Khi ${A} ${a+n} tuổi, ${pr[0]}: ${a+n} + ${D} = ${a+D+n} tuổi.`});}
  if(lv===1){const c=R(5,12),D=R(22,34),n=G>=4&&Math.random()<.5?R(2,6):0;const S=2*c+D+2*n;
    return Qin(n?`${cap(pr[0])} hơn ${pr[1]} ${D} tuổi. Sau ${n} năm nữa, tổng số tuổi hai ${pr[0]} ${pr[1]} là ${S}. Tuổi ${pr[1]} hiện nay là bao nhiêu?`:`${cap(pr[0])} hơn ${pr[1]} ${D} tuổi. Tổng số tuổi hai ${pr[0]} ${pr[1]} hiện nay là ${S}. Tuổi ${pr[1]} hiện nay là bao nhiêu?`,c,{hints:n?[`Tổng tuổi hiện nay: ${S} − 2 × ${n}.`,'Rồi giải bài toán tổng và hiệu.']:['Bài toán tổng và hiệu.',`Tuổi ${pr[1]} = (tổng − hiệu) : 2.`],explain:n?`Tổng tuổi hiện nay: ${S} − ${2*n} = ${S-2*n}. Tuổi ${pr[1]}: (${S-2*n} − ${D}) : 2 = ${c}.`:`Tuổi ${pr[1]}: (${S} − ${D}) : 2 = ${c}.`});}
  const k=R(3,G>=4?7:5),c=R(4,10),D=(k-1)*c;return Qin(`Năm nay tuổi ${pr[0]} gấp ${k} lần tuổi ${pr[1]}, ${pr[0]} hơn ${pr[1]} ${D} tuổi. Tuổi ${pr[1]} năm nay là bao nhiêu?`,c,{visual:tapeSVG([{n:cap(pr[1]),parts:1},{n:cap(pr[0]),parts:k}],''),hints:[`${cap(pr[1])} 1 phần, ${pr[0]} ${k} phần. Hiệu ứng với ${k} − 1 phần.`,`Một phần: ${D} : ${k-1}.`],explain:`Hiệu số phần: ${k} − 1 = ${k-1}. Tuổi ${pr[1]}: ${D} : ${k-1} = ${c}.`});};

/* 31. Ba số */
TDG.sum3=function(G,lv){const [A,B,C]=names(3);const th=RP(['cái kẹo','viên bi','quyển vở','bông hoa']);const top=G===2?20:G===3?100:1000;
  if(lv===0){const a=R(2,top),b=R(2,top),c=R(2,top);const S=a+b+c;return Qin(`Ba bạn ${A}, ${B}, ${C} có tất cả ${fN(S)} ${th}. ${A} có ${fN(a)} ${th}, ${B} có ${fN(b)} ${th}. ${C} có bao nhiêu ${th}?`,c,{hints:['Lấy tổng trừ đi số của hai bạn đã biết.',`${fN(S)} − ${fN(a)} − ${fN(b)}.`],explain:`${C}: ${fN(S)} − ${fN(a)} − ${fN(b)} = ${fN(c)} ${th}.`});}
  if(lv===2&&G>=3){const T=R(10,top),a=R(1,2*T),b=R(1,2*T);const c=3*T-a-b;if(c<0)return null;return Qin(`Trung bình cộng của ba số là ${fN(T)}. Số thứ nhất là ${fN(a)}, số thứ hai là ${fN(b)}. Tìm số thứ ba.`,c,{hints:['Tổng ba số = trung bình cộng × 3.',`Tổng: ${fN(T)} × 3 = ${fN(3*T)}.`],explain:`Tổng ba số: ${fN(T)} × 3 = ${fN(3*T)}. Số thứ ba: ${fN(3*T)} − ${fN(a)} − ${fN(b)} = ${fN(c)}.`});}
  const c=R(2,Math.floor(top/3)),d2=R(1,Math.floor(top/4)),d1=R(1,Math.floor(top/4));const S=3*c+2*d2+d1;
  return Qin(`Ba bạn ${A}, ${B}, ${C} có tất cả ${fN(S)} ${th}. ${A} có nhiều hơn ${B} ${fN(d1)} ${th}, ${B} có nhiều hơn ${C} ${fN(d2)} ${th}. ${C} có bao nhiêu ${th}?`,c,{visual:tapeSVG([{n:A,parts:1,extra:.9,exLab:'+'},{n:B,parts:1,extra:.45},{n:C,parts:1}],fN(S),{u:60}),hints:[`Bớt phần hơn để cả ba bằng ${C}: ${B} bớt ${fN(d2)}, ${A} bớt ${fN(d1)} + ${fN(d2)}.`,`Ba lần số của ${C} = ${fN(S)} − ${fN(d2)} − ${fN(d1+d2)}.`],explain:`Ba lần số của ${C}: ${fN(S)} − ${fN(d2)} − ${fN(d1+d2)} = ${fN(3*c)}. ${C}: ${fN(3*c)} : 3 = ${fN(c)} ${th}.`});};

/* 32. Tổng – tỉ, hiệu – tỉ dạng phân số */
TDG.fracRatio=function(G,lv){for(let t=0;t<30;t++){const q=R(2,9),p=R(1,q-1);if(gcdT(p,q)!==1)continue;const u=R(2,G===4?50:300);const sm=p*u,lg=q*u;
  if(lv<2){const S=sm+lg;if(lv===0)return Qin(`Tổng hai số là ${fN(S)}. Số bé bằng ${p}/${q} số lớn. Tìm số bé.`,sm,{visual:tapeSVG([{n:'Số bé',parts:p},{n:'Số lớn',parts:q}],fN(S),{u:Math.max(16,Math.floor(180/q))}),hints:[`Số bé ${p} phần, số lớn ${q} phần như nhau.`,`Tổng số phần: ${p} + ${q} = ${p+q}.`],explain:`Một phần: ${fN(S)} : ${p+q} = ${fN(u)}. Số bé: ${fN(u)} × ${p} = ${fN(sm)}.`});
    return Qsl(`Tổng hai số là ${fN(S)}. Số bé bằng ${p}/${q} số lớn. Tìm hai số.`,['Số bé','Số lớn'],[sm,lg],[u,S-u,lg+u,Math.max(1,sm-u)],{visual:tapeSVG([{n:'Số bé',parts:p},{n:'Số lớn',parts:q}],fN(S),{u:Math.max(16,Math.floor(180/q))}),hints:[`Tổng số phần: ${p} + ${q} = ${p+q}.`,`Một phần: ${fN(S)} : ${p+q}.`],explain:`Một phần: ${fN(u)}. Số bé: ${fN(sm)}. Số lớn: ${fN(lg)}.`});}
  const D=lg-sm;return Qin(`Hiệu hai số là ${fN(D)}. Số bé bằng ${p}/${q} số lớn. Tìm số lớn.`,lg,{visual:tapeSVG([{n:'Số bé',parts:p},{n:'Số lớn',parts:q}],'',{u:Math.max(16,Math.floor(180/q))}),hints:[`Số lớn hơn số bé ${q} − ${p} = ${q-p} phần.`,`Một phần: ${fN(D)} : ${q-p}.`],explain:`Một phần: ${fN(D)} : ${q-p} = ${fN(u)}. Số lớn: ${fN(u)} × ${q} = ${fN(lg)}.`});}return null;};
const gcdT=(a,b)=>b?gcdT(b,a%b):a;

/* 33. Ốc sên leo cột */
TDG.snail=function(G,lv){for(let t=0;t<30;t++){const a=R(lv===0?2:3,G<=2?4:6),b=R(1,a-1),H=R(a+2,G===1?12:G===2?15:G===3?25:40);let h=0,d=0;while(true){d++;h+=a;if(h>=H)break;h-=b;}
  if(lv===0&&d>8)continue;return Qin(`Một con ốc sên leo lên cột cao ${H} m. Ban ngày ốc leo được ${a} m, ban đêm lại tụt xuống ${b} m. Hỏi đến ngày thứ mấy ốc sên lên tới đỉnh cột?`,d,{hints:[`Mỗi ngày đêm ốc lên được ${a} − ${b} = ${a-b} m.`,`Ngày cuối ốc leo ${a} m là tới đỉnh, không bị tụt nữa: trước ngày cuối ốc chỉ cần lên tới ${H-a} m.`],explain:`Trước ngày cuối cần lên ${H} − ${a} = ${H-a} m, mỗi ngày đêm lên ${a-b} m nên mất ${d-1} ngày đêm. Ngày thứ ${d} ốc tới đỉnh.`});}return null;};

/* 34. Mỗi lần một nửa (tính ngược) */
TDG.half=function(G,lv){const [A,B,C]=names(3);const top=G===2?20:G===3?100:500;
  if(lv===0){const r=R(2,top/2|0),x=R(1,top/4|0);const s=2*(r+x);return Qin(`${A} có một số viên bi. ${A} cho ${B} một nửa số bi, rồi cho ${C} ${x} viên thì còn lại ${r} viên. Lúc đầu ${A} có bao nhiêu viên bi?`,s,{hints:['Đi ngược từ cuối: trước khi cho C thì có thêm bấy nhiêu viên.',`Trước khi cho ${C}: ${r} + ${x} = ${r+x} viên — đây là một nửa số bi.`],explain:`Trước khi cho ${C}: ${r} + ${x} = ${r+x}. Lúc đầu: ${r+x} × 2 = ${s} viên.`});}
  if(lv===1){const r=R(2,top/2|0),x=R(1,top/5|0);const s=2*(r+x);return Qin(`Một cửa hàng có một số quả trứng. Buổi sáng bán một nửa số trứng và thêm ${x} quả thì còn lại ${r} quả. Lúc đầu cửa hàng có bao nhiêu quả trứng?`,s,{hints:[`Nếu không bán thêm ${x} quả thì còn ${r} + ${x} quả.`,'Số đó là một nửa số trứng lúc đầu.'],explain:`${r} + ${x} = ${r+x} là một nửa. Lúc đầu: ${r+x} × 2 = ${s} quả.`});}
  const r=R(1,top/8|0),x=R(1,5),y=R(1,5);const m=2*(r+y),s=2*(m+x);return Qin(`Một cửa hàng có một số quả trứng. Ngày thứ nhất bán một nửa số trứng và thêm ${x} quả. Ngày thứ hai bán một nửa số trứng còn lại và thêm ${y} quả thì còn ${r} quả. Lúc đầu cửa hàng có bao nhiêu quả trứng?`,s,{hints:[`Ngược ngày thứ hai: (${r} + ${y}) × 2 = ${m}.`,`Ngược ngày thứ nhất: (${m} + ${x}) × 2.`],explain:`Sau ngày thứ nhất còn (${r} + ${y}) × 2 = ${m} quả. Lúc đầu: (${m} + ${x}) × 2 = ${s} quả.`});};

/* 35. Tìm số có hai chữ số */
TDG.digits2=function(G,lv){for(let t=0;t<40;t++){const n=R(10,99),a=Math.floor(n/10),b=n%10;const S=a+b;let p,f,ex;
  if(lv===0){if(a<=b)continue;p=`Tìm số có hai chữ số, biết chữ số hàng chục hơn chữ số hàng đơn vị ${a-b} và tổng hai chữ số bằng ${S}.`;f=m=>Math.floor(m/10)-m%10===a-b&&Math.floor(m/10)+m%10===S;ex=`Hàng đơn vị: (${S} − ${a-b}) : 2 = ${b}. Hàng chục: ${b} + ${a-b} = ${a}. Số đó là ${n}.`;}
  else if(lv===1){if(!b||a%b||a===b)continue;const k=a/b;p=`Tìm số có hai chữ số, biết chữ số hàng chục gấp ${k} lần chữ số hàng đơn vị và tổng hai chữ số bằng ${S}.`;f=m=>m%10&&Math.floor(m/10)===k*(m%10)&&Math.floor(m/10)+m%10===S;ex=`Hàng đơn vị 1 phần, hàng chục ${k} phần: ${S} : ${k+1} = ${b}. Hàng chục: ${a}. Số đó là ${n}.`;}
  else{if(a<=b||!b)continue;const D=9*(a-b);p=`Tìm số có hai chữ số, biết tổng hai chữ số bằng ${S} và nếu đổi chỗ hai chữ số thì được số mới bé hơn số cũ ${D} đơn vị.`;f=m=>m%10&&Math.floor(m/10)+m%10===S&&m-(m%10*10+Math.floor(m/10))===D;ex=`Đổi chỗ bé đi ${D} nghĩa là hàng chục hơn hàng đơn vị ${D} : 9 = ${a-b}. Hàng đơn vị: (${S} − ${a-b}) : 2 = ${b}. Số đó là ${n}.`;}
  let c=0;for(let m=10;m<=99;m++)if(f(m))c++;if(c!==1)continue;
  return Qin(p,n,{hints:lv===2?['Số ab − số ba = 9 × (a − b).','Biết tổng và hiệu hai chữ số thì tìm được từng chữ số.']:['Gọi hai chữ số là hàng chục và hàng đơn vị, thử lần lượt các khả năng.','Thử lại: số tìm được phải đúng cả hai điều kiện.'],explain:ex});}return null;};

/* 36. Đếm hình chữ nhật trên lưới */
function rgridSVG(m,n){const U=34;let b='';for(let i=0;i<m;i++)for(let j=0;j<n;j++)b+=`<rect x="${6+j*U}" y="${6+i*U}" width="${U}" height="${U}" fill="#E0ECFF" stroke="#1E3A8A" stroke-width="3"/>`;return SVGW(n*U+12,m*U+12,b,'Lưới ô vuông');}
TDG.rects=function(G,lv){const P=lv===0?[[1,2],[1,3],[1,4]]:lv===1?[[2,2],[2,3],[1,5]]:(G<=3?[[2,3],[2,4]]:[[3,3],[2,4],[3,4]]);let [m,n]=RP(P);if(Math.random()<.4)[m,n]=[n,m];
  const c=(m*(m+1)/2)*(n*(n+1)/2);return Qin(`Hình bên là lưới ${m} hàng, ${n} cột ô vuông. Có tất cả bao nhiêu hình chữ nhật (kể cả hình vuông)?`,c,{visual:rgridSVG(m,n),hints:['Đếm theo kích thước: hình 1 ô, hình 2 ô, hình 3 ô…',`Mỗi hình chữ nhật được tạo bởi 2 đường dọc và 2 đường ngang. Có ${n+1} đường dọc, ${m+1} đường ngang.`],explain:`Cách chọn 2 đường dọc: ${n*(n+1)/2}, chọn 2 đường ngang: ${m*(m+1)/2}. Số hình: ${n*(n+1)/2} × ${m*(m+1)/2} = ${c}.`});};

/* 37. Kim đồng hồ */
TDG.clockAng=function(G,lv){const vis=h=>typeof clkSVG==='function'?clkSVG(h,0):'';
  if(lv===0||(lv===1&&G===3)){const h=RP([1,2,3,4,5,6,7,8,9,10,11]);const deg=30*Math.min(h,12-h);
    if(G===3){const ans=deg===90?'Góc vuông':'Góc không vuông';return Qmc(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc gì?`,ans,['Góc vuông','Góc không vuông'],{visual:vis(h),hints:['Kim phút chỉ số 12.','Góc vuông khi kim giờ chỉ số 3 hoặc số 9.'],explain:`Lúc ${h} giờ, hai kim tạo ${deg===90?'góc vuông':'góc không vuông'}.`});}
    const ans=deg===90?'Góc vuông':deg===180?'Góc bẹt':deg<90?'Góc nhọn':'Góc tù';return Qmc(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc gì?`,ans,['Góc nhọn','Góc vuông','Góc tù','Góc bẹt'],{visual:vis(h),hints:['Mỗi khoảng giữa hai số liền nhau trên mặt đồng hồ là 30°.',`Từ số 12 đến số ${h} (đi đường ngắn) có ${Math.min(h,12-h)} khoảng.`],explain:`Góc giữa hai kim: ${Math.min(h,12-h)} × 30° = ${deg}°, là ${ans.toLowerCase()}.`});}
  if(lv===1){const h=R(1,11);const deg=30*Math.min(h,12-h);return Qin(`Lúc ${h} giờ đúng, góc nhỏ tạo bởi kim giờ và kim phút bằng bao nhiêu độ?`,deg,{visual:vis(h),hints:['Cả vòng đồng hồ là 360°, chia 12 khoảng.','Mỗi khoảng 30°.'],explain:`${Math.min(h,12-h)} khoảng × 30° = ${deg}°.`});}
  if(G===3||Math.random()<.5){const h1=R(1,6),h2=R(h1+2,h1+6);return Qin(`Từ ${h1} giờ đến ${h2} giờ cùng buổi, kim phút quay được mấy vòng?`,h2-h1,{hints:['Mỗi giờ kim phút quay đúng 1 vòng.','Đếm số giờ đã trôi qua.'],explain:`${h2} − ${h1} = ${h2-h1} giờ, kim phút quay ${h2-h1} vòng.`});}
  const n=R(2,10);return Qin(`Trong ${n} giờ, kim giờ quay được một góc bằng bao nhiêu độ?`,30*n,{hints:['12 giờ kim giờ quay 1 vòng = 360°.','1 giờ kim giờ quay 360° : 12 = 30°.'],explain:`${n} × 30° = ${30*n}°.`});};

/* 38. Gấp và cắt giấy */
TDG.fold=function(G,lv){const kind=lv===0?'hole':lv===1?RP(['hole','rope']):RP(G>=3?['cut4','rope']:['rope','hole']);
  if(kind==='hole'){const k=R(1,lv===0?2:G<=2?3:4);return Qin(`Gấp đôi một tờ giấy ${k} lần (lần sau gấp đôi tờ đã gấp), rồi đục một lỗ xuyên qua. Mở tờ giấy ra có mấy lỗ?`,2**k,{hints:['Mỗi lần gấp đôi, số lớp giấy tăng gấp đôi.','Đục 1 lỗ xuyên qua tất cả các lớp.'],explain:`Số lớp: ${Array.from({length:k},()=>2).join(' × ')} = ${2**k}. Có ${2**k} lỗ.`});}
  if(kind==='rope'){const k=R(1,G<=2?2:3);return Qin(`Gấp đôi một sợi dây ${k} lần, rồi cắt một nhát ngang ở giữa bó dây. Được mấy đoạn dây?`,2**k+1,{hints:[`Sau khi gấp có ${2**k} sợi nằm chồng lên nhau, nhát cắt cắt qua tất cả.`,'Vẽ thử với gấp 1 lần: cắt ở giữa được 3 đoạn.'],explain:`Có ${2**k} sợi bị cắt, tạo ${2**k} điểm cắt trên sợi dây: ${2**k} + 1 = ${2**k+1} đoạn.`});}
  const n=R(2,G===3?6:12);return Qin(`Cắt một tờ giấy thành 4 mảnh. Lấy 1 mảnh cắt tiếp thành 4 mảnh. Cứ làm như vậy, tổng cộng ${n} lần cắt. Có tất cả bao nhiêu mảnh giấy?`,1+3*n,{hints:['Mỗi lần cắt, 1 mảnh thành 4 mảnh: thêm 3 mảnh.','Lúc đầu có 1 mảnh.'],explain:`1 + ${n} × 3 = ${1+3*n} mảnh.`});};

/* 39. Tổng dãy cách đều */
TDG.sumSeq=function(G,lv){for(let t=0;t<30;t++){const d=lv===0?RP(G===2?[1,2]:[1,2,5]):R(1,G===2?3:G===3?5:9),a=R(1,G===2?5:G===3?20:100),n=lv===0?R(6,10):lv===1?R(8,G===2?10:20):R(15,G<=3?25:60);const b=a+(n-1)*d;const S=(a+b)*n/2;
  if(G===2&&S>200)continue;if(String(S).length>6)continue;return Qin('Tính nhanh tổng dãy số cách đều.',S,{big:`${fN(a)} + ${fN(a+d)} + ${fN(a+2*d)} + … + ${fN(b)} = ?`,hints:[`Ghép số đầu với số cuối: ${fN(a)} + ${fN(b)} = ${fN(a+b)}.`,`Dãy có (${fN(b)} − ${fN(a)}) : ${d} + 1 = ${n} số.`],explain:`Số số hạng: ${n}. Tổng: (${fN(a)} + ${fN(b)}) × ${n} : 2 = ${fN(S)}.`});}return null;};

/* 40. Nhân nhẩm nhanh */
TDG.mulTrick=function(G,lv){const kinds=G===3?['9','5','4','9']:G===4?['11','99','25','5','9']:['11','99','101','25','125'];const k=lv===0?kinds[R(0,1)]:RP(kinds);let n,ex,hint;
  if(k==='9'){n=R(12,lv?199:99);ex=`${n} × 9 = ${n} × 10 − ${n} = ${n*10} − ${n} = ${n*9}.`;hint='Nhân 9 = nhân 10 rồi trừ đi chính số đó.';}
  else if(k==='5'){n=2*R(6,lv?250:49);ex=`${n} × 5 = ${n} × 10 : 2 = ${n*10} : 2 = ${n*5}.`;hint='Nhân 5 = nhân 10 rồi chia 2.';}
  else if(k==='4'){n=R(12,lv?240:99);ex=`${n} × 4 = ${n} × 2 × 2 = ${n*2} × 2 = ${n*4}.`;hint='Nhân 4 = gấp đôi hai lần.';}
  else if(k==='11'){n=R(12,lv===2?999:99);ex=`${n} × 11 = ${n} × 10 + ${n} = ${n*10} + ${n} = ${n*11}.`;hint=n<100?'Số có hai chữ số × 11: viết tổng hai chữ số vào giữa (nhớ nếu tổng ≥ 10).':'Nhân 11 = nhân 10 rồi cộng chính số đó.';}
  else if(k==='99'){n=R(12,lv===2?999:99);ex=`${n} × 99 = ${n} × 100 − ${n} = ${n*100} − ${n} = ${n*99}.`;hint='Nhân 99 = nhân 100 rồi trừ đi chính số đó.';}
  else if(k==='101'){n=R(12,999);ex=`${n} × 101 = ${n} × 100 + ${n} = ${n*101}.`;hint='Nhân 101 = nhân 100 rồi cộng chính số đó.';}
  else if(k==='25'){n=4*R(3,lv?250:25);ex=`${n} × 25 = ${n} : 4 × 100 = ${n/4} × 100 = ${n*25}.`;hint='Nhân 25 = chia 4 rồi nhân 100 (vì 25 × 4 = 100).';}
  else{n=8*R(2,lv?120:12);ex=`${n} × 125 = ${n} : 8 × 1000 = ${n/8} × 1000 = ${n*125}.`;hint='Nhân 125 = chia 8 rồi nhân 1 000 (vì 125 × 8 = 1 000).';}
  const ans=n*+k;if(String(ans).length>6)return null;return Qin('Tính nhẩm nhanh.',ans,{big:`${fN(n)} × ${k} = ?`,hints:[hint,ex.split('=').slice(0,2).join('=')+' = …'],explain:ex});};

/* 41. Chữ số tận cùng */
TDG.lastDigit=function(G,lv){const kind=lv===0?RP(['pow','oddprod']):RP(['pow','sum','oddprod','pow']);let p,ans,ex,hints;
  if(kind==='pow'){const k=RP([2,3,4,7,8,9]),n=R(lv===0?4:8,lv===2?60:20);let r=1;const cyc=[];for(let i=1;i<=n;i++){r=r*k%10;if(i<=4)cyc.push(r);}ans=r;p=`Tích ${k} × ${k} × … × ${k} (có ${n} thừa số ${k}) có chữ số tận cùng là mấy?`;hints=['Chỉ cần nhân các chữ số tận cùng với nhau.',`Chữ số tận cùng lặp lại theo chu kì: ${cyc.join(', ')}, …`];ex=`Tận cùng lặp lại ${cyc.join(', ')}. ${n} thừa số → tận cùng ${ans}.`;}
  else if(kind==='oddprod'){const m=R(3,lv?60:15)*2+1;ans=5;p=`Tích các số lẻ 1 × 3 × 5 × 7 × … × ${m} có chữ số tận cùng là mấy?`;hints=['Tích có thừa số 5.','Số lẻ nhân với 5 thì tận cùng là 5.'],ex='Tích các số lẻ có thừa số 5 nên tận cùng là 5 (không có thừa số chẵn để thành 0).';}
  else{const n=R(10,lv===2?200:60);const S=n*(n+1)/2;ans=S%10;p=`Tổng 1 + 2 + 3 + … + ${n} có chữ số tận cùng là mấy?`;hints=['Tính tổng bằng cách ghép đầu với cuối.',`Tổng = ${n} × ${n+1} : 2.`];ex=`Tổng = ${n} × ${n+1} : 2 = ${fN(S)}, tận cùng là ${ans}.`;}
  const opts=new Set([String(ans)]);while(opts.size<4)opts.add(String(R(0,9)));return Qmc(p,String(ans),shuffle([...opts]),{hints,explain:ex});};

/* 42. Ghép cặp tròn chục */
TDG.pairTen=function(G,lv){const T=G===1?10:G===2?RP([10,20]):100;const k=lv===0?2:lv===1?(G===1?2:3):3;const terms=[];for(let i=0;i<k;i++){const a=G===3?R(11,89):R(1,T-1);terms.push(a,T-a);}
  if(lv===2)terms.push(G===3?R(1,99):R(1,9));const sh=shuffle(terms);const S=terms.reduce((a,b)=>a+b,0);
  return Qin('Tính nhanh bằng cách ghép cặp.',S,{big:sh.join(' + ')+' = ?',hints:[`Tìm các cặp số cộng lại bằng ${T}.`,`Có ${k} cặp tròn ${T===100?'trăm':'chục'}${lv===2?' và một số lẻ ra':''}.`],explain:`Ghép cặp được ${k} × ${T}${lv===2?' + '+terms[terms.length-1]:''} = ${S}.`});};

/* ========== LỚP LÁ: thêm 6 bài ========== */
TDG.la_seqnum=function(G,lv){let seq,ans;if(lv===0){const s=R(1,6);seq=[s,s+1,s+2];ans=s+3;}else if(lv===1){const s=R(4,10);seq=[s,s-1,s-2];ans=s-3;}else{const s=RP([1,2]);seq=[s,s+2,s+4];ans=s+6;}
  return Qmc('Số tiếp theo là số mấy?',String(ans),shuffle([String(ans),String(ans+1),String(Math.max(0,ans-1)===ans?ans+2:ans-1)]),{big:seq.join(', ')+', ?',voice:[['vi',`Đếm tiếp nhé: ${seq.join(', ')}. Số tiếp theo là số mấy?`]],hints:['Đọc to các số rồi đếm tiếp.',lv===1?'Các số đang bé dần: đếm lùi.':lv===2?'Mỗi lần nhảy 2 số.':'Mỗi lần thêm 1.'],explain:`${seq.join(', ')}, ${ans}.`});};
const LA_SIZE=[['🐘','con voi'],['🦒','hươu cao cổ'],['🐄','con bò'],['🐶','con chó'],['🐱','con mèo'],['🐭','con chuột'],['🐜','con kiến']];
TDG.la_big=function(G,lv){const k=lv===2?3:2;const idx=shuffle(LA_SIZE.map((_,i)=>i)).slice(0,k).sort((a,b)=>a-b);const big=lv!==1||Math.random()<.5;const ans=big?LA_SIZE[idx[0]][0]:LA_SIZE[idx[idx.length-1]][0];
  const w=k===3?(big?'to nhất':'nhỏ nhất'):(big?'to hơn':'nhỏ hơn');return Qmc(`Con nào ${w}?`,ans,shuffle(idx.map(i=>LA_SIZE[i][0])),{emo:true,voice:[['vi',`Con nào ${w}?`]],hints:['Nghĩ xem con vật đó ngoài đời to hay nhỏ.','So sánh từng cặp con vật.'],explain:`${cap(LA_SIZE[idx.find(i=>LA_SIZE[i][0]===ans)][1])} ${w}.`});};
const LA_SH=[['🔺','hình tam giác'],['🟦','hình vuông'],['🟡','hình tròn'],['⭐','ngôi sao']];
TDG.la_shape=function(G,lv){const S=shuffle(LA_SH);const n=R(lv===0?2:3,lv===0?4:lv===1?6:8);const others=[];const m=R(2,lv?6:4);for(let i=0;i<m;i++)others.push(RP(S.slice(1,lv?4:2))[0]);const arr=shuffle(Array(n).fill(S[0][0]).concat(others));
  return Qin(`Có mấy ${S[0][1]} ${S[0][0]}?`,n,{visual:emoRow(arr,'wrap'),voice:[['vi',`Có mấy ${S[0][1]}?`]],hints:[`Chỉ đếm ${S[0][1]}.`,'Chạm tay vào từng hình và đếm to.'],explain:`Có ${n} ${S[0][1]}.`});};
const LA_GRP=[['quả',['🍎','🍌','🍇','🍓','🍊']],['con vật',['🐶','🐱','🐰','🐻','🐸']],['xe',['🚗','🚌','🚲','🚂','🚑']],['quần áo',['👕','👗','👖','🧢','🧦']]];
TDG.la_odd=function(G,lv){const [g1,g2]=shuffle(LA_GRP);const k=lv===0?2:3;const same=shuffle(g1[1]).slice(0,k);const odd=RP(g2[1]);
  return Qmc('Hình nào khác nhóm?',odd,shuffle(same.concat([odd])),{emo:true,voice:[['vi','Hình nào không cùng nhóm với các hình còn lại?']],hints:['Gọi tên từng hình.',`Ba hình là ${g1[0]}, còn một hình thì không.`],explain:`Các hình khác đều là ${g1[0]}, ${odd} thuộc nhóm ${g2[0]}.`});};
TDG.la_scale=function(G,lv){const e=RP(['🍎','🍊','🥚','🧱','🍐']);let a=R(1,5),b=R(1,5);while(a===b)b=R(1,5);
  const vis=`<div class="ht-eqs"><div class="ht-eq">Bên trái: ${Array(a).fill(e).join('')}</div><div class="ht-eq">Bên phải: ${Array(b).fill(e).join('')}</div></div>`;
  if(lv===2){if(a<b)[a,b]=[b,a];const v2=`<div class="ht-eqs"><div class="ht-eq">Bên trái: ${Array(a).fill(e).join('')}</div><div class="ht-eq">Bên phải: ${Array(b).fill(e).join('')}</div></div>`;return Qin(`Cần đặt thêm mấy ${e} vào bên phải để hai bên cân bằng?`,a-b,{visual:v2,voice:[['vi','Cần đặt thêm mấy quả vào bên phải để hai bên bằng nhau?']],hints:['Hai bên cân bằng khi số quả bằng nhau.','Đếm xem bên phải còn thiếu mấy quả.'],explain:`Bên trái ${a}, bên phải ${b}: thêm ${a-b}.`});}
  const hv=lv===0||Math.random()<.5;const w=hv?'nặng':'nhẹ';const ans=(a>b)===hv?'Bên trái':'Bên phải';return Qmc(`Các ${e} nặng bằng nhau. Bên nào ${w} hơn?`,ans,['Bên trái','Bên phải'],{fixed:['Bên trái','Bên phải'],visual:vis,voice:[['vi',`Các quả nặng bằng nhau. Bên nào ${w} hơn?`]],hints:[`Bên nào có ${hv?'nhiều':'ít'} quả hơn thì ${w} hơn.`,'Đếm số quả mỗi bên.'],explain:`Bên trái ${a}, bên phải ${b}: ${ans.toLowerCase()} ${w} hơn.`});};
const LA_BF=[['🥚','🐣','quả trứng','gà con nở ra'],['🌱','🌳','cây non','cây to'],['🧦','👟','đi tất','đi giày'],['🛁','👕','tắm','mặc áo'],['🍳','🍽️','nấu ăn','ăn cơm'],['🌧️','🌈','trời mưa','cầu vồng'],['🌅','🌙','buổi sáng','buổi tối'],['🪥','🛏️','đánh răng','đi ngủ']];
TDG.la_before=function(G,lv){const it=RP(LA_BF);const first=lv===1?Math.random()<.5:true;const ans=first?it[0]:it[1];
  return Qmc(first?'Việc nào có trước?':'Việc nào có sau?',ans,shuffle([it[0],it[1]]),{emo:true,voice:[['vi',(first?'Việc nào có trước? ':'Việc nào có sau? ')+it[2]+' hay '+it[3]+'?']],hints:['Nghĩ xem ở nhà mình thường làm thế nào.',`${cap(it[2])} rồi mới đến ${it[3]}.`],explain:`${cap(it[2])} trước, ${it[3]} sau.`});};
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
/* ================= BỘ ĐỀ TOÁN — phần E (10/2026, lần 3): thêm dạng bài =================
   Đúng/Sai, điền dấu phép tính, tia số, chữ số còn thiếu, so sánh biểu thức, gia đình phép tính,
   ước lượng, chọn đơn vị, thời gian trôi qua, phần trăm giảm giá, toán nhiều bước, mảng nhân. */
const OPF={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,':':(a,b)=>b&&a%b===0?a/b:NaN};
function pickOp(G,lv,P,op){const mx=lim(G,P);if(op==='+'){const [a,b]=pickAdd(G,P,lv);return [a,b,a+b];}if(op==='−'){const [a,b]=pickSub(G,P);return [a,b,a-b];}
  const T=P.tables||(G<=2?[2,5]:[2,3,4,5,6,7,8,9]);if(op==='×'){const a=P.big?R(12,G>=4?999:99):R(2,10),b=RP(T);return [a,b,a*b];}
  const b=RP(T),q=P.big?R(12,G>=4?999:99):R(2,10);return [b*q,b,q];}
const opsFor=(G,P)=>P.ops||(P.mul?['×',':']:G<=1?['+','−']:G===2?['+','−']:['+','−','×',':']);

/* 1. Đúng hay sai */
MG.trueFalse=function(G,lv,P){const op=RP(opsFor(G,P));const [a,b,c]=pickOp(G,lv,P,op);const ok=Math.random()<.5;let shown=c;
  if(!ok){const d=lv===0?R(1,G<=1?2:10):RP([1,10,100,2].filter(x=>x<=Math.max(2,c)));shown=Math.random()<.5||c-d<0?c+d:c-d;if(op==='+'&&hasCarry(a,b)&&lv>0&&Math.random()<.5)shown=c-10>=0?c-10:c+1;}
  if(shown===c&&!ok)shown=c+1;const ans=shown===c?'Đúng':'Sai';
  const vis=G===0?emoRow(Array(a).fill('🍎'))+emoRow(Array(b).fill('🍎')):'';
  return Qmc('Phép tính sau đúng hay sai?',ans,['Đúng','Sai'],{big:`${fN(a)} ${op} ${fN(b)} = ${fN(shown)}`,fixed:['Đúng','Sai'],visual:vis,sk:op==='+'||op==='−'?'congtru':'nhanchia',hints:['Con tự tính lại phép tính ở bên trái dấu =.',`Kết quả đúng là ${fN(a)} ${op} ${fN(b)} = …, so với số bên phải.`],explain:`${fN(a)} ${op} ${fN(b)} = ${fN(c)}. ${ans==='Đúng'?'Phép tính đúng.':`Không phải ${fN(shown)}, nên phép tính sai.`}`});};

/* 2. Điền dấu phép tính */
MG.chooseOp=function(G,lv,P){const L=opsFor(G,P);for(let t=0;t<30;t++){const op=RP(L);const [a,b,c]=pickOp(G,lv,P,op);const fit=L.filter(o=>OPF[o](a,b)===c);if(fit.length!==1)continue;
  return Qmc(`Điền dấu ${L.join(', ')} thích hợp vào ô trống.`,op,L.slice(),{big:`${fN(a)} ☐ ${fN(b)} = ${fN(c)}`,fixed:L.slice(),sk:op==='+'||op==='−'?'congtru':'nhanchia',hints:[c>a?'Kết quả lớn hơn số thứ nhất: thử dấu cộng hoặc nhân.':'Kết quả bé hơn số thứ nhất: thử dấu trừ hoặc chia.','Thử từng dấu rồi tính xem có đúng không.'],explain:`${fN(a)} ${op} ${fN(b)} = ${fN(c)}.`});}return null;};

/* 3. Tia số */
function nlSVG(s,d,k,pos,lab){const n=10,U=28,X=14;let b=`<line x1="${X-8}" y1="40" x2="${X+n*U+14}" y2="40" stroke="#1E3A8A" stroke-width="3"/><path d="M${X+n*U+14} 34 l10 6 l-10 6z" fill="#1E3A8A"/>`;
  for(let i=0;i<=n;i++){const x=X+i*U;b+=`<line x1="${x}" y1="33" x2="${x}" y2="47" stroke="#1E3A8A" stroke-width="2"/>`;if(lab.includes(i))b+=`<text x="${x}" y="66" text-anchor="middle" font-size="${String(s+n*d).length>4?10:12}" font-weight="800" fill="currentColor">${fN(s+i*d)}</text>`;}
  const x=X+pos*U;b+=`<path d="M${x} 28 l-7 -12 h14z" fill="#DC2626"/><text x="${x}" y="12" text-anchor="middle" font-size="12" font-weight="800" fill="#DC2626">?</text>`;
  return `<div class="ht-fig"><svg viewBox="0 0 ${X+n*U+30} 74" width="320" role="img" aria-label="Tia số" data-nl="${s},${d},${pos}">${b}</svg></div>`;}
MG.numberLine=function(G,lv,P){const mx=lim(G,P);const steps=G<=1?(mx<=10?[1]:[1,2,5,10]):G===2?[2,5,10,100]:G===3?[5,10,50,100,1000]:[100,1000,5000,10000];
  for(let t=0;t<40;t++){const d=lv===0?steps[0]:RP(steps);if(10*d>mx)continue;const s=Math.floor(R(0,mx-10*d)/d)*d;const pos=R(1,9);const wide=String(s+10*d).length>=4;const lab=lv===2?[0,10]:lv===1||wide?[0,5,10]:[0,1,2,10];if(lab.includes(pos))continue;
    const v=s+pos*d;if(String(v).length>6)continue;return Qin('Số ở chỗ mũi tên là số nào?',v,{visual:nlSVG(s,d,10,pos,lab),sk:'so',hints:[lv===0?'Đếm tiếp từ các số đã có.':'Tìm khoảng cách giữa hai vạch liền nhau trước.',`Mỗi vạch cách nhau ${fN(d)}.`],explain:`Hai vạch liền nhau cách ${fN(d)}. Mũi tên ở vạch thứ ${pos} kể từ ${fN(s)}: ${fN(s)} + ${pos} × ${fN(d)} = ${fN(v)}.`});}return null;};

/* 4. Chữ số còn thiếu trong phép tính */
MG.missingDigit=function(G,lv,P){const mul=P.mul;for(let t=0;t<40;t++){let a,b,c,op;if(mul){op='×';a=R(12,G>=4?999:99);b=R(2,9);c=a*b;}else{op=RP(['+','−']);[a,b,c]=pickOp(G,lv,P,op);if(a<10||b<10)continue;}
  const parts=[String(a),String(b),String(c)];const which=lv===2?R(0,2):R(0,1);const s=parts[which];const pi=R(0,s.length-1);if(s.length>1&&pi===0&&s[0]==='0')continue;
  const masked=parts.slice();masked[which]=s.slice(0,pi)+'?'+s.slice(pi+1);const ans=+s[pi];
  // chỉ một chữ số đúng
  let cnt=0;for(let dgt=0;dgt<=9;dgt++){if(pi===0&&dgt===0&&s.length>1)continue;const v=+(s.slice(0,pi)+dgt+s.slice(pi+1));const x=[a,b,c];x[which]=v;if(OPF[op](x[0],x[1])===x[2])cnt++;}if(cnt!==1)continue;
  return Qin('Tìm chữ số thích hợp thay cho dấu ?',ans,{big:`${masked[0]} ${op} ${masked[1]} = ${masked[2]}`,sk:mul?'nhanchia':'congtru',hints:['Đặt tính theo cột cho thẳng hàng.',which===2?'Tính phép tính rồi so với kết quả.':op==='+'?'Lấy tổng trừ đi số hạng đã biết.':op==='−'?(which===0?'Số bị trừ = hiệu + số trừ.':'Số trừ = số bị trừ − hiệu.'):'Thử từng chữ số từ 0 đến 9.'],explain:`${fN(a)} ${op} ${fN(b)} = ${fN(c)}. Chữ số cần điền là ${ans}.`});}return null;};

/* 5. So sánh hai biểu thức */
MG.exprCmp=function(G,lv,P){const mx=lim(G,P);const L=opsFor(G,P);for(let t=0;t<40;t++){const o1=RP(L),o2=RP(L);const [a,b,c]=pickOp(G,lv,P,o1);const [x,y,z]=pickOp(G,lv,P,o2);let r=z;
  if(Math.random()<.35){// cho bằng nhau
    if(o2==='+'){const y2=c-x;if(y2<0)continue;r=c;var Lb=`${fN(x)} + ${fN(y2)}`;}else if(o2==='−'){const x2=c+y;if(x2>mx*1.2)continue;r=c;var Lb=`${fN(x2)} − ${fN(y)}`;}else continue;}
  else var Lb=`${fN(x)} ${o2} ${fN(y)}`;
  if(Math.abs(c-r)>Math.max(10,mx/5)&&lv>0)continue;return Qsign('Điền dấu >, <, = thích hợp vào ô trống.',`${fN(a)} ${o1} ${fN(b)} ☐ ${Lb}`,c,r,{sk:'congtru',hints:['Tính giá trị từng vế.','So sánh hai kết quả.'],explain:`Vế trái: ${fN(c)}. Vế phải: ${fN(r)}. ${fN(c)} ${sgn(c,r)} ${fN(r)}.`});}return null;};

/* 6. Gia đình phép tính */
MG.factFamily=function(G,lv,P){const mul=P.mul||(G>=2&&Math.random()<.4&&!P.ops);let a,b,c,ops;
  if(mul){const T=P.tables||[2,3,4,5,6,7,8,9];a=RP(T);b=R(2,G<=2?5:10);if(a===b)b++;c=a*b;ops=['×',':'];}else{const mx=lim(G,P);a=R(1,Math.max(2,Math.floor(mx/2)));b=R(1,Math.max(2,Math.floor(mx/2)));if(a===b)b++;c=a+b;ops=['+','−'];}
  const F=e=>`${fN(e[0])} ${e[1]} ${fN(e[2])} = ${fN(e[3])}`;
  const rightE=mul?RP([[c,':',a,b],[c,':',b,a],[b,'×',a,c]]):RP([[c,'−',a,b],[c,'−',b,a],[b,'+',a,c]]);
  const wrongE=(mul?[[a,':',c,b],[b,':',a,c],[c,'×',a,b],[a,'×',b,c+a]]:[[a,'−',c,b],[b,'−',a,c],[a,'+',c,b],[c,'+',b,a]]).filter(e=>OPF[e[1]](e[0],e[2])!==e[3]);
  const right=F(rightE);const opts=[right,...shuffle(wrongE).slice(0,3).map(F)];
  return Qmc(`Từ phép tính ${mul?`${fN(a)} × ${fN(b)} = ${fN(c)}`:`${fN(a)} + ${fN(b)} = ${fN(c)}`}, phép tính nào dưới đây cũng đúng?`,right,shuffle(opts),{sk:mul?'nhanchia':'congtru',hints:[mul?'Lấy tích chia cho một thừa số thì được thừa số kia.':'Lấy tổng trừ đi một số hạng thì được số hạng kia.','Tính thử từng phép tính.'],explain:`${right} là phép tính đúng.`});};

/* 7. Ước lượng */
MG.estimate=function(G,lv,P){const u=G===3?(lv===2?10:100):G===4?1000:RP([100,1000]);const rd=x=>Math.round(x/u)*u;for(let t=0;t<40;t++){let a,b,op,exact,est;
  if(P.mul){a=R(11,G>=4?999:99);b=R(2,9);op='×';const au=G>=4?100:10;est=Math.round(a/au)*au*b;exact=a*b;const opts=numOpts(est,[est+au*b,est-au*b,exact,est*10]);if(opts.length<4)continue;
    return Qmc(`Ước lượng: ${fN(a)} × ${b} khoảng bao nhiêu?`,String(est),opts,{sk:'nhanchia',hints:[`Làm tròn ${fN(a)} đến hàng ${au===10?'chục':'trăm'}.`,`${fN(Math.round(a/au)*au)} × ${b} = …`],explain:`${fN(a)} ≈ ${fN(Math.round(a/au)*au)}. ${fN(Math.round(a/au)*au)} × ${b} = ${fN(est)} (kết quả đúng là ${fN(exact)}).`});}
  op=RP(['+','−']);a=R(u*2,u*9+u-1);b=R(u,u*5);if(op==='−'&&b>a)continue;exact=OPF[op](a,b);est=OPF[op](rd(a),rd(b));if(est===exact)continue;
  const opts=[...new Set([est,est+u,Math.max(0,est-u),est+2*u].map(String))];if(opts.length<4||opts.includes(String(exact)))continue;
  return Qmc(`Ước lượng: ${fN(a)} ${op} ${fN(b)} khoảng bao nhiêu? (làm tròn từng số đến hàng ${u===10?'chục':u===100?'trăm':'nghìn'})`,String(est),shuffle(opts),{sk:'congtru',hints:[`Làm tròn: ${fN(a)} ≈ ${fN(rd(a))}, ${fN(b)} ≈ ${fN(rd(b))}.`,'Rồi tính với hai số tròn.'],explain:`${fN(rd(a))} ${op} ${fN(rd(b))} = ${fN(est)} (kết quả đúng là ${fN(exact)}).`});}return null;};

/* 8. Chọn đơn vị thích hợp */
const UNITQ=[[1,'len','Chiếc bút chì dài khoảng 15 …','cm'],[1,'len','Cái bàn học dài khoảng 1 …','m'],[1,'len','Gang tay của em dài khoảng 12 …','cm'],[2,'len','Quãng đường từ Hà Nội đến Hải Phòng dài khoảng 100 …','km'],[2,'len','Chiều cao của cửa ra vào khoảng 2 …','m'],[3,'len','Con kiến dài khoảng 5 …','mm'],[3,'len','Bề dày quyển sách khoảng 2 …','cm'],
 [2,'mass','Bao gạo nặng khoảng 25 …','kg'],[2,'mass','Quả trứng gà nặng khoảng 50 …','g'],[3,'mass','Gói kẹo nặng khoảng 200 …','g'],[2,'mass','Con mèo nặng khoảng 4 …','kg'],[4,'mass','Con voi nặng khoảng 5 …','tấn'],[4,'mass','Con lợn nặng khoảng 1 …','tạ'],
 [2,'vol','Chai nước mắm chứa khoảng 1 …','l'],[3,'vol','Thìa thuốc chứa khoảng 5 …','ml'],[3,'vol','Xô nước chứa khoảng 10 …','l'],[3,'vol','Cốc sữa chứa khoảng 200 …','ml'],
 [3,'area','Diện tích con tem khoảng 6 …','cm²'],[4,'area','Diện tích lớp học khoảng 60 …','m²'],[4,'area','Diện tích nước Việt Nam khoảng 331 000 …','km²'],[4,'area','Diện tích mặt bàn học khoảng 50 …','dm²'],
 [2,'time','Em ngủ mỗi đêm khoảng 9 …','giờ'],[2,'time','Em đánh răng khoảng 3 …','phút'],[3,'time','Chớp mắt một cái mất khoảng 1 …','giây'],[2,'time','Một năm học kéo dài khoảng 9 …','tháng']];
const UNITS_OF={len:['mm','cm','m','km'],mass:['g','kg','tạ','tấn'],vol:['ml','l'],area:['cm²','dm²','m²','km²'],time:['giây','phút','giờ','ngày','tháng']};
MG.unitChoose=function(G,lv,P){const L=UNITQ.filter(x=>x[0]<=Math.max(1,G)&&(!P.kind||P.kind===x[1]));const it=RP(L);let opts=UNITS_OF[it[1]].slice();if(it[1]==='mass'&&G<4)opts=['g','kg'];if(it[1]==='len'&&G<=1)opts=['cm','m'];if(it[1]==='area'&&G<4)opts=['cm²','m²'];if(it[1]==='time')opts=shuffle(opts.filter(u=>u!==it[3])).slice(0,2).concat([it[3]]);
  if(!opts.includes(it[3]))return null;return Qmc(`Chọn đơn vị thích hợp: ${it[2]}`,it[3],opts,{fixed:opts.slice(),sk:'doluong',hints:['Hãy hình dung đồ vật đó ngoài đời.','Thử ghép từng đơn vị vào câu xem có hợp lí không.'],explain:`${it[2].replace('…',it[3])}.`});};

/* 9. Thời gian trôi qua */
MG.clockElapsed=function(G,lv,P){const [A]=NM.length?names(1):['An'];const act=RP(['làm bài tập','đọc truyện','tập đàn','đá bóng','vẽ tranh','dọn phòng']);
  const step=G===2?(lv?15:30):5;const h=R(6,G===2?10:16);const m=R(0,59/step|0)*step%60;const dur=G===2?RP(lv?[15,30,45,60]:[30,60]):lv===0?R(2,9)*5:R(5,lv===2?23:11)*5;const t=h*60+m+dur;const h2=Math.floor(t/60),m2=t%60;
  const ts=(x,y)=>y?`${x} giờ ${y} phút`:`${x} giờ`;
  if(lv===2&&G>=3){return Qmc(`${A} bắt đầu ${act} lúc ${ts(h,m)} và ${act} trong ${dur} phút. ${A} xong lúc mấy giờ?`,ts(h2,m2),shuffle([...new Set([ts(h2,m2),ts(h2,(m2+10)%60),ts(h2+1,m2),ts(h,(m+dur)%60===m2?(m2+5)%60:(m+dur)%60)])].slice(0,4)),{sk:'doluong',hints:[`Cộng ${dur} phút vào ${ts(h,m)}.`,'Đủ 60 phút thì đổi thành 1 giờ.'],explain:`${ts(h,m)} + ${dur} phút = ${ts(h2,m2)}.`});}
  return Qin(`${A} bắt đầu ${act} lúc ${ts(h,m)}, xong lúc ${ts(h2,m2)}. ${A} ${act} trong bao nhiêu phút?`,dur,{visual:typeof clkSVG==='function'?`<div class="ht-two">${clkSVG(h%12||12,m)}${clkSVG(h2%12||12,m2)}</div>`:'',sk:'doluong',hints:['Đếm từ lúc bắt đầu đến giờ tròn gần nhất, rồi đếm tiếp.','1 giờ = 60 phút.'],explain:`Từ ${ts(h,m)} đến ${ts(h2,m2)} là ${dur} phút.`});};

/* 10. Phần trăm: giảm giá, tăng thêm */
MG.percentWp=function(G,lv,P){for(let t=0;t<40;t++){const p=RP(lv===0?[10,20,25,50]:[5,10,15,20,25,30,40]);const price=R(2,lv===2?40:20)*(lv===0?10000:5000);const off=price*p/100;if(off%1000)continue;
  if(lv===2){const k=RP(['up','off2']);if(k==='up'){const v=price+off;return Qin(`Một cửa hàng nhập một chiếc ba lô giá ${fN(price)} đồng, rồi bán lãi ${p}% giá nhập. Giá bán chiếc ba lô là bao nhiêu đồng?`,v,{sk:'tiso',hints:[`Tiền lãi = ${fN(price)} × ${p} : 100.`,'Giá bán = giá nhập + tiền lãi.'],explain:`Tiền lãi: ${fN(price)} × ${p} : 100 = ${fN(off)} đồng. Giá bán: ${fN(price)} + ${fN(off)} = ${fN(v)} đồng.`});}
    const v=price-off;return Qin(`Sau khi giảm giá ${p}%, một chiếc cặp có giá ${fN(v)} đồng. Hỏi lúc chưa giảm, chiếc cặp giá bao nhiêu đồng?`,price,{sk:'tiso',hints:[`Giá sau khi giảm bằng ${100-p}% giá cũ.`,`Giá cũ = ${fN(v)} : ${100-p} × 100.`],explain:`${fN(v)} : ${100-p} × 100 = ${fN(price)} đồng.`});}
  const v=price-off;return lv===0?Qin(`Một chiếc áo giá ${fN(price)} đồng, được giảm ${p}%. Hỏi được giảm bao nhiêu tiền?`,off,{sk:'tiso',hints:[`Tìm ${p}% của ${fN(price)}.`,`${fN(price)} : 100 × ${p}.`],explain:`${fN(price)} × ${p} : 100 = ${fN(off)} đồng.`}):Qin(`Một chiếc áo giá ${fN(price)} đồng, được giảm ${p}%. Giá chiếc áo sau khi giảm là bao nhiêu đồng?`,v,{sk:'tiso',hints:[`Số tiền được giảm: ${fN(price)} × ${p} : 100.`,'Lấy giá cũ trừ số tiền được giảm.'],explain:`Được giảm ${fN(off)} đồng. Giá mới: ${fN(price)} − ${fN(off)} = ${fN(v)} đồng.`});}return null;};

/* 11. Toán nhiều bước (có lời văn) */
MG.wpChain=function(G,lv,P){const mx=lim(G,P);const [A,B]=names(2);const [th]=thing();for(let t=0;t<40;t++){const a=R(Math.ceil(mx/5),Math.floor(mx/2)),b=R(1,Math.floor(mx/4)),c=R(1,Math.floor(mx/3));
  const k=lv===0?'+-':RP(['+-','--','++']);let v,p,ex;
  if(k==='+-'){v=a+b-c;p=`${A} có ${fN(a)} ${th}. ${B} cho ${A} thêm ${fN(b)} ${th}. Sau đó ${A} cho em ${fN(c)} ${th}. Hỏi ${A} còn lại bao nhiêu ${th}?`;ex=expl(`${fN(a)} + ${fN(b)} = ${fN(a+b)}`,`${fN(a+b)} − ${fN(c)} = ${fN(v)} ${th}`);}
  else if(k==='--'){v=a-b-c;p=`Thùng có ${fN(a)} ${th}. Buổi sáng lấy ra ${fN(b)} ${th}, buổi chiều lấy ra ${fN(c)} ${th}. Hỏi thùng còn lại bao nhiêu ${th}?`;ex=expl(`${fN(a)} − ${fN(b)} = ${fN(a-b)}`,`${fN(a-b)} − ${fN(c)} = ${fN(v)} ${th}`);}
  else{v=a+b+c;p=`Ngày thứ nhất ${A} gấp được ${fN(a)} ${th}, ngày thứ hai gấp được ${fN(b)} ${th}, ngày thứ ba gấp được ${fN(c)} ${th}. Cả ba ngày ${A} gấp được bao nhiêu ${th}?`;ex=expl(`${fN(a)} + ${fN(b)} = ${fN(a+b)}`,`${fN(a+b)} + ${fN(c)} = ${fN(v)} ${th}`);}
  if(v<0||v>mx||(k==='+-'&&c>a+b))continue;return Qin(p,v,{sk:'giaitoan',hints:['Tóm tắt: có bao nhiêu, thêm hay bớt bao nhiêu, mấy lần.','Làm từng bước theo thứ tự trong đề.'],explain:ex});}return null;};

/* 12. Mảng nhân (hàng × cột) */
MG.arrayMul=function(G,lv,P){const T=P.tables||[2,3,4,5];const r=RP(T),c=R(2,lv?(G<=2?5:9):5);const e=RP(['🍎','🌸','⭐','🍬','🐟']);const rows=Array.from({length:r},()=>emoRow(Array(c).fill(e))).join('');
  if(lv===2)return Qmc(`Có ${r} hàng, mỗi hàng ${c} ${e}. Phép tính nào cho biết có tất cả bao nhiêu ${e}?`,`${c} × ${r}`,shuffle([`${c} × ${r}`,`${c} + ${r}`,`${r} + ${r}`,`${c} × ${c}`].filter((x,i,a)=>a.indexOf(x)===i)),{visual:rows,sk:'nhanchia',hints:[`${c} được lấy ${r} lần.`,'Lấy số hình mỗi hàng nhân với số hàng.'],explain:`${c} được lấy ${r} lần: ${c} × ${r} = ${c*r}.`});
  return Qin(`Có ${r} hàng, mỗi hàng ${c} ${e}. Có tất cả bao nhiêu ${e}?`,r*c,{visual:rows,sk:'nhanchia',hints:[`Mỗi hàng có ${c} hình, có ${r} hàng như thế.`,`${c} × ${r} = …`],explain:`${c} × ${r} = ${r*c} ${e}.`});};

/* 13. Đúng hay sai với số thập phân (lớp 5) */
MG.decTF=function(G,lv,P){const op=RP(P.op||['+','−','×']);const d1=R(1,2),d2=R(1,2);const a=R(11,lv?9999:999)/10**d1,b=op==='×'?R(2,9):R(11,lv?999:99)/10**d2;
  let x=a,y=b;if(op==='−'&&y>x)[x,y]=[y,x];const c=r6(op==='+'?x+y:op==='−'?x-y:x*y);const ok=Math.random()<.5;
  const wrongs=[r6(c*10),r6(c/10),r6(c+1),r6(op==='+'?x+y*10:c+0.1)].filter(v=>v>0&&v!==c);const shown=ok?c:RP(wrongs);const ans=shown===c?'Đúng':'Sai';
  return Qmc('Phép tính sau đúng hay sai?',ans,['Đúng','Sai'],{big:`${fD(x)} ${op} ${fD(y)} = ${fD(shown)}`,fixed:['Đúng','Sai'],sk:'stp',hints:['Đặt tính: các dấu phẩy thẳng cột với nhau.',op==='×'?'Nhân như số tự nhiên rồi đếm số chữ số ở phần thập phân.':'Thêm chữ số 0 cho phần thập phân dài bằng nhau.'],explain:`${fD(x)} ${op} ${fD(y)} = ${fD(c)}. ${ans==='Đúng'?'Phép tính đúng.':'Phép tính sai.'}`});};
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
/* ================= THÊM DẠNG BÀI MỚI VÀO BẢNG BÀI HỌC (10/2026, lần 3) =================
   Mỗi bài (trừ bài Ôn tập tổng hợp) được thêm tối đa 2 dạng mới hợp với nội dung đang học. */
(function(){const has=(L,n)=>L.find(s=>s[0]===n);
  const rules=(G,L)=>{const out=[];const add=(n,p)=>{if(!out.some(s=>s[0]===n)&&!L.some(s=>s[0]===n))out.push(g(n,p||{}));};
    const as=has(L,'addsub');if(as){const P=as[1]||{};const mx=P.max||lim(G,P);const ops=P.ops&&P.ops.length===1?['+','−']:(P.ops||null);
      add('trueFalse',Object.assign({max:mx},ops?{ops}:{},P.small?{small:1}:{},P.k?{k:P.k}:{}));if(G>=2&&mx>=100)add('missingDigit',{max:mx});else if(G>=1)add('chooseOp',Object.assign({max:mx,ops:['+','−']},P.small?{small:1}:{}));}
    const nb=has(L,'readNum')||has(L,'seq')||has(L,'neighbor')||has(L,'order');if(nb){const mx=(nb[1]||{}).max||lim(G,{});if(mx>=(G===0?10:20))add('numberLine',{max:Math.min(mx,999999)});}
    const cp=has(L,'compare');if(cp&&G>=1&&!(cp[1]||{}).mul){const mx=(cp[1]||{}).max||lim(G,{});if(mx>=20&&mx<=100000)add('exprCmp',{max:mx,ops:['+','−']});}
    const tb=has(L,'table');if(tb){const P=tb[1]||{};const T=P.tables;if(G<=3)add('arrayMul',T?{tables:T}:{});add('factFamily',Object.assign({mul:1},T?{tables:T}:{}));if(G>=3)add('chooseOp',Object.assign({ops:['×',':']},T?{tables:T}:{}));}
    const mi=has(L,'missing');if(mi&&!(mi[1]||{}).mulOnly)add('factFamily',{max:(mi[1]||{}).max||lim(G,{})});
    if(has(L,'mental')||has(L,'round'))if(G>=3)add('estimate',{});
    if(has(L,'mulBig')){add('missingDigit',{mul:1});if(G>=3)add('estimate',{mul:1});}
    if(has(L,'divBig'))add('trueFalse',{ops:['×',':'],big:1});
    const ms=has(L,'measOp')||has(L,'conv');if(ms&&G>=1){const k=(ms[1]||{}).kind||((ms[1]||{}).unit==='kg'?'mass':(ms[1]||{}).unit==='l'?'vol':'len');add('unitChoose',{kind:k==='area5'?'area':k});}
    if((has(L,'clock')||has(L,'timeConv')||has(L,'timeOp'))&&G>=2)add('clockElapsed',{});
    const ra=has(L,'ratio');if(ra&&G===5&&JSON.stringify(ra[1]||{}).includes('pct'))add('percentWp',{});
    if((has(L,'wp1')||has(L,'wp2')||has(L,'wpMore'))&&G>=1&&G<=4){const P=(has(L,'wp1')||has(L,'wp2')||has(L,'wpMore'))[1]||{};add('wpChain',{max:P.max||lim(G,{})});}
    if(G===0&&has(L,'addPic'))add('trueFalse',{max:(has(L,'addPic')[1]||{}).max||10,ops:['+'],small:1});
    const dop=has(L,'decOp');if(dop&&G===5){const o=((dop[1]||{}).op||['+','−','×']).filter(o=>o!==':');add('decTF',{op:o.length?o:['×']});}
    if(has(L,'decCompare')||has(L,'decRound'))add('decTF',{op:['+','−']});
    return out.slice(0,2);};
  for(const G in PLAN){PLAN[G].forEach(C=>C.forEach((L,d)=>{if(!Array.isArray(L))return;const orig=L.slice();const nw=rules(+G,L);nw.forEach(s=>L.push(s));if(nw.length&&orig.length===1)L.push(orig[0]);}));}
  /* lớp 5: chặng tỉ số phần trăm có thêm bài toán giảm giá */
})();
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
/* ---- 10/2026 (lần 3): thêm 22 bài cho lớp 1–5 và 6 bài cho Lớp Lá ---- */
TD_ALL.push(
 {id:21,gr:0,t:'Que diêm xếp hình',gen:'matchSeq',g:[1,5],card:{tiles:[['Đếm que','Đếm số que của 3 hình đầu','4, 7, 10'],['Thêm đều','Mỗi hình sau thêm cùng số que','thêm 3 que'],['Hình thứ n','Que hình 1 + (n − 1) × số que thêm','4 + 9 × 3 = 31'],['Ngược lại','(Số que − que hình 1) : số que thêm + 1','(31 − 4) : 3 + 1 = 10']],tip:'Nhìn xem hình sau dùng chung cạnh với hình trước ở chỗ nào.'}},
 {id:22,gr:0,t:'Máy biến số',gen:'machine',g:[1,5],card:{tiles:[['So từng cột','Số ra lớn hơn hay bé hơn số vào?','3 → 7, 5 → 9'],['Thử cộng trừ','Hiệu số ra − số vào có đều không?','luôn thêm 4'],['Thử nhân','Số ra có gấp số vào không?','2 → 6, 4 → 12: × 3'],['Nhân rồi cộng','Nếu chưa đúng, thử × rồi + hoặc −','× 2 + 1']],tip:'Tìm quy tắc ở cột thứ nhất rồi kiểm tra lại ở mọi cột.'}},
 {id:23,gr:0,t:'Quy luật chữ cái',gen:'letters',g:[1,5],card:{tiles:[['Bảng chữ cái','Viết A B C D E F G H…','A đứng thứ 1'],['Nhảy đều','Đếm số chữ bị bỏ qua','A, C, E → nhảy 2'],['Chữ và số','Xét riêng chữ, riêng số','A2, B4, C6 → D8'],['Hai dãy đan xen','Xét vị trí lẻ và vị trí chẵn','A, Z, B, Y → C']],tip:'Đánh số thứ tự cho chữ cái (A = 1, B = 2…) để thấy quy luật.'}},
 {id:24,gr:1,t:'Đếm đường đi',gen:'paths',g:[1,5],card:{tiles:[['Chỉ phải, xuống','Đi đường ngắn nhất từ A đến B','không quay lại'],['Ghi số 1','Các điểm trên hàng trên cùng và cột trái: 1','1 1 1'],['Cộng dồn','Mỗi điểm = số bên trái + số phía trên','1 + 1 = 2'],['Đọc kết quả','Số ghi tại B là đáp án','lưới 2 × 2 → 6']],tip:'Ghi số ngay trên hình rồi cộng dần, không cần vẽ từng đường.'}},
 {id:25,gr:1,t:'Số cách trả tiền',gen:'coins',g:[1,5],card:{tiles:[['Tờ lớn trước','Chọn số tờ lớn nhất: 0, 1, 2…','tờ 5 nghìn'],['Phần còn lại','Trả nốt bằng tờ nhỏ hơn','còn 3 nghìn'],['Liệt kê','Ghi mỗi cách thành một dòng','5 + 2 + 1'],['Không tính thứ tự','2 + 1 và 1 + 2 là một cách','không đếm 2 lần']],tip:'Liệt kê theo thứ tự từ nhiều tờ lớn đến ít tờ lớn thì không bị sót.'}},
 {id:26,gr:1,t:'Đếm số theo chữ số',gen:'digitSum',g:[1,5],card:{tiles:[['Hàng chục khác 0','Số có hai chữ số bắt đầu từ 10','không có 05'],['Tổng chữ số','Thử hàng chục 1, 2, 3…','tổng 4: 13, 22, 31, 40'],['Hiệu chữ số','Hàng chục = hàng đơn vị + hiệu','hiệu 7: 70, 81, 92'],['Tích chữ số','Tìm cặp nhân bằng tích, đổi chỗ','tích 6: 16, 61, 23, 32']],tip:'Viết các số tìm được thành một hàng để đếm và kiểm tra.'}},
 {id:27,gr:2,t:'Cân bằng hình',gen:'balance',g:[1,5],card:{tiles:[['Hình giống nhau','Có giá trị bằng nhau','🍎 = 🍎'],['Chia đều','3 hình bằng nhau tổng 12 → mỗi hình 4','12 : 3 = 4'],['Thay thế','Thay một hình bằng những hình bằng nó','🍌 = 🍎 + 🍎'],['Cộng cả ba dòng','Mỗi hình được tính hai lần','tổng : 2']],tip:'Bắt đầu từ dòng chỉ có một loại hình.'}},
 {id:28,gr:2,t:'Ai thích gì?',gen:'whoWhat',g:[2,5],card:{tiles:[['Kẻ bảng','Hàng là bạn, cột là đồ vật','3 × 3 ô'],['Đánh dấu ✗','Câu “không” thì gạch ô đó','An ✗ mèo'],['Tìm ✓','Hàng/cột còn một ô trống là ✓','An ✓ thỏ'],['Gạch tiếp','Có ✓ thì gạch cả hàng, cả cột còn lại','mỗi bạn một thứ']],tip:'Mỗi bạn một thứ khác nhau, nên mỗi hàng và mỗi cột chỉ có một dấu ✓.'}},
 {id:29,gr:2,t:'Lấy ít nhất để chắc chắn',gen:'pigeon',g:[3,5],card:{tiles:[['Xui nhất','Nghĩ trường hợp lấy toàn thứ không cần','lấy hết bi xanh'],['Thêm 1','Sau đó lấy thêm 1 là chắc chắn','5 xanh + 1'],['Đủ hai màu','Lấy hết màu nhiều hơn rồi thêm 1','8 đỏ + 1 = 9'],['k viên cùng màu','Số màu × (k − 1) + 1','3 màu, 4 viên: 3 × 3 + 1']],tip:'“Chắc chắn” nghĩa là đúng cả khi gặp xui nhất.'}},
 {id:30,gr:3,t:'Bài toán tuổi',gen:'age',g:[3,5],card:{tiles:[['Hiệu không đổi','Hai người luôn cách nhau bấy nhiêu tuổi','mẹ hơn con 26'],['Mỗi năm','Mỗi người thêm 1 tuổi, tổng thêm số người','2 người: +2'],['Tổng – hiệu','Tuổi bé = (tổng − hiệu) : 2','(46 − 26) : 2'],['Gấp lần','Hiệu ứng với (k − 1) phần','gấp 4, hơn 27 → 27 : 3']],tip:'Vẽ sơ đồ tuổi ở cùng một thời điểm rồi mới tính.'}},
 {id:31,gr:3,t:'Ba số, trung bình cộng',gen:'sum3',g:[2,5],card:{tiles:[['Biết hai số','Số thứ ba = tổng − hai số kia','30 − 8 − 12'],['Hơn kém nối tiếp','Đưa cả ba về số bé nhất','bớt phần hơn'],['Ba phần bằng nhau','Tổng sau khi bớt : 3','= số bé nhất'],['Trung bình cộng','Tổng = trung bình × số các số','TB 20 → tổng 60']],tip:'Vẽ ba đoạn thẳng để nhìn rõ phần hơn của mỗi bạn.'}},
 {id:32,gr:3,t:'Tổng, hiệu và tỉ số',gen:'fracRatio',g:[4,5],card:{tiles:[['Đọc tỉ số','Số bé bằng 2/3 số lớn','bé 2 phần, lớn 3 phần'],['Tổng – tỉ','Một phần = tổng : (tổng số phần)','100 : 5 = 20'],['Hiệu – tỉ','Một phần = hiệu : (hiệu số phần)','30 : 1 = 30'],['Nhân lên','Số cần tìm = một phần × số phần','20 × 2 = 40']],tip:'Luôn vẽ sơ đồ: các phần phải dài bằng nhau.'}},
 {id:33,gr:4,t:'Ốc sên leo cột',gen:'snail',g:[1,5],card:{tiles:[['Ngày đêm','Mỗi ngày đêm lên được leo − tụt','5 − 2 = 3 m'],['Ngày cuối','Ngày cuối leo tới đỉnh, không tụt nữa','bớt quãng ngày cuối'],['Tính số ngày','(Cao − leo ngày) : (leo − tụt) + 1','(20 − 5) : 3 + 1 = 6'],['Thử lại','Vẽ cột và đánh dấu từng ngày','3, 6, 9…']],tip:'Cẩn thận: ngày cuối cùng ốc không bị tụt xuống nữa.'}},
 {id:34,gr:4,t:'Mỗi lần một nửa',gen:'half',g:[2,5],card:{tiles:[['Đi từ cuối','Bắt đầu từ số còn lại','còn 5'],['Bỏ phần thêm','Cộng lại phần đã cho thêm','5 + 2 = 7'],['Gấp đôi','Một nửa là 7 thì cả là 14','7 × 2'],['Lặp lại','Làm như vậy cho từng ngày','ngày 2 rồi ngày 1']],tip:'Cộng ngược trước, gấp đôi sau.'}},
 {id:35,gr:4,t:'Tìm số có hai chữ số',gen:'digits2',g:[2,5],card:{tiles:[['Đặt tên','Hàng chục a, hàng đơn vị b','số ab'],['Tổng và hiệu','a + b và a − b → tìm a, b','(9 − 3) : 2 = 3'],['Gấp lần','a = k × b: b là 1 phần, a là k phần','tổng 12, gấp 3 → b = 3'],['Đổi chỗ','ab − ba = 9 × (a − b)','72 − 27 = 45']],tip:'Tìm xong nhớ thử lại với tất cả điều kiện của đề.'}},
 {id:36,gr:5,t:'Đếm hình chữ nhật',gen:'rects',g:[2,5],card:{tiles:[['Hình 1 ô','Đếm từng ô nhỏ','6 ô'],['Ghép ô','Đếm hình 2 ô, 3 ô… theo hàng, theo cột','ngang rồi dọc'],['Dải n ô','n + (n − 1) + … + 1','3 ô → 6 hình'],['Lưới','(cách chọn 2 đường dọc) × (2 đường ngang)','2 × 3 ô: 6 × 3 = 18']],tip:'Đếm theo kích thước từ nhỏ đến lớn và ghi lại từng loại.'}},
 {id:37,gr:5,t:'Kim đồng hồ',gen:'clockAng',g:[3,5],card:{tiles:[['12 khoảng','Mặt đồng hồ chia 12 khoảng bằng nhau','mỗi khoảng 30°'],['Góc lúc giờ đúng','Đếm khoảng từ số 12 đến kim giờ','3 giờ: 3 × 30° = 90°'],['Kim phút','Mỗi giờ quay 1 vòng','từ 2 giờ đến 5 giờ: 3 vòng'],['Kim giờ','12 giờ quay 1 vòng','1 giờ: 30°']],tip:'Lúc 3 giờ và 9 giờ hai kim tạo góc vuông, lúc 6 giờ tạo góc bẹt.'}},
 {id:38,gr:5,t:'Gấp và cắt giấy',gen:'fold',g:[1,5],card:{tiles:[['Gấp đôi','Mỗi lần gấp, số lớp gấp đôi','1 → 2 → 4 → 8'],['Đục lỗ','Số lỗ = số lớp giấy','gấp 3 lần: 8 lỗ'],['Cắt dây gấp','Số đoạn = số sợi + 1','gấp 1 lần: 3 đoạn'],['Cắt thành 4','Mỗi lần thêm 3 mảnh','1 + 3 × n']],tip:'Lấy một tờ giấy thật ra gấp thử là hiểu ngay.'}},
 {id:39,gr:6,t:'Tổng dãy cách đều',gen:'sumSeq',g:[2,5],card:{tiles:[['Số số hạng','(Số cuối − số đầu) : khoảng cách + 1','(20 − 2) : 2 + 1 = 10'],['Ghép cặp','Số đầu + số cuối','2 + 20 = 22'],['Tổng','(đầu + cuối) × số số hạng : 2','22 × 10 : 2 = 110'],['Kiểm tra','Thử với dãy ngắn','1 + 2 + 3 = 6']],tip:'Các cặp đầu – cuối luôn có tổng bằng nhau.'}},
 {id:40,gr:6,t:'Nhân nhẩm nhanh',gen:'mulTrick',g:[3,5],card:{tiles:[['× 9, × 99','Nhân 10 (100) rồi trừ chính số đó','23 × 9 = 230 − 23'],['× 11','Nhân 10 rồi cộng chính số đó','34 × 11 = 374'],['× 5, × 25','× 10 : 2, hoặc : 4 × 100','48 × 25 = 1 200'],['× 125',': 8 × 1 000','16 × 125 = 2 000']],tip:'Biến phép nhân khó thành nhân với 10, 100, 1 000.'}},
 {id:41,gr:6,t:'Chữ số tận cùng',gen:'lastDigit',g:[4,5],card:{tiles:[['Chỉ nhìn hàng đơn vị','Tận cùng của tích chỉ phụ thuộc chữ số tận cùng','…7 × …3 → 1'],['Chu kì','Tận cùng của lũy thừa lặp lại','3: 3, 9, 7, 1'],['Có 5 và số lẻ','Tích tận cùng là 5','1 × 3 × 5 × 7'],['Có 2 và 5','Tích tận cùng là 0','2 × 5 = 10']],tip:'Chu kì thường dài 4: chia số thừa số cho 4 để biết vị trí.'}},
 {id:42,gr:6,t:'Ghép cặp tròn chục',gen:'pairTen',g:[1,3],card:{tiles:[['Tìm cặp','Hai số cộng lại tròn chục','7 + 3 = 10'],['Đổi chỗ','Đổi chỗ các số hạng tổng không đổi','8 + 5 + 2 = 8 + 2 + 5'],['Tròn trăm','Lớp 3: 64 + 36 = 100','ghép đôi'],['Cộng nốt','Cộng các tổng tròn với số còn lại','10 + 10 + 4']],tip:'Gạch nối các cặp số trước khi tính.'}});
TD_LA.push(
 {id:6,gr:0,t:'Số tiếp theo',gen:'la_seqnum',g:[0,0],card:{tiles:[['Đọc to','Đọc các số theo thứ tự','1, 2, 3'],['Đếm tiếp','Số sau hơn số trước 1','3 rồi 4'],['Đếm lùi','Số bé dần thì đếm lùi','9, 8, 7 → 6'],['Nhảy 2','Bỏ qua một số','2, 4, 6 → 8']],tip:'Dùng ngón tay đếm theo từng số.'}},
 {id:7,gr:1,t:'To hơn, nhỏ hơn',gen:'la_big',g:[0,0],card:{tiles:[['Nghĩ ngoài đời','Con vật to hay nhỏ khi gặp thật','voi rất to'],['So hai con','Con nào to hơn?','🐘 > 🐶'],['To nhất','So từng cặp để tìm','🐘'],['Nhỏ nhất','Con bé xíu nhất','🐜']],tip:'Tưởng tượng các con vật đứng cạnh nhau.'}},
 {id:8,gr:1,t:'Đếm hình',gen:'la_shape',g:[0,0],card:{tiles:[['Tam giác','Có 3 cạnh, 3 góc','🔺'],['Hình vuông','4 cạnh bằng nhau','🟦'],['Hình tròn','Tròn như cái đĩa','🟡'],['Chỉ đếm một loại','Bỏ qua hình khác','đếm 🔺']],tip:'Chạm vào từng hình được hỏi và đếm to.'}},
 {id:9,gr:2,t:'Hình nào khác nhóm',gen:'la_odd',g:[0,0],card:{tiles:[['Gọi tên','Nói tên từng hình','táo, chuối, mèo'],['Tìm nhóm','Các hình giống loại nhau','đều là quả'],['Khác loại','Hình không cùng loại','con mèo'],['Nói lí do','Vì sao khác nhóm?','mèo là con vật']],tip:'Hỏi: hình này dùng để làm gì, là quả, con vật hay đồ vật?'}},
 {id:10,gr:2,t:'Cân thăng bằng',gen:'la_scale',g:[0,0],card:{tiles:[['Nặng như nhau','Các quả nặng bằng nhau','🍎 = 🍎'],['Nhiều hơn','Bên nhiều quả hơn thì nặng hơn','3 > 2'],['Cân bằng','Hai bên bằng nhau','2 = 2'],['Thêm vào','Thêm cho bằng bên kia','2 thêm 1 là 3']],tip:'Đếm số quả mỗi bên rồi so sánh.'}},
 {id:11,gr:2,t:'Việc nào trước, sau',gen:'la_before',g:[0,0],card:{tiles:[['Trước','Việc làm trước','đi tất'],['Sau','Việc làm sau','đi giày'],['Hằng ngày','Nghĩ việc con làm mỗi ngày','đánh răng rồi đi ngủ'],['Thiên nhiên','Hạt nảy mầm rồi thành cây','🌱 → 🌳']],tip:'Kể lại thành câu: “Đầu tiên… sau đó…”.'}});
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
/* ================= MÀN NGOÀI TOÁN / TIẾNG VIỆT / ENGLISH: dạng danh sách bài giống trang Toán tư duy ================= */
const MAPL_CSS=`
html body .ht-list::before{display:none}
html body .ht-list .hello{margin:14px 16px 4px}
html body .ht-list .exam-banner{width:calc(100% - 32px);margin:12px 16px 0}
html body .ht-list .ht-due{margin:12px 16px 0}
html body .ht-list .stage{margin:0 16px}
html body .ht-list .stage .ht-gh{margin:22px 2px 4px}
html body .ht-list .ht-gh .num{flex:none;width:34px;height:34px;border-radius:10px;background:var(--c,var(--hv-pri));color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center}
html body .ht-list .ht-gh h2{font-size:19px;line-height:1.2}
html body .ht-list .ht-gh .lab{display:block;font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
html body .ht-list .ht-gdesc{margin:0 2px 10px 46px;color:var(--muted);font-size:13px;font-weight:600;line-height:1.35}
html body .ht-list .en-tools{margin:0 0 10px}
html body .ht-list .ht-row.cur{border-color:var(--hv-pri);box-shadow:0 0 0 3px rgba(37,99,235,.15)}
html body .ht-list .ht-row.cur .tx small{color:var(--hv-pri-d);font-weight:800}
html body .ht-list .ht-row.lock{opacity:.6}
html body .ht-list .ht-row.lock .n{background:var(--soft);color:var(--muted)}
html body .ht-list .ht-row .n{background:var(--soft);font-size:22px}
html body .ht-list .map-end{margin:18px 16px 24px}
`;
const mlEl=document.createElement('style');mlEl.id='ht-maplist';mlEl.textContent=MAPL_CSS;document.head.appendChild(mlEl);
window.addEventListener('load',()=>document.head.appendChild(mlEl));
function htListify(){const scr=document.getElementById('scr');if(!scr||scr.dataset.htl)return;const stages=scr.querySelectorAll('section.stage');if(!stages.length)return;scr.dataset.htl='1';scr.classList.add('ht-list');
  stages.forEach((st,si)=>{const head=st.querySelector('.stage-head'),path=st.querySelector('.path');if(!head||!path)return;
    const lab=(head.querySelector('.stage-num')||{}).textContent||'',title=(head.querySelector('h2')||{}).textContent||'',desc=(head.querySelector('p')||{}).textContent||'';
    let sum=0;const nodes=[...path.querySelectorAll('.node-wrap')];
    const rows=nodes.map(nw=>{const b=nw.querySelector('.node');if(!b)return '';const se=nw.querySelector('.node-stars');const dim=se&&se.querySelector('.dim')?se.querySelector('.dim').textContent.length:0;
      const s=se?Math.max(0,(se.textContent.match(/★/g)||[]).length-dim):0;sum+=s;const lock=b.classList.contains('locked'),cur=nw.classList.contains('current');
      const name=(nw.querySelector('.node-lbl')||{}).textContent||'';const sub=cur?'▶ Con đang học bài này':lock?'🔒 Hoàn thành bài trước để mở':s?`Lần gần nhất ${s}/3 sao`:'Chưa làm';
      return `<button class="ht-row${cur?' cur':''}${lock?' lock':''}" data-act="${H(b.dataset.act||'')}" data-i="${H(b.dataset.i||'')}" aria-label="${H(b.getAttribute('aria-label')||name)}"><span class="n" aria-hidden="true">${H(b.textContent.trim())}</span><span class="tx"><b>${H(name)}</b><small>${sub}</small><div class="ht-bar"><i style="width:${Math.round(s/3*100)}%"></i></div></span><span class="ht-stars">${'★'.repeat(s)}<i>${'★'.repeat(3-s)}</i></span></button>`;}).join('');
    const hd=document.createElement('div');hd.innerHTML=`<div class="ht-gh"><span class="num">${si+1}</span><h2>${lab?`<span class="lab">${H(lab)}</span>`:''}${H(title)}</h2><small>${sum}/${nodes.length*3} ⭐</small></div>${desc?`<p class="ht-gdesc">${H(desc)}</p>`:''}`;
    head.replaceWith(...hd.childNodes);const box=document.createElement('div');box.innerHTML=rows;path.replaceWith(...box.childNodes);});
  const c=scr.querySelector('.ht-row.cur');if(c&&c.scrollIntoView)c.scrollIntoView({block:'center'});}
{const _rh=renderHome;renderHome=function(){const r=_rh.apply(this,arguments);try{htListify();}catch(e){}return r;};}
if(typeof renderTv==='function'){const _rt=renderTv;renderTv=function(){const r=_rt.apply(this,arguments);try{htListify();}catch(e){}return r;};}
if(typeof renderEnglish==='function'){const _re=renderEnglish;renderEnglish=function(){const r=_re.apply(this,arguments);try{htListify();}catch(e){}return r;};}
/* ================= LUYỆN NÓI ĐOẠN VĂN — dữ liệu: PARA[lớp][unit] = [[tiêu đề, đoạn tiếng Anh, nghĩa tiếng Việt], …] ================= */
const PARA={
0:[
 [['Hello!','Hello! I am a boy. Goodbye!','Xin chào! Tớ là bạn trai. Tạm biệt!'],['My teacher','Hello, teacher! I am a girl.','Chào cô ạ! Con là bạn gái.']],
 [['Colours','It is red. It is blue. It is green.','Nó màu đỏ. Nó màu xanh dương. Nó màu xanh lá.']],
 [['Count with me','One, two, three. Three cats. Four, five. Five stars.','Một, hai, ba. Ba con mèo. Bốn, năm. Năm ngôi sao.']],
 [['Big numbers','I am six. Seven ducks. Eight cars. Nine, ten!','Tớ sáu tuổi. Bảy con vịt. Tám chiếc ô tô. Chín, mười!']],
 [['On the farm','It is a cow. It is a pig. It is a duck.','Đó là con bò. Đó là con lợn. Đó là con vịt.']],
 [['My pets','I have a cat. I have a dog. I love my pets.','Tớ có một con mèo. Tớ có một con chó. Tớ yêu thú cưng của tớ.']],
 [['Yummy fruit','I like apples. I like bananas. Yummy!','Tớ thích táo. Tớ thích chuối. Ngon quá!']],
 [['Milk, please','Milk, please. Bread, please. Thank you!','Cho con sữa ạ. Cho con bánh mì ạ. Con cảm ơn!']],
 [['My body','Touch your head. Touch your nose. Clap your hands.','Chạm vào đầu. Chạm vào mũi. Vỗ tay nào.']],
 [['My family','This is my mom. This is my dad. I love my family.','Đây là mẹ tớ. Đây là bố tớ. Tớ yêu gia đình tớ.']],
 [['My toys','I have a ball. I have a doll. I have a kite.','Tớ có quả bóng. Tớ có búp bê. Tớ có con diều.']],
 [['At school','This is my book. This is my pencil. This is my bag.','Đây là quyển sách. Đây là bút chì. Đây là cặp của tớ.']],
 [['Shapes','It is a circle. It is a square. It is a star.','Đây là hình tròn. Đây là hình vuông. Đây là ngôi sao.']],
 [['At the zoo','Look! A lion. Look! A monkey. Look! An elephant.','Nhìn kìa! Con sư tử. Nhìn kìa! Con khỉ. Nhìn kìa! Con voi.']],
 [['On the road','I see a bus. I see a bike. I see a train.','Tớ thấy xe buýt. Tớ thấy xe đạp. Tớ thấy tàu hỏa.']],
 [['I can','I can run. I can jump. I can dance.','Tớ biết chạy. Tớ biết nhảy. Tớ biết múa.']]],
1:[
 [['Hello, Bill','Hello. I am Mai. This is my ball. Goodbye!','Xin chào. Tớ là Mai. Đây là quả bóng của tớ. Tạm biệt!']],
 [['In the dining room','I have a cat. I have a cup. I have a cake.','Tớ có một con mèo. Tớ có một cái cốc. Tớ có một cái bánh.']],
 [['At the market','This is my bag. This is my hat. I like apples.','Đây là túi của tớ. Đây là mũ của tớ. Tớ thích táo.']],
 [['In the bedroom','It is a desk. It is a door. Look! A duck.','Đây là cái bàn. Đây là cửa ra vào. Nhìn kìa! Một con vịt.']],
 [['Fish and chips','I like fish. I like chips. I like milk too.','Tớ thích cá. Tớ thích khoai tây chiên. Tớ cũng thích sữa.']],
 [['In the classroom','This is a pen. This is a pencil. The pencil is red.','Đây là cái bút. Đây là bút chì. Bút chì màu đỏ.']],
 [['In the garden','I see a garden. I see a gate. I see a goat.','Tớ thấy khu vườn. Tớ thấy cái cổng. Tớ thấy con dê.']],
 [['In the park','Touch your head. Touch your hair. Wave your hand.','Chạm vào đầu. Chạm vào tóc. Vẫy tay nào.']],
 [['In the shop','Two clocks. Four pots. One mop. How many locks?','Hai cái đồng hồ. Bốn cái nồi. Một cây lau nhà. Có bao nhiêu ổ khóa?']],
 [['At the zoo','That is a monkey. That is a mouse. The monkey likes mangoes.','Đó là con khỉ. Đó là con chuột. Con khỉ thích xoài.']],
 [['At the bus stop','Look at the bus. Look at the truck. Run to the bus!','Nhìn chiếc xe buýt kìa. Nhìn chiếc xe tải kìa. Chạy ra xe buýt nào!']],
 [['At the lake','Look at the lake. Look at the lion. The leaf is green.','Nhìn cái hồ kìa. Nhìn con sư tử kìa. Chiếc lá màu xanh.']],
 [['In the canteen','He is having noodles. She is having bananas. I am having nuts.','Bạn ấy đang ăn mì. Bạn ấy đang ăn chuối. Tớ đang ăn hạt.']],
 [['In the toy shop','I can see a teddy bear. I can see a tiger. I can see a top.','Tớ thấy con gấu bông. Tớ thấy con hổ. Tớ thấy con quay.']],
 [['Football match','This is my father. He likes football. Point to your foot.','Đây là bố tớ. Bố thích bóng đá. Chỉ vào bàn chân của bạn.']],
 [['At home','Wash your hands. Drink some water. Look at the window.','Rửa tay đi. Uống chút nước. Nhìn ra cửa sổ.']]],
2:[
 [['My birthday party','Today is my birthday. I like pizza. I like popcorn. The cake is yummy.','Hôm nay là sinh nhật tớ. Tớ thích pizza. Tớ thích bỏng ngô. Cái bánh ngon quá.']],
 [['In the backyard','I am in the backyard. I have a kite. I have a bike. Look at the kitten!','Tớ đang ở sân sau. Tớ có một con diều. Tớ có một chiếc xe đạp. Nhìn chú mèo con kìa!']],
 [['At the seaside','I am at the seaside. I can see the sea. I can see the sand. The sun is hot.','Tớ đang ở bãi biển. Tớ thấy biển. Tớ thấy cát. Mặt trời nóng quá.']],
 [['In the countryside','This is the countryside. Look at the rainbow. Look at the river. A rabbit is on the road.','Đây là vùng quê. Nhìn cầu vồng kìa. Nhìn dòng sông kìa. Một con thỏ ở trên đường.']],
 [['In the classroom','We are in the classroom. Draw a square. Let us do a quiz. Can I ask a question?','Chúng tớ đang ở trong lớp. Vẽ một hình vuông. Chúng mình làm câu đố nhé. Con hỏi một câu được không ạ?']],
 [['On the farm','I am on the farm. There is a fox. There is an ox. The fox is in the box.','Tớ đang ở nông trại. Có một con cáo. Có một con bò. Con cáo ở trong cái hộp.']],
 [['In the kitchen','I am in the kitchen. I want some juice. I want some jelly. The jam is on the table.','Tớ đang ở trong bếp. Tớ muốn uống nước ép. Tớ muốn ăn thạch. Hũ mứt ở trên bàn.']],
 [['In the village','This is my village. Look at the van. We play volleyball. My sister plays the violin.','Đây là làng của tớ. Nhìn chiếc xe tải nhỏ kìa. Chúng tớ chơi bóng chuyền. Chị tớ chơi đàn vi-ô-lông.']],
 [['At the store','I am in the store. I want some yogurt. I want some yams. Look at the yellow yo-yos.','Tớ đang ở cửa hàng. Tớ muốn mua sữa chua. Tớ muốn mua khoai. Nhìn những chiếc yo-yo màu vàng kìa.']],
 [['At the zoo','Let us go to the zoo. I can see a zebra. I can see a lion. The lion is big.','Chúng mình đi sở thú nhé. Tớ thấy ngựa vằn. Tớ thấy sư tử. Con sư tử to quá.']],
 [['In the playground','I am in the playground. Look at the slide. I can ride a bike. I can swing.','Tớ đang ở sân chơi. Nhìn cầu trượt kìa. Tớ biết đi xe đạp. Tớ biết chơi xích đu.']],
 [['At the café','We are at the café. I would like a cake. I would like some grapes. Sit at the table, please.','Chúng tớ đang ở quán. Tớ muốn một cái bánh. Tớ muốn ít nho. Mời ngồi vào bàn ạ.']],
 [['In the maths class','I have eleven pens. I have twelve books. Let us count to fifteen.','Tớ có mười một cái bút. Tớ có mười hai quyển sách. Cùng đếm đến mười lăm nào.']],
 [['My family at home','This is my family. This is my brother. This is my sister. I love my grandmother.','Đây là gia đình tớ. Đây là anh trai tớ. Đây là chị gái tớ. Tớ yêu bà của tớ.']],
 [['Clothes shop','I am in the clothes shop. I want a shirt. I want some shoes. This dress is nice.','Tớ đang ở cửa hàng quần áo. Tớ muốn một cái áo sơ mi. Tớ muốn một đôi giày. Cái váy này đẹp quá.']],
 [['At the campsite','We are at the campsite. This is my tent. I have a blanket. Where is the torch?','Chúng tớ đang ở khu cắm trại. Đây là lều của tớ. Tớ có một cái chăn. Cái đèn pin đâu rồi?']]],
3:[
 [['About me','Hello! My name is Mai. I am eight years old. My favourite colour is blue. Nice to meet you!','Xin chào! Tớ tên là Mai. Tớ tám tuổi. Màu tớ thích nhất là xanh dương. Rất vui được gặp bạn!']],
 [['My toys','This is my doll. This is my teddy bear. That is my kite. I like my toys very much.','Đây là búp bê của tớ. Đây là gấu bông của tớ. Kia là con diều của tớ. Tớ rất thích đồ chơi của tớ.']],
 [['My school things','This is my pencil case. My pen is in the pencil case. That is his ruler. That is her book.','Đây là hộp bút của tớ. Bút của tớ ở trong hộp bút. Kia là thước của bạn ấy. Kia là sách của bạn ấy.']],
 [['My family','This is my family. This is my mom and this is my dad. I have a sister. My grandma is kind.','Đây là gia đình tớ. Đây là mẹ và đây là bố tớ. Tớ có một chị gái. Bà tớ rất hiền.']],
 [['Meet my friend','This is Billy. He is my friend. He is nine years old. Red and white make pink.','Đây là Billy. Cậu ấy là bạn tớ. Cậu ấy chín tuổi. Đỏ và trắng pha thành hồng.']],
 [['Animals I like','I like monkeys. They are funny. I like birds too. I do not like big elephants.','Tớ thích khỉ. Chúng rất vui nhộn. Tớ cũng thích chim. Tớ không thích những con voi to.']],
 [['My food','I like rice and meat. I like carrots. I do not like yogurt. I drink milk every day.','Tớ thích cơm và thịt. Tớ thích cà rốt. Tớ không thích sữa chua. Ngày nào tớ cũng uống sữa.']],
 [['My new friend','I have a new friend. Her name is Rosy. She has long hair. She is tall and thin.','Tớ có một người bạn mới. Bạn ấy tên là Rosy. Bạn ấy có tóc dài. Bạn ấy cao và gầy.']],
 [['Insects','A bird has feathers. A bee is an insect. It has wings. Do you like fish?','Con chim có lông vũ. Con ong là côn trùng. Nó có cánh. Bạn có thích cá không?']],
 [['My clothes','I am wearing a blue skirt. I am wearing a white shirt. My brother is wearing jeans and boots.','Tớ đang mặc váy xanh. Tớ đang mặc áo sơ mi trắng. Anh tớ đang mặc quần bò và đi bốt.']],
 [['At home now','It is Sunday. I am dancing with Dad. Mom is singing. My brother is watching TV.','Hôm nay là Chủ nhật. Tớ đang nhảy cùng bố. Mẹ đang hát. Anh tớ đang xem ti vi.']],
 [['I can','I can run fast. I can ride a bike. My sister can read and write. She can not swim.','Tớ chạy được nhanh. Tớ biết đi xe đạp. Em gái tớ biết đọc và viết. Em ấy chưa biết bơi.']],
 [['At the museum','We are at the museum. It is great. May I take a photo? Yes, you may.','Chúng tớ đang ở bảo tàng. Nó thật tuyệt. Con chụp ảnh được không ạ? Được, con chụp đi.']],
 [['My bedroom','This is my bedroom. There is a bed. There is a pillow on the bed. There are twelve books on the shelf.','Đây là phòng ngủ của tớ. Có một cái giường. Có một cái gối trên giường. Có mười hai quyển sách trên giá.']],
 [['Our classroom','This is our classroom. These are our tables. Those are our computers. There is a big board.','Đây là lớp học của chúng tớ. Đây là bàn của chúng tớ. Kia là máy tính của chúng tớ. Có một cái bảng lớn.']],
 [['Five senses','I see with my eyes. I hear with my ears. I smell with my nose. I taste with my tongue.','Tớ nhìn bằng mắt. Tớ nghe bằng tai. Tớ ngửi bằng mũi. Tớ nếm bằng lưỡi.']]],
4:[
 [['My friends','I have many friends. Mai is from Viet Nam. Tom is from Britain. Akiko is from Japan. We are good friends.','Tớ có nhiều bạn. Mai đến từ Việt Nam. Tom đến từ Anh. Akiko đến từ Nhật Bản. Chúng tớ là bạn tốt.']],
 [['My day','I get up at six o\'clock. I have breakfast at half past six. I go to school at seven. I go to bed at nine.','Tớ thức dậy lúc sáu giờ. Tớ ăn sáng lúc sáu rưỡi. Tớ đi học lúc bảy giờ. Tớ đi ngủ lúc chín giờ.']],
 [['My week','I go to school from Monday to Friday. I study English on Tuesdays. On Saturdays, I help my parents. On Sundays, I visit my grandparents.','Tớ đi học từ thứ Hai đến thứ Sáu. Tớ học tiếng Anh vào thứ Ba. Thứ Bảy, tớ giúp bố mẹ. Chủ nhật, tớ thăm ông bà.']],
 [['My birthday','My birthday is in June. I have a party with my friends. We eat chips and grapes. We drink lemonade. It is fun.','Sinh nhật tớ vào tháng Sáu. Tớ tổ chức tiệc với các bạn. Chúng tớ ăn khoai tây chiên và nho. Chúng tớ uống nước chanh. Thật vui.']],
 [['Things I can do','I can swim and I can draw. I can not ride a horse. My sister can dance. My brother can play the guitar.','Tớ biết bơi và biết vẽ. Tớ không biết cưỡi ngựa. Chị tớ biết múa. Anh tớ biết chơi đàn ghi-ta.']],
 [['My school','This is my school. It is big and beautiful. There is a library and a computer room. The playground is in front of the school.','Đây là trường tớ. Trường to và đẹp. Có thư viện và phòng máy tính. Sân chơi ở phía trước trường.']],
 [['My subjects','I have Maths and English today. My favourite subject is Science. I like it because it is interesting. I have Art on Fridays.','Hôm nay tớ có Toán và Tiếng Anh. Môn tớ thích nhất là Khoa học. Tớ thích vì nó thú vị. Tớ có môn Mĩ thuật vào thứ Sáu.']],
 [['Sports day','Our sports day is in November. I am good at running. My friends are playing football. Everyone is happy.','Ngày hội thể thao của trường tớ vào tháng Mười Một. Tớ chạy giỏi. Các bạn tớ đang đá bóng. Mọi người đều vui.']],
 [['Last summer','Last summer, I was at the beach. I swam in the sea. I built sandcastles with my brother. We took many photos.','Hè năm ngoái, tớ ở bãi biển. Tớ bơi ở biển. Tớ xây lâu đài cát với anh trai. Chúng tớ chụp nhiều ảnh.']],
 [['My home','I live in a small house in the city. My street is busy and noisy. My grandparents live in a village. It is quiet and beautiful.','Tớ sống trong một ngôi nhà nhỏ ở thành phố. Phố của tớ đông đúc và ồn ào. Ông bà tớ sống ở làng. Ở đó yên tĩnh và đẹp.']],
 [['Jobs','My father is a farmer. He works on the farm. My mother is a nurse. She works in a hospital. I want to be a teacher.','Bố tớ là nông dân. Bố làm việc ở nông trại. Mẹ tớ là y tá. Mẹ làm việc ở bệnh viện. Tớ muốn làm giáo viên.']],
 [['Appearance','My best friend is Nam. He is tall and slim. He has short black hair and big eyes. He is very friendly.','Bạn thân nhất của tớ là Nam. Cậu ấy cao và gầy. Cậu ấy có tóc đen ngắn và mắt to. Cậu ấy rất thân thiện.']],
 [['Our weekends','At the weekend, my family is busy. I do morning exercise. My mother cooks dinner. My father waters the flowers. On Sundays, we go to the cinema.','Cuối tuần, gia đình tớ bận rộn. Tớ tập thể dục buổi sáng. Mẹ nấu bữa tối. Bố tưới hoa. Chủ nhật, cả nhà đi xem phim.']],
 [['The weather','What is the weather like today? It is sunny and hot. Yesterday it was rainy and cold. I like sunny days.','Hôm nay thời tiết thế nào? Trời nắng và nóng. Hôm qua trời mưa và lạnh. Tớ thích những ngày nắng.']],
 [['Shopping','I am at the shopping centre with my mother. I want to buy a jacket. How much is the T-shirt? It is seventy thousand dong.','Tớ đang ở trung tâm mua sắm với mẹ. Tớ muốn mua một chiếc áo khoác. Cái áo phông giá bao nhiêu? Nó giá bảy mươi nghìn đồng.']],
 [['Animals and camp','I like animals. The kangaroo can jump. The monkey can climb. At the summer camp, we put up a tent and sing songs.','Tớ thích động vật. Con chuột túi biết nhảy. Con khỉ biết leo trèo. Ở trại hè, chúng tớ dựng lều và hát.']]],
5:[
 [['All about me','My name is Lan. I am in Class 5C. I live in the countryside with my family. I like playing table tennis. My favourite animal is the dolphin.','Tớ tên là Lan. Tớ học lớp 5C. Tớ sống ở vùng quê cùng gia đình. Tớ thích chơi bóng bàn. Con vật tớ yêu thích là cá heo.']],
 [['Our home','I live in a flat in a tall building. My address is twenty-three Green Street. The building has many floors. I can see the whole city from my window.','Tớ sống trong một căn hộ ở tòa nhà cao. Địa chỉ của tớ là số hai mươi ba phố Green. Tòa nhà có nhiều tầng. Tớ nhìn thấy cả thành phố từ cửa sổ.']],
 [['My foreign friends','I have two foreign friends. Jack is Australian. He is active and friendly. Yumi is Japanese. She is clever and kind.','Tớ có hai người bạn nước ngoài. Jack là người Úc. Cậu ấy năng động và thân thiện. Yumi là người Nhật. Bạn ấy thông minh và tốt bụng.']],
 [['My free time','In my free time, I usually ride my bike. I sometimes watch cartoons. My sister always plays the violin. We often go for a walk after dinner.','Lúc rảnh, tớ thường đạp xe. Thỉnh thoảng tớ xem phim hoạt hình. Chị tớ luôn chơi vi-ô-lông. Chúng tớ hay đi dạo sau bữa tối.']],
 [['My future job','I would like to be a firefighter in the future. I want to help people. My friend would like to be a reporter. She wants to report the news.','Tương lai tớ muốn làm lính cứu hỏa. Tớ muốn giúp đỡ mọi người. Bạn tớ muốn làm phóng viên. Bạn ấy muốn đưa tin tức.']],
 [['Our school rooms','Our school has four floors. The library is on the ground floor. The computer room is on the third floor. Go upstairs and it is on your left.','Trường tớ có bốn tầng. Thư viện ở tầng trệt. Phòng máy tính ở tầng ba. Đi lên cầu thang và nó ở bên trái bạn.']],
 [['School activities','I like doing projects at school. It is fun and good for group work. My friend likes solving maths problems. He thinks it is useful.','Tớ thích làm dự án ở trường. Nó vui và tốt cho làm việc nhóm. Bạn tớ thích giải toán. Cậu ấy nghĩ nó có ích.']],
 [['In our classroom','There are many things in our classroom. The crayons are beside the books. The map is above the board. My school bag is under the desk.','Lớp tớ có nhiều đồ vật. Bút sáp ở cạnh những quyển sách. Bản đồ ở phía trên bảng. Cặp của tớ ở dưới bàn.']],
 [['Outdoor activities','Yesterday we were at the campsite. We listened to music and played chess. In the evening, we danced around the campfire. It was great.','Hôm qua chúng tớ ở khu cắm trại. Chúng tớ nghe nhạc và chơi cờ. Buổi tối, chúng tớ nhảy quanh lửa trại. Thật tuyệt.']],
 [['Our school trip','Last month, our class went to Hoan Kiem Lake. We walked around the lake. We visited the old buildings. We played games and took photos.','Tháng trước, lớp tớ đi Hồ Hoàn Kiếm. Chúng tớ đi dạo quanh hồ. Chúng tớ thăm các tòa nhà cổ. Chúng tớ chơi trò chơi và chụp ảnh.']],
 [['Family time','Last summer, my family went to the beach. We walked on the beach and collected seashells. We ate seafood. I bought souvenirs for my friends.','Hè năm ngoái, gia đình tớ đi biển. Chúng tớ đi dạo trên bãi biển và nhặt vỏ sò. Chúng tớ ăn hải sản. Tớ mua quà lưu niệm cho các bạn.']],
 [['Our Tet holiday','Tet is coming soon. We will decorate the house. My mother will make banh chung. My father will buy a branch of peach blossoms. We will watch the fireworks show.','Tết sắp đến rồi. Chúng tớ sẽ trang trí nhà cửa. Mẹ sẽ gói bánh chưng. Bố sẽ mua một cành đào. Chúng tớ sẽ xem bắn pháo hoa.']],
 [['Special days','I love the Mid-Autumn Festival. We carry lanterns and eat mooncakes. On Children\'s Day, we have a party. We eat pizza and drink apple juice.','Tớ yêu Tết Trung thu. Chúng tớ rước đèn và ăn bánh trung thu. Vào ngày Quốc tế Thiếu nhi, chúng tớ có tiệc. Chúng tớ ăn pizza và uống nước táo.']],
 [['Staying healthy','I want to stay healthy. I do morning exercise every day. I eat vegetables and drink fresh juice. I play sports three times a week.','Tớ muốn khỏe mạnh. Ngày nào tớ cũng tập thể dục buổi sáng. Tớ ăn rau và uống nước ép tươi. Tớ chơi thể thao ba lần một tuần.']],
 [['Our health','Yesterday I had a headache and a sore throat. My mother said I should have a rest. I drank warm water and went to bed early. Today I feel better.','Hôm qua tớ bị đau đầu và đau họng. Mẹ bảo tớ nên nghỉ ngơi. Tớ uống nước ấm và đi ngủ sớm. Hôm nay tớ thấy khỏe hơn.']],
 [['Seasons','There are four seasons in Ha Noi. It is warm in spring. It is hot in summer. It is cool in autumn. It is cold in winter.','Hà Nội có bốn mùa. Mùa xuân ấm áp. Mùa hè nóng. Mùa thu mát mẻ. Mùa đông lạnh.']],
 [['A story','I like the story of the hare and the tortoise. The hare ran fast but he slept under a tree. The tortoise walked slowly. In the end, the tortoise won the race.','Tớ thích câu chuyện thỏ và rùa. Thỏ chạy nhanh nhưng lại ngủ dưới gốc cây. Rùa đi chậm rãi. Cuối cùng rùa thắng cuộc đua.']],
 [['Transport','I want to visit the Dragon Bridge. I will go there by bus. My friend wants to visit Ngo Mon Square. She will go there by taxi.','Tớ muốn thăm Cầu Rồng. Tớ sẽ đi đến đó bằng xe buýt. Bạn tớ muốn thăm Quảng trường Ngọ Môn. Bạn ấy sẽ đi bằng taxi.']],
 [['Places of interest','Last year, I visited Ba Na Hills. I think it is beautiful and exciting. It is about forty kilometres from Da Nang. I want to go there again.','Năm ngoái, tớ đã đến Bà Nà. Tớ nghĩ nơi đó đẹp và thú vị. Nó cách Đà Nẵng khoảng bốn mươi ki-lô-mét. Tớ muốn đến đó lần nữa.']],
 [['Summer plans','This summer, I am going to visit Phu Quoc Island. I am going to practise swimming. My brother is going to join a music club. We are going to have a great summer.','Hè này, tớ sẽ đi đảo Phú Quốc. Tớ sẽ luyện bơi. Anh tớ sẽ tham gia câu lạc bộ âm nhạc. Chúng tớ sẽ có một mùa hè tuyệt vời.']]]};
/* đoạn văn chung theo chủ đề để luyện thêm (mọi Unit), khó dần theo lớp */
const PARA_EXTRA={
 me:[[0,1,'Me','I am a boy. I am five. I like red.','Tớ là bạn trai. Tớ năm tuổi. Tớ thích màu đỏ.'],[2,3,'Introduce myself','Hello! My name is Nam. I am eight years old. I like football. I have a dog.','Xin chào! Tớ tên là Nam. Tớ tám tuổi. Tớ thích bóng đá. Tớ có một con chó.'],[4,5,'Introduce myself','Hello, everyone! My name is Minh and I am ten years old. I am in Class 5A at Hong Hoa Primary School. In my free time, I like reading books and playing badminton.','Chào mọi người! Tớ tên là Minh, tớ mười tuổi. Tớ học lớp 5A trường Tiểu học Hồng Hoa. Lúc rảnh, tớ thích đọc sách và chơi cầu lông.']],
 day:[[1,3,'My morning','I get up early. I wash my face. I eat breakfast. I go to school.','Tớ dậy sớm. Tớ rửa mặt. Tớ ăn sáng. Tớ đi học.'],[4,5,'My daily routine','I usually get up at six. After breakfast, I walk to school with my friends. In the afternoon, I do my homework. In the evening, I read books and go to bed at half past nine.','Tớ thường dậy lúc sáu giờ. Sau bữa sáng, tớ đi bộ đến trường cùng các bạn. Buổi chiều, tớ làm bài tập. Buổi tối, tớ đọc sách và đi ngủ lúc chín rưỡi.']]};
/* ĐOẠN VĂN THỨ HAI cho mỗi Unit (lớp 2–5): kể về bản thân con theo chủ đề của bài */
const PARA2={
2:[['My party','I like parties. At my party, I eat pizza. My friends sing a song. We are happy.','Tớ thích tiệc. Ở bữa tiệc của tớ, tớ ăn pizza. Các bạn hát một bài. Chúng tớ rất vui.'],
 ['My kite','This is my kite. It is red and yellow. I fly my kite in the park. It is fun.','Đây là con diều của tớ. Nó màu đỏ và vàng. Tớ thả diều ở công viên. Thật vui.'],
 ['At the beach','I go to the beach in summer. I swim in the sea. I play in the sand. I love the beach.','Mùa hè tớ đi biển. Tớ bơi ở biển. Tớ chơi trên cát. Tớ yêu bãi biển.'],
 ['My grandparents','My grandparents live in the countryside. There is a river near their house. I see rabbits and ducks. I like it there.','Ông bà tớ sống ở vùng quê. Có một con sông gần nhà ông bà. Tớ thấy thỏ và vịt. Tớ thích ở đó.'],
 ['My classroom','My classroom is big. There are many desks. My teacher is kind. I like my class.','Lớp học của tớ rộng. Có nhiều bàn học. Cô giáo tớ rất hiền. Tớ thích lớp của tớ.'],
 ['Farm animals','I like farm animals. The cow is big. The hen is small. The fox is clever.','Tớ thích các con vật ở trang trại. Con bò thì to. Con gà mái thì nhỏ. Con cáo thì thông minh.'],
 ['My breakfast','I have breakfast at home. I drink orange juice. I eat bread with jam. It is yummy.','Tớ ăn sáng ở nhà. Tớ uống nước cam. Tớ ăn bánh mì với mứt. Ngon lắm.'],
 ['Sports I like','I like volleyball. I play it with my friends. My brother likes football. We play after school.','Tớ thích bóng chuyền. Tớ chơi với các bạn. Anh tớ thích bóng đá. Chúng tớ chơi sau giờ học.'],
 ['Shopping with Mom','I go to the store with my mom. She buys some yogurt. I want a yellow yo-yo. Mom says yes.','Tớ đi cửa hàng với mẹ. Mẹ mua sữa chua. Tớ muốn một chiếc yo-yo màu vàng. Mẹ đồng ý.'],
 ['My favourite animal','My favourite animal is the zebra. It is black and white. It can run fast. I see it at the zoo.','Con vật tớ thích nhất là ngựa vằn. Nó có màu đen và trắng. Nó chạy rất nhanh. Tớ thấy nó ở sở thú.'],
 ['After school','After school, I go to the playground. I go down the slide. I play on the swing. Then I go home.','Sau giờ học, tớ ra sân chơi. Tớ chơi cầu trượt. Tớ chơi xích đu. Sau đó tớ về nhà.'],
 ['At a café','I am at a café with my dad. I would like a cake. Dad would like a cup of tea. We sit near the window.','Tớ ở quán với bố. Tớ muốn một cái bánh. Bố muốn một cốc trà. Chúng tớ ngồi gần cửa sổ.'],
 ['Counting','I can count to twenty. I have thirteen stickers. My sister has fifteen stickers. We have a lot!','Tớ đếm được đến hai mươi. Tớ có mười ba hình dán. Em tớ có mười lăm hình dán. Chúng tớ có nhiều lắm!'],
 ['My brother','This is my brother. He is ten years old. He is tall. He helps me with my homework.','Đây là anh trai tớ. Anh ấy mười tuổi. Anh ấy cao. Anh ấy giúp tớ làm bài tập.'],
 ['My clothes','I like my new shoes. They are white. I have a blue shirt. I wear it to school.','Tớ thích đôi giày mới. Nó màu trắng. Tớ có một áo sơ mi xanh. Tớ mặc nó đi học.'],
 ['Camping','I go camping with my family. We sleep in a tent. At night, we look at the stars. It is great.','Tớ đi cắm trại với gia đình. Chúng tớ ngủ trong lều. Buổi tối, chúng tớ ngắm sao. Thật tuyệt.']],
3:[['My best friend','My best friend is Nam. He is eight years old. His favourite colour is green. We go to school together.','Bạn thân nhất của tớ là Nam. Cậu ấy tám tuổi. Màu cậu ấy thích nhất là xanh lá. Chúng tớ đi học cùng nhau.'],
 ['My favourite toy','My favourite toy is a robot. It is big and grey. It can walk and talk. I play with it every day.','Đồ chơi tớ thích nhất là một con rô-bốt. Nó to và màu xám. Nó biết đi và nói. Ngày nào tớ cũng chơi với nó.'],
 ['My school bag','This is my school bag. It is blue. In my bag, there are three books and a pencil case. My bag is not heavy.','Đây là cặp sách của tớ. Nó màu xanh. Trong cặp có ba quyển sách và một hộp bút. Cặp của tớ không nặng.'],
 ['My big family','There are five people in my family. My dad is a doctor. My mom is a teacher. I have a brother and a sister.','Gia đình tớ có năm người. Bố tớ là bác sĩ. Mẹ tớ là giáo viên. Tớ có một anh trai và một em gái.'],
 ['My colours','I like painting. I mix blue and yellow. They make green. My picture is very colourful.','Tớ thích vẽ màu. Tớ pha màu xanh dương và vàng. Chúng thành màu xanh lá. Bức tranh của tớ rất nhiều màu.'],
 ['At the zoo','I go to the zoo with my class. I see big elephants and funny monkeys. The giraffes are very tall. I like the zoo.','Tớ đi sở thú với lớp. Tớ thấy những con voi to và những chú khỉ vui nhộn. Những con hươu cao cổ rất cao. Tớ thích sở thú.'],
 ['My lunch','For lunch, I have rice, fish and vegetables. I drink water. I do not eat sweets. I want to be healthy.','Bữa trưa tớ ăn cơm, cá và rau. Tớ uống nước. Tớ không ăn đồ ngọt. Tớ muốn khỏe mạnh.'],
 ['About me','I have short black hair and brown eyes. I am not tall. I am friendly. I like making new friends.','Tớ có tóc đen ngắn và mắt nâu. Tớ không cao. Tớ thân thiện. Tớ thích kết bạn mới.'],
 ['Animals I know','A fish can swim. A bird can fly. A frog can jump. I like all animals.','Con cá biết bơi. Con chim biết bay. Con ếch biết nhảy. Tớ thích tất cả các con vật.'],
 ['What I wear','Today it is cold. I am wearing a jacket and a scarf. My sister is wearing a hat. We are warm.','Hôm nay trời lạnh. Tớ đang mặc áo khoác và quàng khăn. Em gái tớ đang đội mũ. Chúng tớ thấy ấm.'],
 ['This evening','It is seven o\'clock in the evening. My dad is cooking. My mom is reading a book. I am doing my homework.','Bây giờ là bảy giờ tối. Bố tớ đang nấu ăn. Mẹ tớ đang đọc sách. Tớ đang làm bài tập.'],
 ['My talents','I can sing and dance. I can not play the piano. My friend can play football very well. We help each other.','Tớ biết hát và múa. Tớ không biết chơi đàn piano. Bạn tớ chơi bóng đá rất giỏi. Chúng tớ giúp đỡ nhau.'],
 ['A day out','We are at the park. My brother is flying a kite. I am taking photos. May I have an ice cream, Mom?','Chúng tớ đang ở công viên. Anh tớ đang thả diều. Tớ đang chụp ảnh. Mẹ ơi, con ăn kem được không ạ?'],
 ['My living room','There is a big sofa in my living room. There are two lamps. There is a TV on the table. I like watching cartoons there.','Phòng khách nhà tớ có một chiếc ghế sô-pha to. Có hai cái đèn. Có một cái ti vi trên bàn. Tớ thích xem phim hoạt hình ở đó.'],
 ['Our school','Our school is big. There are many classrooms. These are our books. Those are our teachers.','Trường tớ rất rộng. Có nhiều phòng học. Đây là sách của chúng tớ. Kia là các thầy cô của chúng tớ.'],
 ['I use my senses','I can see the flowers. I can smell the cake. I can hear the birds. I can touch the soft cat.','Tớ nhìn thấy những bông hoa. Tớ ngửi thấy mùi bánh. Tớ nghe thấy tiếng chim. Tớ chạm vào chú mèo mềm mại.']],
4:[['My pen friend','I have a pen friend. His name is Tony. He is from Australia. He is nine years old. He likes football and swimming.','Tớ có một người bạn qua thư. Cậu ấy tên Tony. Cậu ấy đến từ Úc. Cậu ấy chín tuổi. Cậu ấy thích bóng đá và bơi lội.'],
 ['My morning','I get up at half past six every morning. I brush my teeth and wash my face. Then I have breakfast with my family. I go to school at seven o\'clock.','Tớ dậy lúc sáu rưỡi mỗi sáng. Tớ đánh răng và rửa mặt. Sau đó tớ ăn sáng cùng gia đình. Tớ đi học lúc bảy giờ.'],
 ['My weekend','I do not go to school at the weekend. On Saturday morning, I clean my room. In the afternoon, I play with my friends. On Sunday, I go to the park with my family.','Cuối tuần tớ không đi học. Sáng thứ Bảy, tớ dọn phòng. Buổi chiều, tớ chơi với các bạn. Chủ nhật, tớ đi công viên với gia đình.'],
 ['My mother\'s birthday','My mother\'s birthday is in March. I make a card for her. My father buys flowers. We have a big dinner together.','Sinh nhật mẹ tớ vào tháng Ba. Tớ làm một tấm thiệp tặng mẹ. Bố tớ mua hoa. Cả nhà ăn một bữa tối thật to.'],
 ['My friend can','My friend Lan is very clever. She can play the piano. She can draw pictures. But she can not swim. I want to teach her.','Bạn tớ Lan rất giỏi. Bạn ấy biết chơi đàn piano. Bạn ấy biết vẽ tranh. Nhưng bạn ấy không biết bơi. Tớ muốn dạy bạn ấy.'],
 ['My classroom','My classroom is on the second floor. It is big and bright. There are thirty desks. There is a map on the wall.','Lớp tớ ở tầng hai. Lớp rộng và sáng. Có ba mươi cái bàn. Có một tấm bản đồ trên tường.'],
 ['My timetable','Today is Monday. I have Vietnamese, Maths and English. I like English because I can sing English songs. I do not have Music today.','Hôm nay là thứ Hai. Tớ có môn Tiếng Việt, Toán và Tiếng Anh. Tớ thích Tiếng Anh vì tớ được hát bài hát tiếng Anh. Hôm nay tớ không có môn Âm nhạc.'],
 ['My favourite sport','My favourite sport is badminton. I play it with my father every evening. I am good at it. Next week, I will play in a school competition.','Môn thể thao tớ thích nhất là cầu lông. Tối nào tớ cũng chơi với bố. Tớ chơi giỏi. Tuần sau, tớ sẽ thi đấu ở trường.'],
 ['My holiday','Last week, I was in Da Lat with my family. The weather was cool. We visited a flower garden. I ate strawberries. It was a great holiday.','Tuần trước, tớ ở Đà Lạt với gia đình. Thời tiết mát mẻ. Chúng tớ thăm một vườn hoa. Tớ ăn dâu tây. Đó là một kì nghỉ tuyệt vời.'],
 ['My street','I live on a quiet street. There are many trees. There is a small shop near my house. My neighbours are very friendly.','Tớ sống trên một con phố yên tĩnh. Có nhiều cây xanh. Có một cửa hàng nhỏ gần nhà tớ. Hàng xóm của tớ rất thân thiện.'],
 ['My dream job','I want to be a doctor. Doctors work in hospitals. They help sick people. I think it is a great job.','Tớ muốn làm bác sĩ. Bác sĩ làm việc ở bệnh viện. Họ giúp những người bị ốm. Tớ nghĩ đó là một nghề tuyệt vời.'],
 ['My teacher','My English teacher is Ms Hoa. She is young and pretty. She has long hair. She is very kind and funny.','Cô giáo Tiếng Anh của tớ là cô Hoa. Cô trẻ và xinh. Cô có mái tóc dài. Cô rất hiền và vui tính.'],
 ['Sunday at home','On Sunday, my family stays at home. My father cleans the house. My mother and I cook lunch. In the evening, we watch a film together.','Chủ nhật, cả nhà tớ ở nhà. Bố dọn nhà. Mẹ và tớ nấu bữa trưa. Buổi tối, cả nhà cùng xem phim.'],
 ['Rainy days','I do not like rainy days. I can not play outside. I stay at home and read comics. I like sunny days better.','Tớ không thích những ngày mưa. Tớ không ra ngoài chơi được. Tớ ở nhà đọc truyện tranh. Tớ thích ngày nắng hơn.'],
 ['At the market','I go to the market with my grandmother. She buys some fish and vegetables. I want some bananas. They are twenty thousand dong.','Tớ đi chợ với bà. Bà mua cá và rau. Tớ muốn mua chuối. Chuối giá hai mươi nghìn đồng.'],
 ['At the zoo','Last Sunday, I went to the zoo. I saw tigers and bears. The monkeys were very funny. They were swinging in the trees.','Chủ nhật trước, tớ đi sở thú. Tớ thấy hổ và gấu. Những chú khỉ rất vui nhộn. Chúng đang đu trên cây.']],
5:[['My hobbies','I have many hobbies. I like reading books about animals. I also like playing chess with my grandfather. At the weekend, I often go swimming with my friends. My hobbies make me happy.','Tớ có nhiều sở thích. Tớ thích đọc sách về động vật. Tớ cũng thích chơi cờ với ông. Cuối tuần, tớ thường đi bơi với các bạn. Sở thích làm tớ vui.'],
 ['My dream house','In the future, I want to live in a house near the sea. It will have a big garden with many flowers. My bedroom will be on the second floor. I will see the sea from my window.','Trong tương lai, tớ muốn sống trong một ngôi nhà gần biển. Ngôi nhà sẽ có một khu vườn lớn với nhiều hoa. Phòng ngủ của tớ sẽ ở tầng hai. Tớ sẽ nhìn thấy biển từ cửa sổ.'],
 ['A friend from abroad','My friend Anna is from England. She is tall and has blue eyes. She is very kind and hard-working. She is learning Vietnamese. We often talk on the computer.','Bạn tớ Anna đến từ nước Anh. Bạn ấy cao và có mắt xanh. Bạn ấy rất tốt bụng và chăm chỉ. Bạn ấy đang học tiếng Việt. Chúng tớ thường nói chuyện qua máy tính.'],
 ['My week','I usually go to the library on Mondays. On Wednesdays, I have a drawing class. I sometimes play football on Fridays. I never stay up late on school days.','Tớ thường đến thư viện vào thứ Hai. Thứ Tư, tớ có lớp vẽ. Thỉnh thoảng tớ đá bóng vào thứ Sáu. Tớ không bao giờ thức khuya vào ngày đi học.'],
 ['My future job','I would like to be a pilot. I want to fly planes around the world. I will study English hard. I will also keep fit and do exercise every day.','Tớ muốn làm phi công. Tớ muốn lái máy bay đi khắp thế giới. Tớ sẽ học tiếng Anh chăm chỉ. Tớ cũng sẽ giữ dáng và tập thể dục mỗi ngày.'],
 ['Where is the library?','Excuse me, where is the library? Go along the corridor and turn right. The library is next to the music room. It is on the first floor.','Xin lỗi, thư viện ở đâu ạ? Đi dọc hành lang rồi rẽ phải. Thư viện ở cạnh phòng âm nhạc. Nó ở tầng một.'],
 ['My favourite activity','My favourite activity at school is reading books in the library. I think it is interesting. I can learn many new things. I read two books every week.','Hoạt động ở trường tớ thích nhất là đọc sách ở thư viện. Tớ nghĩ nó thú vị. Tớ có thể học nhiều điều mới. Mỗi tuần tớ đọc hai quyển sách.'],
 ['My bedroom','My bedroom is small but tidy. My bed is next to the window. There is a desk in front of the bed. My books are on the shelf above the desk.','Phòng ngủ của tớ nhỏ nhưng gọn gàng. Giường của tớ ở cạnh cửa sổ. Có một cái bàn ở phía trước giường. Sách của tớ ở trên giá phía trên bàn.'],
 ['Last weekend','Last weekend, I went to the countryside. I helped my grandparents in the garden. We picked fruit and fed the chickens. In the evening, we had dinner in the yard.','Cuối tuần trước, tớ về quê. Tớ giúp ông bà làm vườn. Chúng tớ hái quả và cho gà ăn. Buổi tối, cả nhà ăn tối ngoài sân.'],
 ['A trip to the museum','Last Friday, my class visited the History Museum. We saw many old things. Our teacher told us interesting stories. I learned a lot about our country.','Thứ Sáu tuần trước, lớp tớ đi thăm Bảo tàng Lịch sử. Chúng tớ thấy nhiều đồ vật cổ. Cô giáo kể cho chúng tớ nhiều câu chuyện thú vị. Tớ học được nhiều điều về đất nước mình.'],
 ['A family trip','Last month, my family went to Ha Long Bay. We went there by coach. We took a boat around the islands. The view was amazing. I took many photos.','Tháng trước, gia đình tớ đi Vịnh Hạ Long. Chúng tớ đi bằng xe khách. Chúng tớ đi thuyền quanh các đảo. Cảnh đẹp tuyệt vời. Tớ chụp rất nhiều ảnh.'],
 ['New Year plans','Next Tet, I will visit my grandparents. I will wear new clothes. I will get lucky money. I will help my mother clean the house before Tet.','Tết tới, tớ sẽ thăm ông bà. Tớ sẽ mặc quần áo mới. Tớ sẽ được lì xì. Tớ sẽ giúp mẹ dọn nhà trước Tết.'],
 ['Teachers\' Day','Teachers\' Day is on the twentieth of November. We make cards for our teachers. We sing songs and give them flowers. Our teachers are very happy.','Ngày Nhà giáo là ngày hai mươi tháng Mười Một. Chúng tớ làm thiệp tặng thầy cô. Chúng tớ hát và tặng hoa thầy cô. Các thầy cô rất vui.'],
 ['Healthy habits','To stay healthy, I go to bed early. I eat a lot of fruit and vegetables. I do not drink soft drinks. I walk to school every day.','Để khỏe mạnh, tớ đi ngủ sớm. Tớ ăn nhiều hoa quả và rau. Tớ không uống nước ngọt có ga. Ngày nào tớ cũng đi bộ đến trường.'],
 ['When I am ill','Last week, I had a fever. I felt very tired. My mother took me to the doctor. The doctor said I should take medicine and rest. Now I am fine.','Tuần trước, tớ bị sốt. Tớ thấy rất mệt. Mẹ đưa tớ đi khám. Bác sĩ bảo tớ nên uống thuốc và nghỉ ngơi. Bây giờ tớ khỏe rồi.'],
 ['My favourite season','My favourite season is autumn. The weather is cool and windy. I can fly kites in the field. We also have the Mid-Autumn Festival in autumn.','Mùa tớ thích nhất là mùa thu. Thời tiết mát mẻ và có gió. Tớ có thể thả diều ngoài cánh đồng. Mùa thu còn có Tết Trung thu.'],
 ['My favourite character','My favourite character is Tam in the story Tam and Cam. She is kind and gentle. She works very hard. In the end, she becomes a queen.','Nhân vật tớ thích nhất là Tấm trong truyện Tấm Cám. Cô ấy hiền lành và dịu dàng. Cô ấy làm việc rất chăm chỉ. Cuối cùng, cô ấy trở thành hoàng hậu.'],
 ['How I go to school','I live near my school. I usually go to school on foot. Sometimes my father takes me there by motorbike. My friend lives far away, so she goes by bus.','Tớ sống gần trường. Tớ thường đi bộ đến trường. Thỉnh thoảng bố chở tớ bằng xe máy. Bạn tớ sống xa nên bạn ấy đi xe buýt.'],
 ['A place I love','I love Hoi An Old Town. It is very beautiful at night with many lanterns. The food there is delicious. I think everyone should visit it.','Tớ yêu Phố cổ Hội An. Ban đêm phố rất đẹp với nhiều đèn lồng. Đồ ăn ở đó rất ngon. Tớ nghĩ ai cũng nên đến thăm.'],
 ['My summer holiday','This summer, I am going to learn to swim. I am going to read many books. I am also going to visit my aunt in Ho Chi Minh City. I think it will be fun.','Hè này, tớ sẽ học bơi. Tớ sẽ đọc nhiều sách. Tớ cũng sẽ thăm dì ở Thành phố Hồ Chí Minh. Tớ nghĩ sẽ rất vui.']]};
for(const g in PARA2){(PARA[g]||[]).forEach((L,u)=>{if(PARA2[g][u])L.push(PARA2[g][u]);});}
/* ================= LUYỆN NÓI ĐOẠN VĂN + NÓI TỪNG CÂU (tiếng Anh) ================= */
const PA_CSS=`
html body .en-tools{flex-wrap:wrap}
html body .en-tools .tool-btn.ht-pa{background:var(--hv-navy,#1E3A8A);color:#fff;border-color:transparent}
html body .en-tools .tool-btn.ht-pa small{color:#C7D7F5}
.pa-page{padding-bottom:30px}
.pa-page .lead{margin:2px 0 10px;color:var(--muted);font-weight:700}
.pa-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}
.pa-tabs::-webkit-scrollbar{display:none}
.pa-tabs .voc-chip{flex:none}
.pa-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:4px 0 12px}
.pa-seg button{border:2px solid var(--line);background:var(--card);border-radius:14px;padding:8px 4px;font:inherit;font-weight:800;font-size:13px;color:var(--ink);line-height:1.2;cursor:pointer}
.pa-seg button small{display:block;font-weight:700;color:var(--muted);font-size:11px;margin-top:2px}
.pa-seg button.on{border-color:var(--hv-pri,#2563EB);background:var(--hv-pri,#2563EB);color:#fff}
.pa-seg button.on small{color:#DCE7FB}
.pa-card{background:var(--card);border:2px solid var(--line);border-radius:18px;padding:14px;margin:0 0 12px}
.pa-card h3{margin:0 0 6px;font-size:18px;display:flex;align-items:center;gap:8px}
.pa-card h3 .spk{margin-left:auto}
.pa-text{font-size:19px;line-height:1.75;font-weight:700}
.pa-text .w-hide{display:inline-block;min-width:2.2em;border-bottom:3px solid var(--hv-pri,#2563EB);color:transparent;line-height:1.1;user-select:none}
.pa-text .w-hide.w-ok,.pa-text .w-hide.w-near{color:inherit;border-bottom-color:transparent}
.pa-vi{margin:8px 0 0;color:var(--muted);font-size:14px;font-weight:600;line-height:1.45}
.pa-sents{display:grid;gap:8px;margin:0 0 12px}
.pa-sent{display:flex;align-items:center;gap:8px;background:var(--card);border:2px solid var(--line);border-radius:14px;padding:8px 10px}
.pa-sent .tx{flex:1;min-width:0}
.pa-sent .tx b{display:block;font-size:16px;line-height:1.35}
.pa-sent .tx small{display:block;color:var(--muted);font-weight:600;font-size:12.5px;line-height:1.3}
.pa-sent .no{flex:none;width:26px;height:26px;border-radius:8px;background:var(--soft);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px}
.pa-sent .mini{flex:none;font-size:12px;font-weight:800;color:#C98A00}
.pa-sent .spk,.pa-sent .rec-btn{flex:none}
.pa-sent .rec-btn{padding:6px 10px;font-size:14px;min-height:0}
.pa-sent.on{border-color:var(--hv-pri,#2563EB)}
.pa-sent .res{flex-basis:100%}
.pa-sent{flex-wrap:wrap}
.pa-big{display:flex;flex-direction:column;align-items:center;gap:6px;margin:6px 0 10px}
.pa-big .rec-btn{font-size:18px;padding:12px 22px}
.pa-big small{color:var(--muted);font-weight:700;text-align:center}
.pa-live{font-size:13px;font-weight:800;color:var(--hv-pri,#2563EB);min-height:18px;text-align:center}
.pa-meter{height:8px;border-radius:6px;background:var(--soft);overflow:hidden;width:100%;max-width:320px}
.pa-meter i{display:block;height:100%;width:0;background:var(--hv-pri,#2563EB);transition:width .3s}
.pa-hint{font-size:13px;color:var(--muted);font-weight:600;margin:0 0 10px;line-height:1.4}
.pa-badges{display:flex;gap:4px;flex:none}
.pa-badges i{font-style:normal;font-size:11px;font-weight:800;border-radius:6px;padding:1px 5px;background:var(--soft);color:var(--muted)}
.pa-badges i.ok{background:#DCFCE7;color:#15803D}
`;
const paEl=document.createElement('style');paEl.id='ht-para';paEl.textContent=PA_CSS;document.head.appendChild(paEl);
window.addEventListener('load',()=>document.head.appendChild(paEl));

const PA_MODES=[['Đọc theo','nhìn đủ chữ'],['Che bớt chữ','nhớ từ còn thiếu'],['Tự nói','theo gợi ý']];
const paS=()=>{S.para=S.para||{};return S.para;};
const paSt=id=>{const P=paS();return P[id]||(P[id]={m:[0,0,0],s:{}});};
/* danh sách đoạn văn của 1 unit (u là số) hoặc của nhóm chủ đề chung ('x') */
function paList(u){if(u==='x'){const out=[];Object.keys(PARA_EXTRA).forEach(cat=>PARA_EXTRA[cat].forEach((e,i)=>{if(GRADE>=e[0]&&GRADE<=e[1])out.push({id:'x'+cat+i,key:'px'+cat,kk:'k'+i,t:e[2],en:e[3],vi:e[4]});}));return out;}
  const L=(PARA[GRADE]||[])[u]||[];return L.map((p,k)=>({id:'u'+u+'k'+k,key:'pa'+u,kk:'k'+k,t:p[0],en:p[1],vi:p[2]}));}
const paSplit=t=>(String(t).match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g)||[t]).map(x=>x.trim()).filter(Boolean);
function paViSplit(p){const e=paSplit(p.en),v=paSplit(p.vi);return v.length===e.length?v:null;}
/* sao cho cả đoạn: dễ hơn chấm từng câu một chút (đoạn dài khó đọc hoàn hảo từng từ) */
const paStars=r=>!r.heard?0:r.r>=.93?5:r.r>=.82?4:r.r>=.65?3:r.r>=.45?2:1;
function paBest(id){const s=paSt(id);return Math.max(...s.m);}
function paUnitCount(u){const L=paList(u);let d=0;L.forEach(p=>{if(paBest(p.id)>=3)d++;});return[d,L.length];}
function paAllCount(){let d=0,t=0;const n=(typeof EN_UNITS!=='undefined'?EN_UNITS.length:0);for(let u=0;u<n;u++){const[a,b]=paUnitCount(u);d+=a;t+=b;}const[a,b]=paUnitCount('x');return[d+a,t+b];}

/* chữ hiển thị: tô màu theo kết quả; mode 1 che ~1/3 từ nội dung (đã nói đúng thì hiện ra) */
function paHide(text){const toks=String(text).split(/\s+/);let c=0;return toks.map((w,i)=>{const core=w.replace(/[^A-Za-z']/g,'');if(core.length<3||i===0)return false;c++;return c%3===1;});}
function paMark(text,res,mode){const hide=mode===1?paHide(text):null;const hit=res&&res.hit||new Set(),sim=res&&res.sim||new Map(),se=res&&res.sErr||new Set();const toks=String(text).split(/\s+/);let k=0;
  return toks.map((w,ti)=>{const n=normEn(w);let c=res?'w-ok':'';n.forEach(()=>{const i=k++;if(!res)return;const v=!hit.has(i)?(se.has(i)?'w-s':'w-miss'):sim.get(i)<1?'w-near':'w-ok';if(v!=='w-ok'&&c!=='w-miss')c=v;});
    if(res&&res.live&&c!=='w-ok'&&c!=='w-near')c='';
    if(hide&&hide[ti]){const m=w.match(/^(\W*)(.*?)(\W*)$/);return `${H(m[1])}<span class="w-hide ${c}">${H(m[2])}</span>${H(m[3])}`;}
    return c?`<span class="${c}">${H(w)}</span>`:H(w);}).join(' ');}
function paCue(p){const vs=paViSplit(p);return paSplit(p.en).map((s,i)=>{const w=s.split(/\s+/);const st=w.slice(0,Math.min(2,Math.max(1,w.length-2))).join(' ');return `<div class="pa-sent"><span class="no">${i+1}</span><span class="tx"><b>${H(st)} …</b>${vs?`<small>${H(vs[i])}</small>`:''}</span></div>`;}).join('')+(vs?'':`<p class="pa-vi">${H(p.vi)}</p>`);}

/* Ghi âm dài cho cả đoạn: nghe liên tục tới ~2 phút, tự dừng khi con im ~4,5 giây hoặc đã nói đủ. */
async function recLong(target,cb,btn,onLive){
  if(REC.active){REC.active.stop();return;}
  stopVoice();let stream=null,mr=null,chunks=[],srDone=!SR_API,mrDone=true,finished=false,timer=null,silTimer=null,srErr='',fatal=false,userStop=false,srRunning=false,restarts=0,heardAt=0,dropRec=false,micErr='',liveT=0;
  const segs=[];let sess=[];const t0=Date.now(),maxMs=Math.min(120000,12000+String(target).length*130);
  AUDIO_REC=true;iosAudioPause();setAudioSession('play-and-record');
  const relMic=()=>{try{stream&&stream.getTracks().forEach(t=>t.stop());}catch(e){}stream=null;};
  const finish=()=>{if(finished||!srDone||!mrDone)return;finished=true;clearTimeout(timer);clearTimeout(silTimer);REC.active=null;if(btn)btn.classList.remove('rec-on');relMic();
    AUDIO_REC=false;setTimeout(()=>{if(!AUDIO_REC)setAudioSession(IS_IOS?'playback':'auto');},300);
    const url=chunks.length&&!dropRec?URL.createObjectURL(new Blob(chunks,{type:(mr&&mr.mimeType)||'audio/webm'})):null;
    const alts=srCandidates(segs.concat(sess));
    if(!SR_API||(srErr&&!alts.length&&srErr!=='no-speech'&&srErr!=='aborted')){cb({noScore:true,url,error:srErr||micErr});return;}
    const r=scoreSpeech(target,alts);cb({...r,stars:paStars(r),url});};
  const endAll=()=>{srDone=true;if(mr&&mr.state!=='inactive'){try{mr.stop();}catch(_){mrDone=true;}}finish();};
  const stopAll=()=>{userStop=true;clearTimeout(silTimer);if(srRunning){try{sr.stop();}catch(e){srRunning=false;endAll();}}else endAll();};
  const useRec=typeof MediaRecorder!=='undefined'&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&!(SR_API&&recSeq);
  if(useRec){try{stream=await navigator.mediaDevices.getUserMedia({audio:true});const mt=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/aac'].find(x=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x));mr=new MediaRecorder(stream,mt?{mimeType:mt}:undefined);mrDone=false;mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};mr.onstop=()=>{mrDone=true;finish();};mr.onerror=()=>{mrDone=true;dropRec=true;finish();};mr.start();}
    catch(e){micErr=e&&e.name==='NotAllowedError'?'not-allowed':'audio-capture';relMic();if(!SR_API){AUDIO_REC=false;setAudioSession(IS_IOS?'playback':'auto');toast(micErr==='not-allowed'?'Con cần cho phép dùng micro để ghi âm nhé!':'Không mở được micro. Con tắt ứng dụng khác đang dùng micro rồi thử lại nhé!');return;}mr=null;mrDone=true;}}
  else if(!SR_API){AUDIO_REC=false;setAudioSession(IS_IOS?'playback':'auto');toast('Thiết bị này chưa hỗ trợ ghi âm. Con mở bằng Chrome nhé!');return;}
  let sr=null;
  const cur=()=>scoreSpeech(target,srCandidates(segs.concat(sess)));
  const startSR=()=>{sr=new SR_API();sr.lang='en-US';sr.interimResults=true;sr.maxAlternatives=3;sr.continuous=true;
    sr.onresult=e=>{const c=[];for(let i=0;i<e.results.length;i++){const R=e.results[i],a=[];for(let k=0;k<R.length;k++){const tx=String(R[k].transcript||'').trim();if(tx)a.push(tx);}if(a.length)c.push(a);}
      sess=c;if(!c.length)return;heardAt=Date.now();if(srErr==='no-speech')srErr='';clearTimeout(silTimer);
      let r=null;if(Date.now()-liveT>350){liveT=Date.now();try{r=cur();onLive&&onLive(r);}catch(_){}}
      if(r&&r.hit.size>=r.words.length&&r.r>=.95){silTimer=setTimeout(stopAll,900);return;}
      silTimer=setTimeout(stopAll,4500);};
    sr.onerror=e=>{const er=e.error||'error';if(er==='no-speech'||er==='aborted'){if(!srErr)srErr=er;return;}
      if(er==='audio-capture'&&mr&&!heardAt&&!dropRec){dropRec=true;try{if(mr.state!=='inactive')mr.stop();}catch(_){mrDone=true;}relMic();recSeq=true;try{localStorage.setItem('hv_rec_seq','1');}catch(_){}sr._retry=true;return;}
      srErr=er;if(/not-allowed|service-not-allowed|audio-capture|language-not-supported|network/.test(er))fatal=true;if(er==='not-allowed'&&!mr)toast('Con cần cho phép dùng micro để ghi âm nhé!');};
    sr.onend=()=>{srRunning=false;if(sess.length){segs.push(...sess);sess=[];}
      if(sr._retry){sr._retry=false;setTimeout(()=>{if(userStop||finished){endAll();return;}try{sr.start();srRunning=true;}catch(e){srErr='audio-capture';endAll();}},250);return;}
      const left=maxMs-(Date.now()-t0);
      if(!userStop&&!fatal&&!finished&&left>1500&&restarts<40&&!(heardAt&&Date.now()-heardAt>4500)){restarts++;try{sr.start();srRunning=true;return;}catch(e){}}
      if(fatal&&!userStop&&!finished&&mr&&mr.state==='recording'){srDone=true;toast('Con đọc xong thì bấm 🎤 lần nữa để dừng nhé!');return;}
      endAll();};
    try{sr.start();srRunning=true;}catch(e){srRunning=false;srDone=true;srErr='start';}};
  if(SR_API)startSR();
  if(btn)btn.classList.add('rec-on');sfx.tap();
  REC.active={stop:stopAll};timer=setTimeout(()=>REC.active&&REC.active.stop(),maxMs);
  if(srDone&&!mr)finish();}

function paResHTML(res,text,mode){if(res.noScore)return recResultHTML(res,text);
  return `<div class="rec-res"><div class="rec-top">${starsHTML(res.stars)}<b>${praiseFor(res.stars)}</b></div><small>Đúng ${res.hit.size}/${res.words.length} từ (${Math.round(res.r*100)}%). Từ xanh: đúng · cam: gần đúng · đỏ: thiếu/sai.</small>${recTips(text,res)}${res.url?`<button class="say-btn" data-play="${res.url}">▶ Nghe lại giọng con</button>`:''}</div>`;}
function paGive(p,mode,stars){const s=paSt(p.id);const prev=s.m[mode]||0;if(stars>prev){s.m[mode]=stars;addSpeakPoints(stars-prev,`p.${p.key}.${p.kk}.${'abc'[mode]}`,stars);}save();}

/* ---------- màn luyện nói ---------- */
function renderPara(u,k,mode){stopVoice();stopRec();k=k||0;mode=mode||0;const L=paList(u);const isX=u==='x';const U=isX?null:EN_UNITS[u];
  const tabs=L.map((p,j)=>`<button class="voc-chip${j===k?' on':''}" data-k="${j}">📖 ${H(p.t)}${paBest(p.id)?`<span class="mini">${paBest(p.id)}★</span>`:''}</button>`).join('')+(isX?'':`<button class="voc-chip${k===-1?' on':''}" data-k="-1">💬 Nói từng câu</button>`);
  const title=isX?'Chủ đề chung':`${U.lab}: ${U.t}`;
  let body='';
  if(k===-1)body=paSentHTML(u);
  else{const p=L[k];const s=paSt(p.id);const sents=paSplit(p.en),vs=paViSplit(p);
    body=`<div class="pa-seg">${PA_MODES.map((m,i)=>`<button data-m="${i}" class="${i===mode?'on':''}">${i+1}. ${m[0]}${s.m[i]?` ${s.m[i]}★`:''}<small>${m[1]}</small></button>`).join('')}</div>
    <p class="pa-hint">${mode===0?'Nghe cả đoạn, đọc theo từng câu (bấm 🎤 ở mỗi câu), rồi bấm “Nói cả đoạn”.':mode===1?'Một số từ đã bị che. Con nói cả đoạn, từ nào nói đúng sẽ hiện ra.':'Chỉ còn chữ đầu câu và nghĩa tiếng Việt. Con tự nói lại cả đoạn nhé!'}</p>
    <div class="pa-card"><h3>📖 ${H(p.t)}<button class="spk" id="paSay" aria-label="Nghe cả đoạn">🔊</button></h3>
      ${mode===2?`<div id="paTx">${paCue(p)}</div>`:`<div class="pa-text" id="paTx">${paMark(p.en,null,mode)}</div>${mode===0?`<p class="pa-vi">${H(p.vi)}</p>`:''}`}</div>
    <div class="pa-big"><button class="rec-btn" id="paRec">🎤 Nói cả đoạn</button><div class="pa-meter"><i id="paBar"></i></div><div class="pa-live" id="paLive">Bấm 🎤 rồi nói hết đoạn văn. Nói xong bấm lại để dừng.</div></div>
    <div id="paRes"></div>
    ${mode===0?`<div class="pa-sents">${sents.map((t,i)=>`<div class="pa-sent" data-s="${i}"><span class="no">${i+1}</span><span class="tx"><b>${H(t)}</b>${vs?`<small>${H(vs[i])}</small>`:''}</span>${s.s[i]?`<span class="mini">${s.s[i]}★</span>`:''}<button class="spk" data-say="${i}" aria-label="Nghe câu ${i+1}">🔊</button><button class="rec-btn" data-rec="${i}" aria-label="Ghi âm câu ${i+1}">🎤</button><div class="res"></div></div>`).join('')}</div>`:''}
    <div class="voc-nav"><button class="btn btn-soft" id="paPrev" ${mode===0?'disabled':''}>◀ Bước trước</button><button class="btn btn-soft" id="paNext">${mode<2?'Bước tiếp ▶':k<L.length-1?'Đoạn tiếp ▶':isX?'Xong ✓':'Nói từng câu ▶'}</button></div>`;}
  app.innerHTML=`<div class="screen"><div class="page pa-page"><div class="voc-head"><button class="icon-btn" id="paBack" aria-label="Quay lại">✕</button><h1>🗣️ Luyện nói đoạn văn</h1></div><p class="lead">${H(title)}</p><div class="pa-tabs">${tabs}</div>${body}<button class="btn btn-soft" id="paHome">Tất cả đoạn văn</button><button class="btn btn-soft" id="paBack2">Về English</button></div></div>`;
  const back=()=>{stopRec();stopVoice();renderEnglish();};$('#paBack').onclick=back;$('#paBack2').onclick=back;$('#paHome').onclick=()=>{stopRec();renderParaHome();};
  app.querySelectorAll('.pa-tabs [data-k]').forEach(b=>b.onclick=()=>{sfx.tap();renderPara(u,+b.dataset.k,0);});
  const on=app.querySelector('.pa-tabs .on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'center'});
  if(k===-1){paSentBind(u);return;}
  const p=L[k];const s=paSt(p.id);
  app.querySelectorAll('.pa-seg [data-m]').forEach(b=>b.onclick=()=>{sfx.tap();renderPara(u,k,+b.dataset.m);});
  $('#paSay').onclick=()=>speak([['en',p.en]]);
  $('#paRec').onclick=()=>{const btn=$('#paRec');const live=$('#paLive'),bar=$('#paBar');
    if(REC.active){REC.active.stop();return;}
    btn.textContent='⏹ Dừng';live.textContent='🎙️ Đang nghe… con nói to, rõ từng câu nhé.';
    recLong(p.en,res=>{btn.textContent='🎤 Nói lại cả đoạn';
      if(!res.noScore){bar.style.width=Math.round(res.r*100)+'%';live.textContent='';paGive(p,mode,res.stars);res.stars>=3?sfx.win():sfx.bad();if(res.stars>=4&&typeof confetti==='function')confetti();speak([['en',praiseFor(res.stars)]],{silent:true});
        const tx=$('#paTx');if(tx)tx.innerHTML=mode===2?`<div class="pa-text">${paMark(p.en,res,0)}</div>`:paMark(p.en,res,mode);
        const sb=app.querySelector(`.pa-seg [data-m="${mode}"]`);if(sb)sb.firstChild.textContent=`${mode+1}. ${PA_MODES[mode][0]} ${s.m[mode]}★`;}
      else live.textContent='';
      $('#paRes').innerHTML=paResHTML(res,p.en,mode);},btn,r=>{try{bar.style.width=Math.round(r.hit.size/Math.max(1,r.words.length)*100)+'%';live.textContent=`🎙️ Đã nghe ${r.hit.size}/${r.words.length} từ…`;if(mode!==2){const tx=$('#paTx');if(tx)tx.innerHTML=paMark(p.en,{...r,live:true},mode);}}catch(_){}});};
  app.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speak([['en',paSplit(p.en)[+b.dataset.say]]]));
  app.querySelectorAll('[data-rec]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rec;const t=paSplit(p.en)[i];const row=b.closest('.pa-sent');
    app.querySelectorAll('.pa-sent').forEach(x=>x.classList.toggle('on',x===row));
    recordAndScore(t,res=>{const box=row.querySelector('.res');box.innerHTML=recResultHTML(res,t);
      if(!res.noScore){const prev=s.s[i]||0;if(res.stars>prev){s.s[i]=res.stars;addSpeakPoints(res.stars-prev,`p.ps${p.key.slice(2)}.${p.kk}_${i}`,res.stars);save();let m=row.querySelector('.mini');if(!m){row.querySelector('.tx').insertAdjacentHTML('afterend','<span class="mini"></span>');m=row.querySelector('.mini');}m.textContent=s.s[i]+'★';}
        res.stars>=3?sfx.ok():sfx.bad();speak([['en',praiseFor(res.stars)]],{silent:true});}},b);});
  $('#paPrev').onclick=()=>{if(mode>0)renderPara(u,k,mode-1);};
  $('#paNext').onclick=()=>{stopRec();if(mode<2)renderPara(u,k,mode+1);else if(k<L.length-1)renderPara(u,k+1,0);else if(!isX)renderPara(u,-1,0);else renderParaHome();};}

/* ---------- Nói từng câu của bài (tất cả câu mẫu trong Unit) ---------- */
const pcS=u=>{const P=paS();return P['c'+u]||(P['c'+u]={});};
function paSentHTML(u){const U=EN_UNITS[u];const st=pcS(u);const C=U.c||[];
  return `<p class="pa-hint">Tất cả ${C.length} câu của ${H(U.lab)}. Bấm 🔊 nghe, bấm 🎤 nói lại — mỗi câu được chấm đến 5 sao.</p><div class="pa-sents">${C.map((c,i)=>`<div class="pa-sent" data-c="${i}"><span class="no">${c[2]&&!/^[A-Za-z0-9]/.test(c[2])?c[2]:i+1}</span><span class="tx"><b>${H(c[0])}</b>${c[1]?`<small>${H(c[1])}</small>`:''}</span>${st[i]?`<span class="mini">${st[i]}★</span>`:''}<button class="spk" data-csay="${i}" aria-label="Nghe câu">🔊</button><button class="rec-btn" data-crec="${i}" aria-label="Ghi âm">🎤</button><div class="res"></div></div>`).join('')}</div>`;}
function paSentBind(u){const U=EN_UNITS[u];const st=pcS(u);
  app.querySelectorAll('[data-csay]').forEach(b=>b.onclick=()=>speak([['en',U.c[+b.dataset.csay][0]]]));
  app.querySelectorAll('[data-crec]').forEach(b=>b.onclick=()=>{const i=+b.dataset.crec,t=U.c[i][0],row=b.closest('.pa-sent');app.querySelectorAll('.pa-sent').forEach(x=>x.classList.toggle('on',x===row));
    recordAndScore(t,res=>{row.querySelector('.res').innerHTML=recResultHTML(res,t);
      if(!res.noScore){const prev=st[i]||0;if(res.stars>prev){st[i]=res.stars;addSpeakPoints(res.stars-prev,`p.pc${u}.${i}`,res.stars);save();let m=row.querySelector('.mini');if(!m){row.querySelector('.tx').insertAdjacentHTML('afterend','<span class="mini"></span>');m=row.querySelector('.mini');}m.textContent=st[i]+'★';}
        res.stars>=3?sfx.ok():sfx.bad();speak([['en',praiseFor(res.stars)]],{silent:true});}},b);});}

/* ---------- danh sách tất cả đoạn văn ---------- */
function renderParaHome(){stopVoice();stopRec();const n=EN_UNITS.length;const[d,t]=paAllCount();
  const row=(u,p,j)=>{const s=paSt(p.id);return `<button class="ht-row" data-act="htpara" data-u="${u}" data-k="${j}"><span class="n">📖</span><span class="tx"><b>${H(p.t)}</b><small>${paSplit(p.en).length} câu · ${p.en.split(/\s+/).length} từ</small></span><span class="pa-badges">${PA_MODES.map((m,i)=>`<i class="${s.m[i]>=3?'ok':''}">${i+1}${s.m[i]?' '+s.m[i]+'★':''}</i>`).join('')}</span></button>`;};
  let h='';for(let u=0;u<n;u++){const U=EN_UNITS[u];const L=paList(u);if(!L.length)continue;const[a,b]=paUnitCount(u);
    h+=`<div class="ht-gh"><span class="num">${u+1}</span><h2><span class="lab">${H(U.lab)}</span>${H(U.t)}</h2><small>${a}/${b}</small></div>`+L.map((p,j)=>row(u,p,j)).join('')+`<button class="ht-row" data-act="htpara" data-u="${u}" data-k="-1"><span class="n">💬</span><span class="tx"><b>Nói từng câu của bài</b><small>${(U.c||[]).length} câu · ${Object.keys(pcS(u)).length} câu đã nói</small></span></button>`;}
  const X=paList('x');if(X.length)h=`<div class="ht-gh"><span class="num">★</span><h2><span class="lab">Chủ đề chung</span>Nói về bản thân</h2></div>`+X.map((p,j)=>row('x',p,j)).join('')+h;
  app.innerHTML=`<div class="screen notebook nogrid ht-list" id="scr">${topbar()}<section class="hello"><div class="owl" aria-hidden="true">🦉</div><div class="say"><b>Luyện nói đoạn văn</b><br>Mỗi đoạn có 3 bước: đọc theo → che bớt chữ → tự nói. Nói cả đoạn liền mạch, app chấm từng từ. Đã đạt ${d}/${t} đoạn.</div></section><div class="stage">${h}</div><p class="map-end">Mỗi bước đạt từ 3★ là con đã nói tốt đoạn đó! 🌟</p></div>${tabbar('en')}`;}

/* nút ở mỗi Unit + banner ở trang English */
{const _et=enTools;enTools=function(u){let h=_et.apply(this,arguments);try{if(paList(u).length){const[a,b]=paUnitCount(u);h=h.replace(/<\/div>\s*$/,`<button class="tool-btn ht-pa" data-act="htpara" data-u="${u}" data-k="0">📖 Nói đoạn văn <small>${a}/${b}</small></button></div>`);}}catch(e){}return h;};}
if(typeof renderEnglish==='function'){const _re2=renderEnglish;renderEnglish=function(){const r=_re2.apply(this,arguments);try{const scr=document.getElementById('scr');if(scr&&!scr.querySelector('.ht-pa-banner')){const[d,t]=paAllCount();const b=document.createElement('div');
  b.innerHTML=`<button class="exam-banner ht-pa-banner" data-act="htparahome" style="--c:#1E3A8A;--cd:#172554"><span class="eb-ic">📖</span><span><b>Luyện nói đoạn văn</b><small>Nói cả đoạn 3–8 câu, app chấm từng từ · ${d}/${t} đoạn</small></span><span class="eb-go">›</span></button>`;
  const ref=[...scr.querySelectorAll('.exam-banner')].pop();if(ref)ref.after(b.firstChild);else{const h=scr.querySelector('.hello');if(h)h.after(b.firstChild);}}}catch(e){}return r;};}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="htpara"],[data-act="htparahome"]');if(!b)return;e.stopPropagation();sfx.tap();
  if(b.dataset.act==='htparahome'){renderParaHome();return;}const u=b.dataset.u==='x'?'x':+b.dataset.u;renderPara(u,+b.dataset.k||0,0);},true);
/* ================= HỎI ĐÁP TIẾNG ANH — ngân hàng câu hỏi theo từng Unit =================
   QA_DATA[lớp][unit] = các câu "câu hỏi|nghĩa|câu mẫu|mẫu khác|từ hợp lệ|hình"
   – câu mẫu: {…} là chỗ con tự điền; nhiều câu mẫu cách nhau " / " (vd. "Yes, I do. / No, I don't.").
   – mẫu khác (cách nhau ;): * = chỗ điền 1–5 từ, a/b = một trong các từ, [x] = có hoặc không, "=…" = câu trả lời ngắn (3★).
   – từ hợp lệ (cách nhau ,): các từ đúng cho chỗ điền; "~" = trả lời tự do. Bỏ trống = chỉ nhận từ trong câu mẫu.
   – hình: emoji hiện trong bong bóng câu hỏi (cho câu hỏi kiểu “What is it?”).
   Mạo từ a/an/the được bỏ qua khi chấm; viết tắt (I'm, it's, don't…) tự đổi thành dạng đầy đủ. */
const QA_NUM='one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen,fourteen,fifteen,sixteen,seventeen,eighteen,nineteen,twenty';
const QA_COL='red,blue,yellow,green,pink,orange,purple,black,white,brown,grey,violet';
const QA_MON='january,february,march,april,may,june,july,august,september,october,november,december';
const QA_DAY='monday,tuesday,wednesday,thursday,friday,saturday,sunday,mondays,tuesdays,wednesdays,thursdays,fridays,saturdays,sundays';
const QA_YN=(q,vi,a,b)=>`${q}|${vi}|${a} / ${b}||`;
const QA_DATA={
/* ---------------- Lớp Lá ---------------- */
0:[
 ["Hello! What's your name?|Xin chào! Con tên là gì?|My name is {Nam}.|i am *;name is *|~",
  "Are you a boy or a girl?|Con là bạn trai hay bạn gái?|I am a {boy}.||boy,girl",
  "How are you?|Con có khỏe không?|I am {fine}, thank you.|i am *;* thank you|fine,good,great,happy,ok,okay,very well"],
 ["What colour is it?|Nó màu gì?|It is {red}.|=*||🍎",
  "What colour is it?|Nó màu gì?|It is {yellow}.|=*||🍌",
  "What colour do you like?|Con thích màu gì?|I like {blue}.|=*|"+QA_COL],
 ["How many apples?|Có mấy quả táo?|{Three} apples.|=*;i see * apples;there are * apples||🍎🍎🍎",
  "How many stars?|Có mấy ngôi sao?|{Five} stars.|=*;i see * stars;there are * stars||⭐⭐⭐⭐⭐",
  "How many cats?|Có mấy con mèo?|{Two} cats.|=*;i see * cats;there are * cats||🐱🐱"],
 ["How old are you?|Con mấy tuổi?|I am {six}.|i am * years old;=*|four,five,six,seven",
  "How many cars?|Có mấy chiếc ô tô?|{Eight} cars.|=*;i see * cars;there are * cars||🚗🚗🚗🚗🚗🚗🚗🚗",
  "How many fingers?|Có mấy ngón tay?|{Ten} fingers.|=*;i have * fingers||🖐️🖐️"],
 ["What is it?|Đây là con gì?|It is a {cow}.|=*||🐄",
  "What is it?|Đây là con gì?|It is a {pig}.|=*||🐷",
  "What is it?|Đây là con gì?|It is a {duck}.|=*||🦆"],
 ["What pet do you have?|Con nuôi con vật gì?|I have a {dog}.|=*|cat,dog,fish,bird,rabbit,hamster,turtle,parrot",
  QA_YN("Do you have a cat?","Con có nuôi mèo không?","Yes, I do.","No, I don't."),
  "What is it?|Đây là con gì?|It is a {rabbit}.|=*||🐰"],
 ["What fruit do you like?|Con thích quả gì?|I like {bananas}.|=*|apples,bananas,oranges,mangoes,grapes,apple,banana,orange,mango,grape,watermelon,strawberries",
  QA_YN("Do you like apples?","Con có thích táo không?","Yes, I do.","No, I don't."),
  "What is it?|Đây là quả gì?|It is an {orange}.|=*||🍊"],
 ["What do you want?|Con muốn gì?|{Milk}, please. / I want {milk}.|=*|milk,bread,rice,egg,water,juice,cake",
  "What is it?|Đây là gì?|It is {bread}.|=*||🍞",
  QA_YN("Are you hungry?","Con có đói không?","Yes, I am.","No, I am not.")],
 ["What is it?|Đây là gì?|It is my {nose}.|it is *;=*||👃",
  "What is it?|Đây là gì?|It is my {ear}.|it is *;=*||👂",
  "How many eyes do you have?|Con có mấy mắt?|I have {two} eyes.|=*;* eyes|"],
 ["Who is this?|Đây là ai?|This is my {mom}.|it is my *;=*|mom,mother,mommy,mum,mummy|👩",
  "Who is this?|Đây là ai?|This is my {grandpa}.|it is my *;=*|grandpa,grandfather,granddad|👴",
  QA_YN("Do you love your family?","Con có yêu gia đình không?","Yes, I do.","No, I don't.")],
 ["What is it?|Đây là gì?|It is a {ball}.|=*||⚽",
  "What toy do you have?|Con có đồ chơi gì?|I have a {doll}.|=*|ball,doll,car,teddy bear,kite,robot,train,yo-yo",
  QA_YN("Do you have a kite?","Con có cái diều không?","Yes, I do.","No, I don't.")],
 ["What is it?|Đây là gì?|It is a {pencil}.|this is my *;this is *;=*||✏️",
  "What is it?|Đây là gì?|It is a {ruler}.|this is my *;this is *;=*||📏",
  QA_YN("Is this your bag?","Đây có phải cặp của con không?","Yes, it is.","No, it isn't.")],
 ["What shape is it?|Đây là hình gì?|It is a {circle}.|=*||⭕",
  "What shape is it?|Đây là hình gì?|It is a {triangle}.|=*||🔺",
  "What shape is it?|Đây là hình gì?|It is a {star}.|=*||⭐"],
 ["What animal is it?|Đây là con vật gì?|It is a {lion}.|look *;=*||🦁",
  "What animal is it?|Đây là con vật gì?|It is an {elephant}.|look *;=*||🐘",
  QA_YN("Do you like monkeys?","Con có thích khỉ không?","Yes, I do.","No, I don't.")],
 ["What do you see?|Con nhìn thấy gì?|I see a {bus}.|it is *;=*||🚌",
  "What do you see?|Con nhìn thấy gì?|I see a {plane}.|it is *;=*|plane,airplane,aeroplane|✈️",
  "What do you see?|Con nhìn thấy gì?|I see a {bike}.|it is *;=*|bike,bicycle|🚲"],
 [QA_YN("Can you swim?","Con có biết bơi không?","Yes, I can.","No, I can't."),
  QA_YN("Can you jump?","Con có nhảy được không?","Yes, I can.","No, I can't."),
  "What can you do?|Con làm được gì?|I can {run}.|=*|run,jump,swim,sing,dance,draw,read,skip,hop,climb"]],

/* ---------------- Lớp 1 ---------------- */
1:[
 ["Hello! What's your name?|Xin chào! Bạn tên là gì?|My name is {Mai}.|i am *;name is *|~",
  "How are you?|Bạn có khỏe không?|I am {fine}, thank you.|i am *;* thank you|fine,good,great,happy,ok,okay,very well",
  "What is it?|Đây là gì?|It is a {ball}.|=*||⚽",
  "What is it?|Đây là gì?|It is a {book}.|=*||📕"],
 ["What do you have?|Bạn có gì?|I have a {car}.|=*||🚗",
  "What do you have?|Bạn có gì?|I have a {cake}.|=*||🎂",
  "What do you have?|Bạn có gì?|I have a {cat}.|=*||🐱",
  QA_YN("Do you have a cup?","Bạn có cái cốc không?","Yes, I do.","No, I don't.")],
 ["What is this?|Đây là gì?|This is my {bag}.|it is my *;this is *;=*||👜",
  "What is this?|Đây là gì?|This is my {hat}.|it is my *;this is *;=*||👒",
  "What is this?|Đây là gì?|This is my {apple}.|it is my *;this is *;=*||🍎"],
 ["What is it?|Đây là gì?|It is a {dog}.|=*||🐶",
  "What is it?|Đây là gì?|It is a {duck}.|=*||🦆",
  "What is it?|Đây là gì?|It is a {door}.|=*||🚪",
  "What is it?|Đây là gì?|It is a {desk}.|=*||🗄️"],
 ["What do you like?|Bạn thích gì?|I like {chips}.|=*|chips,fish,milk,chicken,rice,bread,cake,fruit",
  QA_YN("Do you like fish?","Bạn có thích cá không?","Yes, I do.","No, I don't."),
  QA_YN("Do you like milk?","Bạn có thích sữa không?","Yes, I do.","No, I don't.")],
 ["What is this?|Đây là gì?|This is a {pen}.|it is *;=*||🖊️",
  "What is this?|Đây là gì?|This is a {pencil}.|it is *;=*||✏️",
  "What colour is it?|Nó màu gì?|It is {red}.|=*||🔴",
  "What colour is it?|Nó màu gì?|It is {green}.|=*||🟢"],
 ["What do you see?|Bạn nhìn thấy gì?|I see a {goat}.|it is *;=*||🐐",
  "What do you see?|Bạn nhìn thấy gì?|I see a {girl}.|it is *;=*||👧",
  QA_YN("Do you like the garden?","Bạn có thích khu vườn không?","Yes, I do.","No, I don't.")],
 ["What is it?|Đây là gì?|It is my {hand}.|it is *;=*|hand,hands|✋",
  "What do you see?|Bạn nhìn thấy gì?|I see a {horse}.|it is *;=*||🐴",
  QA_YN("Can you touch your head?","Bạn chạm được vào đầu không?","Yes, I can.","No, I can't.")],
 ["How many clocks?|Có mấy cái đồng hồ?|{Four} clocks.|=*;i see * clocks;there are * clocks||🕐🕐🕐🕐",
  "How many locks?|Có mấy cái ổ khóa?|{Two} locks.|=*;i see * locks;there are * locks||🔒🔒",
  "How many pots?|Có mấy cái nồi?|{Three} pots.|=*;i see * pots;there are * pots||🍲🍲🍲"],
 ["What's that?|Kia là con gì?|That is a {monkey}.|it is *;=*||🐒",
  "What's that?|Kia là con gì?|That is a {mouse}.|it is *;=*||🐭",
  "What's that?|Kia là quả gì?|That is a {mango}.|it is *;=*||🥭"],
 ["What is it?|Đây là gì?|It is a {bus}.|look at *;=*||🚌",
  "What is it?|Đây là gì?|It is a {truck}.|look at *;=*||🚚",
  "What is it?|Đây là gì?|It is the {sun}.|look at *;=*||☀️"],
 ["What is it?|Đây là gì?|It is a {lemon}.|look at *;=*||🍋",
  "What is it?|Đây là con gì?|It is a {lion}.|look at *;=*||🦁",
  "What is it?|Đây là gì?|It is a {leaf}.|look at *;=*||🍃"],
 ["What is he having?|Bạn ấy đang ăn gì?|He is having {noodles}.|=*||🍜",
  "What is she having?|Bạn ấy đang ăn gì?|She is having {bananas}.|=*|bananas,banana|🍌",
  "How many bananas?|Có mấy quả chuối?|{Nine} bananas.|=*;i see * bananas;there are * bananas||🍌🍌🍌🍌🍌🍌🍌🍌🍌"],
 ["What can you see?|Bạn nhìn thấy gì?|I can see a {teddy bear}.|i see *;it is *;=*|teddy bear,teddy,bear|🧸",
  "What can you see?|Bạn nhìn thấy gì?|I can see a {tiger}.|i see *;it is *;=*||🐯",
  "What can you see?|Bạn nhìn thấy gì?|I can see a {turtle}.|i see *;it is *;=*|turtle,tortoise|🐢"],
 [QA_YN("Do you like football?","Bạn có thích bóng đá không?","Yes, I do.","No, I don't."),
  "What is it?|Đây là gì?|It is my {foot}.|it is *;=*|foot,feet|🦶",
  "Who is this?|Đây là ai?|This is my {father}.|it is my *;=*|father,dad,daddy|👨"],
 ["How many windows?|Có mấy cái cửa sổ?|{Three} windows.|=*;i see * windows;there are * windows||🪟🪟🪟",
  QA_YN("Do you like water?","Bạn có thích nước không?","Yes, I do.","No, I don't."),
  "What is it?|Đây là gì?|It is my {bed}.|this is my *;it is *;=*||🛏️"]],

/* ---------------- Lớp 2 ---------------- */
2:[
 ["What food do you like?|Bạn thích món gì?|I like {pizza}.|=*|pizza,popcorn,pasta,cake,chicken,chips,ice cream,noodles,rice,bread",
  QA_YN("Do you like popcorn?","Bạn có thích bỏng ngô không?","Yes, I do.","No, I don't."),
  "How old are you?|Bạn mấy tuổi?|I am {seven} years old.|i am *;=*|six,seven,eight"],
 ["What do you have?|Bạn có gì?|I have a {kite}.|=*||🪁",
  "What do you have?|Bạn có gì?|I have a {bike}.|=*|bike,bicycle|🚲",
  "What can you see?|Bạn nhìn thấy gì?|I can see a {kitten}.|i see *;=*|kitten,cat|🐱"],
 ["What can you see?|Bạn nhìn thấy gì?|I can see the {sea}.|i see *;=*|sea,ocean|🌊",
  "What can you see?|Bạn nhìn thấy gì?|I can see the {sand}.|i see *;=*|sand,beach|🏖️",
  QA_YN("Is the sun hot?","Mặt trời có nóng không?","Yes, it is.","No, it isn't.")],
 ["What can you see?|Bạn nhìn thấy gì?|I can see a {rainbow}.|i see *;=*||🌈",
  "Is the rabbit big or small?|Con thỏ to hay nhỏ?|It is {small}.|rabbit is *;=*|small,little|🐇",
  QA_YN("Is the road long?","Con đường có dài không?","Yes, it is.","No, it isn't.")],
 ["What shape is it?|Đây là hình gì?|It is a {square}.|=*||🟥",
  QA_YN("Can I ask a question?","Tớ hỏi một câu được không?","Yes, you can.","No, you can't."),
  QA_YN("Do you like quizzes?","Bạn có thích câu đố không?","Yes, I do.","No, I don't.")],
 ["What can you see?|Bạn nhìn thấy gì?|I can see a {fox}.|i see *;=*||🦊",
  "How many ducks can you see?|Bạn thấy mấy con vịt?|I can see {six} ducks.|i see * ducks;* ducks;=*||🦆🦆🦆🦆🦆🦆",
  "Where is the fox?|Con cáo ở đâu?|It is in the {box}.|fox is in *;=in *|box|🦊📦"],
 ["What do you want?|Bạn muốn gì?|I want some {juice}.|=*|juice,jelly,jam,milk,water,bread,cake",
  "Do you want some jam?|Bạn có muốn ăn mứt không?|Yes, please. / No, thank you.|yes i do;no i do not;no thanks|",
  QA_YN("Do you like jelly?","Bạn có thích thạch không?","Yes, I do.","No, I don't.")],
 [QA_YN("Do you play volleyball?","Bạn có chơi bóng chuyền không?","Yes, I do.","No, I don't."),
  "What can you see?|Bạn nhìn thấy gì?|I can see a {van}.|i see *;=*||🚐",
  "What do you play?|Bạn chơi nhạc cụ gì?|I play the {violin}.|=*|violin,piano,guitar,drums|🎻"],
 ["What do you want?|Bạn muốn gì?|I want some {yogurt}.|=*|yogurt,yoghurt,yams,juice,milk,bread,apples",
  "What colour is it?|Nó màu gì?|It is {yellow}.|=*||🍋",
  QA_YN("Do you like yo-yos?","Bạn có thích yo-yo không?","Yes, I do.","No, I don't.")],
 ["What can you see?|Bạn nhìn thấy gì?|I can see a {zebra}.|i see *;=*||🦓",
  "What colour is the zebra?|Con ngựa vằn màu gì?|It is {black and white}.|zebra is *;=*|black and white,white and black",
  QA_YN("Do you like the zoo?","Bạn có thích sở thú không?","Yes, I do.","No, I don't.")],
 [QA_YN("Can you ride a bike?","Bạn có biết đi xe đạp không?","Yes, I can.","No, I can't."),
  QA_YN("Can you drive a car?","Bạn có biết lái ô tô không?","Yes, I can.","No, I can't."),
  "What can you do?|Bạn làm được gì?|I can {ride a bike}.|=*|~"],
 ["What would you like?|Bạn muốn ăn gì?|I'd like some {grapes}.|i want *;=*|grapes,cake,juice,milk,ice cream,bread,apples,water",
  "Would you like a cake?|Bạn có muốn ăn bánh không?|Yes, please. / No, thank you.|yes i would;no thanks|",
  "Where do you sit?|Bạn ngồi ở đâu?|I sit at the {table}.|at *;=*|table,desk"],
 ["How many pens do you have?|Bạn có bao nhiêu cái bút?|I have {eleven} pens.|* pens;=*|~",
  "What is ten and two?|Mười cộng hai bằng mấy?|It is {twelve}.|ten and two is *;=*|",
  QA_YN("Can you count to fifteen?","Bạn đếm được đến mười lăm không?","Yes, I can.","No, I can't.")],
 ["Who is this?|Đây là ai?|This is my {brother}.|it is my *;=*||👦",
  "Who is this?|Đây là ai?|This is my {grandmother}.|it is my *;=*|grandmother,grandma,granny|👵",
  QA_YN("Do you love your family?","Bạn có yêu gia đình không?","Yes, I do.","No, I don't.")],
 ["What do you want?|Bạn muốn mua gì?|I want a {shirt}.|=*|shirt,t-shirt|👕",
  QA_YN("Do you like this dress?","Bạn có thích chiếc váy này không?","Yes, I do.","No, I don't."),
  "What are these?|Đây là những gì?|They are {shoes}.|these are *;=*||👟👟"],
 ["What is it?|Đây là gì?|It is a {tent}.|this is my *;=*||⛺",
  QA_YN("Do you like camping?","Bạn có thích cắm trại không?","Yes, I do.","No, I don't."),
  QA_YN("Do you have a blanket?","Bạn có chăn không?","Yes, I do.","No, I don't.")]],

/* ---------------- Lớp 3 ---------------- */
3:[
 ["What's your name?|Bạn tên là gì?|My name is {Rosy}.|i am *;name is *|~",
  "How old are you?|Bạn bao nhiêu tuổi?|I am {eight}.|i am * years old;=*|seven,eight,nine",
  "What colour is it?|Nó màu gì?|It is {green}.|=*||🍏",
  "How are you?|Bạn có khỏe không?|I am {fine}, thank you.|i am *;* thank you|fine,good,great,happy,ok,okay,very well"],
 [QA_YN("Is this your doll?","Đây có phải búp bê của bạn không?","Yes, it is.","No, it isn't."),
  "What is this?|Đây là gì?|This is my {train}.|it is *;this is *;=*||🚂",
  "What toys do you have?|Bạn có đồ chơi gì?|I have a {ball}.|=*|ball,doll,bike,kite,train,teddy bear,car,robot,yo-yo",
  "What's your favourite toy?|Đồ chơi yêu thích của bạn là gì?|My favourite toy is my {teddy bear}.|it is *;i like *;=*|~"],
 [QA_YN("Is that his ruler?","Kia có phải thước kẻ của bạn ấy không?","Yes, it is.","No, it isn't."),
  "What's in your bag?|Trong cặp của bạn có gì?|I have a {book} in my bag.|there is * in my bag;i have *;=*|~",
  "What colour is your pen?|Bút của bạn màu gì?|My pen is {blue}.|it is *;=*|"+QA_COL],
 ["Where is the cat?|Con mèo ở đâu?|The cat is on the {table}.|it is on *;=on *||🐱⬆️🪑",
  "Where is the ball?|Quả bóng ở đâu?|The ball is in the {box}.|it is in *;=in *||⚽📦",
  "Where is the dog?|Con chó ở đâu?|The dog is under the {bed}.|it is under *;=under *||🐶⬇️🛏️"],
 ["Nice to meet you!|Rất vui được gặp bạn!|Nice to meet you, too.|nice to meet you;=me too|",
  "What do red and white make?|Đỏ và trắng pha thành màu gì?|Red and white make {pink}.|it is *;they make *;=*|",
  "What do blue and yellow make?|Xanh dương và vàng pha thành màu gì?|Blue and yellow make {green}.|it is *;they make *;=*|"],
 [QA_YN("Do you like monkeys?","Bạn có thích khỉ không?","Yes, I do.","No, I don't."),
  "What animals do you like?|Bạn thích con vật nào?|I like {monkeys}.|=*|~",
  QA_YN("Is the giraffe tall?","Con hươu cao cổ có cao không?","Yes, it is.","No, it isn't."),
  "Is the elephant big or little?|Con voi to hay nhỏ?|It is {big}.|elephant is *;=*|big,very big"],
 [QA_YN("Do you like carrots?","Bạn có thích cà rốt không?","Yes, I do.","No, I don't."),
  QA_YN("Do you like meat?","Bạn có thích thịt không?","Yes, I do.","No, I don't."),
  "What food do you like?|Bạn thích món gì?|I like {fish}.|=*|~",
  QA_YN("Do you eat healthy food?","Bạn có ăn đồ ăn tốt cho sức khỏe không?","Yes, I do.","No, I don't.")],
 ["What colour are your eyes?|Mắt bạn màu gì?|My eyes are {black}.|they are *;=*|black,brown,blue,green,grey",
  QA_YN("Do you have long hair?","Tóc bạn có dài không?","Yes, I do.","No, I don't."),
  QA_YN("Do you have curly hair?","Tóc bạn có xoăn không?","Yes, I do.","No, I don't."),
  "Is your best friend tall?|Bạn thân của bạn có cao không?|Yes, he is. / No, he isn't.|yes she is;no she is not;yes he is tall;no he is short|"],
 [QA_YN("Do you like fish?","Bạn có thích cá không?","Yes, I do.","No, I don't."),
  "How many legs does an insect have?|Côn trùng có mấy chân?|An insect has {six} legs.|it has * legs;* legs;=*|",
  "What does a bird have?|Con chim có gì?|A bird has {feathers}.|it has *;=*|feathers,wings,two legs"],
 ["What are you wearing?|Bạn đang mặc gì?|I'm wearing a {T-shirt}.|i am wearing *;=*|~",
  "What colour is your T-shirt?|Áo phông của bạn màu gì?|My T-shirt is {white}.|it is *;=*|"+QA_COL,
  QA_YN("Are you wearing jeans?","Bạn có đang mặc quần bò không?","Yes, I am.","No, I'm not.")],
 ["What are you doing?|Bạn đang làm gì?|I'm {reading}.|=*|~",
  QA_YN("Are you dancing?","Bạn có đang nhảy múa không?","Yes, I am.","No, I'm not."),
  "What is your dad doing?|Bố bạn đang làm gì?|He is {washing the car}.|=*|~"],
 [QA_YN("Can you ride a bike?","Bạn có biết đi xe đạp không?","Yes, I can.","No, I can't."),
  QA_YN("Can you swim?","Bạn có biết bơi không?","Yes, I can.","No, I can't."),
  "What can you do?|Bạn làm được gì?|I can {run}.|=*|~",
  QA_YN("Can a bird fly?","Con chim có bay được không?","Yes, it can.","No, it can't.")],
 [QA_YN("May I take a photo?","Tớ chụp ảnh được không?","Yes, you may.","No, you may not."),
  QA_YN("May I open the window?","Tớ mở cửa sổ được không?","Yes, you may.","No, you may not."),
  QA_YN("Is this an old car?","Đây có phải chiếc ô tô cũ không?","Yes, it is.","No, it isn't.")],
 ["What's on the bed?|Trên giường có gì?|There's a {pillow} on the bed.|there is *;=*|pillow,doll,teddy bear,book,cat|🛏️🧸",
  "How many books are there?|Có bao nhiêu quyển sách?|There are {three} books.|* books;=*||📚📕📗",
  QA_YN("Is there a lamp in your room?","Phòng bạn có đèn không?","Yes, there is.","No, there isn't.")],
 ["What are these?|Đây là những gì?|These are {computers}.|they are *;those are *;=*|computers,computer|💻💻",
  QA_YN("Are those your pencils?","Kia có phải bút chì của bạn không?","Yes, they are.","No, they aren't."),
  QA_YN("Is this your chair?","Đây có phải ghế của bạn không?","Yes, it is.","No, it isn't.")],
 ["What are you wearing today?|Hôm nay bạn mặc gì?|I'm wearing {new shoes}.|i am wearing *;=*|~",
  "What do you see with?|Bạn nhìn bằng gì?|I see with my {eyes}.|with my *;=*|eyes,eye",
  "What do you hear with?|Bạn nghe bằng gì?|I hear with my {ears}.|with my *;=*|ears,ear",
  QA_YN("May I go on the swing?","Tớ chơi xích đu được không?","Yes, you may.","No, you may not.")]],

/* ---------------- Lớp 4 ---------------- */
4:[
 ["Where are you from?|Bạn đến từ đâu?|I'm from {Viet Nam}.|=*|~",
  "Where is she from?|Bạn ấy đến từ đâu?|She's from {Japan}.|she is from *;=*||👧🇯🇵",
  "What's your name?|Bạn tên là gì?|My name is {Mai}.|i am *;name is *|~",
  "Nice to meet you!|Rất vui được gặp bạn!|Nice to meet you, too.|nice to meet you;=me too|"],
 ["What time is it?|Mấy giờ rồi?|It's {seven o'clock}.|=*|seven oclock,seven|🕖",
  "What time do you get up?|Bạn thức dậy lúc mấy giờ?|I get up at {six}.|=at *;=*|~",
  "What time do you go to school?|Bạn đi học lúc mấy giờ?|I go to school at {seven}.|=at *;=*|~",
  "What time do you go to bed?|Bạn đi ngủ lúc mấy giờ?|I go to bed at {nine thirty}.|=at *;=*|~"],
 ["What day is it today?|Hôm nay là thứ mấy?|It's {Monday}.|today is *;=*|"+QA_DAY,
  "What do you do on Sundays?|Bạn làm gì vào Chủ nhật?|I {listen to music} on Sundays.|=*|~",
  QA_YN("Do you go to school on Saturdays?","Bạn có đi học vào thứ Bảy không?","Yes, I do.","No, I don't.")],
 ["When's your birthday?|Sinh nhật bạn vào khi nào?|It's in {June}.|my birthday is in *;=in *;=*|"+QA_MON,
  "What do you want at your party?|Bạn muốn ăn gì ở bữa tiệc?|I want some {chips}.|=*|~",
  "Would you like some lemonade?|Bạn có muốn uống nước chanh không?|Yes, please. / No, thank you.|yes i would;no thanks|"],
 ["What can you do?|Bạn làm được gì?|I can {swim}.|=*|~",
  QA_YN("Can you ride a horse?","Bạn có biết cưỡi ngựa không?","Yes, I can.","No, I can't."),
  QA_YN("Can you play the guitar?","Bạn có biết chơi ghi-ta không?","Yes, I can.","No, I can't."),
  "What can your best friend do?|Bạn thân của bạn làm được gì?|He can {dance}.|she can *;=*|~"],
 [QA_YN("Is there a garden at your school?","Trường bạn có vườn không?","Yes, there is.","No, there isn't."),
  "Where is the library?|Thư viện ở đâu?|It's on the {second} floor.|library is on *;=on * floor;=*|~",
  QA_YN("Is your school big?","Trường bạn có to không?","Yes, it is.","No, it isn't.")],
 ["What subjects do you have today?|Hôm nay bạn có môn gì?|I have {Maths and English}.|we have *;=*|~",
  "What's your favourite subject?|Môn học yêu thích của bạn là gì?|My favourite subject is {Art}.|i like *;it is *;=*|maths,english,art,science,music,vietnamese,pe,it,history,geography",
  "When do you have English?|Bạn học tiếng Anh vào hôm nào?|I have English on {Mondays}.|we have english on *;=on *;=*|"+QA_DAY,
  "What do you want to be?|Bạn muốn làm nghề gì?|I want to be a {teacher}.|=*|~"],
 ["When's sports day?|Ngày hội thể thao vào khi nào?|It's in {November}.|sports day is in *;=in *;=*|"+QA_MON,
  "What are you doing?|Bạn đang làm gì?|I'm {running}.|=*|~",
  "What are they doing?|Họ đang làm gì?|They're playing {football}.|=*|football,soccer|⚽"],
 ["Where were you last summer?|Hè năm ngoái bạn ở đâu?|I was at the {beach}.|i was in *;=at *;=in *|~",
  "What did you do there?|Bạn đã làm gì ở đó?|I {built sandcastles}.|we *;=*|~",
  QA_YN("Did you take photos?","Bạn có chụp ảnh không?","Yes, I did.","No, I didn't.")],
 ["Where do you live?|Bạn sống ở đâu?|I live in the {city}.|i live on *;i live at *;=*|~",
  "What's your street like?|Đường phố nhà bạn thế nào?|It's {busy}.|my street is *;=*|busy,quiet,big,small,noisy,beautiful,long,narrow,wide,crowded,clean",
  "Do you live in a house or a flat?|Bạn sống ở nhà riêng hay căn hộ?|I live in a {house}.|=*|house,flat,apartment"],
 ["What does your father do?|Bố bạn làm nghề gì?|He's a {farmer}.|he works *;=*|~",
  "What does your mother do?|Mẹ bạn làm nghề gì?|She's a {nurse}.|she works *;=*|~",
  "Where does a nurse work?|Y tá làm việc ở đâu?|She works in a {hospital}.|=in *;=*|hospital,clinic",
  "What do you want to be?|Bạn muốn làm nghề gì?|I want to be a {teacher}.|=*|~"],
 ["What does your mother look like?|Mẹ bạn trông thế nào?|She's {tall and slim}.|she has *;=*|~",
  "What does your best friend look like?|Bạn thân của bạn trông thế nào?|He's {short}.|she is *;he has *;she has *;=*|~",
  "Who is taller, you or your brother?|Ai cao hơn, bạn hay anh/em trai bạn?|{My brother} is taller than me.|* taller;=*|~",
  QA_YN("Do you have big eyes?","Mắt bạn có to không?","Yes, I do.","No, I don't.")],
 ["What do you do in the morning?|Buổi sáng bạn làm gì?|I {do morning exercise}.|=*|~",
  "What do you do in the evening?|Buổi tối bạn làm gì?|I {watch TV} in the evening.|=*|~",
  "What do you do on Sundays?|Chủ nhật bạn làm gì?|We {go to the swimming pool} on Sundays.|i * on sundays;=*|~"],
 ["What's the weather like today?|Hôm nay thời tiết thế nào?|It's {sunny}.|=*|sunny,rainy,cloudy,windy,hot,cold,warm,cool,snowy,stormy,foggy",
  QA_YN("Is it hot today?","Hôm nay trời có nóng không?","Yes, it is.","No, it isn't."),
  "Where is the post office?|Bưu điện ở đâu?|It's next to the {bookshop}.|it is *;go *;turn *;=*|~"],
 ["How much is the T-shirt?|Áo phông giá bao nhiêu?|It's {seventy thousand} dong.|it is *;=*|~|👕 70.000đ",
  "What do you want to buy?|Bạn muốn mua gì?|I want to buy a {jacket}.|i want *;=*|~",
  "Can I help you?|Tôi giúp gì được bạn?|Yes, I want a {T-shirt}.|i want *;i would like *;=*|~"],
 ["What animal is it?|Đây là con vật gì?|It's a {kangaroo}.|=*||🦘",
  "What can a monkey do?|Con khỉ làm được gì?|It can {climb}.|monkey can *;=*|~",
  "What are they doing?|Họ đang làm gì?|They're putting up a {tent}.|=*|tent|⛺",
  "What animal do you like?|Bạn thích con vật nào?|I like {elephants}.|=*|~"]],

/* ---------------- Lớp 5 ---------------- */
5:[
 ["Can you tell me about yourself?|Bạn kể về bản thân được không?|I'm {Nam}. I'm in Class 5A.|i am *;my name is *;i live in *;i am in class *|~",
  "What class are you in?|Bạn học lớp nào?|I'm in Class {5C}.|=class *;=*|~",
  "What's your favourite animal?|Con vật yêu thích của bạn là gì?|It's the {dolphin}.|my favourite animal is *;i like *;=*|~",
  "What's your favourite colour?|Màu yêu thích của bạn là gì?|My favourite colour is {pink}.|it is *;i like *;=*|"+QA_COL],
 ["What's your address?|Địa chỉ nhà bạn là gì?|It's {15 Ba Dinh Street}.|my address is *;i live at *;i live on *|~",
  "Do you live in a house or a flat?|Bạn sống ở nhà riêng hay căn hộ?|I live in a {house}.|=*|house,flat,apartment,building",
  QA_YN("Do you live near the school?","Nhà bạn có gần trường không?","Yes, I do.","No, I don't."),
  "Do you live in the city or the countryside?|Bạn sống ở thành phố hay nông thôn?|I live in the {city}.|=*|city,countryside,town,village"],
 ["What nationality is he?|Bạn ấy quốc tịch gì?|He's {Australian}.|he is from *;=*||👦🇦🇺",
  "What nationality is she?|Bạn ấy quốc tịch gì?|She's {Japanese}.|she is from *;=*||👧🇯🇵",
  "What nationality are you?|Bạn quốc tịch gì?|I'm {Vietnamese}.|i am from *;=*|vietnamese,viet nam,vietnam",
  "What's your best friend like?|Bạn thân của bạn là người thế nào?|He's {clever and helpful}.|she is *;=*|~"],
 ["What do you like doing in your free time?|Lúc rảnh bạn thích làm gì?|I like {watching cartoons}.|i love *;=*|~",
  "What do you do at the weekend?|Cuối tuần bạn làm gì?|I often {play table tennis}.|i usually *;i sometimes *;i always *;=*|~",
  QA_YN("Do you like surfing the Internet?","Bạn có thích lướt mạng không?","Yes, I do.","No, I don't.")],
 ["What would you like to be in the future?|Sau này bạn muốn làm nghề gì?|I'd like to be a {firefighter}.|i want to be *;=*|~",
  "Why would you like to be a teacher?|Vì sao bạn muốn làm giáo viên?|Because I'd like to {teach children}.|because *;i would like to *;=*|~",
  "What would your best friend like to be?|Bạn thân của bạn muốn làm nghề gì?|She'd like to be a {reporter}.|he would like to be *;he wants to be *;she wants to be *;=*|~"],
 ["Where's the computer room?|Phòng máy tính ở đâu?|It's on the {third} floor.|computer room is on *;=on *;=*|~",
  "Where's the music room?|Phòng âm nhạc ở đâu?|It's on the {first} floor.|music room is on *;=on *;=*|~",
  "Could you tell me the way to the library?|Bạn chỉ đường đến thư viện giúp tôi?|Go along the corridor. / Go upstairs to the second floor.|go *;turn *;it is *|~",
  "How many floors does your school have?|Trường bạn có mấy tầng?|It has {three} floors.|my school has *;* floors;=*|~"],
 ["What school activity do you like?|Bạn thích hoạt động nào ở trường?|I like {reading books}.|=*|~",
  "Why do you like reading books?|Vì sao bạn thích đọc sách?|Because I think it's {interesting}.|because *;i think it is *;it is *;=*|~",
  QA_YN("Do you like doing projects?","Bạn có thích làm dự án không?","Yes, I do.","No, I don't.")],
 ["Where are the crayons?|Bút sáp màu ở đâu?|They're beside the {books}.|they are *;=*|~|🖍️📚",
  "Where are the maps?|Những tấm bản đồ ở đâu?|They're above the {board}.|they are *;=*|~",
  "Whose glue stick is this?|Thỏi keo này của ai?|It's {Mai's}.|it is *;=*|~"],
 ["Were you at the aquarium yesterday?|Hôm qua bạn có ở thủy cung không?|Yes, I was. / No, I wasn't.|yes we were;no we were not|",
  "What did you do yesterday?|Hôm qua bạn đã làm gì?|I {watched the fish}.|we *;=*|~",
  "Where were you last weekend?|Cuối tuần trước bạn ở đâu?|I was at the {campsite}.|we were at *;i was in *;we were in *;=at *;=in *|~"],
 [QA_YN("Did you go to Ba Na Hills?","Bạn có đi Bà Nà không?","Yes, I did.","No, I didn't."),
  "What did you do on your school trip?|Bạn đã làm gì trong chuyến đi của trường?|We {planted trees}.|i *;they *;=*|~",
  "When was your school trip?|Chuyến đi của trường bạn vào khi nào?|It was in {December}.|our school trip was in *;=in *;=*|~"],
 ["Did you buy souvenirs?|Bạn có mua quà lưu niệm không?|Yes, I did. I bought a {hat}. / No, I didn't.|yes i did;i bought *|~",
  "What did your family do last summer?|Hè năm ngoái gia đình bạn đã làm gì?|We {took a boat trip}.|i *;=*|~",
  "When did you go to Ha Long Bay?|Bạn đi Vịnh Hạ Long khi nào?|We went there {last summer}.|i went there *;i went *;we went *;=*|~"],
 [QA_YN("Will you decorate the house for Tet?","Bạn có trang trí nhà đón Tết không?","Yes, I will.","No, I won't."),
  "Where will you go at Tet?|Tết bạn sẽ đi đâu?|I'll go to the {flower festival}.|we will go to *;=to *;=*|~",
  "What will you do at Tet?|Tết bạn sẽ làm gì?|We'll {make banh chung}.|i will *;=*|~"],
 ["What will you do at the Mid-Autumn Festival?|Tết Trung thu bạn sẽ làm gì?|We'll {carry lanterns and eat mooncakes}.|i will *;=*|~",
  "What food will you have at the party?|Ở bữa tiệc bạn sẽ ăn gì?|We'll have {burgers and pizza}.|i will have *;=*|~",
  "What drinks will you have at the party?|Ở bữa tiệc bạn sẽ uống gì?|We'll have {apple juice}.|i will have *;=*|~"],
 ["How do you stay healthy?|Bạn giữ sức khỏe bằng cách nào?|I {do morning exercise}.|=*|~",
  "How often do you play sports?|Bạn chơi thể thao bao lâu một lần?|I play sports {three times a week}.|=*|~",
  QA_YN("Do you eat healthy food?","Bạn có ăn đồ ăn tốt cho sức khỏe không?","Yes, I do.","No, I don't."),
  "How does your father stay healthy?|Bố bạn giữ sức khỏe bằng cách nào?|He {goes jogging}.|=*|~"],
 ["What's the matter?|Bạn bị làm sao thế?|I have a {headache}.|=*|headache,toothache,stomach ache,sore throat,fever,cold,cough,earache,backache|🤕",
  "I have a toothache. What should I do?|Tôi bị đau răng. Tôi nên làm gì?|You should {go to the dentist}.|=*|~",
  "I have a sore throat. What should I do?|Tôi bị đau họng. Tôi nên làm gì?|You should {drink warm water}.|=*|~"],
 ["What's the weather like in summer?|Mùa hè thời tiết thế nào?|It's {hot} in summer.|it is *;=*|hot,sunny,warm,very hot,rainy",
  "What do you usually wear in winter?|Mùa đông bạn thường mặc gì?|I wear {a jumper and jeans}.|i usually wear *;=*|~",
  "What's your favourite season?|Mùa yêu thích của bạn là gì?|My favourite season is {spring}.|i like *;it is *;=*|spring,summer,autumn,fall,winter"],
 ["Who are the main characters in The Hare and the Tortoise?|Nhân vật chính trong truyện Thỏ và Rùa là ai?|They're the {hare and the tortoise}.|=*|~",
  "How did the hare run?|Con thỏ chạy thế nào?|He ran {fast}.|it ran *;=*|fast,quickly,very fast",
  QA_YN("Do you like reading stories?","Bạn có thích đọc truyện không?","Yes, I do.","No, I don't."),
  "What's your favourite story?|Câu chuyện yêu thích của bạn là gì?|My favourite story is {Snow White}.|i like *;it is *;=*|~"],
 ["How do you go to school?|Bạn đến trường bằng gì?|I go to school {by bike}.|i go *;=by *;=on foot;=*|~",
  "Where do you want to visit?|Bạn muốn đến thăm nơi nào?|I want to visit {Dragon Bridge}.|i would like to visit *;=*|~",
  "How can I get to the zoo?|Tôi đến sở thú bằng cách nào?|You can get there {by bus}.|you can go *;=by *;=on foot|~"],
 ["What do you think of Ba Na Hills?|Bạn nghĩ gì về Bà Nà?|I think it's {beautiful}.|it is *;=*|~",
  "What do you think of the old buildings?|Bạn nghĩ gì về những tòa nhà cổ?|I think they're {fantastic}.|they are *;=*|~",
  "Which place do you want to visit?|Bạn muốn đến thăm nơi nào?|I want to visit {Phu Quoc Island}.|i would like to visit *;=*|~"],
 ["Where are you going to visit this summer?|Hè này bạn định đi đâu?|I'm going to visit {Phu Quoc Island}.|i will visit *;i want to visit *;=*|~",
  "What are you going to do this summer?|Hè này bạn định làm gì?|I'm going to {go camping}.|i will *;=*|~",
  QA_YN("Are you going to join a music club?","Bạn có định tham gia câu lạc bộ âm nhạc không?","Yes, I am.","No, I'm not.")]]
};
/* ================= HỎI ĐÁP TIẾNG ANH: máy hỏi – con trả lời – máy chấm =================
   Mỗi Unit có vài câu hỏi (QA_DATA trong 92-qa-data.js). App đọc câu hỏi bằng giọng tiếng Anh, con trả lời bằng giọng nói
   (hoặc gõ), app chấm 1–5 sao theo mẫu câu: trả lời đúng ý bằng cả câu → 5★, chỉ nói 1 từ → 3★, lạc đề → 1★.
   Máy chủ có ANTHROPIC_API_KEY (src/routes/qa.js) thì câu trả lời được chấm thêm bằng AI: hiểu câu tự do, sửa ngữ pháp,
   nhận xét bằng tiếng Việt. Không có mạng / không có khóa → vẫn chấm trên máy như bình thường. */
const QA_CSS=`
html body .en-tools .tool-btn.ht-qa{background:#0F766E;color:#fff;border-color:transparent}
html body .en-tools .tool-btn.ht-qa small{color:#CCFBF1}
.qa-page{padding-bottom:30px}
.qa-page .lead{margin:2px 0 8px;color:var(--muted);font-weight:700}
.qa-dots{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
.qa-dots button{min-width:34px;height:34px;border-radius:12px;border:2px solid var(--line);background:var(--card);font:inherit;font-weight:800;font-size:14px;color:var(--ink);cursor:pointer}
.qa-dots button.on{border-color:#0F766E;background:#0F766E;color:#fff}
.qa-dots button.ok{border-color:#16A34A}
.qa-ask{display:flex;gap:10px;align-items:flex-start;margin:0 0 12px}
.qa-ask .owl{flex:none;font-size:44px;line-height:1}
.qa-bub{flex:1;min-width:0;background:var(--card);border:2px solid var(--line);border-radius:4px 18px 18px 18px;padding:12px 14px}
.qa-bub .pic{font-size:40px;line-height:1.2;margin:0 0 6px;letter-spacing:2px;overflow-wrap:anywhere}
.qa-bub .q{font-size:21px;font-weight:800;line-height:1.35;margin:0}
.qa-bub .q.hid{color:var(--muted);font-size:16px}
.qa-bub .vi{margin:6px 0 0;color:var(--muted);font-weight:600;font-size:14px}
.qa-bub .ex{margin:8px 0 0;padding:8px 10px;border-radius:12px;background:var(--soft);font-weight:700;font-size:15px}
.qa-tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.qa-tools button{border:2px solid var(--line);background:var(--card);border-radius:999px;padding:4px 12px;font:inherit;font-weight:800;font-size:14px;color:var(--ink);cursor:pointer}
.qa-big{display:flex;flex-direction:column;align-items:center;gap:8px;margin:4px 0 12px}
.qa-big .rec-btn{font-size:21px;padding:12px 26px}
.qa-live{min-height:22px;font-weight:700;color:var(--muted);text-align:center;font-size:15px}
.qa-type{display:flex;gap:6px;width:100%}
.qa-type[hidden]{display:none}
.qa-type input{flex:1;min-width:0;border:2px solid var(--line);border-radius:14px;padding:10px 12px;font:inherit;font-size:17px;background:var(--card);color:var(--ink)}
.qa-type button{border:0;border-radius:14px;background:#0F766E;color:#fff;font:inherit;font-weight:800;padding:0 16px}
.qa-res{background:var(--card);border:2px solid var(--line);border-radius:18px;padding:12px 14px;margin:0 0 12px}
.qa-res .rec-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.qa-res .heard{color:var(--muted);font-size:14px;font-weight:600;margin:0 0 6px}
.qa-res .fb{font-weight:700;margin:0 0 8px;line-height:1.45}
.qa-res .better{display:flex;align-items:center;gap:8px;background:#ECFDF5;border-radius:12px;padding:8px 10px;font-weight:800;color:#065F46}
.qa-res .better b{flex:1;min-width:0}
.qa-res .ai{margin-top:8px;font-size:13px;color:var(--muted);font-weight:700}
.qa-sum{display:grid;gap:6px;margin:8px 0 14px}
.qa-sum div{display:flex;gap:8px;align-items:center;background:var(--card);border:2px solid var(--line);border-radius:14px;padding:8px 10px;font-weight:700}
.qa-sum div span{flex:1;min-width:0}
`;
const qaEl=document.createElement('style');qaEl.id='ht-qa';qaEl.textContent=QA_CSS;document.head.appendChild(qaEl);
window.addEventListener('load',()=>document.head.appendChild(qaEl));

/* ---------- dữ liệu ---------- */
/* mỗi câu: "câu hỏi|nghĩa|câu mẫu có {chỗ trống}|mẫu khác;mẫu khác|từ hợp lệ"
   – mẫu khác viết thường, * = chỗ con tự điền (1–5 từ), a/b = một trong các từ, [x] = có hoặc không,
     mẫu bắt đầu bằng "=" là câu trả lời ngắn (chấm 3★).
   – từ hợp lệ: danh sách từ cho chỗ trống, "~" = câu trả lời tự do (tên, số nhà…) */
const qaS=()=>{S.qa=S.qa||{};return S.qa;};
const qaSt=u=>{const Q=qaS();return Q[u]||(Q[u]={});};
function qaParse(s,u,i){const p=String(s).split('|');const exs=String(p[2]||'').split(/\s+\/\s+/);const ex=exs[0];const m=ex.match(/\{([^}]*)\}/);
  const words=(p[4]||'').trim();const open=words==='~';
  const W=open?[]:words.split(',').map(x=>x.trim()).filter(Boolean);if(m&&!open)W.push(m[1]);
  return {u,i,q:p[0],vi:p[1]||'',ex,exs,show:ex.replace(/[{}]/g,''),alts:(p[3]||'').split(';').map(x=>x.trim()).filter(Boolean),words:W,open,pic:(p[5]||'').trim()};}
function qaList(u){const L=(typeof QA_DATA!=='undefined'&&QA_DATA[GRADE]||[])[u]||[];return L.map((s,i)=>qaParse(s,u,i));}
function qaUnits(){const n=typeof EN_UNITS!=='undefined'?EN_UNITS.length:0;const out=[];for(let u=0;u<n;u++)if(qaList(u).length)out.push(u);return out;}
function qaUnitCount(u){const L=qaList(u),st=qaSt(u);let d=0;L.forEach((_,i)=>{if((st[i]||0)>=3)d++;});return[d,L.length];}
function qaAllCount(){let d=0,t=0;qaUnits().forEach(u=>{const[a,b]=qaUnitCount(u);d+=a;t+=b;});return[d,t];}

/* ---------- chấm trên máy ---------- */
const QA_FILL=new Set(['um','uh','er','erm','hmm','ah','oh','well','so','okay','ok','yeah']);
const QA_ART=new Set(['a','an','the']);
const QA_SP={favorite:'favourite',favorites:'favourites',color:'colour',colors:'colours',gray:'grey',mom:'mum',mommy:'mummy',theater:'theatre',center:'centre',meter:'metre',meters:'metres',kilometers:'kilometres',kilometer:'kilometre',practice:'practise',traveling:'travelling'};
/* viết tắt normEn chưa tách (we'll → "well", she'd → "shed"…) */
const qaUnc=t=>String(t||'').replace(/[’‘`´]/g,"'").replace(/\b(i|you|he|she|it|we|they|that|there)'ll\b/gi,'$1 will').replace(/\bwon't\b/gi,'will not')
  .replace(/\b(you|he|she|we|they)'d\b/gi,'$1 would').replace(/\b(i|you|we|they)'ve\b/gi,'$1 have').replace(/\b(did|was|were|has|have|had|would|should|could|must)n't\b/gi,'$1 not');
/* normEn bỏ "am" (hiểu là a.m.) → giữ lại để phân biệt "I am" */
function qaNorm(t){return normEn(qaUnc(t).replace(/\bam\b/gi,'qqam')).map(w=>w==='qqam'?'am':QA_SP[w]||w).filter(w=>!QA_ART.has(w));}
function qaClean(t){const w=qaNorm(t);while(w.length&&QA_FILL.has(w[0]))w.shift();return w;}
const qaStem=w=>w.length>4&&/ies$/.test(w)?w.slice(0,-3)+'y':w.length>3&&/(s|x|ch|sh)es$/.test(w)?w.slice(0,-2):w.length>2&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w;
/* mẫu → danh sách token {slot} | {opt, alts:[[từ…]…]} */
const QA_TPL=new Map();
function qaTpl(t){if(QA_TPL.has(t))return QA_TPL.get(t);const out=[];
  String(t).replace(/[{][^}]*[}]/g,'*').replace(/[.,!?]/g,' ').split(/\s+/).filter(Boolean).forEach(raw=>{
    if(raw==='*'){out.push({slot:true});return;}
    const opt=/^\[.*\]$/.test(raw);const inner=opt?raw.slice(1,-1):raw;
    const alts=inner.split('/').map(a=>qaNorm(a.replace(/_/g,' '))).filter(a=>a.length);
    if(alts.length)out.push({opt,alts});});
  QA_TPL.set(t,out);return out;}
/* tìm mọi cách khớp mẫu P với một đoạn liên tiếp của câu A (bắt đầu tại s) */
function qaMatchAt(P,A,s){const res=[];
  const go=(pi,ai,slot)=>{if(res.length>40)return;if(pi===P.length){res.push({end:ai,slot});return;}
    const t=P[pi];
    if(t.slot){for(let k=1;k<=5&&ai+k<=A.length;k++)go(pi+1,ai+k,slot.concat([A.slice(ai,ai+k)]));return;}
    if(t.opt)go(pi+1,ai,slot);
    t.alts.forEach(seq=>{let ok=ai+seq.length<=A.length;for(let k=0;ok&&k<seq.length;k++)if(qaStem(A[ai+k])!==qaStem(seq[k]))ok=false;if(ok)go(pi+1,ai+seq.length,slot);});};
  go(0,s,[]);return res;}
function qaMatch(tpl,A){const P=qaTpl(tpl);if(!P.length)return null;let best=null;
  for(let s=0;s<A.length;s++)qaMatchAt(P,A,s).forEach(m=>{const span=m.end-s;const sc=span*2-(s>0?1:0)+(m.end===A.length?1:0);if(!best||sc>best.sc)best={sc,start:s,end:m.end,slot:m.slot};});
  return best;}
function qaWordOk(it,seg){if(it.open)return true;const set=new Set(it.words.map(w=>qaNorm(w).map(qaStem).join(' ')));
  const toks=seg.map(qaStem);for(let a=0;a<toks.length;a++)for(let b=a+1;b<=toks.length;b++)if(set.has(toks.slice(a,b).join(' ')))return true;return false;}
function qaKnown(it,A){if(it.open||!it.words.length)return null;const set=it.words.map(w=>qaNorm(w).map(qaStem));const T=A.map(qaStem);
  for(const w of set)for(let a=0;a+w.length<=T.length;a++)if(w.every((x,k)=>T[a+k]===x))return A.slice(a,a+w.length);return null;}
function qaLcs(a,b){const m=a.length,n=b.length;if(!m||!n)return 0;let pr=new Array(n+1).fill(0);for(let i=1;i<=m;i++){const cu=[0];for(let k=1;k<=n;k++)cu[k]=qaStem(a[i-1])===qaStem(b[k-1])?pr[k-1]+1:Math.max(pr[k],cu[k-1]);pr=cu;}return pr[n];}
/* điền từ của con vào câu mẫu (viết hoa nếu chỗ trống trong câu mẫu viết hoa: tên riêng, thứ, tháng) */
const qaFill=(it,seg,ti)=>{const base=it.exs[ti>0&&ti<it.exs.length?ti:0];const m=base.match(/\{([^}]*)\}/);if(!seg||!m)return base.replace(/[{}]/g,'');
  const up=/^[A-Z]/.test(m[1]);return base.replace(m[0],seg.map(w=>up?w[0].toUpperCase()+w.slice(1):w).join(' '));};
const qaSent=t=>{t=qaCap(String(t).replace(/\s+/g,' ').trim());return /[.!?]$/.test(t)?t:t+'.';};
const qaCap=s=>{s=String(s).trim();return s?s[0].toUpperCase()+s.slice(1):s;};
const qaYN=it=>/^(yes|no)\b/i.test(it.ex);
/* chấm 1 câu trả lời (chuỗi) → {stars, fb, better, heard} */
function qaGrade1(it,text){const A=qaClean(text);if(!A.length)return {stars:0,heard:''};
  const full=it.exs.concat(it.alts.filter(a=>a[0]!=='='));const short=it.alts.filter(a=>a[0]==='=').map(a=>a.slice(1));
  let best=null;
  full.forEach((t,ti)=>{const m=qaMatch(t,A);if(!m)return;const seg=m.slot[m.slot.length-1]||null;const okW=!m.slot.length||m.slot.every(sg=>qaWordOk(it,sg));
    const cov=(m.end-m.start)/A.length;if(qaTpl(t).filter(x=>!x.slot).length<2&&cov<.6)return;const sc=(okW?10:8)+cov;if(!best||sc>best.sc)best={sc,kind:okW?'full':'fullUnk',seg,ti};});
  if(!best){short.forEach(t=>{const m=qaMatch(t,A);if(!m||(it.open&&m.slot.length&&A.length>3))return;const seg=m.slot[m.slot.length-1]||null;if(m.slot.length&&!m.slot.every(sg=>qaWordOk(it,sg)))return;
      const cov=(m.end-m.start)/A.length;if(cov<.5)return;const sc=5+cov;if(!best||sc>best.sc)best={sc,kind:'short',seg};});}
  if(!best){const kw=qaKnown(it,A);
    if(kw&&A.length<=kw.length+1)best={kind:'short',seg:kw};
    else if(qaYN(it)&&A.length<=2&&/^(yes|no)$/.test(A[0]))best={kind:'short',seg:null,yn:A[0]};
    else if(it.open&&A.length<=3&&!qaYN(it))best={kind:'short',seg:A};
    else{const T=qaTpl(it.ex).filter(t=>!t.slot).map(t=>t.alts[0]).flat();
      const l=qaLcs(A,T),r=l/Math.max(T.length,1),ra=l/A.length;
      best={kind:r>=.6&&ra>=.5&&A.length>=2?'near':kw||(r>=.3&&ra>=.25)?'topic':'off',seg:kw};}}
  const yi=best.yn?Math.max(0,it.exs.findIndex(x=>x.toLowerCase().startsWith(best.yn))):best.ti;
  const better=best.kind==='full'?qaSent(text):best.kind==='fullUnk'?it.show:qaCap(qaFill(it,best.seg,yi));
  const stars={full:5,fullUnk:3,short:3,near:3,topic:2,off:1}[best.kind];
  const fb={full:'Con trả lời đúng ý và nói được cả câu. Giỏi lắm!',fullUnk:'Con nói đúng mẫu câu rồi, nhưng từ con chọn chưa đúng. Con nghe câu đúng nhé.',
    short:'Con trả lời đúng ý rồi! Lần sau con thử nói cả câu nhé.',near:'Gần đúng rồi! Con nói lại theo câu mẫu cho đủ từ nhé.',
    topic:'Con đã hiểu câu hỏi. Con nghe câu mẫu rồi trả lời lại cả câu nhé.',off:'Câu trả lời chưa khớp với câu hỏi. Con nghe lại câu hỏi và câu mẫu nhé.'}[best.kind];
  return {stars,fb,better,heard:text,kind:best.kind};}
function qaGrade(it,alts){let best={stars:0,heard:''};(alts||[]).slice(0,40).forEach(t=>{const r=qaGrade1(it,t);if(r.stars>best.stars||(r.stars===best.stars&&r.stars&&t.length<best.heard.length))best=r;});
  if(!best.stars&&alts&&alts[0])best={...qaGrade1(it,alts[0])};return best;}

/* ---------- chấm bằng AI (máy chủ) ---------- */
let QA_AI=null;// null = chưa hỏi, true/false
function qaAiCheck(){if(QA_AI!==null||!LOGGED())return;QA_AI=false;fetch(API_BASE+'/qa/status').then(r=>r.json()).then(d=>{QA_AI=!!(d&&d.ai);}).catch(()=>{QA_AI=null;});}
function qaAiGrade(it,answer,alts){const U=typeof EN_UNITS!=='undefined'?EN_UNITS[it.u]:null;
  const p=apiPost('/qa/grade',{grade:GRADE,topic:U?U.t:'',question:it.q,samples:it.exs.map(x=>x.replace(/[{}]/g,'')),answer,alts:(alts||[]).slice(1,4)});
  return Promise.race([p,new Promise((_,rj)=>setTimeout(()=>rj(new Error('timeout')),12000))]);}

/* ---------- nghe câu trả lời (chỉ nhận dạng, tự dừng khi con im ~2,5 giây) ---------- */
function qaListen(cb,btn,onLive){
  if(REC.active){REC.active.stop();return;}
  if(!SR_API){cb({alts:[],error:'no-sr'});return;}
  stopVoice();AUDIO_REC=true;iosAudioPause();setAudioSession('play-and-record');
  const segs=[];let sess=[],finished=false,userStop=false,running=false,fatal=false,restarts=0,heardAt=0,err='',sil=null,tm=null;const t0=Date.now(),maxMs=16000;
  const sr=new SR_API();sr.lang='en-US';sr.interimResults=true;sr.maxAlternatives=5;sr.continuous=true;
  const done=()=>{if(finished)return;finished=true;clearTimeout(sil);clearTimeout(tm);REC.active=null;if(btn)btn.classList.remove('rec-on');
    AUDIO_REC=false;setTimeout(()=>{if(!AUDIO_REC)setAudioSession(IS_IOS?'playback':'auto');},300);
    const alts=srCandidates(segs.concat(sess));cb({alts,error:alts.length?'':(err||'no-speech')});};
  const stop=()=>{userStop=true;clearTimeout(sil);if(running){try{sr.stop();}catch(e){running=false;done();}}else done();};
  sr.onresult=e=>{const cur=[];for(let i=0;i<e.results.length;i++){const R=e.results[i],a=[];for(let k=0;k<R.length;k++){const tx=String(R[k].transcript||'').trim();if(tx)a.push(tx);}if(a.length)cur.push(a);}
    sess=cur;if(!cur.length)return;heardAt=Date.now();try{onLive&&onLive(segs.concat(cur).map(a=>a[0]).join(' '));}catch(_){}clearTimeout(sil);sil=setTimeout(stop,2500);};
  sr.onerror=e=>{const er=e.error||'error';if(er==='no-speech'||er==='aborted'){if(!err)err=er;return;}err=er;
    if(/not-allowed|service-not-allowed|audio-capture|language-not-supported|network/.test(er))fatal=true;};
  sr.onend=()=>{running=false;if(sess.length){segs.push(...sess);sess=[];}
    if(!userStop&&!fatal&&!finished&&Date.now()-t0<maxMs-1000&&restarts<8&&!(heardAt&&Date.now()-heardAt>2500)){restarts++;try{sr.start();running=true;return;}catch(e){}}
    done();};
  try{sr.start();running=true;}catch(e){err='start';done();return;}
  if(btn)btn.classList.add('rec-on');sfx.tap();REC.active={stop};tm=setTimeout(stop,maxMs);}
const qaWhy=e=>e==='no-sr'?'Trình duyệt này chưa nghe được giọng nói. Con mở bằng Chrome hoặc Safari, hoặc bấm ⌨️ để gõ câu trả lời nhé.':e==='no-speech'||e==='aborted'||!e?'App chưa nghe thấy con nói. Con bấm 🎤 rồi nói to, rõ hơn nhé.':(typeof recWhy==='function'&&recWhy(e))||'Chưa nghe được. Con thử lại hoặc bấm ⌨️ để gõ câu trả lời nhé.';

/* ---------- màn hỏi đáp ---------- */
let QA_RUN=null;// {u, list, k, res:[], hint:Set}
function qaStart(u){const list=u==='x'?qaQuick():qaList(u);if(!list.length){toast('Chưa có câu hỏi cho bài này.');return;}QA_RUN={u,list,k:0,res:[],hint:new Set()};qaAiCheck();renderQa();}
function qaQuick(){const pool=[];qaUnits().forEach(u=>qaList(u).forEach(it=>pool.push(it)));for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,5);}
function qaAsk(it){speak([['en',it.q]]);}
function renderQa(){stopVoice();stopRec();const R=QA_RUN;if(!R)return;const it=R.list[R.k];const U=EN_UNITS[it.u];const hide=!!S.qaHide;const canType=GRADE>=1;
  const dots=R.list.map((x,j)=>{const r=R.res[j];return `<button data-j="${j}" class="${j===R.k?'on':''}${r&&r.stars>=3?' ok':''}">${r?r.stars+'★':j+1}</button>`;}).join('');
  app.innerHTML=`<div class="screen"><div class="page qa-page"><div class="voc-head"><button class="icon-btn" id="qaBack" aria-label="Quay lại">✕</button><h1>💬 Hỏi đáp tiếng Anh</h1></div>
    <p class="lead">${R.u==='x'?'🎲 Hỏi nhanh 5 câu':H(U.lab+': '+U.t)}</p><div class="qa-dots">${dots}</div>
    <div class="qa-ask"><div class="owl" aria-hidden="true">🦉</div><div class="qa-bub">${it.pic?`<div class="pic" aria-hidden="true">${H(it.pic)}</div>`:''}
      <p class="q${hide?' hid':''}" id="qaQ">${hide?'🎧 Con nghe câu hỏi rồi trả lời nhé':H(it.q)}</p><div id="qaMore"></div>
      <div class="qa-tools"><button id="qaSay">🔊 Nghe lại</button>${hide?'<button id="qaShow">👀 Xem chữ</button>':''}<button id="qaVi">🇻🇳 Nghĩa</button><button id="qaHint">💡 Gợi ý</button></div></div></div>
    <div class="qa-big"><button class="rec-btn" id="qaRec">🎤 Trả lời</button><div class="qa-live" id="qaLive">Bấm 🎤 rồi trả lời bằng tiếng Anh, nói cả câu nhé.</div>
      ${canType?`<button class="btn btn-soft" id="qaTypeBtn" style="margin:0">⌨️ Gõ câu trả lời</button><div class="qa-type" id="qaType" hidden><input id="qaIn" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Type your answer…"><button id="qaSend">Gửi</button></div>`:''}</div>
    <div id="qaRes">${R.res[R.k]?qaResHTML(R.res[R.k],it):''}</div>
    <div class="voc-nav"><button class="btn btn-soft" id="qaPrev" ${R.k===0?'disabled':''}>◀ Câu trước</button><button class="btn ${R.res[R.k]?'btn-go':'btn-soft'}" id="qaNext">${R.k<R.list.length-1?'Câu tiếp ▶':'Xong ✓'}</button></div>
    <label style="display:flex;gap:8px;align-items:center;font-weight:700;color:var(--muted);font-size:14px"><input type="checkbox" id="qaHideCk" ${hide?'checked':''}> Ẩn chữ câu hỏi (chỉ nghe)</label>
  </div></div>`;
  const back=()=>{stopRec();stopVoice();QA_RUN=null;renderQaHome();};$('#qaBack').onclick=back;
  app.querySelectorAll('.qa-dots [data-j]').forEach(b=>b.onclick=()=>{sfx.tap();R.k=+b.dataset.j;renderQa();});
  $('#qaSay').onclick=()=>qaAsk(it);
  if($('#qaShow'))$('#qaShow').onclick=()=>{const q=$('#qaQ');q.textContent=it.q;q.classList.remove('hid');$('#qaShow').remove();};
  const more=$('#qaMore');
  $('#qaVi').onclick=()=>{if(!more.querySelector('.vi'))more.insertAdjacentHTML('afterbegin',`<p class="vi">${H(it.vi)}</p>`);};
  $('#qaHint').onclick=()=>{R.hint.add(R.k);if(!more.querySelector('.ex')){more.insertAdjacentHTML('beforeend',`<p class="ex">💡 ${H(it.show)}</p>`);speak([['en',it.show]]);}};
  $('#qaHideCk').onchange=e=>{S.qaHide=e.target.checked;save();renderQa();};
  $('#qaPrev').onclick=()=>{if(R.k>0){R.k--;renderQa();}};
  $('#qaNext').onclick=()=>{stopRec();if(R.k<R.list.length-1){R.k++;renderQa();}else renderQaSum();};
  const live=$('#qaLive'),btn=$('#qaRec');
  btn.onclick=()=>{if(REC.active){REC.active.stop();return;}btn.textContent='🎙️ Đang nghe';live.textContent='🎙️ Con nói đi…';
    qaListen(r=>{btn.textContent='🎤 Trả lời lại';if(!r.alts.length){live.textContent=qaWhy(r.error);sfx.bad();return;}live.textContent='';qaJudge(it,r.alts);},btn,t=>{live.textContent='🎙️ '+t;});};
  if(canType){$('#qaTypeBtn').onclick=()=>{$('#qaType').hidden=false;$('#qaTypeBtn').remove();$('#qaIn').focus();};
    const send=()=>{const v=$('#qaIn').value.trim();if(!v){toast('Con gõ câu trả lời trước nhé!');return;}qaJudge(it,[v],true);};
    $('#qaSend').onclick=send;$('#qaIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();send();}};}
  if(!R.res[R.k])setTimeout(()=>{if(QA_RUN===R&&R.list[R.k]===it)qaAsk(it);},250);}

function qaResHTML(r,it){if(r.pending)return `<div class="qa-res"><p class="heard">Con nói: “${H(r.heard)}”</p><p class="fb">🤖 Đang chấm…</p></div>`;
  return `<div class="qa-res"><div class="rec-top">${starsHTML(r.stars)}<b>${praiseFor(r.stars)}</b></div>
    <p class="heard">${r.typed?'Con viết':'App nghe được'}: “${H(r.heard)}”</p><p class="fb">${H(r.fb)}</p>
    ${r.better?`<div class="better"><b>${r.stars>=5&&!r.ai?'✓ ':'👉 '}${H(r.better)}</b><button class="spk" data-qasay="${H(r.better)}" aria-label="Nghe câu mẫu">🔊</button></div>`:''}
    ${r.ai?'<div class="ai">🤖 Được chấm bằng AI</div>':r.hint?'<div class="ai">💡 Con đã xem gợi ý nên tối đa 4★.</div>':''}</div>`;}

async function qaJudge(it,alts,typed){const R=QA_RUN;const k=R.k;let r=qaGrade(it,alts);r.typed=!!typed;
  const box=$('#qaRes');const useAi=QA_AI===true&&LOGGED()&&r.heard;
  if(useAi&&box){box.innerHTML=qaResHTML({pending:true,heard:r.heard},it);
    try{const a=await qaAiGrade(it,r.heard,alts);if(a&&a.stars){const sameBetter=qaNorm(a.better).join(' ')===qaNorm(r.heard).join(' ');
      r={...r,stars:a.stars,fb:a.feedback_vi||r.fb,better:sameBetter&&a.stars>=5?'':(a.better||r.better),ai:true};}}catch(e){}}
  if(R.hint.has(k)&&r.stars>4){r.stars=4;r.hint=true;}
  const prevRun=R.res[k];if(!prevRun||r.stars>=prevRun.stars)R.res[k]=r;
  if(QA_RUN!==R||R.k!==k||!$('#qaRes'))return;
  $('#qaRes').innerHTML=qaResHTML(r,it);
  const st=qaSt(it.u);const prev=st[it.i]||0;if(r.stars>prev){st[it.i]=r.stars;addSpeakPoints(r.stars-prev,`p.qa${it.u}.${it.i}`,r.stars);save();}
  r.stars>=3?sfx.ok():sfx.bad();if(r.stars>=5&&typeof confetti==='function')confetti();
  const say=[['en',praiseFor(r.stars).replace(/[^\x20-\x7E]/g,'').trim()]];if(r.better&&r.stars<5)say.push(['en',r.better]);speak(say,{silent:true});
  const d=app.querySelector(`.qa-dots [data-j="${k}"]`);if(d){d.textContent=R.res[k].stars+'★';d.classList.toggle('ok',R.res[k].stars>=3);}
  const nx=$('#qaNext');if(nx){nx.classList.add('btn-go');nx.classList.remove('btn-soft');}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-qasay]');if(!b)return;e.stopPropagation();speak([['en',b.dataset.qasay]]);},true);

function renderQaSum(){stopVoice();const R=QA_RUN;if(!R)return;const tot=R.res.reduce((s,r)=>s+(r?r.stars:0),0),max=R.list.length*5;const pct=tot/max;
  if(pct>=.8){sfx.win();if(typeof confetti==='function')confetti();}
  app.innerHTML=`<div class="screen"><div class="page qa-page"><div class="voc-head"><button class="icon-btn" id="qaBack" aria-label="Quay lại">✕</button><h1>💬 Kết quả hỏi đáp</h1></div>
    <section class="hello"><div class="owl" aria-hidden="true">🦉</div><div class="say"><b>${pct>=.8?'Excellent! 🌟':pct>=.6?'Great job! ⭐':'Good try! 💪'}</b><br>Con được ${tot}/${max} sao.</div></section>
    <div class="qa-sum">${R.list.map((it,j)=>{const r=R.res[j];return `<div><span>${H(it.q)}<br><small style="color:var(--muted)">${r?'“'+H(r.heard)+'”':'Chưa trả lời'}</small></span>${r?starsHTML(r.stars):''}</div>`;}).join('')}</div>
    <button class="btn btn-go" id="qaAgain">🔁 Làm lại</button><button class="btn btn-soft" id="qaHome">Tất cả bài hỏi đáp</button><button class="btn btn-soft" id="qaEn">Về trang English</button></div></div>`;
  $('#qaBack').onclick=$('#qaHome').onclick=()=>{QA_RUN=null;renderQaHome();};
  $('#qaAgain').onclick=()=>qaStart(R.u);$('#qaEn').onclick=()=>{QA_RUN=null;renderEnglish();};}

/* ---------- danh sách bài ---------- */
function renderQaHome(){stopVoice();stopRec();qaAiCheck();const[d,t]=qaAllCount();
  const rows=qaUnits().map(u=>{const U=EN_UNITS[u];const[a,b]=qaUnitCount(u);const st=qaSt(u);const s=qaList(u).reduce((x,_,i)=>x+(st[i]||0),0);
    return `<button class="ht-row" data-act="htqa" data-u="${u}"><span class="n">${u+1}</span><span class="tx"><b>${H(U.lab)}: ${H(U.t)}</b><small>${b} câu hỏi · đã đạt ${a}/${b}</small><span class="ht-bar" style="--c:#0F766E"><i style="width:${b?Math.round(s/(b*5)*100):0}%"></i></span></span><span class="go">›</span></button>`;}).join('');
  app.innerHTML=`<div class="screen notebook nogrid ht-list" id="scr">${topbar()}<section class="hello"><div class="owl" aria-hidden="true">🦉</div><div class="say"><b>Hỏi đáp tiếng Anh</b><br>Cú Bông hỏi bằng tiếng Anh, con trả lời bằng tiếng Anh (nói cả câu). App chấm ngay và gợi ý câu đúng. Đã đạt ${d}/${t} câu.</div></section>
    <div class="page ht-page"><button class="exam-banner" data-act="htqa" data-u="x" style="--c:#0F766E;--cd:#115E59;width:100%;margin:0 0 12px"><span class="eb-ic">🎲</span><span><b>Hỏi nhanh 5 câu</b><small>Câu hỏi ngẫu nhiên từ mọi Unit</small></span><span class="eb-go">›</span></button>${rows}
    <button class="btn btn-soft" id="qaEn">Về trang English</button></div></div>${tabbar('en')}`;
  $('#qaEn').onclick=()=>renderEnglish();}

/* nút ở mỗi Unit + banner ở trang English */
{const _et=enTools;enTools=function(u){let h=_et.apply(this,arguments);try{if(qaList(u).length){const[a,b]=qaUnitCount(u);h=h.replace(/<\/div>\s*$/,`<button class="tool-btn ht-qa" data-act="htqa" data-u="${u}">💬 Hỏi đáp <small>${a}/${b}</small></button></div>`);}}catch(e){}return h;};}
if(typeof renderEnglish==='function'){const _re3=renderEnglish;renderEnglish=function(){const r=_re3.apply(this,arguments);try{const scr=document.getElementById('scr');if(scr&&!scr.querySelector('.ht-qa-banner')&&qaUnits().length){const[d,t]=qaAllCount();const b=document.createElement('div');
  b.innerHTML=`<button class="exam-banner ht-qa-banner" data-act="htqahome" style="--c:#0F766E;--cd:#115E59"><span class="eb-ic">💬</span><span><b>Hỏi đáp tiếng Anh</b><small>Cú Bông hỏi, con trả lời bằng tiếng Anh · ${d}/${t} câu</small></span><span class="eb-go">›</span></button>`;
  const ref=[...scr.querySelectorAll('.exam-banner')].pop();if(ref)ref.after(b.firstChild);else{const h=scr.querySelector('.hello');if(h)h.after(b.firstChild);}}}catch(e){}return r;};}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="htqa"],[data-act="htqahome"]');if(!b)return;e.stopPropagation();sfx.tap();
  if(b.dataset.act==='htqahome'){renderQaHome();return;}qaStart(b.dataset.u==='x'?'x':+b.dataset.u);},true);
/* màn hình đầu tiên đã vẽ trước khi lớp này chạy → vẽ lại để có tab Tư duy và các mục mới */
try{if(document.querySelector('#scr')&&document.querySelector('.tab[data-t="map"].on'))renderHome();
  else{const tb=document.querySelector('nav.tabbar');if(tb){const on=tb.querySelector('.tab.on');const t=on?on.dataset.t:'';const d=document.createElement('div');d.innerHTML=tabbar(t);if(d.firstElementChild)tb.replaceWith(d.firstElementChild);}}}catch(e){}
window.HT={TDG,TD_ALL,TD_LA,KC,tdBuild,tdMake,kcFor,kcForChapter,bankQs,cardForQ,GRADE,similarQ,polyomino,MG,PLAN,renderTd,startTd,renderPara,renderParaHome,paList,paSt,paSplit,pcS,PARA,QA_DATA,qaList,qaGrade,qaStart,renderQaHome};
})();
