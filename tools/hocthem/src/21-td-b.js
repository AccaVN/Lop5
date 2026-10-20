/* ---------------- TOÁN TƯ DUY: BỘ SINH ĐỀ MỞ RỘNG (10/2026, lần 3) ---------------- */
const tdEq=lines=>`<div class="ht-eqs">${lines.map(l=>`<div class="ht-eq">${l}</div>`).join('')}</div>`;
const tdTab=(rows,hid)=>`<div class="ht-grid ht-mach" style="grid-template-columns:repeat(${rows[0].length},1fr)">${rows.map((r,i)=>r.map((v,j)=>{const h=hid&&hid[0]===i&&hid[1]===j;return `<span class="${h?'hid':j===0?'hd':''}">${h?'?':typeof v==='number'?fN(v):esc(v)}</span>`;}).join('')).join('')}</div>`;
const binom=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);};

/* 21. Que diêm xếp hình */
function matchSVG(kind,k){const U=34;let b='',x0=6,W=0;const ln=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#B45309" stroke-width="4" stroke-linecap="round"/>`;
  for(let f=1;f<=3;f++){let w=0;if(kind==='sq'){for(let i=0;i<f;i++){const x=x0+i*U;b+=ln(x,10,x+U,10)+ln(x,10+U,x+U,10+U)+ln(x,10,x,10+U);}b+=ln(x0+f*U,10,x0+f*U,10+U);w=f*U;}
    else{const h=30;for(let i=0;i<f;i++){const x=x0+i*U/2;if(i%2===0)b+=ln(x,10+h,x+U/2,10)+ln(x+U/2,10,x+U,10+h)+ln(x,10+h,x+U,10+h);else b+=ln(x,10,x+U,10);}w=(f+1)*U/2;}
    b+=`<text x="${x0+w/2}" y="${10+U+18}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">Hình ${f}</text>`;x0+=w+26;W=x0;}
  return SVGW(W,10+U+26,b,'Que diêm xếp hình');}
TDG.matchSeq=function(G,lv){const kind=RP(['sq','tri']);const a=kind==='sq'?4:3,d=kind==='sq'?3:2;const shape=kind==='sq'?'hình vuông':'hình tam giác';
  const vis=matchSVG(kind,3);const head=`An xếp que diêm thành các ${shape} như hình. Hình 1 dùng ${a} que, Hình 2 dùng ${a+d} que, Hình 3 dùng ${a+2*d} que.`;
  const nMax=G===1?6:G===2?10:G===3?20:40;
  if(lv===2&&G>=2){const n=R(5,nMax);const T=a+(n-1)*d;return Qin(`${head} Với ${T} que diêm, An xếp được đúng hình thứ mấy?`,n,{visual:vis,hints:[`Mỗi hình sau thêm ${d} que.`,`Bớt ${a} que của Hình 1: ${T} − ${a} = ${T-a}. Chia cho ${d} để biết đã thêm mấy lần.`],explain:`(${T} − ${a}) : ${d} = ${(T-a)/d}. Thêm ${(T-a)/d} lần sau Hình 1 nên là Hình ${n}.`});}
  const n=lv===0?R(4,G===1?5:6):R(G===1?5:7,nMax);const T=a+(n-1)*d;
  return Qin(`${head} Hình ${n} dùng bao nhiêu que?`,T,{visual:vis,hints:[`Mỗi hình sau thêm ${d} que: ${a}, ${a+d}, ${a+2*d}, …`,G===1?`Đếm thêm ${d} que cho đến Hình ${n}.`:`Hình ${n} = ${a} + (${n} − 1) × ${d}.`],explain:G===1?`${Array.from({length:n},(_,i)=>a+i*d).join(', ')}. Hình ${n} dùng ${T} que.`:`${a} + (${n} − 1) × ${d} = ${a} + ${(n-1)*d} = ${T} que.`});};

/* 22. Máy biến số */
TDG.machine=function(G,lv){const rules=G===1?['add','sub']:G===2?['add','sub','mul']:['mul','muladd','mulsub','add'];
  for(let t=0;t<40;t++){const k=lv===0?rules[R(0,Math.min(1,rules.length-1))]:RP(rules);const a=k==='add'||k==='sub'?1:R(2,G<=2?5:G===3?9:12),b=k==='mul'?0:R(1,G===1?9:G===2?20:G===3?30:50);
    const f=x=>k==='add'?x+b:k==='sub'?x-b:k==='mul'?a*x:k==='muladd'?a*x+b:a*x-b;const xmax=G===1?20:G===2?30:G===3?50:100;
    const xs=new Set();while(xs.size<4)xs.add(R(k==='sub'||k==='mulsub'?Math.ceil((b+1)/a):1,xmax));const X=[...xs];const Y=X.map(f);
    if(Y.some(y=>y<0||y>(G===1?100:999999)))continue;const desc=k==='add'?`cộng ${b}`:k==='sub'?`trừ ${b}`:k==='mul'?`nhân ${a}`:k==='muladd'?`nhân ${a} rồi cộng ${b}`:`nhân ${a} rồi trừ ${b}`;
    const back=lv===2&&G>=2;const hid=back?[0,4]:[1,4];const vis=tdTab([['Số vào',...X],['Số ra',...Y]],hid);const ans=back?X[3]:Y[3];
    return Qin(back?'Máy biến số làm cùng một phép tính với mọi số cho vào. Số nào đã được cho vào?':'Máy biến số làm cùng một phép tính với mọi số cho vào. Số ra còn thiếu là bao nhiêu?',ans,{visual:vis,hints:['So sánh số vào và số ra ở từng cột: thêm, bớt hay gấp lên?',`Máy ${desc}.`],explain:back?`Máy ${desc}. Làm ngược lại với ${fN(Y[3])}: được ${fN(X[3])}.`:`Máy ${desc}: ${fN(X[3])} → ${fN(Y[3])}.`});}
  return null;};

