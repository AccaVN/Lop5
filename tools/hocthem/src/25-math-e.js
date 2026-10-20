/* ================= BỘ ĐỀ TOÁN — phần E (10/2026, lần 3): thêm dạng bài =================
   Đúng/Sai, điền dấu phép tính, tia số, chữ số còn thiếu, so sánh biểu thức, gia đình phép tính,
   ước lượng, chọn đơn vị, thời gian trôi qua, phần trăm giảm giá, toán nhiều bước, mảng nhân. */
const OPF={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,':':(a,b)=>b&&a%b===0?a/b:NaN};
function pickOp(G,lv,P,op){const mx=lim(G,P);if(op==='+'){const [a,b]=pickAdd(G,P,lv);return [a,b,a+b];}if(op==='−'){const [a,b]=pickSub(G,P);return [a,b,a-b];}
  const T=P.tables||(G<=2?[2,5]:[2,3,4,5,6,7,8,9]);if(op==='×'){const a=P.big?R(12,G>=4?999:99):R(2,10),b=RP(T);return [a,b,a*b];}
  const b=RP(T),q=P.big?R(12,G>=4?999:99):R(2,10);return [b*q,b,q];}
const opsFor=(G,P)=>P.ops||(P.mul?['×',':']:G<=1?['+','−']:G===2?['+','−']:['+','−','×',':']);

/* 1. Đúng hay sai */
MG.trueFalse=function(G,lv,P){const op=RP(opsFor(G,P));const [a,b,c]=pickOp(G,lv,P,op);const ok=Math.random()<.5;let shown=c;
  if(!ok){const d=lv===0?R(1,G<=1?2:10):RP([1,10,100,2].filter(x=>x<=Math.max(2,c)));shown=Math.random()<.5||c-d<0?c+d:c-d;if(op==='+'&&hasCarry(a,b)&&lv>0&&Math.random()<.5)shown=c-10>=0?c-10:c+1;}
  if(shown===c&&!ok)shown=c+1;const ans=shown===c?'Đúng':'Sai';
  const vis=G===0?emoRow(Array(a).fill('🍎'))+emoRow(Array(b).fill('🍎')):'';
  return Qmc('Phép tính sau đúng hay sai?',ans,['Đúng','Sai'],{big:`${fN(a)} ${op} ${fN(b)} = ${fN(shown)}`,fixed:['Đúng','Sai'],visual:vis,sk:op==='+'||op==='−'?'congtru':'nhanchia',hints:['Con tự tính lại phép tính ở bên trái dấu =.',`Kết quả đúng là ${fN(a)} ${op} ${fN(b)} = …, so với số bên phải.`],explain:`${fN(a)} ${op} ${fN(b)} = ${fN(c)}. ${ans==='Đúng'?'Phép tính đúng.':`Không phải ${fN(shown)}, nên phép tính sai.`}`});};

/* 2. Điền dấu phép tính */
MG.chooseOp=function(G,lv,P){const L=opsFor(G,P);for(let t=0;t<30;t++){const op=RP(L);const [a,b,c]=pickOp(G,lv,P,op);const fit=L.filter(o=>OPF[o](a,b)===c);if(fit.length!==1)continue;
  return Qmc(`Điền dấu ${L.join(', ')} thích hợp vào ô trống.`,op,L.slice(),{big:`${fN(a)} ☐ ${fN(b)} = ${fN(c)}`,fixed:L.slice(),sk:op==='+'||op==='−'?'congtru':'nhanchia',hints:[c>a?'Kết quả lớn hơn số thứ nhất: thử dấu cộng hoặc nhân.':'Kết quả bé hơn số thứ nhất: thử dấu trừ hoặc chia.','Thử từng dấu rồi tính xem có đúng không.'],explain:`${fN(a)} ${op} ${fN(b)} = ${fN(c)}.`});}return null;};

