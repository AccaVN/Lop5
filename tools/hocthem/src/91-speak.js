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