/* 23. Quy luật chữ cái */
const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
TDG.letters=function(G,lv){const kind=lv===0?'step':lv===1?RP(G===1?['step','num']:['step','num','back']):RP(G===1?['num','step']:['alt','num2','back']);
  let seq=[],ans,why;
  if(kind==='step'||kind==='back'){const d=R(1,G===1?2:3)*(kind==='back'?-1:1);const len=G===1?12:26;const st=d>0?R(0,len-1-4*d):R(-4*d,25);for(let i=0;i<4;i++)seq.push(ABC[st+i*d]);ans=ABC[st+4*d];why=d>0?`Mỗi chữ cách nhau ${d} chữ cái (nhảy ${d}).`:`Dãy đi ngược bảng chữ cái, mỗi lần lùi ${-d} chữ.`;}
  else if(kind==='num'){const d=R(1,2),e=R(1,G===1?2:3);const st=R(0,10),n0=R(1,5);for(let i=0;i<4;i++)seq.push(ABC[st+i*d]+(n0+i*e));ans=ABC[st+4*d]+(n0+4*e);why=`Chữ cái nhảy ${d}, số tăng thêm ${e} mỗi lần.`;}
  else if(kind==='num2'){const d=R(1,2);const st=R(0,12),m=R(2,3);for(let i=0;i<4;i++)seq.push(ABC[st+i*d]+(m*(i+1)));ans=ABC[st+4*d]+(m*5);why=`Chữ cái nhảy ${d}, số là bảng nhân ${m}.`;}
  else{const st=R(0,6);for(let i=0;i<3;i++){seq.push(ABC[st+i]);seq.push(ABC[25-st-i]);}seq=seq.slice(0,5);ans=ABC[25-st-2];why='Hai dãy đan xen: một dãy đi xuôi từ đầu bảng chữ cái, một dãy đi ngược từ cuối.';}
  const wrong=new Set();const near=c=>{const m=/^([A-Z])(\d*)$/.exec(c);const i=ABC.indexOf(m[1]);const alt=[ABC[(i+1)%26],ABC[(i+25)%26],ABC[(i+2)%26]];return m[2]?[alt[0]+m[2],m[1]+(+m[2]+1),alt[1]+m[2],m[1]+Math.max(0,+m[2]-1)]:alt;};
  near(ans).forEach(x=>{if(x!==ans&&wrong.size<3)wrong.add(x);});
  return Qmc('Chữ (hoặc chữ và số) tiếp theo là gì?',ans,shuffle([ans,...wrong]),{big:seq.join(', ')+', ?',hints:['Viết bảng chữ cái A B C D E… ra giấy rồi đánh dấu các chữ trong dãy.',why],explain:`${why} Đáp án: ${ans}.`});};

/* 24. Đếm đường đi trên lưới */
function pathSVG(m,n){const U=40,X=24,Y=18;let b='';for(let i=0;i<=m;i++)b+=`<line x1="${X}" y1="${Y+i*U}" x2="${X+n*U}" y2="${Y+i*U}" stroke="#334155" stroke-width="3"/>`;for(let j=0;j<=n;j++)b+=`<line x1="${X+j*U}" y1="${Y}" x2="${X+j*U}" y2="${Y+m*U}" stroke="#334155" stroke-width="3"/>`;
  b+=`<circle cx="${X}" cy="${Y}" r="7" fill="#2563EB"/><text x="${X-12}" y="${Y-4}" font-size="15" font-weight="800" fill="#2563EB">A</text><circle cx="${X+n*U}" cy="${Y+m*U}" r="7" fill="#DC2626"/><text x="${X+n*U+6}" y="${Y+m*U+18}" font-size="15" font-weight="800" fill="#DC2626">B</text>`;
  return SVGW(X+n*U+28,Y+m*U+26,b,'Lưới ô vuông từ A đến B');}
TDG.paths=function(G,lv){const P=lv===0?[[1,1],[1,2],[1,3],[2,2]]:lv===1?(G<=3?[[2,2],[1,4],[2,3]]:[[2,3],[3,3],[1,5],[2,4]]):(G<=3?[[2,3],[3,3]]:[[3,3],[2,4],[3,4],[2,5]]);let [m,n]=RP(P);if(Math.random()<.5)[m,n]=[n,m];
  const c=binom(m+n,m);return Qin(`Kiến đi từ A đến B theo các cạnh của lưới (${m} hàng, ${n} cột ô vuông). Mỗi bước kiến chỉ đi sang phải hoặc đi xuống. Có bao nhiêu đường đi khác nhau?`,c,{visual:pathSVG(m,n),hints:['Ở mỗi điểm trên cạnh trên cùng và cạnh bên trái chỉ có 1 cách đi tới.','Số cách đi tới một điểm = số cách tới điểm bên trái nó + số cách tới điểm phía trên nó.'],explain:`Ghi số cách đi tới từng điểm, cộng dần từ A. Tới B có ${c} đường.`});};

/* 25. Số cách trả tiền */
function waysPay(N,vals){let c=0;const go=(i,left)=>{if(i===vals.length){if(left===0)c++;return;}for(let k=0;k*vals[i]<=left;k++)go(i+1,left-k*vals[i]);};go(0,N);return c;}
TDG.coins=function(G,lv){const sets=lv===0?[[1,2]]:lv===1?[[1,2,5],[2,5],[1,5]]:[[1,2,5],[2,5,10],[1,2,10]];for(let t=0;t<30;t++){const V=RP(sets);const N=lv===0?R(4,G<=2?8:10):lv===1?R(G<=2?6:8,G<=2?10:14):R(10,G<=3?15:20);
  const c=waysPay(N,V);if(c<2||c>30)continue;const list=V.join(' nghìn, ')+' nghìn đồng';
  return Qin(`Mẹ có rất nhiều tờ tiền loại ${list}. Có bao nhiêu cách lấy ra đúng ${N} nghìn đồng? (Chỉ quan tâm mỗi loại lấy mấy tờ.)`,c,{hints:[`Bắt đầu từ tờ mệnh giá lớn nhất (${V[V.length-1]} nghìn): lấy 0 tờ, 1 tờ, 2 tờ…`,'Với mỗi cách lấy tờ lớn, đếm số cách lấy phần còn lại bằng tờ nhỏ hơn.'],explain:`Liệt kê lần lượt theo số tờ ${V[V.length-1]} nghìn, ta được ${c} cách.`});}return null;};

/* 26. Đếm số theo chữ số */
TDG.digitSum=function(G,lv){const two=[];for(let n=10;n<=99;n++)two.push(n);
  if(lv===2&&G>=3){const S=R(2,G===3?5:8);let c=0;for(let n=100;n<=999;n++){const s=String(n).split('').reduce((a,x)=>a+ +x,0);if(s===S)c++;}return Qin(`Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng ${S}?`,c,{hints:['Chữ số hàng trăm phải khác 0.','Lần lượt cho hàng trăm là 1, 2, 3… rồi đếm cách chọn hai chữ số còn lại.'],explain:`Đếm theo chữ số hàng trăm, cộng lại được ${c} số.`});}
  const kind=lv===0?'sum':RP(G===1?['sum','diff']:['sum','diff','prod']);
  if(kind==='sum'){const S=R(lv?9:3,lv?17:10);const L=two.filter(n=>Math.floor(n/10)+n%10===S);return Qin(`Có bao nhiêu số có hai chữ số mà tổng hai chữ số bằng ${S}?`,L.length,{hints:['Chữ số hàng chục phải khác 0.','Thử lần lượt chữ số hàng chục là 1, 2, 3…'],explain:`Đó là các số ${L.join(', ')}: có ${L.length} số.`});}
  if(kind==='diff'){const d=R(1,7);const L=two.filter(n=>Math.floor(n/10)-n%10===d);return Qin(`Có bao nhiêu số có hai chữ số mà chữ số hàng chục hơn chữ số hàng đơn vị ${d}?`,L.length,{hints:['Hàng đơn vị nhỏ nhất là 0.',`Hàng chục = hàng đơn vị + ${d}, không được quá 9.`],explain:`Đó là các số ${L.join(', ')}: có ${L.length} số.`});}
  const Pp=RP([6,8,12,18,24,36]);const L=two.filter(n=>Math.floor(n/10)*(n%10)===Pp);return Qin(`Có bao nhiêu số có hai chữ số mà tích hai chữ số bằng ${Pp}?`,L.length,{hints:[`Tìm các cặp chữ số nhân với nhau bằng ${Pp}.`,'Mỗi cặp hai chữ số khác nhau cho ta 2 số (đổi chỗ).'],explain:`Đó là các số ${L.join(', ')}: có ${L.length} số.`});};

