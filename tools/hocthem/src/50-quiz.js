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
