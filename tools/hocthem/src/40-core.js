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
  if(q.gen&&TDG[q.gen]){const L=q.td!=null?tdLesson(q.td):null;if(L)return tdMake(L,q.lv||0);try{const n=TDG[q.gen](GRADE,q.lv||0);return Object.assign(n,{skill:q.skill,gen:q.gen,lv:q.lv,secLab:q.secLab,hard:q.hard,td:q.td});}catch(e){return null;}}
  if(isMainQ()&&typeof MATH_BANK!=='undefined'&&MATH_BANK&&!q.hard){try{const w=Math.floor(Q.level/6),d=Q.level%6;const nested=Array.isArray(MATH_BANK[w][0]);const pool=nested?MATH_BANK[w][d]:MATH_BANK[w];
    const used=new Set((Q.orig||Q.qs).map(x=>qKey(x)));const cands=pool.filter(x=>x&&x.skill===q.skill&&x.type===q.type&&!used.has(qKey(x))&&qKey(x)!==qKey(q));
    if(cands.length){const n=JSON.parse(JSON.stringify(pick(cands)));if(n.type==='order'&&n.items)n.items=shuffle(n.answer.slice());return n;}}catch(e){}}
  return null;}
