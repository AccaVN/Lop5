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