/* 3. Tia số */
function nlSVG(s,d,k,pos,lab){const n=10,U=28,X=14;let b=`<line x1="${X-8}" y1="40" x2="${X+n*U+14}" y2="40" stroke="#1E3A8A" stroke-width="3"/><path d="M${X+n*U+14} 34 l10 6 l-10 6z" fill="#1E3A8A"/>`;
  for(let i=0;i<=n;i++){const x=X+i*U;b+=`<line x1="${x}" y1="33" x2="${x}" y2="47" stroke="#1E3A8A" stroke-width="2"/>`;if(lab.includes(i))b+=`<text x="${x}" y="66" text-anchor="middle" font-size="${String(s+n*d).length>4?10:12}" font-weight="800" fill="currentColor">${fN(s+i*d)}</text>`;}
  const x=X+pos*U;b+=`<path d="M${x} 28 l-7 -12 h14z" fill="#DC2626"/><text x="${x}" y="12" text-anchor="middle" font-size="12" font-weight="800" fill="#DC2626">?</text>`;
  return `<div class="ht-fig"><svg viewBox="0 0 ${X+n*U+30} 74" width="320" role="img" aria-label="Tia số" data-nl="${s},${d},${pos}">${b}</svg></div>`;}
MG.numberLine=function(G,lv,P){const mx=lim(G,P);const steps=G<=1?(mx<=10?[1]:[1,2,5,10]):G===2?[2,5,10,100]:G===3?[5,10,50,100,1000]:[100,1000,5000,10000];
  for(let t=0;t<40;t++){const d=lv===0?steps[0]:RP(steps);if(10*d>mx)continue;const s=Math.floor(R(0,mx-10*d)/d)*d;const pos=R(1,9);const wide=String(s+10*d).length>=4;const lab=lv===2?[0,10]:lv===1||wide?[0,5,10]:[0,1,2,10];if(lab.includes(pos))continue;
    const v=s+pos*d;if(String(v).length>6)continue;return Qin('Số ở chỗ mũi tên là số nào?',v,{visual:nlSVG(s,d,10,pos,lab),sk:'so',hints:[lv===0?'Đếm tiếp từ các số đã có.':'Tìm khoảng cách giữa hai vạch liền nhau trước.',`Mỗi vạch cách nhau ${fN(d)}.`],explain:`Hai vạch liền nhau cách ${fN(d)}. Mũi tên ở vạch thứ ${pos} kể từ ${fN(s)}: ${fN(s)} + ${pos} × ${fN(d)} = ${fN(v)}.`});}return null;};

/* 4. Chữ số còn thiếu trong phép tính */
MG.missingDigit=function(G,lv,P){const mul=P.mul;for(let t=0;t<40;t++){let a,b,c,op;if(mul){op='×';a=R(12,G>=4?999:99);b=R(2,9);c=a*b;}else{op=RP(['+','−']);[a,b,c]=pickOp(G,lv,P,op);if(a<10||b<10)continue;}
  const parts=[String(a),String(b),String(c)];const which=lv===2?R(0,2):R(0,1);const s=parts[which];const pi=R(0,s.length-1);if(s.length>1&&pi===0&&s[0]==='0')continue;
  const masked=parts.slice();masked[which]=s.slice(0,pi)+'?'+s.slice(pi+1);const ans=+s[pi];
  // chỉ một chữ số đúng
  let cnt=0;for(let dgt=0;dgt<=9;dgt++){if(pi===0&&dgt===0&&s.length>1)continue;const v=+(s.slice(0,pi)+dgt+s.slice(pi+1));const x=[a,b,c];x[which]=v;if(OPF[op](x[0],x[1])===x[2])cnt++;}if(cnt!==1)continue;
  return Qin('Tìm chữ số thích hợp thay cho dấu ?',ans,{big:`${masked[0]} ${op} ${masked[1]} = ${masked[2]}`,sk:mul?'nhanchia':'congtru',hints:['Đặt tính theo cột cho thẳng hàng.',which===2?'Tính phép tính rồi so với kết quả.':op==='+'?'Lấy tổng trừ đi số hạng đã biết.':op==='−'?(which===0?'Số bị trừ = hiệu + số trừ.':'Số trừ = số bị trừ − hiệu.'):'Thử từng chữ số từ 0 đến 9.'],explain:`${fN(a)} ${op} ${fN(b)} = ${fN(c)}. Chữ số cần điền là ${ans}.`});}return null;};