/* 27. Cân bằng hình — mỗi hình là một số */
const FRU=['🍎','🍌','🍇','🍐','🍓','🍊','🥝'];
function eqSolve(eqs,syms,max){const out=[];const val={};const go=i=>{if(out.length>1)return;if(i===syms.length){if(eqs.every(e=>e.l.reduce((a,s)=>a+(typeof s==='number'?s:val[s]),0)===e.r.reduce((a,s)=>a+(typeof s==='number'?s:val[s]),0)))out.push({...val});return;}for(let v=1;v<=max;v++){val[syms[i]]=v;go(i+1);}};go(0);return out;}
TDG.balance=function(G,lv){const E=shuffle(FRU);const mx=G===1?10:G===2?20:G===3?50:100;
  for(let t=0;t<40;t++){let eqs,ask,vals;
    if(lv===0){const k=R(2,G===1?3:4),v=R(2,Math.floor((G===1?20:mx*2)/k));eqs=[{l:Array(k).fill(E[0]),r:[k*v]}];ask=E[0];vals={[E[0]]:v};}
    else if(lv===1){const v=R(2,Math.floor(mx/3));eqs=[{l:[E[0],E[0]],r:[E[1]]},{l:[E[1],E[0]],r:[3*v]}];vals={[E[0]]:v,[E[1]]:2*v};ask=RP([E[0],E[1]]);}
    else{const a=R(2,mx/2|0),b=R(2,mx/2|0),c=R(2,mx/2|0);if(new Set([a,b,c]).size<3)continue;if(G<=2){eqs=[{l:[E[0],E[1]],r:[a+b]},{l:[E[0]],r:[E[1],a-b]}];if(a<=b)continue;vals={[E[0]]:a,[E[1]]:b};}else{eqs=[{l:[E[0],E[1]],r:[a+b]},{l:[E[1],E[2]],r:[b+c]},{l:[E[0],E[2]],r:[a+c]}];vals={[E[0]]:a,[E[1]]:b,[E[2]]:c};}ask=RP(Object.keys(vals));}
    const syms=Object.keys(vals);if(syms.length<3&&eqSolve(eqs,syms,lv===2?mx:mx*2).length!==1)continue;
    const show=s=>s.map(x=>typeof x==='number'?fN(x):x).join(' + ');const lines=eqs.map(e=>`${show(e.l)} = ${show(e.r)}`);
    const hints=lv===0?[`${eqs[0].l.length} hình ${ask} bằng nhau có tổng ${eqs[0].r[0]}.`,`Lấy ${eqs[0].r[0]} chia cho ${eqs[0].l.length}.`]:lv===1?[`Thay ${E[1]} ở dòng 2 bằng ${E[0]} + ${E[0]}.`,`Ba hình ${E[0]} có tổng ${3*vals[E[0]]}.`]:syms.length===3?['Cộng cả ba dòng: mỗi hình được tính hai lần.','Tổng ba hình bằng một nửa tổng ba dòng; trừ đi dòng không chứa hình cần tìm.']:[`Dòng 2: ${E[0]} hơn ${E[1]} ${a_of(eqs)}.`,'Đây là bài toán tổng và hiệu.'];
    return Qin(`Mỗi hình thay cho một số (hình giống nhau là số giống nhau). Tìm số của ${ask}.`,vals[ask],{visual:tdEq(lines),hints,explain:`${syms.map(s=>s+' = '+fN(vals[s])).join(', ')}. Thử lại: các dòng đều đúng.`});}
  return null;};
const a_of=eqs=>eqs[1].r[1];

/* 28. Ai thích gì (bảng suy luận) */
function perms(a){if(a.length<=1)return[a];const out=[];a.forEach((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).forEach(p=>out.push([x,...p])));return out;}
TDG.whoWhat=function(G,lv){const T=RP([['nuôi',['con mèo','con chó','con thỏ','con vẹt']],['thích màu',['đỏ','xanh','vàng','tím']],['chơi',['cờ vua','bóng đá','cầu lông','bơi lội']],['học đàn',['piano','ghi-ta','trống','sáo']]]);
  const k=lv===2&&G>=4?4:3;const P=names(k),I=shuffle(T[1]).slice(0,k);const sol=shuffle(I.slice());
  for(let t=0;t<60;t++){const cands=[];P.forEach((p,i)=>I.forEach(it=>{if(sol[i]===it)cands.push({p,it,pos:true});else cands.push({p,it,pos:false});}));
    const pool=shuffle(cands.filter(c=>!c.pos)).concat(shuffle(cands.filter(c=>c.pos)).slice(0,lv===0?1:0));const chosen=[];const ok=cl=>perms(I).filter(pm=>cl.every(c=>(pm[P.indexOf(c.p)]===c.it)===c.pos));
    for(const c of shuffle(pool)){if(ok(chosen).length===1)break;chosen.push(c);}
    while(chosen.length>1){let removed=false;for(let i=0;i<chosen.length;i++){const tr=chosen.slice(0,i).concat(chosen.slice(i+1));if(ok(tr).length===1){chosen.splice(i,1);removed=true;break;}}if(!removed)break;}
    if(ok(chosen).length!==1)continue;const askI=shuffle(P.map((_,i)=>i)).find(i=>!chosen.some(c=>c.pos&&c.p===P[i]));if(askI==null)continue;
    const text=shuffle(chosen).map(c=>`${c.p} ${c.pos?'':'không '}${T[0]} ${c.it}.`).join(' ');
    return Qmc(`${P.join(', ')} mỗi bạn ${T[0]} một thứ khác nhau: ${I.join(', ')}. ${text} Hỏi ${P[askI]} ${T[0]} gì?`,sol[askI],shuffle(I.slice()),{hints:['Kẻ bảng: hàng là tên bạn, cột là các thứ. Điều “không” thì đánh dấu ✗.','Hàng hoặc cột nào chỉ còn một ô trống thì đó là ✓.'],explain:P.map((p,i)=>`${p} ${T[0]} ${sol[i]}`).join('; ')+'.'});}
  return null;};

