/* ================= GHI ÂM + CHẤM SAO TRONG 1 LẦN ĐỌC (luyện nói câu / đoạn văn) =================
   Trước đây một số điện thoại Android không cho vừa ghi âm vừa nhận dạng giọng nói → con đọc xong app báo
   “đọc lại một lần nữa”, và từ đó chỉ chấm sao, không ghi âm. Nay con chỉ đọc 1 lần:
   1. Chrome/Edge ≥ 133: nhận dạng nghe từ CHÍNH luồng micro đang ghi âm (SpeechRecognition.start(track)).
   2. Máy vẫn tranh micro: giữ bản ghi âm, gửi lên máy chủ nhận dạng (/api/stt, cần khóa Google) rồi chấm.
   3. Không có cả hai: như cũ (máy chỉ chấm sao, không ghi âm).
   Dùng chung cho recordAndScore (câu, từ) và recLong (đoạn văn). */
const MIC_KEY=(typeof KEY==='string'?KEY:'hv')+'_mic';
const micF=(()=>{try{return JSON.parse(localStorage.getItem(MIC_KEY)||'{}')||{};}catch(e){return {};}})();
const micSave=()=>{try{localStorage.setItem(MIC_KEY,JSON.stringify(micF));}catch(e){}};
const SR_TRACK_OK=(()=>{const ua=navigator.userAgent||'';const m=/Chrome\/(\d+)/.exec(ua);return !!m&&+m[1]>=133&&!/iPhone|iPad|iPod/.test(ua);})();
const srUseTrack=()=>SR_TRACK_OK&&!micF.trackBad;
/* máy không cho dùng chung micro: lần sau ghi âm + nhận dạng trên máy chủ (nếu có), hoặc chỉ nhận dạng */
function micConflict(track){if(track)micF.trackBad=1;else micF.seq=1;micSave();if(!srUseTrack()){recSeq=true;}}
if(micF.seq)recSeq=true;
let STT_OK=null;
function sttCheck(){if(STT_OK!==null||!LOGGED())return;STT_OK=false;fetch(API_BASE+'/stt/status').then(r=>r.json()).then(d=>{STT_OK=!!(d&&d.ok);}).catch(()=>{STT_OK=null;});}
sttCheck();
const sttOn=mime=>STT_OK===true&&LOGGED()&&/webm|ogg/.test(mime||'');
async function sttSend(blob,ms){syncTok();const r=await fetch(API_BASE+'/stt',{method:'POST',headers:{'Content-Type':blob.type||'audio/webm','Authorization':'Bearer '+TOKEN,'X-Audio-Ms':String(Math.round(ms))},body:blob});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'stt');return String(d.text||'').trim();}
function srStart(sr,stream){const tr=stream&&srUseTrack()&&stream.getAudioTracks?stream.getAudioTracks()[0]:null;
  if(tr&&tr.readyState==='live'){try{sr.start(tr);sr._track=true;return;}catch(e){if(e&&e.name==='InvalidStateError'&&/already/i.test(e.message||''))throw e;}}
  sr._track=false;sr.start();}
/* đo âm lượng: biết con có nói, và lúc nào con im (để tự dừng khi không có nhận dạng) */
function vad2(stream){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC||!stream)return null;const ac=new AC();try{ac.resume&&ac.resume();}catch(e){}
  const an=ac.createAnalyser();an.fftSize=1024;ac.createMediaStreamSource(stream).connect(an);const buf=new Float32Array(an.fftSize);let floor=.005;
  let closed=false;const st={ms:0,last:0,stop(){clearInterval(t);if(closed)return;closed=true;try{const p=ac.close();p&&p.catch&&p.catch(()=>{});}catch(e){}}};
  const t=setInterval(()=>{try{an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];const rms=Math.sqrt(s/buf.length);if(rms>Math.max(.02,floor*4)){st.ms+=100;st.last=Date.now();}else floor=floor*.95+rms*.05;}catch(e){}},100);return st;}catch(e){return null;}}

