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