/* 29. Lấy ít nhất để chắc chắn */
TDG.pigeon=function(G,lv){const C=['đỏ','xanh','vàng','trắng'];const kind=lv===0?RP(['one','both']):lv===1?RP(['both','pair','one']):(G>=4?'k':RP(['pair','both']));
  const a=R(3,12),b=R(3,12);let p,ans,ex;
  if(kind==='one'){p=`Trong hộp có ${a} viên bi đỏ và ${b} viên bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có ít nhất 1 viên bi đỏ?`;ans=b+1;ex=`Xui nhất là lấy hết ${b} viên xanh trước. Lấy thêm 1 viên nữa chắc chắn là đỏ: ${b} + 1 = ${ans}.`;}
  else if(kind==='both'){if(a===b)return null;p=`Trong hộp có ${a} viên bi đỏ và ${b} viên bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có đủ cả hai màu?`;ans=Math.max(a,b)+1;ex=`Xui nhất là lấy hết ${Math.max(a,b)} viên ${a>b?'đỏ':'xanh'} trước. Thêm 1 viên nữa thì có đủ hai màu: ${ans}.`;}
  else if(kind==='pair'){const c=R(2,G>=4?4:3);const cs=C.slice(0,c);p=`Trong túi có rất nhiều viên bi các màu ${cs.join(', ')}. Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?`;ans=c+1;ex=`Xui nhất là ${c} viên đầu mỗi viên một màu. Viên thứ ${c+1} chắc chắn trùng màu một viên đã lấy.`;}
  else{const c=R(2,4),k=R(3,5);const cs=C.slice(0,c);p=`Trong túi có rất nhiều viên bi các màu ${cs.join(', ')} (mỗi màu nhiều hơn ${k} viên). Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên để chắc chắn có ${k} viên cùng màu?`;ans=c*(k-1)+1;ex=`Xui nhất là mỗi màu lấy được ${k-1} viên: ${c} × ${k-1} = ${c*(k-1)} viên. Thêm 1 viên nữa: ${ans}.`;}
  return Qin(p,ans,{hints:['Hãy nghĩ đến trường hợp xui xẻo nhất.','Sau trường hợp xui nhất, lấy thêm 1 viên là chắc chắn.'],explain:ex});};

/* 30. Bài toán tuổi */
TDG.age=function(G,lv){const [A]=names(1);const pr=RP([['mẹ','con'],['bố','con'],['ông','cháu']]);
  if(lv===0){const a=R(5,10),D=pr[0]==='ông'?R(50,60):R(24,34),n=R(2,9);return Qin(`Năm nay ${A} ${a} tuổi, ${pr[0]} của ${A} ${a+D} tuổi. Hỏi khi ${A} ${a+n} tuổi thì ${pr[0]} bao nhiêu tuổi?`,a+D+n,{hints:['Mỗi năm ai cũng thêm 1 tuổi.',`${pr[0]} luôn hơn ${A} ${D} tuổi.`],explain:`${pr[0]} hơn ${A}: ${a+D} − ${a} = ${D} tuổi. Khi ${A} ${a+n} tuổi, ${pr[0]}: ${a+n} + ${D} = ${a+D+n} tuổi.`});}
  if(lv===1){const c=R(5,12),D=R(22,34),n=G>=4&&Math.random()<.5?R(2,6):0;const S=2*c+D+2*n;
    return Qin(n?`${cap(pr[0])} hơn ${pr[1]} ${D} tuổi. Sau ${n} năm nữa, tổng số tuổi hai ${pr[0]} ${pr[1]} là ${S}. Tuổi ${pr[1]} hiện nay là bao nhiêu?`:`${cap(pr[0])} hơn ${pr[1]} ${D} tuổi. Tổng số tuổi hai ${pr[0]} ${pr[1]} hiện nay là ${S}. Tuổi ${pr[1]} hiện nay là bao nhiêu?`,c,{hints:n?[`Tổng tuổi hiện nay: ${S} − 2 × ${n}.`,'Rồi giải bài toán tổng và hiệu.']:['Bài toán tổng và hiệu.',`Tuổi ${pr[1]} = (tổng − hiệu) : 2.`],explain:n?`Tổng tuổi hiện nay: ${S} − ${2*n} = ${S-2*n}. Tuổi ${pr[1]}: (${S-2*n} − ${D}) : 2 = ${c}.`:`Tuổi ${pr[1]}: (${S} − ${D}) : 2 = ${c}.`});}
  const k=R(3,G>=4?7:5),c=R(4,10),D=(k-1)*c;return Qin(`Năm nay tuổi ${pr[0]} gấp ${k} lần tuổi ${pr[1]}, ${pr[0]} hơn ${pr[1]} ${D} tuổi. Tuổi ${pr[1]} năm nay là bao nhiêu?`,c,{visual:tapeSVG([{n:cap(pr[1]),parts:1},{n:cap(pr[0]),parts:k}],''),hints:[`${cap(pr[1])} 1 phần, ${pr[0]} ${k} phần. Hiệu ứng với ${k} − 1 phần.`,`Một phần: ${D} : ${k-1}.`],explain:`Hiệu số phần: ${k} − 1 = ${k-1}. Tuổi ${pr[1]}: ${D} : ${k-1} = ${c}.`});};

/* 31. Ba số */
TDG.sum3=function(G,lv){const [A,B,C]=names(3);const th=RP(['cái kẹo','viên bi','quyển vở','bông hoa']);const top=G===2?20:G===3?100:1000;
  if(lv===0){const a=R(2,top),b=R(2,top),c=R(2,top);const S=a+b+c;return Qin(`Ba bạn ${A}, ${B}, ${C} có tất cả ${fN(S)} ${th}. ${A} có ${fN(a)} ${th}, ${B} có ${fN(b)} ${th}. ${C} có bao nhiêu ${th}?`,c,{hints:['Lấy tổng trừ đi số của hai bạn đã biết.',`${fN(S)} − ${fN(a)} − ${fN(b)}.`],explain:`${C}: ${fN(S)} − ${fN(a)} − ${fN(b)} = ${fN(c)} ${th}.`});}
  if(lv===2&&G>=3){const T=R(10,top),a=R(1,2*T),b=R(1,2*T);const c=3*T-a-b;if(c<0)return null;return Qin(`Trung bình cộng của ba số là ${fN(T)}. Số thứ nhất là ${fN(a)}, số thứ hai là ${fN(b)}. Tìm số thứ ba.`,c,{hints:['Tổng ba số = trung bình cộng × 3.',`Tổng: ${fN(T)} × 3 = ${fN(3*T)}.`],explain:`Tổng ba số: ${fN(T)} × 3 = ${fN(3*T)}. Số thứ ba: ${fN(3*T)} − ${fN(a)} − ${fN(b)} = ${fN(c)}.`});}
  const c=R(2,Math.floor(top/3)),d2=R(1,Math.floor(top/4)),d1=R(1,Math.floor(top/4));const S=3*c+2*d2+d1;
  return Qin(`Ba bạn ${A}, ${B}, ${C} có tất cả ${fN(S)} ${th}. ${A} có nhiều hơn ${B} ${fN(d1)} ${th}, ${B} có nhiều hơn ${C} ${fN(d2)} ${th}. ${C} có bao nhiêu ${th}?`,c,{visual:tapeSVG([{n:A,parts:1,extra:.9,exLab:'+'},{n:B,parts:1,extra:.45},{n:C,parts:1}],fN(S),{u:60}),hints:[`Bớt phần hơn để cả ba bằng ${C}: ${B} bớt ${fN(d2)}, ${A} bớt ${fN(d1)} + ${fN(d2)}.`,`Ba lần số của ${C} = ${fN(S)} − ${fN(d2)} − ${fN(d1+d2)}.`],explain:`Ba lần số của ${C}: ${fN(S)} − ${fN(d2)} − ${fN(d1+d2)} = ${fN(3*c)}. ${C}: ${fN(3*c)} : 3 = ${fN(c)} ${th}.`});};