/* 5. So sánh hai biểu thức */
MG.exprCmp=function(G,lv,P){const mx=lim(G,P);const L=opsFor(G,P);for(let t=0;t<40;t++){const o1=RP(L),o2=RP(L);const [a,b,c]=pickOp(G,lv,P,o1);const [x,y,z]=pickOp(G,lv,P,o2);let r=z;
  if(Math.random()<.35){// cho bằng nhau
    if(o2==='+'){const y2=c-x;if(y2<0)continue;r=c;var Lb=`${fN(x)} + ${fN(y2)}`;}else if(o2==='−'){const x2=c+y;if(x2>mx*1.2)continue;r=c;var Lb=`${fN(x2)} − ${fN(y)}`;}else continue;}
  else var Lb=`${fN(x)} ${o2} ${fN(y)}`;
  if(Math.abs(c-r)>Math.max(10,mx/5)&&lv>0)continue;return Qsign('Điền dấu >, <, = thích hợp vào ô trống.',`${fN(a)} ${o1} ${fN(b)} ☐ ${Lb}`,c,r,{sk:'congtru',hints:['Tính giá trị từng vế.','So sánh hai kết quả.'],explain:`Vế trái: ${fN(c)}. Vế phải: ${fN(r)}. ${fN(c)} ${sgn(c,r)} ${fN(r)}.`});}return null;};

/* 6. Gia đình phép tính */
MG.factFamily=function(G,lv,P){const mul=P.mul||(G>=2&&Math.random()<.4&&!P.ops);let a,b,c,ops;
  if(mul){const T=P.tables||[2,3,4,5,6,7,8,9];a=RP(T);b=R(2,G<=2?5:10);if(a===b)b++;c=a*b;ops=['×',':'];}else{const mx=lim(G,P);a=R(1,Math.max(2,Math.floor(mx/2)));b=R(1,Math.max(2,Math.floor(mx/2)));if(a===b)b++;c=a+b;ops=['+','−'];}
  const F=e=>`${fN(e[0])} ${e[1]} ${fN(e[2])} = ${fN(e[3])}`;
  const rightE=mul?RP([[c,':',a,b],[c,':',b,a],[b,'×',a,c]]):RP([[c,'−',a,b],[c,'−',b,a],[b,'+',a,c]]);
  const wrongE=(mul?[[a,':',c,b],[b,':',a,c],[c,'×',a,b],[a,'×',b,c+a]]:[[a,'−',c,b],[b,'−',a,c],[a,'+',c,b],[c,'+',b,a]]).filter(e=>OPF[e[1]](e[0],e[2])!==e[3]);
  const right=F(rightE);const opts=[right,...shuffle(wrongE).slice(0,3).map(F)];
  return Qmc(`Từ phép tính ${mul?`${fN(a)} × ${fN(b)} = ${fN(c)}`:`${fN(a)} + ${fN(b)} = ${fN(c)}`}, phép tính nào dưới đây cũng đúng?`,right,shuffle(opts),{sk:mul?'nhanchia':'congtru',hints:[mul?'Lấy tích chia cho một thừa số thì được thừa số kia.':'Lấy tổng trừ đi một số hạng thì được số hạng kia.','Tính thử từng phép tính.'],explain:`${right} là phép tính đúng.`});};

/* 7. Ước lượng */
MG.estimate=function(G,lv,P){const u=G===3?(lv===2?10:100):G===4?1000:RP([100,1000]);const rd=x=>Math.round(x/u)*u;for(let t=0;t<40;t++){let a,b,op,exact,est;
  if(P.mul){a=R(11,G>=4?999:99);b=R(2,9);op='×';const au=G>=4?100:10;est=Math.round(a/au)*au*b;exact=a*b;const opts=numOpts(est,[est+au*b,est-au*b,exact,est*10]);if(opts.length<4)continue;
    return Qmc(`Ước lượng: ${fN(a)} × ${b} khoảng bao nhiêu?`,String(est),opts,{sk:'nhanchia',hints:[`Làm tròn ${fN(a)} đến hàng ${au===10?'chục':'trăm'}.`,`${fN(Math.round(a/au)*au)} × ${b} = …`],explain:`${fN(a)} ≈ ${fN(Math.round(a/au)*au)}. ${fN(Math.round(a/au)*au)} × ${b} = ${fN(est)} (kết quả đúng là ${fN(exact)}).`});}
  op=RP(['+','−']);a=R(u*2,u*9+u-1);b=R(u,u*5);if(op==='−'&&b>a)continue;exact=OPF[op](a,b);est=OPF[op](rd(a),rd(b));if(est===exact)continue;
  const opts=[...new Set([est,est+u,Math.max(0,est-u),est+2*u].map(String))];if(opts.length<4||opts.includes(String(exact)))continue;
  return Qmc(`Ước lượng: ${fN(a)} ${op} ${fN(b)} khoảng bao nhiêu? (làm tròn từng số đến hàng ${u===10?'chục':u===100?'trăm':'nghìn'})`,String(est),shuffle(opts),{sk:'congtru',hints:[`Làm tròn: ${fN(a)} ≈ ${fN(rd(a))}, ${fN(b)} ≈ ${fN(rd(b))}.`,'Rồi tính với hai số tròn.'],explain:`${fN(rd(a))} ${op} ${fN(rd(b))} = ${fN(est)} (kết quả đúng là ${fN(exact)}).`});}return null;};

