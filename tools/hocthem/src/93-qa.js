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
/* normEn bỏ "am" (hiểu là a.m.) → giữ lại để phân biệt "I am". keep=true: giữ a/an/the để chấm mạo từ */
function qaNorm(t,keep){return normEn(qaUnc(t).replace(/\bam\b/gi,'qqam')).map(w=>w==='qqam'?'am':QA_SP[w]||w).filter(w=>keep||!QA_ART.has(w));}
function qaClean(t,keep){const w=qaNorm(t,keep);while(w.length&&QA_FILL.has(w[0]))w.shift();return w;}
const qaStem=w=>w.length>4&&/ies$/.test(w)?w.slice(0,-3)+'y':w.length>3&&/(s|x|ch|sh)es$/.test(w)?w.slice(0,-2):w.length>2&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w;
/* 3 mức so khớp: 'x' = đúng từng từ, kể cả a/an/the và âm s cuối (được 5★)
   'a' = đúng từ nhưng thiếu/sai a/an/the · 'l' = thêm cả thiếu/thừa s cuối (book ≠ books) — hai mức này chỉ để báo lỗi cho con */
const qaEq=(md,a,b)=>md==='l'?qaStem(a)===qaStem(b):a===b;
/* mẫu → danh sách token {slot} | {opt, alts:[[từ…]…]} */
const QA_TPL=new Map();
function qaTpl(t,keep){const ck=(keep?'1':'0')+t;if(QA_TPL.has(ck))return QA_TPL.get(ck);const out=[];
  String(t).replace(/[{][^}]*[}]/g,'*').replace(/[.,!?]/g,' ').split(/\s+/).filter(Boolean).forEach(raw=>{
    if(raw==='*'){out.push({slot:true});return;}
    const opt=/^\[.*\]$/.test(raw);const inner=opt?raw.slice(1,-1):raw;
    const alts=inner.split('/').map(a=>qaNorm(a.replace(/_/g,' '),keep)).filter(a=>a.length);
    if(alts.length)out.push({opt,alts});});
  QA_TPL.set(ck,out);return out;}
/* tìm mọi cách khớp mẫu P với một đoạn liên tiếp của câu A (bắt đầu tại s) */
function qaMatchAt(P,A,s,md){const res=[];
  const go=(pi,ai,slot)=>{if(res.length>40)return;if(pi===P.length){res.push({end:ai,slot});return;}
    const t=P[pi];
    if(t.slot){for(let k=1;k<=5&&ai+k<=A.length;k++)go(pi+1,ai+k,slot.concat([A.slice(ai,ai+k)]));return;}
    if(t.opt)go(pi+1,ai,slot);
    t.alts.forEach(seq=>{let ok=ai+seq.length<=A.length;for(let k=0;ok&&k<seq.length;k++)if(!qaEq(md,A[ai+k],seq[k]))ok=false;if(ok)go(pi+1,ai+seq.length,slot);});};
  go(0,s,[]);return res;}
function qaMatch(tpl,A,md){md=md||'l';const P=qaTpl(tpl,md==='x');if(!P.length)return null;let best=null;
  for(let s=0;s<A.length;s++)qaMatchAt(P,A,s,md).forEach(m=>{const span=m.end-s;const sc=span*2-(s>0?1:0)+(m.end===A.length?1:0);if(!best||sc>best.sc)best={sc,start:s,end:m.end,slot:m.slot};});
  return best;}
const qaNoArt=seg=>seg.filter(w=>!QA_ART.has(w));
/* từ con điền có trong danh sách không (stem=true: tha s cuối) */
function qaWordOk(it,seg,stem){if(it.open)return true;const f=stem?qaStem:(w=>w);const set=new Set(it.words.map(w=>qaNorm(w).map(f).join(' ')));
  const toks=qaNoArt(seg).map(f);for(let a=0;a<toks.length;a++)for(let b=a+1;b<=toks.length;b++)if(set.has(toks.slice(a,b).join(' ')))return true;return false;}