/* 32. Tổng – tỉ, hiệu – tỉ dạng phân số */
TDG.fracRatio=function(G,lv){for(let t=0;t<30;t++){const q=R(2,9),p=R(1,q-1);if(gcdT(p,q)!==1)continue;const u=R(2,G===4?50:300);const sm=p*u,lg=q*u;
  if(lv<2){const S=sm+lg;if(lv===0)return Qin(`Tổng hai số là ${fN(S)}. Số bé bằng ${p}/${q} số lớn. Tìm số bé.`,sm,{visual:tapeSVG([{n:'Số bé',parts:p},{n:'Số lớn',parts:q}],fN(S),{u:Math.max(16,Math.floor(180/q))}),hints:[`Số bé ${p} phần, số lớn ${q} phần như nhau.`,`Tổng số phần: ${p} + ${q} = ${p+q}.`],explain:`Một phần: ${fN(S)} : ${p+q} = ${fN(u)}. Số bé: ${fN(u)} × ${p} = ${fN(sm)}.`});
    return Qsl(`Tổng hai số là ${fN(S)}. Số bé bằng ${p}/${q} số lớn. Tìm hai số.`,['Số bé','Số lớn'],[sm,lg],[u,S-u,lg+u,Math.max(1,sm-u)],{visual:tapeSVG([{n:'Số bé',parts:p},{n:'Số lớn',parts:q}],fN(S),{u:Math.max(16,Math.floor(180/q))}),hints:[`Tổng số phần: ${p} + ${q} = ${p+q}.`,`Một phần: ${fN(S)} : ${p+q}.`],explain:`Một phần: ${fN(u)}. Số bé: ${fN(sm)}. Số lớn: ${fN(lg)}.`});}
  const D=lg-sm;return Qin(`Hiệu hai số là ${fN(D)}. Số bé bằng ${p}/${q} số lớn. Tìm số lớn.`,lg,{visual:tapeSVG([{n:'Số bé',parts:p},{n:'Số lớn',parts:q}],'',{u:Math.max(16,Math.floor(180/q))}),hints:[`Số lớn hơn số bé ${q} − ${p} = ${q-p} phần.`,`Một phần: ${fN(D)} : ${q-p}.`],explain:`Một phần: ${fN(D)} : ${q-p} = ${fN(u)}. Số lớn: ${fN(u)} × ${q} = ${fN(lg)}.`});}return null;};
const gcdT=(a,b)=>b?gcdT(b,a%b):a;

/* 33. Ốc sên leo cột */
TDG.snail=function(G,lv){for(let t=0;t<30;t++){const a=R(lv===0?2:3,G<=2?4:6),b=R(1,a-1),H=R(a+2,G===1?12:G===2?15:G===3?25:40);let h=0,d=0;while(true){d++;h+=a;if(h>=H)break;h-=b;}
  if(lv===0&&d>8)continue;return Qin(`Một con ốc sên leo lên cột cao ${H} m. Ban ngày ốc leo được ${a} m, ban đêm lại tụt xuống ${b} m. Hỏi đến ngày thứ mấy ốc sên lên tới đỉnh cột?`,d,{hints:[`Mỗi ngày đêm ốc lên được ${a} − ${b} = ${a-b} m.`,`Ngày cuối ốc leo ${a} m là tới đỉnh, không bị tụt nữa: trước ngày cuối ốc chỉ cần lên tới ${H-a} m.`],explain:`Trước ngày cuối cần lên ${H} − ${a} = ${H-a} m, mỗi ngày đêm lên ${a-b} m nên mất ${d-1} ngày đêm. Ngày thứ ${d} ốc tới đỉnh.`});}return null;};

/* 34. Mỗi lần một nửa (tính ngược) */
TDG.half=function(G,lv){const [A,B,C]=names(3);const top=G===2?20:G===3?100:500;
  if(lv===0){const r=R(2,top/2|0),x=R(1,top/4|0);const s=2*(r+x);return Qin(`${A} có một số viên bi. ${A} cho ${B} một nửa số bi, rồi cho ${C} ${x} viên thì còn lại ${r} viên. Lúc đầu ${A} có bao nhiêu viên bi?`,s,{hints:['Đi ngược từ cuối: trước khi cho C thì có thêm bấy nhiêu viên.',`Trước khi cho ${C}: ${r} + ${x} = ${r+x} viên — đây là một nửa số bi.`],explain:`Trước khi cho ${C}: ${r} + ${x} = ${r+x}. Lúc đầu: ${r+x} × 2 = ${s} viên.`});}
  if(lv===1){const r=R(2,top/2|0),x=R(1,top/5|0);const s=2*(r+x);return Qin(`Một cửa hàng có một số quả trứng. Buổi sáng bán một nửa số trứng và thêm ${x} quả thì còn lại ${r} quả. Lúc đầu cửa hàng có bao nhiêu quả trứng?`,s,{hints:[`Nếu không bán thêm ${x} quả thì còn ${r} + ${x} quả.`,'Số đó là một nửa số trứng lúc đầu.'],explain:`${r} + ${x} = ${r+x} là một nửa. Lúc đầu: ${r+x} × 2 = ${s} quả.`});}
  const r=R(1,top/8|0),x=R(1,5),y=R(1,5);const m=2*(r+y),s=2*(m+x);return Qin(`Một cửa hàng có một số quả trứng. Ngày thứ nhất bán một nửa số trứng và thêm ${x} quả. Ngày thứ hai bán một nửa số trứng còn lại và thêm ${y} quả thì còn ${r} quả. Lúc đầu cửa hàng có bao nhiêu quả trứng?`,s,{hints:[`Ngược ngày thứ hai: (${r} + ${y}) × 2 = ${m}.`,`Ngược ngày thứ nhất: (${m} + ${x}) × 2.`],explain:`Sau ngày thứ nhất còn (${r} + ${y}) × 2 = ${m} quả. Lúc đầu: (${m} + ${x}) × 2 = ${s} quả.`});};