/* o: {target, maxMs, silMs, maxRestarts, score(alts)→r, full(r)→bool (đọc đủ → dừng sớm), fullMs, onLive(r), btn, cb(res)} */
async function recCore(o){
  if(REC.active){REC.active.stop();return;}
  stopVoice();
  const canRec=typeof MediaRecorder!=='undefined'&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;
  if(!canRec&&!SR_API){toast('Thiết bị này chưa hỗ trợ ghi âm. Con mở bằng Chrome nhé!');return;}
  let stream=null,mr=null,chunks=[],vad=null,sr=null,finished=false,timer=null,silTimer=null,srErr='',fatal=false,userStop=false,srRunning=false,restarts=0,heardAt=0,micErr='',liveT=0;
  let srDone=true,mrDone=true,useSR=!!SR_API,dropRec=false,srRetry=false,srRetried=false;
  const segs=[];let sess=[];const t0=Date.now();
  AUDIO_REC=true;iosAudioPause();setAudioSession('play-and-record');
  const relMic=()=>{try{vad&&vad.stop();}catch(e){}try{stream&&stream.getTracks().forEach(t=>t.stop());}catch(e){}stream=null;};
  const mime=()=>(mr&&mr.mimeType)||'audio/webm';
  /* chế độ: máy đã biết tranh micro mà không dùng được track → có máy chủ nhận dạng thì chỉ ghi âm, không thì chỉ nhận dạng */
  const conflictDev=SR_API&&recSeq&&!srUseTrack();
  const wantRec=canRec&&!(conflictDev&&STT_OK!==true);
  if(conflictDev&&STT_OK===true&&LOGGED())useSR=false;
  if(wantRec){try{stream=await navigator.mediaDevices.getUserMedia({audio:true});const mt=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4','audio/aac'].find(x=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x));
      mr=new MediaRecorder(stream,mt?{mimeType:mt}:undefined);mrDone=false;mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};mr.onstop=()=>{mrDone=true;finish();};mr.onerror=()=>{mrDone=true;dropRec=true;finish();};mr.start(1000);vad=vad2(stream);}
    catch(e){micErr=e&&e.name==='NotAllowedError'?'not-allowed':'audio-capture';relMic();mr=null;mrDone=true;
      if(!SR_API){AUDIO_REC=false;setAudioSession(IS_IOS?'playback':'auto');toast(micErr==='not-allowed'?'Con cần cho phép dùng micro để ghi âm nhé!':'Không mở được micro. Con tắt ứng dụng khác đang dùng micro rồi thử lại nhé!');return;}
      useSR=true;}}
  if(!useSR&&!mr){AUDIO_REC=false;setAudioSession(IS_IOS?'playback':'auto');toast('Không mở được micro. Con thử lại nhé!');return;}
  if(useSR)srDone=false;
  const alts=()=>srCandidates(segs.concat(sess),o.target);
  const result=(r,url)=>{o.cb({...r,url});};
  /* chấm bằng bản ghi âm trên máy chủ (không bắt con đọc lại) */
  const viaServer=(blob,url,why)=>{o.cb({pending:true,url});
    sttSend(blob,Date.now()-t0).then(tx=>{if(!tx){o.cb({noScore:true,url,error:'no-speech'});return;}result(o.score([tx]),url);})
      .catch(()=>{STT_OK=false;o.cb({noScore:true,url,error:why||'sr-busy'});});};
  const finish=()=>{if(finished||!srDone||!mrDone)return;finished=true;clearTimeout(timer);clearTimeout(silTimer);REC.active=null;if(o.btn)o.btn.classList.remove('rec-on');
    const spoke=vad&&vad.ms>=800;relMic();
    AUDIO_REC=false;setTimeout(()=>{if(!AUDIO_REC)setAudioSession(IS_IOS?'playback':'auto');},300);
    const blob=chunks.length&&!dropRec?new Blob(chunks,{type:mime()}):null;const url=blob?URL.createObjectURL(blob):null;
    const A=useSR?alts():[];
    if(!useSR){/* chỉ ghi âm: nhận dạng trên máy chủ, hoặc không chấm được */
      if(blob&&sttOn(mime())&&spoke){viaServer(blob,url,'no-speech');return;}
      o.cb({noScore:true,url,error:SR_API?(spoke?'sr-busy':'no-speech'):micErr});return;}
    /* con CÓ nói (micro bắt được tiếng) mà nhận dạng không ra chữ: máy không cho dùng chung micro */
    if(!A.length&&mr&&!dropRec&&spoke&&!fatal&&srErr!=='network'){micConflict(sr&&sr._track);
      if(blob&&sttOn(mime())){viaServer(blob,url);return;}
      o.cb({noScore:true,url,error:'sr-busy'});return;}
    if(srErr&&!A.length&&srErr!=='no-speech'&&srErr!=='aborted'){if(blob&&sttOn(mime())&&spoke){viaServer(blob,url,srErr);return;}o.cb({noScore:true,url,error:srErr||micErr});return;}
    result(o.score(A),url);};
  const endAll=()=>{srDone=true;if(mr&&mr.state!=='inactive'){try{mr.stop();}catch(_){mrDone=true;}}finish();};
  const stopAll=()=>{userStop=true;clearTimeout(silTimer);if(srRunning){try{sr.stop();}catch(e){srRunning=false;endAll();}}else endAll();};
  const startSR=()=>{sr=new SR_API();sr.lang='en-US';sr.interimResults=true;sr.maxAlternatives=5;sr.continuous=true;
    sr.onresult=e=>{const c=[];for(let i=0;i<e.results.length;i++){const R=e.results[i],a=[];for(let k=0;k<R.length;k++){const tx=String(R[k].transcript||'').trim();if(tx)a.push(tx);}if(a.length)c.push(a);}
      sess=c;if(!c.length)return;heardAt=Date.now();if(srErr==='no-speech')srErr='';clearTimeout(silTimer);
      let r=null;if(o.onLive||o.full){if(!o.onLive||Date.now()-liveT>350){liveT=Date.now();try{r=o.score(alts());if(o.onLive)o.onLive(r);}catch(_){}}}
      if(r&&o.full&&o.full(r)){silTimer=setTimeout(stopAll,o.fullMs||800);return;}
      silTimer=setTimeout(stopAll,o.silMs);};
    sr.onerror=e=>{const er=e.error||'error';if(er==='no-speech'||er==='aborted'){if(!srErr)srErr=er;return;}
      /* micro bị máy ghi âm giữ: có máy chủ nhận dạng → giữ bản ghi âm, tắt nhận dạng (con vẫn đọc 1 lần);
         không có → nhường micro cho nhận dạng ngay trong lượt này (bỏ bản ghi âm) */
      if(er==='audio-capture'&&mr&&!heardAt&&!srRetried){srRetried=true;micConflict(sr._track);
        if(sttOn(mime())){useSR=false;srDone=true;sr._dead=true;vadWatch();return;}
        srRetry=true;dropRec=true;try{if(mr.state!=='inactive')mr.stop();}catch(_){mrDone=true;}relMic();return;}
      srErr=er;if(/not-allowed|service-not-allowed|audio-capture|language-not-supported|network/.test(er))fatal=true;
      if(er==='not-allowed'&&!mr)toast('Con cần cho phép dùng micro để ghi âm nhé!');};
    sr.onend=()=>{srRunning=false;if(sess.length){segs.push(...sess);sess=[];}
      if(sr._dead){if(mr&&mr.state==='recording')return;finish();return;}
      if(srRetry){srRetry=false;setTimeout(()=>{if(userStop||finished){endAll();return;}try{srStart(sr,null);srRunning=true;}catch(e){srErr='audio-capture';endAll();}},250);return;}
      const left=o.maxMs-(Date.now()-t0);
      let full=false;try{full=!!(o.full&&segs.length&&o.full(o.score(alts())));}catch(_){}
      if(!userStop&&!fatal&&!finished&&left>1200&&restarts<o.maxRestarts&&!full&&!(heardAt&&Date.now()-heardAt>o.silMs)){restarts++;try{srStart(sr,stream);srRunning=true;return;}catch(e){}}
      if(fatal&&!userStop&&!finished&&mr&&mr.state==='recording'){srDone=true;toast('Con đọc xong thì bấm 🎤 lần nữa để dừng nhé!');return;}
      endAll();};
    try{srStart(sr,stream);srRunning=true;}catch(e){srRunning=false;srDone=true;srErr='start';}};
  if(useSR)startSR();
  /* không có nhận dạng: tự dừng khi con im lặng sau khi đã nói */
  function vadWatch(){if(!vad)return;const iv=setInterval(()=>{if(finished){clearInterval(iv);return;}if(vad.last&&Date.now()-vad.last>o.silMs+500){clearInterval(iv);stopAll();}},300);}
  if(!useSR)vadWatch();
  if(o.btn)o.btn.classList.add('rec-on');sfx.tap();
  REC.active={stop:stopAll};timer=setTimeout(()=>REC.active&&REC.active.stop(),o.maxMs);
  if(srDone&&!mr)finish();}

/* câu / từ: thay hàm cũ trong app (cùng cách chấm, cùng thời gian chờ) */
recordAndScore=function(target,cb,btn,opts){
  const sc=a=>scoreSpeech(target,a,opts);
  return recCore({target,maxMs:Math.min(20000,6000+String(target).length*160),silMs:opts&&opts.soft?4500:3000,maxRestarts:8,score:sc,
    full:r=>r.stars>=5&&r.hit.size>=r.words.length,fullMs:700,btn,cb:res=>{if(res.pending){toast('⏳ Đang chấm bài đọc của con…');return;}cb(res);}});};
