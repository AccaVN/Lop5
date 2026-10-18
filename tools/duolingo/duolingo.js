/* ============ LỚP GIAO DIỆN & BÀI TẬP KIỂU DUOLINGO ============
   Dùng chung cho các app Học Vui (Lớp Lá, 1, 2, 3, 4, 5). Chạy sau script chính, chỉ bọc lại các hàm
   check / finish / renderQ / renderAnswer / buildEn nên không sửa dữ liệu câu hỏi gốc.
   1) Giao diện: thanh tiến độ xanh, combo, ô chọn, thanh phản hồi xanh/đỏ, nút bấm giống Duolingo.
   2) Dạng bài mới cho tiếng Anh: nối cặp (match), gõ lại (text), xếp câu từ các từ cho sẵn (bank).
   3) Làm sai thì cuối bài phải làm lại các câu sai, lặp đến khi đúng hết mới hoàn thành bài.
   Cài vào index.html bằng: python3 duolingo/inject.py public/index.html */
(function(){
"use strict";
if(window.__DUO__)return;
if(typeof check!=='function'||typeof finish!=='function'||typeof renderQ!=='function'||typeof renderAnswer!=='function'||typeof buildEn!=='function')return;
window.__DUO__=1;

const KM=/^lop(la|\d)_/.exec(typeof KEY==='string'?KEY:'');
const GRADE=KM?(KM[1]==='la'?0:+KM[1]):3;           /* 0 = Lớp Lá (chưa biết chữ, chỉ chạm), 1–5 = lớp */
const EN=()=>typeof isEnQ==='function'&&isEnQ();
const norm=s=>String(s==null?'':s).toLowerCase().replace(/[’‘`]/g,"'").replace(/'/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const hasEmoji=t=>/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[0-9]️?⃣/u.test(t);
const sayEn=t=>{try{speak([['en',t]],{silent:true});}catch(e){}};
const sayVi=t=>{try{speak([['vi',t]],{silent:true});}catch(e){}};

/* ---------------- CSS ---------------- */
const CSS=`
:root{--dg:#58CC02;--dg-d:#58A700;--db:#1CB0F6;--db-d:#1899D6;--dr:#FF4B4B;--dr-d:#EA2B2B;--dy:#FFC800;--dy-d:#E6A800;--dln:#E5E5E5;--dln-d:#CECECE;--dgr:#AFAFAF;
 --dok-bg:#D7FFB8;--dok-tx:#58A700;--dbad-bg:#FFDFE0;--dbad-tx:#EA2B2B;--dsel-bg:#DDF4FF;--dsel-tx:#1899D6;--dcard:#fff}
:root[data-theme="dark"]{--dln:#37464F;--dln-d:#2B3A43;--dgr:#7C8A93;--dok-bg:#202F36;--dok-tx:#89E219;--dbad-bg:#2B2124;--dbad-tx:#FF7878;--dsel-bg:#1B3A4B;--dsel-tx:#49C0F8;--dcard:var(--card)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--dln:#37464F;--dln-d:#2B3A43;--dgr:#7C8A93;--dok-bg:#202F36;--dok-tx:#89E219;--dbad-bg:#2B2124;--dbad-tx:#FF7878;--dsel-bg:#1B3A4B;--dsel-tx:#49C0F8;--dcard:var(--card)}}

/* nút bấm */
.btn{border-radius:16px;font-weight:800;font-size:17px;letter-spacing:.8px;text-transform:uppercase;padding:14px 18px;box-shadow:0 4px 0 var(--cd,var(--db-d))}
.btn:active{transform:translateY(4px);box-shadow:0 0 0 var(--cd,var(--db-d))}
.btn-go{--c:var(--dg);--cd:var(--dg-d)}
.btn-bad{--c:var(--dr);--cd:var(--dr-d)}
.btn-soft{--c:var(--dcard);--cd:var(--dln);color:var(--db);border:2px solid var(--dln);box-shadow:0 4px 0 var(--dln);padding:12px 18px}
.btn:disabled{background:var(--dln);box-shadow:0 4px 0 var(--dln-d);color:var(--dgr)}
.tab.on{color:var(--dg-d)}

/* màn làm bài */
.quiz .qtop{padding:14px 16px 10px;gap:14px}
.quiz .bar{height:16px;background:var(--dln)}
.quiz .bar i{position:relative;background:var(--dg);min-width:16px;transition:width .35s ease-out,background .3s}
.quiz .bar i::after{content:"";position:absolute;left:8px;right:8px;top:4px;height:4px;border-radius:4px;background:rgba(255,255,255,.32)}
.quiz .bar.gold i{background:var(--dy)}
.quiz .qcount{font-size:15px;color:var(--dgr);min-width:42px}
.quiz #quit{color:var(--dgr);font-size:26px;padding:0 4px}
.duo-combo{min-height:20px;margin-top:10px;margin-bottom:-4px;text-align:center;font-weight:800;font-size:16px;letter-spacing:.3px;color:var(--dg);line-height:20px}
.duo-combo.gold{color:var(--dy)}
.duo-combo.pop{animation:duopop .5s ease-out}
@keyframes duopop{0%{transform:scale(.6);opacity:.2}60%{transform:scale(1.25)}100%{transform:scale(1);opacity:1}}
.quiz .qbody{padding:6px 20px 14px}
.quiz .prompt{font-size:24px;font-weight:800;line-height:1.3;margin:6px 0 14px}
.quiz .tag{background:transparent;color:var(--dgr);padding:0;font-size:14px;letter-spacing:.6px;text-transform:uppercase}
.quiz .opt,.quiz .chip{background:var(--dcard);border:2px solid var(--dln);border-bottom-width:4px;border-radius:16px;box-shadow:none;font-weight:700}
.quiz .opt:active,.quiz .chip:active{transform:translateY(2px);border-bottom-width:2px;margin-bottom:2px}
.quiz .opt.sel{background:var(--dsel-bg);border-color:var(--db);color:var(--dsel-tx);box-shadow:none}
.quiz .opt.right{background:var(--dok-bg);border-color:var(--dg);color:var(--dok-tx);box-shadow:none}
.quiz .opt.wrong{background:var(--dbad-bg);border-color:var(--dr);color:var(--dbad-tx);box-shadow:none}
.quiz .opt.reading{border-color:var(--dy);box-shadow:0 0 0 3px rgba(255,200,0,.35)}
.quiz .line .chip{border-color:var(--dln);box-shadow:none}
.quiz .say-btn{border:2px solid var(--dln);border-bottom-width:4px;color:var(--db);box-shadow:none;background:var(--dcard)}
.quiz .say-btn.large{box-shadow:none}
.quiz .qfoot{border-top:2px solid var(--dln);padding:14px 20px calc(14px + env(safe-area-inset-bottom,0px))}
.quiz .sheet{border-radius:0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px))}
.quiz .sheet.good{background:var(--dok-bg);color:var(--dok-tx)}
.quiz .sheet.bad{background:var(--dbad-bg);color:var(--dbad-tx)}
.quiz .fb-title{display:flex;align-items:center;gap:12px;font-size:24px}
.quiz .fb-title::before{content:"✓";flex:none;width:36px;height:36px;border-radius:50%;background:#fff;color:var(--dg-d);display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:1}
.quiz .sheet.bad .fb-title::before{content:"✕";color:var(--dr-d)}
.quiz .fb-ans{font-weight:700;margin-top:6px}
.quiz .fb-exp{background:rgba(255,255,255,.55);color:inherit}
.quiz .fb-combo{font-weight:800;font-size:17px;margin-top:6px;color:var(--dy-d);animation:duopop .5s ease-out}
.quiz .sheet .btn{margin-top:16px}
.duo-rvtag{display:inline-block;margin:0 0 8px;padding:2px 12px;border-radius:999px;background:var(--dy);color:#7A5200;font-weight:800;font-size:13px;letter-spacing:.5px;text-transform:uppercase}
.duo-rv{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px 28px}
.duo-rv-ic{font-size:84px;line-height:1}
.duo-rv h1{font-size:30px;margin:10px 0 4px;line-height:1.15}
.duo-rv p{font-size:19px;color:var(--muted);font-weight:600;margin:4px 0 22px}
.duo-rv .btn{max-width:360px}
.duo-rvnote{color:var(--dok-tx)!important;font-weight:800!important}

/* nhân vật + bong bóng thoại */
.duo-say{display:flex;align-items:center;gap:10px;margin:2px 0 18px}
.duo-say .owl{font-size:68px;line-height:1;flex:none}
.duo-say .bub{position:relative;flex:1;background:var(--dcard);border:2px solid var(--dln);border-radius:16px;padding:12px 14px;font-size:21px;font-weight:700;line-height:1.35;display:flex;align-items:center;gap:10px}
.duo-say .bub::before{content:"";position:absolute;left:-9px;top:50%;width:14px;height:14px;margin-top:-7px;background:var(--dcard);border-left:2px solid var(--dln);border-bottom:2px solid var(--dln);transform:rotate(45deg)}
.duo-say .bub button{border:0;background:none;font-size:26px;padding:0 2px;line-height:1;flex:none}

/* nối cặp */
.duo-match{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px}
.duo-match .col{display:flex;flex-direction:column;gap:12px}
.mt{display:flex;align-items:center;justify-content:center;text-align:center;gap:6px;min-height:68px;padding:8px 10px;background:var(--dcard);color:var(--ink);border:2px solid var(--dln);border-bottom-width:4px;border-radius:16px;font-weight:700;font-size:19px;line-height:1.25;word-break:break-word;transition:transform .08s,background .15s,opacity .3s}
.mt.big-e{font-size:36px}
.mt.small{font-size:16px}
.mt:active{transform:translateY(2px)}
.mt.on{background:var(--dsel-bg);border-color:var(--db);color:var(--dsel-tx)}
.mt.ok{background:var(--dok-bg);border-color:var(--dg);color:var(--dok-tx)}
.mt.bad{background:var(--dbad-bg);border-color:var(--dr);color:var(--dbad-tx);animation:duoshake .4s}
.mt.done{opacity:.35;border-color:var(--dln);background:var(--dcard);color:var(--dgr);pointer-events:none}
@keyframes duoshake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

/* gõ lại */
.duo-type{display:flex;align-items:center;flex-wrap:wrap;min-height:84px;padding:14px 16px;border:2px solid var(--dln);border-bottom-width:4px;border-radius:16px;background:var(--dcard);color:var(--ink);font-size:28px;font-weight:800;line-height:1.3;word-break:break-all;white-space:pre-wrap}
.duo-type .ph{color:var(--dgr);font-size:19px;font-weight:700}
.duo-type .caret{display:inline-block;width:3px;height:1.1em;margin-left:2px;background:var(--db);animation:duocaret 1s steps(1) infinite}
.duo-type.off .caret{display:none}
@keyframes duocaret{50%{opacity:0}}
.duo-kb{display:flex;flex-direction:column;gap:7px;margin-bottom:12px;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.duo-kb .kr{display:flex;justify-content:center;gap:5px}
.duo-kb button{flex:1 1 0;max-width:40px;height:46px;padding:0;border:2px solid var(--dln);border-bottom-width:4px;border-radius:10px;background:var(--dcard);color:var(--ink);font-weight:800;font-size:20px;text-transform:uppercase}
.duo-kb button:active{transform:translateY(2px);border-bottom-width:2px}
.duo-kb button.wide{max-width:none;flex:2 1 0}
.duo-kb button.sp{max-width:none;flex:5 1 0;font-size:15px}

/* xếp câu từ các từ cho sẵn */
.duo-line{min-height:116px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;padding:6px 0;margin-bottom:22px;background-image:linear-gradient(var(--dln) 2px,transparent 2px);background-size:100% 56px;background-position:0 52px}
.duo-line .chip,.duo-pool .chip{height:46px;padding:0 14px;font-size:20px;display:inline-flex;align-items:center}
.duo-pool{display:flex;flex-wrap:wrap;gap:8px 10px;justify-content:center}
.duo-pool .chip.ghost{visibility:visible;background:var(--dln);border-color:var(--dln);border-bottom-width:4px;color:transparent;pointer-events:none}
`;
const st=document.createElement('style');st.id='duo-css';st.textContent=CSS;document.head.appendChild(st);

/* ---------------- tạo câu hỏi mới (tiếng Anh) ---------------- */
const pickN=(a,n)=>shuffle(a).slice(0,n);
const tok=s=>String(s).trim().split(/\s+/).filter(t=>norm(t));

function mkMatch(skill,pairs,o){
  const seenL=new Set(),seenR=new Set();
  pairs=pairs.filter(p=>{const a=norm(p[0])||p[0],b=norm(p[1])||p[1];if(seenL.has(a)||seenR.has(b))return false;seenL.add(a);seenR.add(b);return true;});
  if(pairs.length<3)return null;
  return Object.assign({type:'match',skill,pairs,prompt:'Match the pairs. (Nhấn vào các cặp tương ứng)',
    answer:pairs.map(p=>p[0]+' = '+p[1]).join('; '),voice:[['vi','Nhấn vào các cặp tương ứng']]},o||{});
}
function mkText(skill,prompt,answer,o){
  return Object.assign({type:'text',skill,prompt,answer,alts:[]},o||{});
}
function mkBank(skill,en,vi,dir,pool){
  const ans=tok(dir==='vi2en'?en:vi);
  const ban=new Set(ans.map(norm));
  const cand=shuffle(pool.map(s=>tok(dir==='vi2en'?s[0]:s[1])).reduce((a,b)=>a.concat(b),[])).filter((t,i,a)=>!ban.has(norm(t))&&a.findIndex(x=>norm(x)===norm(t))===i);
  const items=shuffle(ans.concat(cand.slice(0,ans.length>4?3:2)));
  const shown=dir==='vi2en'?vi:en;
  return {type:'bank',skill,dir,prompt:'Translate this sentence. (Dịch câu này)',tokens:ans,items,answer:ans.join(' '),
    bubble:shown,bubbleLang:dir==='vi2en'?'vi':'en',
    visual:`<div class="duo-say"><div class="owl" aria-hidden="true">🦉</div><div class="bub"><span>${esc(shown)}</span><button type="button" id="bubSay" aria-label="Nghe">🔊</button></div></div>`,
    voice:[['vi','Dịch câu này'],[dir==='vi2en'?'vi':'en',shown]],
    explain:en+' = '+vi};
}
function extrasFor(u,d){
  const U=EN_UNITS[u];if(!U)return [];
  const w=U.w||[],c=(U.c||[]).filter(x=>x&&x[0]&&x[1]);
  const ex=[];
  const wm=n=>pickN(w,Math.min(n,w.length));
  const cm=n=>pickN(c,Math.min(n,c.length));
  const okTok=n=>x=>{const t=tok(x);return t.length>=2&&t.length<=n;};
  if(d===0&&w.length>=3){
    if(GRADE===0)ex.push(mkMatch('en_vocab',wm(5).map(x=>[x[0],x[1]]),{mode:'pic',hint:'say'}));
    else ex.push(mkMatch('en_vocab',wm(5).map(x=>[x[0],x[2]])));
    if(GRADE>=1){
      const x=pick(w);
      if(GRADE<=2)ex.push(mkText('en_vocab','Type the English word. (Gõ từ tiếng Anh)',x[0],{visual:`<div class="emo">${x[1]}</div>`,voice:[['vi','Gõ từ tiếng Anh']],explain:x[1]+' = '+x[0]+' ('+x[2]+')'}));
      else ex.push(mkText('en_vocab','Type this in English. (Gõ bằng tiếng Anh)',x[0],{big:x[2],visual:`<div class="emo sm">${x[1]}</div>`,voice:[['vi','Gõ bằng tiếng Anh'],['vi',x[2]]],explain:x[1]+' = '+x[0]+' ('+x[2]+')'}));
    }
  }
  if(d===1&&w.length>=3){
    ex.push(mkMatch('en_listen',wm(5).map(x=>[x[0],x[1]]),{mode:'pic',hint:'listen',prompt:'Tap 🔊, then tap the matching picture. (Nghe rồi chọn hình tương ứng)',voice:[['vi','Nghe rồi chọn hình tương ứng']]}));
    if(GRADE>=1){
      const x=pick(w);
      ex.push(mkText('en_listen','Listen and type. (Nghe và gõ lại)',x[0],{auto:true,voice:[['en',x[0]]],explain:x[1]+' '+x[0]+' = '+x[2]}));
    }
  }
  if(d===2&&c.length>=3){
    if(GRADE===0){
      const cc=cm(4).filter(x=>x[2]);
      if(cc.length>=3)ex.push(mkMatch('en_sent',cc.map(x=>[x[0],x[2]]),{mode:'pic',hint:'say'}));
    }else{
      ex.push(mkMatch('en_sent',cm(4).map(x=>[x[0],x[1]]),{mode:'sent'}));
      const mx=GRADE<=2?6:9;
      const cs=c.filter(x=>okTok(mx)(x[0]));
      if(cs.length){const x=pick(cs);ex.push(mkBank('en_sent',x[0],x[1],'vi2en',c));}
      if(GRADE>=3){const cv=c.filter(x=>okTok(9)(x[1])&&okTok(9)(x[0]));if(cv.length){const x=pick(cv);ex.push(mkBank('en_sent',x[0],x[1],'en2vi',c));}}
    }
  }
  return ex.filter(Boolean).slice(0,3);
}
function mixExtras(qs,u,d){
  if(!qs||qs.length<5)return qs;
  const ex=extrasFor(u,d);if(!ex.length)return qs;
  const idx=shuffle(qs.map((q,i)=>i).filter(i=>i>0&&qs[i].type==='mc'&&!qs[i].hard&&!qs[i].passage));
  const out=qs.slice();
  ex.forEach((q,k)=>{if(idx[k]!==undefined)out[idx[k]]=q;});
  return out;
}
const _buildEn=buildEn;
buildEn=function(u,d){const qs=_buildEn.apply(this,arguments);try{return mixExtras(qs,u,d);}catch(e){return qs;}};

/* ---------------- hiển thị các dạng bài mới ---------------- */
const CUSTOM={match:1,text:1,bank:1};
function renderMatch(q){
  const ans=$('#ans'),n=q.pairs.length;
  const Ls=shuffle(q.pairs.map((p,i)=>({i,t:p[0]}))),Rs=shuffle(q.pairs.map((p,i)=>({i,t:p[1]})));
  Q.mm={sel:null,done:0,mist:0,n};
  const hideL=q.hint==='listen',pic=q.mode==='pic';
  const sz=t=>String(t).length>24?' small':'';
  const tl=x=>`<button type="button" class="mt${sz(x.t)}" data-s="L" data-i="${x.i}"${hideL?' aria-label="Nghe"':''}>${hideL?'🔊':(q.hint==='say'?'🔊 ':'')+esc(x.t)}</button>`;
  const tr=x=>`<button type="button" class="mt${pic?' big-e':sz(x.t)}" data-s="R" data-i="${x.i}">${esc(x.t)}</button>`;
  ans.innerHTML=`<div class="duo-match"><div class="col">${Ls.map(tl).join('')}</div><div class="col">${Rs.map(tr).join('')}</div></div>`;
  const check0=$('#check');if(check0)check0.disabled=true;
  ans.querySelectorAll('.mt').forEach(b=>b.onclick=()=>{
    if(Q.locked||Q.qs[Q.i]!==q||b.classList.contains('done')||b.classList.contains('ok'))return;
    const m=Q.mm,side=b.dataset.s;sfx.tap();
    if(side==='L')sayEn(q.pairs[+b.dataset.i][0]);
    const cur=m.sel;
    if(!cur||cur.dataset.s===side){if(cur)cur.classList.remove('on');if(cur===b){m.sel=null;return;}b.classList.add('on');m.sel=b;return;}
    m.sel=null;cur.classList.remove('on');
    if(cur.dataset.i===b.dataset.i){
      cur.classList.add('ok');b.classList.add('ok');m.done++;setTimeout(sfx.coin,120);
      setTimeout(()=>{cur.classList.replace('ok','done');b.classList.replace('ok','done');},450);
      if(m.done>=m.n){const c=$('#check');if(c)c.disabled=false;setTimeout(()=>{if(Q&&Q.qs[Q.i]===q&&!Q.locked)check();},700);}
    }else{
      m.mist++;sfx.bad();cur.classList.add('bad');b.classList.add('bad');
      setTimeout(()=>{cur.classList.remove('bad');b.classList.remove('bad');},450);
    }
  });
}
function renderText(q){
  const ans=$('#ans'),pw=$('#padwrap');
  const en=EN(),ph=en?'Type in English':'Gõ bằng tiếng Anh';
  Q.typed='';
  ans.innerHTML=`<div class="duo-type" id="tbox" aria-live="polite"><span class="ph">${ph}</span><i class="caret"></i></div>`;
  const btn=k=>`<button type="button" data-k="${k}"${k==="'"?' aria-label="Dấu nháy"':''}>${k}</button>`;
  const hasDigit=/\d/.test(q.answer);
  pw.innerHTML=`<div class="duo-kb">${hasDigit?`<div class="kr">${'1234567890'.split('').map(btn).join('')}</div>`:''}
    <div class="kr">${'qwertyuiop'.split('').map(btn).join('')}</div>
    <div class="kr">${'asdfghjkl'.split('').map(btn).join('')}</div>
    <div class="kr">${'zxcvbnm'.split('').map(btn).join('')}<button type="button" class="wide" data-k="B" aria-label="Xóa một chữ">⌫</button></div>
    <div class="kr"><button type="button" data-k="'" aria-label="Dấu nháy">'</button><button type="button" class="sp" data-k=" ">${en?'space':'dấu cách'}</button><button type="button" data-k="-" aria-label="Gạch nối">-</button></div></div>`;
  const draw=()=>{const box=$('#tbox');if(!box)return;box.innerHTML=(Q.typed?esc(Q.typed).replace(/ /g,'&nbsp;'):`<span class="ph">${ph}</span>`)+'<i class="caret"></i>';
    const c=$('#check');if(c)c.disabled=!norm(Q.typed);};
  const key=k=>{
    if(Q.locked||Q.qs[Q.i]!==q)return;
    if(k==='B')Q.typed=Q.typed.slice(0,-1);
    else if(Q.typed.length<40)Q.typed+=(Q.typed===''&&k===' ')?'':k;
    draw();
  };
  Q.tkey=key;
  pw.querySelectorAll('button').forEach(b=>b.onclick=()=>{sfx.tap();key(b.dataset.k);});
}
/* bàn phím máy tính: gõ chữ/số, Backspace; Enter do bộ xử lý phím gốc của app lo */
document.addEventListener('keydown',e=>{
  if(!Q||!Q.tkey||Q.locked||!Q.qs||!Q.qs[Q.i]||Q.qs[Q.i].type!=='text'||document.querySelector('.modal'))return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Backspace'){e.preventDefault();Q.tkey('B');}
  else if(e.key.length===1&&/[\p{L}\p{N}' \-]/u.test(e.key)){e.preventDefault();Q.tkey(e.key.toLowerCase());}
});
function renderBank(q){
  const ans=$('#ans');Q.placed=[];
  ans.innerHTML=`<div class="duo-line" id="dline"></div><div class="duo-pool" id="dpool"></div>`;
  drawBank(q);
}
function drawBank(q){
  const line=$('#dline'),pool=$('#dpool');
  line.innerHTML=Q.placed.map(k=>`<button type="button" class="chip" data-k="${k}">${esc(q.items[k])}</button>`).join('');
  pool.innerHTML=q.items.map((t,k)=>`<button type="button" class="chip${Q.placed.includes(k)?' ghost':''}" data-k="${k}"${Q.placed.includes(k)?' tabindex="-1" aria-hidden="true"':''}>${esc(t)}</button>`).join('');
  line.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{if(Q.locked)return;sfx.tap();Q.placed=Q.placed.filter(x=>x!==+b.dataset.k);drawBank(q);});
  pool.querySelectorAll('.chip:not(.ghost)').forEach(b=>b.onclick=()=>{if(Q.locked)return;sfx.tap();if(q.dir==='vi2en')sayEn(q.items[+b.dataset.k]);Q.placed.push(+b.dataset.k);drawBank(q);});
  const c=$('#check');if(c)c.disabled=!Q.placed.length;
}
const _renderAnswer=renderAnswer;
renderAnswer=function(q){
  if(q&&q.type==='match')return renderMatch(q);
  if(q&&q.type==='text')return renderText(q);
  if(q&&q.type==='bank')return renderBank(q);
  return _renderAnswer.apply(this,arguments);
};
function customOk(q){
  if(q.type==='match')return !!Q.mm&&Q.mm.done>=q.pairs.length&&Q.mm.mist<=1;
  if(q.type==='text'){const v=norm(Q.typed);return !!v&&[q.answer].concat(q.alts||[]).some(a=>norm(a)===v);}
  if(q.type==='bank')return Q.placed.map(k=>norm(q.items[k])).join(' ')===q.tokens.map(norm).join(' ');
  return false;
}

/* ---------------- combo + làm lại câu sai ---------------- */
const reviewable=()=>!!Q&&Q.qs&&(!Q.mode||Q.mode==='en'||Q.mode==='tv');
function setCombo(pop){
  const el=document.querySelector('.duo-combo');if(!el||!Q)return;
  const n=Q.combo||0;el.textContent=n>=2?'COMBO x'+n:'';el.classList.toggle('gold',n>=5);
  el.classList.remove('pop');if(pop&&n>=2){void el.offsetWidth;el.classList.add('pop');}
  const bar=document.querySelector('.quiz .bar');if(bar)bar.classList.toggle('gold',n>=5);
}
function decorate(){
  const quiz=document.querySelector('.quiz');if(!quiz||!Q||!Q.qs)return;
  const q=Q.qs[Q.i];
  if(!quiz.querySelector('.duo-combo')){const d=document.createElement('div');d.className='duo-combo';quiz.insertBefore(d,quiz.firstChild);}
  setCombo(false);
  const head=quiz.querySelector('.qhead');
  if(Q.review&&head){const t=document.createElement('div');t.className='duo-rvtag';t.textContent=EN()?'Practice mistakes':'Ôn lại câu sai';head.parentNode.insertBefore(t,head);}
  const bs=$('#bubSay');if(bs&&q)bs.onclick=()=>q.bubbleLang==='en'?sayEn(q.bubble):sayVi(q.bubble);
  }
const _renderQ=renderQ;
renderQ=function(){_renderQ.apply(this,arguments);try{decorate();}catch(e){}};

const fresh=q=>{const c=JSON.parse(JSON.stringify(q));delete c._sh;if(c.type==='order'&&c.items)c.items=shuffle(c.items);if(c.type==='bank')c.items=shuffle(c.items);return c;};
const _check=check;
check=function(){
  const q=Q&&Q.qs&&Q.qs[Q.i];
  if(!q||Q.locked||!reviewable()&&!CUSTOM[q.type])return _check.apply(this,arguments);
  const rv=!!Q.review,sk=q.skill;
  const snap=rv?{c:Q.correct,coins:Q.coins,secs:Q.secs?JSON.stringify(Q.secs):null,sd:Q.skillDelta?JSON.stringify(Q.skillDelta):null,
    st:S.stats&&S.stats[sk]?{c:S.stats[sk].c,t:S.stats[sk].t}:null}:null;
  if(CUSTOM[q.type]){
    const ok=customOk(q),t=q.type;q.type='mc';Q.sel=ok?q.answer:'\u0000';
    try{_check.apply(this,arguments);}finally{q.type=t;}
    const tb=$('#tbox');if(tb)tb.classList.add('off');
  }else _check.apply(this,arguments);
  const sh=$('#sheet'),bad=!!sh&&sh.classList.contains('bad');
  if(rv){   /* vòng ôn lại không tính điểm, xu, thống kê */
    Q.correct=snap.c;Q.coins=snap.coins;Q.secs=snap.secs?JSON.parse(snap.secs):undefined;Q.skillDelta=snap.sd?JSON.parse(snap.sd):undefined;
    if(Q.secs===undefined)delete Q.secs;if(Q.skillDelta===undefined)delete Q.skillDelta;
    if(snap.st){S.stats[sk].c=snap.st.c;S.stats[sk].t=snap.st.t;}else if(S.stats)delete S.stats[sk];
    try{save();}catch(e){}
    const fc=sh&&sh.querySelector('.fb-coin');if(fc)fc.remove();
  }
  if(bad&&q.type!=='speak')(Q.rvWrong||(Q.rvWrong=[])).push(q);
  Q.combo=bad?0:(Q.combo||0)+1;
  setCombo(true);
  if(!bad&&Q.combo>=3&&sh){const d=document.createElement('div');d.className='fb-combo';d.textContent='🔥 COMBO x'+Q.combo;const b=sh.querySelector('.btn');if(b)b.parentNode.insertBefore(d,b);}
};

function reviewIntro(n,go){
  const en=EN();
  const t1=en?"Let's fix the mistakes!":'Ôn lại các câu làm sai';
  const t2=en?`You have ${n} question${n>1?'s':''} to try again. Get them all right to finish! (Con còn ${n} câu cần làm lại.)`:`Con còn ${n} câu cần làm lại. Làm đúng hết mới hoàn thành bài nhé!`;
  app.innerHTML=`<div class="quiz"><div class="duo-combo"></div><div class="qtop"><button class="icon-btn" id="quit" aria-label="Thoát bài">✕</button><div class="bar"><i style="width:100%"></i></div></div><div class="duo-rv"><div class="duo-rv-ic" aria-hidden="true">🦉</div><h1>${esc(t1)}</h1><p>${esc(t2)}</p><button class="btn btn-go" id="rvGo">${en?'Start':'Bắt đầu'}</button></div></div>`;
  $('#quit').onclick=confirmQuit;$('#rvGo').onclick=go;setCombo(false);
  if(typeof say==='function'&&S.autoRead!==false)setTimeout(()=>{if(document.getElementById('rvGo'))say(`Ôn lại ${n} câu làm sai nhé!`,true);},350);
}
const _finish=finish;
finish=function(){
  if(!reviewable()||Q.mode&&Q.mode==='exam')return _finish.apply(this,arguments);
  const pend=Q.rvWrong||[];
  if(pend.length){
    try{
      Q.orig=Q.orig||Q.qs;Q.review=true;Q.round=(Q.round||0)+1;Q.rvTotal=Math.max(Q.rvTotal||0,pend.length);Q.gamePlayed=true;
      Q.rvWrong=[];Q.qs=pend.map(fresh);Q.i=0;Q.locked=false;
      reviewIntro(Q.qs.length,()=>renderQ());
      return;
    }catch(e){if(Q.orig){Q.qs=Q.orig;Q.orig=null;}Q.review=false;}
  }
  const hadReview=!!Q.review,rvN=Q.rvTotal||0;
  if(Q.orig){Q.qs=Q.orig;Q.orig=null;}Q.review=false;Q.i=Q.qs.length;
  const r=_finish.apply(this,arguments);
  if(hadReview){const res=document.querySelector('.result');if(res){const p=document.createElement('p');p.className='duo-rvnote';p.textContent=(EN()?'💪 You fixed all your mistakes! (Con đã làm lại ':'💪 Con đã làm lại ')+rvN+' câu sai đến khi đúng hết'+(EN()?')':'!');const rw=res.querySelector('.rewards');if(rw)res.insertBefore(p,rw);else res.appendChild(p);}}
  return r;
};
})();