/* 35. Tìm số có hai chữ số */
TDG.digits2=function(G,lv){for(let t=0;t<40;t++){const n=R(10,99),a=Math.floor(n/10),b=n%10;const S=a+b;let p,f,ex;
  if(lv===0){if(a<=b)continue;p=`Tìm số có hai chữ số, biết chữ số hàng chục hơn chữ số hàng đơn vị ${a-b} và tổng hai chữ số bằng ${S}.`;f=m=>Math.floor(m/10)-m%10===a-b&&Math.floor(m/10)+m%10===S;ex=`Hàng đơn vị: (${S} − ${a-b}) : 2 = ${b}. Hàng chục: ${b} + ${a-b} = ${a}. Số đó là ${n}.`;}
  else if(lv===1){if(!b||a%b||a===b)continue;const k=a/b;p=`Tìm số có hai chữ số, biết chữ số hàng chục gấp ${k} lần chữ số hàng đơn vị và tổng hai chữ số bằng ${S}.`;f=m=>m%10&&Math.floor(m/10)===k*(m%10)&&Math.floor(m/10)+m%10===S;ex=`Hàng đơn vị 1 phần, hàng chục ${k} phần: ${S} : ${k+1} = ${b}. Hàng chục: ${a}. Số đó là ${n}.`;}
  else{if(a<=b||!b)continue;const D=9*(a-b);p=`Tìm số có hai chữ số, biết tổng hai chữ số bằng ${S} và nếu đổi chỗ hai chữ số thì được số mới bé hơn số cũ ${D} đơn vị.`;f=m=>m%10&&Math.floor(m/10)+m%10===S&&m-(m%10*10+Math.floor(m/10))===D;ex=`Đổi chỗ bé đi ${D} nghĩa là hàng chục hơn hàng đơn vị ${D} : 9 = ${a-b}. Hàng đơn vị: (${S} − ${a-b}) : 2 = ${b}. Số đó là ${n}.`;}
  let c=0;for(let m=10;m<=99;m++)if(f(m))c++;if(c!==1)continue;
  return Qin(p,n,{hints:lv===2?['Số ab − số ba = 9 × (a − b).','Biết tổng và hiệu hai chữ số thì tìm được từng chữ số.']:['Gọi hai chữ số là hàng chục và hàng đơn vị, thử lần lượt các khả năng.','Thử lại: số tìm được phải đúng cả hai điều kiện.'],explain:ex});}return null;};

/* 36. Đếm hình chữ nhật trên lưới */
function rgridSVG(m,n){const U=34;let b='';for(let i=0;i<m;i++)for(let j=0;j<n;j++)b+=`<rect x="${6+j*U}" y="${6+i*U}" width="${U}" height="${U}" fill="#E0ECFF" stroke="#1E3A8A" stroke-width="3"/>`;return SVGW(n*U+12,m*U+12,b,'Lưới ô vuông');}
TDG.rects=function(G,lv){const P=lv===0?[[1,2],[1,3],[1,4]]:lv===1?[[2,2],[2,3],[1,5]]:(G<=3?[[2,3],[2,4]]:[[3,3],[2,4],[3,4]]);let [m,n]=RP(P);if(Math.random()<.4)[m,n]=[n,m];
  const c=(m*(m+1)/2)*(n*(n+1)/2);return Qin(`Hình bên là lưới ${m} hàng, ${n} cột ô vuông. Có tất cả bao nhiêu hình chữ nhật (kể cả hình vuông)?`,c,{visual:rgridSVG(m,n),hints:['Đếm theo kích thước: hình 1 ô, hình 2 ô, hình 3 ô…',`Mỗi hình chữ nhật được tạo bởi 2 đường dọc và 2 đường ngang. Có ${n+1} đường dọc, ${m+1} đường ngang.`],explain:`Cách chọn 2 đường dọc: ${n*(n+1)/2}, chọn 2 đường ngang: ${m*(m+1)/2}. Số hình: ${n*(n+1)/2} × ${m*(m+1)/2} = ${c}.`});};

