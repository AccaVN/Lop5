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