/* đổi từ con nói sai s cuối về từ đúng trong danh sách (banana → bananas) */
function qaWordFix(it,seg){if(it.open||!seg)return seg;const T=qaNoArt(seg);const st=T.map(qaStem).join(' ');
  for(const w of it.words){const n=qaNorm(w);if(n.map(qaStem).join(' ')===st)return n;}
  for(const w of it.words){const n=qaNorm(w);if(n.length===1&&T.some(x=>qaStem(x)===qaStem(n[0])))return n;}return T;}
function qaKnown(it,A){if(it.open||!it.words.length)return null;const set=it.words.map(w=>qaNorm(w).map(qaStem));const T=A.map(qaStem);
  for(const w of set)for(let a=0;a+w.length<=T.length;a++)if(w.every((x,k)=>T[a+k]===x))return A.slice(a,a+w.length);return null;}
function qaLcs(a,b){const m=a.length,n=b.length;if(!m||!n)return 0;let pr=new Array(n+1).fill(0);for(let i=1;i<=m;i++){const cu=[0];for(let k=1;k<=n;k++)cu[k]=qaStem(a[i-1])===qaStem(b[k-1])?pr[k-1]+1:Math.max(pr[k],cu[k-1]);pr=cu;}return pr[n];}
/* điền từ của con vào câu mẫu (viết hoa nếu chỗ trống trong câu mẫu viết hoa: tên riêng, thứ, tháng) */
const qaFill=(it,seg,ti)=>{const base=it.exs[ti>0&&ti<it.exs.length?ti:0];const m=base.match(/\{([^}]*)\}/);if(!seg||!m)return base.replace(/[{}]/g,'');
  const up=/^[A-Z]/.test(m[1]);return base.replace(m[0],qaNoArt(seg).map(w=>up?w[0].toUpperCase()+w.slice(1):w).join(' '));};