/* 37. Kim đồng hồ */
TDG.clockAng=function(G,lv){const vis=h=>typeof clkSVG==='function'?clkSVG(h,0):'';
  if(lv===0||(lv===1&&G===3)){const h=RP([1,2,3,4,5,6,7,8,9,10,11]);const deg=30*Math.min(h,12-h);
    if(G===3){const ans=deg===90?'Góc vuông':'Góc không vuông';return Qmc(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc gì?`,ans,['Góc vuông','Góc không vuông'],{visual:vis(h),hints:['Kim phút chỉ số 12.','Góc vuông khi kim giờ chỉ số 3 hoặc số 9.'],explain:`Lúc ${h} giờ, hai kim tạo ${deg===90?'góc vuông':'góc không vuông'}.`});}
    const ans=deg===90?'Góc vuông':deg===180?'Góc bẹt':deg<90?'Góc nhọn':'Góc tù';return Qmc(`Lúc ${h} giờ đúng, kim giờ và kim phút tạo thành góc gì?`,ans,['Góc nhọn','Góc vuông','Góc tù','Góc bẹt'],{visual:vis(h),hints:['Mỗi khoảng giữa hai số liền nhau trên mặt đồng hồ là 30°.',`Từ số 12 đến số ${h} (đi đường ngắn) có ${Math.min(h,12-h)} khoảng.`],explain:`Góc giữa hai kim: ${Math.min(h,12-h)} × 30° = ${deg}°, là ${ans.toLowerCase()}.`});}
  if(lv===1){const h=R(1,11);const deg=30*Math.min(h,12-h);return Qin(`Lúc ${h} giờ đúng, góc nhỏ tạo bởi kim giờ và kim phút bằng bao nhiêu độ?`,deg,{visual:vis(h),hints:['Cả vòng đồng hồ là 360°, chia 12 khoảng.','Mỗi khoảng 30°.'],explain:`${Math.min(h,12-h)} khoảng × 30° = ${deg}°.`});}
  if(G===3||Math.random()<.5){const h1=R(1,6),h2=R(h1+2,h1+6);return Qin(`Từ ${h1} giờ đến ${h2} giờ cùng buổi, kim phút quay được mấy vòng?`,h2-h1,{hints:['Mỗi giờ kim phút quay đúng 1 vòng.','Đếm số giờ đã trôi qua.'],explain:`${h2} − ${h1} = ${h2-h1} giờ, kim phút quay ${h2-h1} vòng.`});}
  const n=R(2,10);return Qin(`Trong ${n} giờ, kim giờ quay được một góc bằng bao nhiêu độ?`,30*n,{hints:['12 giờ kim giờ quay 1 vòng = 360°.','1 giờ kim giờ quay 360° : 12 = 30°.'],explain:`${n} × 30° = ${30*n}°.`});};

/* 38. Gấp và cắt giấy */
TDG.fold=function(G,lv){const kind=lv===0?'hole':lv===1?RP(['hole','rope']):RP(G>=3?['cut4','rope']:['rope','hole']);
  if(kind==='hole'){const k=R(1,lv===0?2:G<=2?3:4);return Qin(`Gấp đôi một tờ giấy ${k} lần (lần sau gấp đôi tờ đã gấp), rồi đục một lỗ xuyên qua. Mở tờ giấy ra có mấy lỗ?`,2**k,{hints:['Mỗi lần gấp đôi, số lớp giấy tăng gấp đôi.','Đục 1 lỗ xuyên qua tất cả các lớp.'],explain:`Số lớp: ${Array.from({length:k},()=>2).join(' × ')} = ${2**k}. Có ${2**k} lỗ.`});}
  if(kind==='rope'){const k=R(1,G<=2?2:3);return Qin(`Gấp đôi một sợi dây ${k} lần, rồi cắt một nhát ngang ở giữa bó dây. Được mấy đoạn dây?`,2**k+1,{hints:[`Sau khi gấp có ${2**k} sợi nằm chồng lên nhau, nhát cắt cắt qua tất cả.`,'Vẽ thử với gấp 1 lần: cắt ở giữa được 3 đoạn.'],explain:`Có ${2**k} sợi bị cắt, tạo ${2**k} điểm cắt trên sợi dây: ${2**k} + 1 = ${2**k+1} đoạn.`});}
  const n=R(2,G===3?6:12);return Qin(`Cắt một tờ giấy thành 4 mảnh. Lấy 1 mảnh cắt tiếp thành 4 mảnh. Cứ làm như vậy, tổng cộng ${n} lần cắt. Có tất cả bao nhiêu mảnh giấy?`,1+3*n,{hints:['Mỗi lần cắt, 1 mảnh thành 4 mảnh: thêm 3 mảnh.','Lúc đầu có 1 mảnh.'],explain:`1 + ${n} × 3 = ${1+3*n} mảnh.`});};

/* 39. Tổng dãy cách đều */
TDG.sumSeq=function(G,lv){for(let t=0;t<30;t++){const d=lv===0?RP(G===2?[1,2]:[1,2,5]):R(1,G===2?3:G===3?5:9),a=R(1,G===2?5:G===3?20:100),n=lv===0?R(6,10):lv===1?R(8,G===2?10:20):R(15,G<=3?25:60);const b=a+(n-1)*d;const S=(a+b)*n/2;
  if(G===2&&S>200)continue;if(String(S).length>6)continue;return Qin('Tính nhanh tổng dãy số cách đều.',S,{big:`${fN(a)} + ${fN(a+d)} + ${fN(a+2*d)} + … + ${fN(b)} = ?`,hints:[`Ghép số đầu với số cuối: ${fN(a)} + ${fN(b)} = ${fN(a+b)}.`,`Dãy có (${fN(b)} − ${fN(a)}) : ${d} + 1 = ${n} số.`],explain:`Số số hạng: ${n}. Tổng: (${fN(a)} + ${fN(b)}) × ${n} : 2 = ${fN(S)}.`});}return null;};

/* 40. Nhân nhẩm nhanh */
TDG.mulTrick=function(G,lv){const kinds=G===3?['9','5','4','9']:G===4?['11','99','25','5','9']:['11','99','101','25','125'];const k=lv===0?kinds[R(0,1)]:RP(kinds);let n,ex,hint;
  if(k==='9'){n=R(12,lv?199:99);ex=`${n} × 9 = ${n} × 10 − ${n} = ${n*10} − ${n} = ${n*9}.`;hint='Nhân 9 = nhân 10 rồi trừ đi chính số đó.';}
  else if(k==='5'){n=2*R(6,lv?250:49);ex=`${n} × 5 = ${n} × 10 : 2 = ${n*10} : 2 = ${n*5}.`;hint='Nhân 5 = nhân 10 rồi chia 2.';}
  else if(k==='4'){n=R(12,lv?240:99);ex=`${n} × 4 = ${n} × 2 × 2 = ${n*2} × 2 = ${n*4}.`;hint='Nhân 4 = gấp đôi hai lần.';}
  else if(k==='11'){n=R(12,lv===2?999:99);ex=`${n} × 11 = ${n} × 10 + ${n} = ${n*10} + ${n} = ${n*11}.`;hint=n<100?'Số có hai chữ số × 11: viết tổng hai chữ số vào giữa (nhớ nếu tổng ≥ 10).':'Nhân 11 = nhân 10 rồi cộng chính số đó.';}
  else if(k==='99'){n=R(12,lv===2?999:99);ex=`${n} × 99 = ${n} × 100 − ${n} = ${n*100} − ${n} = ${n*99}.`;hint='Nhân 99 = nhân 100 rồi trừ đi chính số đó.';}
  else if(k==='101'){n=R(12,999);ex=`${n} × 101 = ${n} × 100 + ${n} = ${n*101}.`;hint='Nhân 101 = nhân 100 rồi cộng chính số đó.';}
  else if(k==='25'){n=4*R(3,lv?250:25);ex=`${n} × 25 = ${n} : 4 × 100 = ${n/4} × 100 = ${n*25}.`;hint='Nhân 25 = chia 4 rồi nhân 100 (vì 25 × 4 = 100).';}
  else{n=8*R(2,lv?120:12);ex=`${n} × 125 = ${n} : 8 × 1000 = ${n/8} × 1000 = ${n*125}.`;hint='Nhân 125 = chia 8 rồi nhân 1 000 (vì 125 × 8 = 1 000).';}
  const ans=n*+k;if(String(ans).length>6)return null;return Qin('Tính nhẩm nhanh.',ans,{big:`${fN(n)} × ${k} = ?`,hints:[hint,ex.split('=').slice(0,2).join('=')+' = …'],explain:ex});};

/* 41. Chữ số tận cùng */
TDG.lastDigit=function(G,lv){const kind=lv===0?RP(['pow','oddprod']):RP(['pow','sum','oddprod','pow']);let p,ans,ex,hints;
  if(kind==='pow'){const k=RP([2,3,4,7,8,9]),n=R(lv===0?4:8,lv===2?60:20);let r=1;const cyc=[];for(let i=1;i<=n;i++){r=r*k%10;if(i<=4)cyc.push(r);}ans=r;p=`Tích ${k} × ${k} × … × ${k} (có ${n} thừa số ${k}) có chữ số tận cùng là mấy?`;hints=['Chỉ cần nhân các chữ số tận cùng với nhau.',`Chữ số tận cùng lặp lại theo chu kì: ${cyc.join(', ')}, …`];ex=`Tận cùng lặp lại ${cyc.join(', ')}. ${n} thừa số → tận cùng ${ans}.`;}
  else if(kind==='oddprod'){const m=R(3,lv?60:15)*2+1;ans=5;p=`Tích các số lẻ 1 × 3 × 5 × 7 × … × ${m} có chữ số tận cùng là mấy?`;hints=['Tích có thừa số 5.','Số lẻ nhân với 5 thì tận cùng là 5.'],ex='Tích các số lẻ có thừa số 5 nên tận cùng là 5 (không có thừa số chẵn để thành 0).';}
  else{const n=R(10,lv===2?200:60);const S=n*(n+1)/2;ans=S%10;p=`Tổng 1 + 2 + 3 + … + ${n} có chữ số tận cùng là mấy?`;hints=['Tính tổng bằng cách ghép đầu với cuối.',`Tổng = ${n} × ${n+1} : 2.`];ex=`Tổng = ${n} × ${n+1} : 2 = ${fN(S)}, tận cùng là ${ans}.`;}
  const opts=new Set([String(ans)]);while(opts.size<4)opts.add(String(R(0,9)));return Qmc(p,String(ans),shuffle([...opts]),{hints,explain:ex});};

/* 42. Ghép cặp tròn chục */
TDG.pairTen=function(G,lv){const T=G===1?10:G===2?RP([10,20]):100;const k=lv===0?2:lv===1?(G===1?2:3):3;const terms=[];for(let i=0;i<k;i++){const a=G===3?R(11,89):R(1,T-1);terms.push(a,T-a);}
  if(lv===2)terms.push(G===3?R(1,99):R(1,9));const sh=shuffle(terms);const S=terms.reduce((a,b)=>a+b,0);
  return Qin('Tính nhanh bằng cách ghép cặp.',S,{big:sh.join(' + ')+' = ?',hints:[`Tìm các cặp số cộng lại bằng ${T}.`,`Có ${k} cặp tròn ${T===100?'trăm':'chục'}${lv===2?' và một số lẻ ra':''}.`],explain:`Ghép cặp được ${k} × ${T}${lv===2?' + '+terms[terms.length-1]:''} = ${S}.`});};

/* ========== LỚP LÁ: thêm 6 bài ========== */
TDG.la_seqnum=function(G,lv){let seq,ans;if(lv===0){const s=R(1,6);seq=[s,s+1,s+2];ans=s+3;}else if(lv===1){const s=R(4,10);seq=[s,s-1,s-2];ans=s-3;}else{const s=RP([1,2]);seq=[s,s+2,s+4];ans=s+6;}
  return Qmc('Số tiếp theo là số mấy?',String(ans),shuffle([String(ans),String(ans+1),String(Math.max(0,ans-1)===ans?ans+2:ans-1)]),{big:seq.join(', ')+', ?',voice:[['vi',`Đếm tiếp nhé: ${seq.join(', ')}. Số tiếp theo là số mấy?`]],hints:['Đọc to các số rồi đếm tiếp.',lv===1?'Các số đang bé dần: đếm lùi.':lv===2?'Mỗi lần nhảy 2 số.':'Mỗi lần thêm 1.'],explain:`${seq.join(', ')}, ${ans}.`});};
const LA_SIZE=[['🐘','con voi'],['🦒','hươu cao cổ'],['🐄','con bò'],['🐶','con chó'],['🐱','con mèo'],['🐭','con chuột'],['🐜','con kiến']];
TDG.la_big=function(G,lv){const k=lv===2?3:2;const idx=shuffle(LA_SIZE.map((_,i)=>i)).slice(0,k).sort((a,b)=>a-b);const big=lv!==1||Math.random()<.5;const ans=big?LA_SIZE[idx[0]][0]:LA_SIZE[idx[idx.length-1]][0];
  const w=k===3?(big?'to nhất':'nhỏ nhất'):(big?'to hơn':'nhỏ hơn');return Qmc(`Con nào ${w}?`,ans,shuffle(idx.map(i=>LA_SIZE[i][0])),{emo:true,voice:[['vi',`Con nào ${w}?`]],hints:['Nghĩ xem con vật đó ngoài đời to hay nhỏ.','So sánh từng cặp con vật.'],explain:`${cap(LA_SIZE[idx.find(i=>LA_SIZE[i][0]===ans)][1])} ${w}.`});};
const LA_SH=[['🔺','hình tam giác'],['🟦','hình vuông'],['🟡','hình tròn'],['⭐','ngôi sao']];
TDG.la_shape=function(G,lv){const S=shuffle(LA_SH);const n=R(lv===0?2:3,lv===0?4:lv===1?6:8);const others=[];const m=R(2,lv?6:4);for(let i=0;i<m;i++)others.push(RP(S.slice(1,lv?4:2))[0]);const arr=shuffle(Array(n).fill(S[0][0]).concat(others));
  return Qin(`Có mấy ${S[0][1]} ${S[0][0]}?`,n,{visual:emoRow(arr,'wrap'),voice:[['vi',`Có mấy ${S[0][1]}?`]],hints:[`Chỉ đếm ${S[0][1]}.`,'Chạm tay vào từng hình và đếm to.'],explain:`Có ${n} ${S[0][1]}.`});};
const LA_GRP=[['quả',['🍎','🍌','🍇','🍓','🍊']],['con vật',['🐶','🐱','🐰','🐻','🐸']],['xe',['🚗','🚌','🚲','🚂','🚑']],['quần áo',['👕','👗','👖','🧢','🧦']]];
TDG.la_odd=function(G,lv){const [g1,g2]=shuffle(LA_GRP);const k=lv===0?2:3;const same=shuffle(g1[1]).slice(0,k);const odd=RP(g2[1]);
  return Qmc('Hình nào khác nhóm?',odd,shuffle(same.concat([odd])),{emo:true,voice:[['vi','Hình nào không cùng nhóm với các hình còn lại?']],hints:['Gọi tên từng hình.',`Ba hình là ${g1[0]}, còn một hình thì không.`],explain:`Các hình khác đều là ${g1[0]}, ${odd} thuộc nhóm ${g2[0]}.`});};
TDG.la_scale=function(G,lv){const e=RP(['🍎','🍊','🥚','🧱','🍐']);let a=R(1,5),b=R(1,5);while(a===b)b=R(1,5);
  const vis=`<div class="ht-eqs"><div class="ht-eq">Bên trái: ${Array(a).fill(e).join('')}</div><div class="ht-eq">Bên phải: ${Array(b).fill(e).join('')}</div></div>`;
  if(lv===2){if(a<b)[a,b]=[b,a];const v2=`<div class="ht-eqs"><div class="ht-eq">Bên trái: ${Array(a).fill(e).join('')}</div><div class="ht-eq">Bên phải: ${Array(b).fill(e).join('')}</div></div>`;return Qin(`Cần đặt thêm mấy ${e} vào bên phải để hai bên cân bằng?`,a-b,{visual:v2,voice:[['vi','Cần đặt thêm mấy quả vào bên phải để hai bên bằng nhau?']],hints:['Hai bên cân bằng khi số quả bằng nhau.','Đếm xem bên phải còn thiếu mấy quả.'],explain:`Bên trái ${a}, bên phải ${b}: thêm ${a-b}.`});}
  const hv=lv===0||Math.random()<.5;const w=hv?'nặng':'nhẹ';const ans=(a>b)===hv?'Bên trái':'Bên phải';return Qmc(`Các ${e} nặng bằng nhau. Bên nào ${w} hơn?`,ans,['Bên trái','Bên phải'],{fixed:['Bên trái','Bên phải'],visual:vis,voice:[['vi',`Các quả nặng bằng nhau. Bên nào ${w} hơn?`]],hints:[`Bên nào có ${hv?'nhiều':'ít'} quả hơn thì ${w} hơn.`,'Đếm số quả mỗi bên.'],explain:`Bên trái ${a}, bên phải ${b}: ${ans.toLowerCase()} ${w} hơn.`});};
const LA_BF=[['🥚','🐣','quả trứng','gà con nở ra'],['🌱','🌳','cây non','cây to'],['🧦','👟','đi tất','đi giày'],['🛁','👕','tắm','mặc áo'],['🍳','🍽️','nấu ăn','ăn cơm'],['🌧️','🌈','trời mưa','cầu vồng'],['🌅','🌙','buổi sáng','buổi tối'],['🪥','🛏️','đánh răng','đi ngủ']];
TDG.la_before=function(G,lv){const it=RP(LA_BF);const first=lv===1?Math.random()<.5:true;const ans=first?it[0]:it[1];
  return Qmc(first?'Việc nào có trước?':'Việc nào có sau?',ans,shuffle([it[0],it[1]]),{emo:true,voice:[['vi',(first?'Việc nào có trước? ':'Việc nào có sau? ')+it[2]+' hay '+it[3]+'?']],hints:['Nghĩ xem ở nhà mình thường làm thế nào.',`${cap(it[2])} rồi mới đến ${it[3]}.`],explain:`${cap(it[2])} trước, ${it[3]} sau.`});};