/* 8. Chọn đơn vị thích hợp */
const UNITQ=[[1,'len','Chiếc bút chì dài khoảng 15 …','cm'],[1,'len','Cái bàn học dài khoảng 1 …','m'],[1,'len','Gang tay của em dài khoảng 12 …','cm'],[2,'len','Quãng đường từ Hà Nội đến Hải Phòng dài khoảng 100 …','km'],[2,'len','Chiều cao của cửa ra vào khoảng 2 …','m'],[3,'len','Con kiến dài khoảng 5 …','mm'],[3,'len','Bề dày quyển sách khoảng 2 …','cm'],
 [2,'mass','Bao gạo nặng khoảng 25 …','kg'],[2,'mass','Quả trứng gà nặng khoảng 50 …','g'],[3,'mass','Gói kẹo nặng khoảng 200 …','g'],[2,'mass','Con mèo nặng khoảng 4 …','kg'],[4,'mass','Con voi nặng khoảng 5 …','tấn'],[4,'mass','Con lợn nặng khoảng 1 …','tạ'],
 [2,'vol','Chai nước mắm chứa khoảng 1 …','l'],[3,'vol','Thìa thuốc chứa khoảng 5 …','ml'],[3,'vol','Xô nước chứa khoảng 10 …','l'],[3,'vol','Cốc sữa chứa khoảng 200 …','ml'],
 [3,'area','Diện tích con tem khoảng 6 …','cm²'],[4,'area','Diện tích lớp học khoảng 60 …','m²'],[4,'area','Diện tích nước Việt Nam khoảng 331 000 …','km²'],[4,'area','Diện tích mặt bàn học khoảng 50 …','dm²'],
 [2,'time','Em ngủ mỗi đêm khoảng 9 …','giờ'],[2,'time','Em đánh răng khoảng 3 …','phút'],[3,'time','Chớp mắt một cái mất khoảng 1 …','giây'],[2,'time','Một năm học kéo dài khoảng 9 …','tháng']];
const UNITS_OF={len:['mm','cm','m','km'],mass:['g','kg','tạ','tấn'],vol:['ml','l'],area:['cm²','dm²','m²','km²'],time:['giây','phút','giờ','ngày','tháng']};
MG.unitChoose=function(G,lv,P){const L=UNITQ.filter(x=>x[0]<=Math.max(1,G)&&(!P.kind||P.kind===x[1]));const it=RP(L);let opts=UNITS_OF[it[1]].slice();if(it[1]==='mass'&&G<4)opts=['g','kg'];if(it[1]==='len'&&G<=1)opts=['cm','m'];if(it[1]==='area'&&G<4)opts=['cm²','m²'];if(it[1]==='time')opts=shuffle(opts.filter(u=>u!==it[3])).slice(0,2).concat([it[3]]);
  if(!opts.includes(it[3]))return null;return Qmc(`Chọn đơn vị thích hợp: ${it[2]}`,it[3],opts,{fixed:opts.slice(),sk:'doluong',hints:['Hãy hình dung đồ vật đó ngoài đời.','Thử ghép từng đơn vị vào câu xem có hợp lí không.'],explain:`${it[2].replace('…',it[3])}.`});};

