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