const qaSent=t=>{t=qaCap(String(t).replace(/\s+/g,' ').trim());return /[.!?]$/.test(t)?t:t+'.';};
const qaCap=s=>{s=String(s).trim();return s?s[0].toUpperCase()+s.slice(1):s;};
const qaYN=it=>/^(yes|no)\b/i.test(it.ex);
/* chấm 1 câu trả lời (chuỗi) → {stars, fb, better, heard}. Chỉ câu đúng từng từ (cả a/an/the, âm s cuối) mới được 5★. */
function qaGrade1(it,text){const A=qaClean(text);if(!A.length)return {stars:0,heard:''};
  const AX=qaClean(text,true);
  const full=it.exs.concat(it.alts.filter(a=>a[0]!=='='));const short=it.alts.filter(a=>a[0]==='=').map(a=>a.slice(1));
  let best=null;
  /* câu đầy đủ: thử lần lượt mức x → a → l; mức đầu tiên khớp mẫu quyết định loại lỗi */
  for(const md of ['x','a','l']){const B=md==='x'?AX:A;let mb=null;
    full.forEach((t,ti)=>{const m=qaMatch(t,B,md);if(!m)return;const cov=(m.end-m.start)/B.length;if(qaTpl(t,md==='x').filter(x=>!x.slot).length<2&&cov<.6)return;
      const seg=m.slot[m.slot.length-1]||null;const exact=!m.slot.length||m.slot.every(sg=>qaWordOk(it,sg,false));const stem=exact||m.slot.every(sg=>qaWordOk(it,sg,true));
      const kind=exact?(md==='x'?'full':md==='a'?'art':'s'):stem?'s':'fullUnk';const sc=(kind==='fullUnk'?8:10)+cov;
      if(!mb||sc>mb.sc)mb={sc,kind,seg,ti};});
    if(mb&&mb.kind!=='fullUnk'){best=mb;break;}if(mb&&!best)best=mb;}
  if(!best){short.forEach(t=>{const m=qaMatch(t,A);if(!m||(it.open&&m.slot.length&&A.length>3))return;const seg=m.slot[m.slot.length-1]||null;if(m.slot.length&&!m.slot.every(sg=>qaWordOk(it,sg,true)))return;
      const cov=(m.end-m.start)/A.length;if(cov<.5)return;const sc=5+cov;if(!best||sc>best.sc)best={sc,kind:'short',seg};});}
  if(!best){const kw=qaKnown(it,A);
    if(kw&&A.length<=kw.length+1)best={kind:'short',seg:kw};
    else if(qaYN(it)&&A.length<=2&&/^(yes|no)$/.test(A[0]))best={kind:'short',seg:null,yn:A[0]};
    else if(it.open&&A.length<=3&&!qaYN(it))best={kind:'short',seg:A};
    else{const T=qaTpl(it.ex).filter(t=>!t.slot).map(t=>t.alts[0]).flat();
      const l=qaLcs(A,T),r=l/Math.max(T.length,1),ra=l/A.length;
      best={kind:r>=.6&&ra>=.5&&A.length>=2?'near':kw||(r>=.3&&ra>=.25)?'topic':'off',seg:kw};}}
  const yi=best.yn?Math.max(0,it.exs.findIndex(x=>x.toLowerCase().startsWith(best.yn))):best.ti;
  const seg=best.kind==='s'||best.kind==='short'?qaWordFix(it,best.seg):best.seg;
  const better=best.kind==='full'?qaSent(text):best.kind==='fullUnk'?it.show:qaCap(qaFill(it,seg,yi));
  const stars={full:5,art:4,s:4,fullUnk:3,short:3,near:3,topic:2,off:1}[best.kind];
  const fb={full:'Con trả lời đúng ý và nói đúng cả câu. Giỏi lắm!',art:'Đúng ý rồi, nhưng con thiếu hoặc dùng sai a / an / the. Con nghe câu đúng và nói lại nhé.',
    s:'Đúng ý rồi, nhưng con thiếu hoặc thừa âm s cuối từ (vd. book ≠ books). Con nghe câu đúng và nói lại nhé.',
    fullUnk:'Con nói đúng mẫu câu rồi, nhưng có từ chưa đúng (con chọn sai từ hoặc đọc chưa rõ nên máy nghe thành từ khác). Con nghe câu đúng nhé.',
    short:'Con trả lời đúng ý rồi! Lần sau con thử nói cả câu nhé.',near:'Gần đúng rồi! Con nói lại theo câu mẫu cho đủ từ nhé.',
    topic:'Con đã hiểu câu hỏi. Con nghe câu mẫu rồi trả lời lại cả câu nhé.',off:'Câu trả lời chưa khớp với câu hỏi. Con nghe lại câu hỏi và câu mẫu nhé.'}[best.kind];
  return {stars,fb,better,heard:text,kind:best.kind};}
/* chỉ chấm câu máy nghe được đầu tiên — không chọn phương án nhận dạng khác “đẹp” hơn (không tha lỗi phát âm) */
function qaGrade(it,alts){const t=(alts||[]).find(x=>String(x||'').trim());return t?qaGrade1(it,t):{stars:0,heard:''};}

/* ---------- chấm bằng AI (máy chủ) ---------- */
let QA_AI=null;// null = chưa hỏi, true/false
function qaAiCheck(){if(QA_AI!==null||!LOGGED())return;QA_AI=false;fetch(API_BASE+'/qa/status').then(r=>r.json()).then(d=>{QA_AI=!!(d&&d.ai);}).catch(()=>{QA_AI=null;});}
function qaAiGrade(it,answer,alts){const U=typeof EN_UNITS!=='undefined'?EN_UNITS[it.u]:null;
  const p=apiPost('/qa/grade',{grade:GRADE,topic:U?U.t:'',question:it.q,samples:it.exs.map(x=>x.replace(/[{}]/g,'')),answer});
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
    try{const a=await qaAiGrade(it,r.heard,alts);if(a&&a.stars){const sameBetter=qaNorm(a.better,true).join(' ')===qaNorm(r.heard,true).join(' ');
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