/* 9. Thời gian trôi qua */
MG.clockElapsed=function(G,lv,P){const [A]=NM.length?names(1):['An'];const act=RP(['làm bài tập','đọc truyện','tập đàn','đá bóng','vẽ tranh','dọn phòng']);
  const step=G===2?(lv?15:30):5;const h=R(6,G===2?10:16);const m=R(0,59/step|0)*step%60;const dur=G===2?RP(lv?[15,30,45,60]:[30,60]):lv===0?R(2,9)*5:R(5,lv===2?23:11)*5;const t=h*60+m+dur;const h2=Math.floor(t/60),m2=t%60;
  const ts=(x,y)=>y?`${x} giờ ${y} phút`:`${x} giờ`;
  if(lv===2&&G>=3){return Qmc(`${A} bắt đầu ${act} lúc ${ts(h,m)} và ${act} trong ${dur} phút. ${A} xong lúc mấy giờ?`,ts(h2,m2),shuffle([...new Set([ts(h2,m2),ts(h2,(m2+10)%60),ts(h2+1,m2),ts(h,(m+dur)%60===m2?(m2+5)%60:(m+dur)%60)])].slice(0,4)),{sk:'doluong',hints:[`Cộng ${dur} phút vào ${ts(h,m)}.`,'Đủ 60 phút thì đổi thành 1 giờ.'],explain:`${ts(h,m)} + ${dur} phút = ${ts(h2,m2)}.`});}
  return Qin(`${A} bắt đầu ${act} lúc ${ts(h,m)}, xong lúc ${ts(h2,m2)}. ${A} ${act} trong bao nhiêu phút?`,dur,{visual:typeof clkSVG==='function'?`<div class="ht-two">${clkSVG(h%12||12,m)}${clkSVG(h2%12||12,m2)}</div>`:'',sk:'doluong',hints:['Đếm từ lúc bắt đầu đến giờ tròn gần nhất, rồi đếm tiếp.','1 giờ = 60 phút.'],explain:`Từ ${ts(h,m)} đến ${ts(h2,m2)} là ${dur} phút.`});};

/* 10. Phần trăm: giảm giá, tăng thêm */
MG.percentWp=function(G,lv,P){for(let t=0;t<40;t++){const p=RP(lv===0?[10,20,25,50]:[5,10,15,20,25,30,40]);const price=R(2,lv===2?40:20)*(lv===0?10000:5000);const off=price*p/100;if(off%1000)continue;
  if(lv===2){const k=RP(['up','off2']);if(k==='up'){const v=price+off;return Qin(`Một cửa hàng nhập một chiếc ba lô giá ${fN(price)} đồng, rồi bán lãi ${p}% giá nhập. Giá bán chiếc ba lô là bao nhiêu đồng?`,v,{sk:'tiso',hints:[`Tiền lãi = ${fN(price)} × ${p} : 100.`,'Giá bán = giá nhập + tiền lãi.'],explain:`Tiền lãi: ${fN(price)} × ${p} : 100 = ${fN(off)} đồng. Giá bán: ${fN(price)} + ${fN(off)} = ${fN(v)} đồng.`});}
    const v=price-off;return Qin(`Sau khi giảm giá ${p}%, một chiếc cặp có giá ${fN(v)} đồng. Hỏi lúc chưa giảm, chiếc cặp giá bao nhiêu đồng?`,price,{sk:'tiso',hints:[`Giá sau khi giảm bằng ${100-p}% giá cũ.`,`Giá cũ = ${fN(v)} : ${100-p} × 100.`],explain:`${fN(v)} : ${100-p} × 100 = ${fN(price)} đồng.`});}
  const v=price-off;return lv===0?Qin(`Một chiếc áo giá ${fN(price)} đồng, được giảm ${p}%. Hỏi được giảm bao nhiêu tiền?`,off,{sk:'tiso',hints:[`Tìm ${p}% của ${fN(price)}.`,`${fN(price)} : 100 × ${p}.`],explain:`${fN(price)} × ${p} : 100 = ${fN(off)} đồng.`}):Qin(`Một chiếc áo giá ${fN(price)} đồng, được giảm ${p}%. Giá chiếc áo sau khi giảm là bao nhiêu đồng?`,v,{sk:'tiso',hints:[`Số tiền được giảm: ${fN(price)} × ${p} : 100.`,'Lấy giá cũ trừ số tiền được giảm.'],explain:`Được giảm ${fN(off)} đồng. Giá mới: ${fN(price)} − ${fN(off)} = ${fN(v)} đồng.`});}return null;};

/* 11. Toán nhiều bước (có lời văn) */
MG.wpChain=function(G,lv,P){const mx=lim(G,P);const [A,B]=names(2);const [th]=thing();for(let t=0;t<40;t++){const a=R(Math.ceil(mx/5),Math.floor(mx/2)),b=R(1,Math.floor(mx/4)),c=R(1,Math.floor(mx/3));
  const k=lv===0?'+-':RP(['+-','--','++']);let v,p,ex;
  if(k==='+-'){v=a+b-c;p=`${A} có ${fN(a)} ${th}. ${B} cho ${A} thêm ${fN(b)} ${th}. Sau đó ${A} cho em ${fN(c)} ${th}. Hỏi ${A} còn lại bao nhiêu ${th}?`;ex=expl(`${fN(a)} + ${fN(b)} = ${fN(a+b)}`,`${fN(a+b)} − ${fN(c)} = ${fN(v)} ${th}`);}
  else if(k==='--'){v=a-b-c;p=`Thùng có ${fN(a)} ${th}. Buổi sáng lấy ra ${fN(b)} ${th}, buổi chiều lấy ra ${fN(c)} ${th}. Hỏi thùng còn lại bao nhiêu ${th}?`;ex=expl(`${fN(a)} − ${fN(b)} = ${fN(a-b)}`,`${fN(a-b)} − ${fN(c)} = ${fN(v)} ${th}`);}
  else{v=a+b+c;p=`Ngày thứ nhất ${A} gấp được ${fN(a)} ${th}, ngày thứ hai gấp được ${fN(b)} ${th}, ngày thứ ba gấp được ${fN(c)} ${th}. Cả ba ngày ${A} gấp được bao nhiêu ${th}?`;ex=expl(`${fN(a)} + ${fN(b)} = ${fN(a+b)}`,`${fN(a+b)} + ${fN(c)} = ${fN(v)} ${th}`);}
  if(v<0||v>mx||(k==='+-'&&c>a+b))continue;return Qin(p,v,{sk:'giaitoan',hints:['Tóm tắt: có bao nhiêu, thêm hay bớt bao nhiêu, mấy lần.','Làm từng bước theo thứ tự trong đề.'],explain:ex});}return null;};

/* 12. Mảng nhân (hàng × cột) */
MG.arrayMul=function(G,lv,P){const T=P.tables||[2,3,4,5];const r=RP(T),c=R(2,lv?(G<=2?5:9):5);const e=RP(['🍎','🌸','⭐','🍬','🐟']);const rows=Array.from({length:r},()=>emoRow(Array(c).fill(e))).join('');
  if(lv===2)return Qmc(`Có ${r} hàng, mỗi hàng ${c} ${e}. Phép tính nào cho biết có tất cả bao nhiêu ${e}?`,`${c} × ${r}`,shuffle([`${c} × ${r}`,`${c} + ${r}`,`${r} + ${r}`,`${c} × ${c}`].filter((x,i,a)=>a.indexOf(x)===i)),{visual:rows,sk:'nhanchia',hints:[`${c} được lấy ${r} lần.`,'Lấy số hình mỗi hàng nhân với số hàng.'],explain:`${c} được lấy ${r} lần: ${c} × ${r} = ${c*r}.`});
  return Qin(`Có ${r} hàng, mỗi hàng ${c} ${e}. Có tất cả bao nhiêu ${e}?`,r*c,{visual:rows,sk:'nhanchia',hints:[`Mỗi hàng có ${c} hình, có ${r} hàng như thế.`,`${c} × ${r} = …`],explain:`${c} × ${r} = ${r*c} ${e}.`});};

/* 13. Đúng hay sai với số thập phân (lớp 5) */
MG.decTF=function(G,lv,P){const op=RP(P.op||['+','−','×']);const d1=R(1,2),d2=R(1,2);const a=R(11,lv?9999:999)/10**d1,b=op==='×'?R(2,9):R(11,lv?999:99)/10**d2;
  let x=a,y=b;if(op==='−'&&y>x)[x,y]=[y,x];const c=r6(op==='+'?x+y:op==='−'?x-y:x*y);const ok=Math.random()<.5;
  const wrongs=[r6(c*10),r6(c/10),r6(c+1),r6(op==='+'?x+y*10:c+0.1)].filter(v=>v>0&&v!==c);const shown=ok?c:RP(wrongs);const ans=shown===c?'Đúng':'Sai';
  return Qmc('Phép tính sau đúng hay sai?',ans,['Đúng','Sai'],{big:`${fD(x)} ${op} ${fD(y)} = ${fD(shown)}`,fixed:['Đúng','Sai'],sk:'stp',hints:['Đặt tính: các dấu phẩy thẳng cột với nhau.',op==='×'?'Nhân như số tự nhiên rồi đếm số chữ số ở phần thập phân.':'Thêm chữ số 0 cho phần thập phân dài bằng nhau.'],explain:`${fD(x)} ${op} ${fD(y)} = ${fD(c)}. ${ans==='Đúng'?'Phép tính đúng.':'Phép tính sai.'}`});};
