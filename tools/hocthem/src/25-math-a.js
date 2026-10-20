/* ================= BỘ ĐỀ TOÁN MỚI (máy tự sinh) — phần A: tiện ích, số, cộng trừ =================
   Mỗi dạng: MG.ten(G, lv, P) → câu hỏi. G = lớp (0 = Lá), lv = 0 cơ bản · 1 vận dụng · 2 thử thách,
   P = tham số của bài (phạm vi số, bảng nhân…). Lời giải viết từng bước, cách nhau bằng xuống dòng. */
const MG={};
/* kỹ năng: dùng đúng mã kỹ năng có trong app của từng lớp */
const SK_FB={hinhhoc:['hinhhoc','doluong'],thongke:['thongke','xacsuat','doluong','so'],xacsuat:['xacsuat','thongke','so'],phanso:['phanso','so'],stp:['stp','so'],tiso:['tiso','giaitoan'],quyluat:['quyluat','so'],thoigian:['thoigian','doluong'],congtru:['congtru','stp','so'],nhanchia:['nhanchia','stp','so'],giaitoan:['giaitoan','so'],doluong:['doluong','hinhhoc','so'],so:['so']};
function skOf(k){const L=SK_FB[k]||[k];for(const x of L){try{if(SKILLS&&SKILLS[x])return x;}catch(e){}}return 'so';}
const fD=(x,dp)=>{let s=dp==null?String(+(+x).toFixed(6)):(+x).toFixed(dp);let [a,b]=s.split('.');a=fN(+a);return b?a+','+b:a;};
const r6=x=>Math.round(x*1e6)/1e6;
const pickK=(a,k)=>shuffle(a).slice(0,k);
const SIGNS=['>','<','='];
const sgn=(a,b)=>a>b?'>':a<b?'<':'=';
const Qsign=(prompt,big,a,b,o)=>Qmc(prompt,sgn(a,b),SIGNS,Object.assign({big,fixed:SIGNS.slice()},o||{}));
function Qord(prompt,answer,o){let items=shuffle(answer.map(String));let t=0;while(items.join('|')===answer.join('|')&&t<10){items=shuffle(answer.map(String));t++;}return Object.assign({type:'order',prompt,answer:answer.map(String),items},o||{});}
const ops={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,':':(a,b)=>a/b};
/* đọc số tiếng Việt */
const DGV=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
function read3(n,full){const h=Math.floor(n/100),t=Math.floor(n/10)%10,u=n%10;const out=[];
  if(full||h>0)out.push(DGV[h]+' trăm');
  if(t===0){if(u>0&&(full||h>0))out.push('linh '+DGV[u]);else if(u>0)out.push(DGV[u]);}
  else{out.push(t===1?'mười':DGV[t]+' mươi');if(u===1&&t>1)out.push('mốt');else if(u===5)out.push('lăm');else if(u===4&&t>1)out.push('tư');else if(u>0)out.push(DGV[u]);}
  return out.join(' ');}
function vnRead(n){if(n===0)return 'không';const parts=[[1e9,'tỉ'],[1e6,'triệu'],[1e3,'nghìn'],[1,'']];let out=[],started=false;
  for(const [v,name] of parts){const g=Math.floor(n/v)%1000;if(g===0){continue;}out.push(read3(g,started)+(name?' '+name:''));started=true;}
  return out.join(' ').replace(/\s+/g,' ').trim();}
/* SGK lớp 4–5 đọc “tư” (24: hai mươi tư) — các lớp nhỏ đọc “bốn”; cả hai đều đúng, dùng “tư” khi đứng sau mươi */
/* tên đồ vật cho bài toán có lời văn */
const THG=[['quả cam','quả'],['cái kẹo','cái'],['quyển vở','quyển'],['bông hoa','bông'],['viên bi','viên'],['cây bút chì','cây'],['quả táo','quả'],['con gà','con'],['quyển truyện','quyển'],['chiếc bánh','chiếc']];
const thing=()=>RP(THG);
const lim=(G,P)=>P&&P.max?P.max:[10,100,1000,100000,1000000,1000000][G];
/* giải thích phép tính trong ô */
const expl=(...lines)=>lines.filter(Boolean).join('\n');

/* -------- SỐ -------- */
MG.count=function(G,lv,P){const mx=P.max||10;const E=shuffle(['🍎','🐟','⭐','🌸','🎈','🐥','🍓','🚗','⚽','🐞']);const n=R(lv?Math.ceil(mx/2):1,mx);
  if(lv===2&&G<=1){const m=R(1,Math.max(1,mx-n));const arr=shuffle(Array(n).fill(E[0]).concat(Array(m).fill(E[1])));return Qin(`Có bao nhiêu ${E[0]}?`,n,{visual:emoRow(arr,'wrap'),voice:[['vi','Đếm xem có bao nhiêu hình này.']],sk:'so',hints:['Chạm tay vào từng hình và đếm to.','Chỉ đếm đúng một loại hình.'],explain:`Có ${n} ${E[0]}.`});}
  return Qin(`Có bao nhiêu ${E[0]}?`,n,{visual:emoRow(Array(n).fill(E[0]),'wrap'),voice:[['vi','Đếm xem có bao nhiêu hình.']],sk:'so',hints:['Chạm tay vào từng hình và đếm to.','Số đếm cuối cùng là số lượng.'],explain:`Đếm lần lượt 1, 2, … , ${n}. Có ${n} ${E[0]}.`});};
MG.groups=function(G,lv,P){const mx=P.max||10;const E=shuffle(['🍎','🐟','⭐','🌸','🎈','🐥','🍓','🚗']);let a=R(1,mx),b=R(1,mx);while(b===a)b=R(1,mx);
  if(lv>=1){const big=Math.max(a,b),sm=Math.min(a,b);return Qin('Nhóm nhiều hơn thì nhiều hơn mấy hình?',big-sm,{visual:emoRow(Array(a).fill(E[0]))+emoRow(Array(b).fill(E[1])),sk:'so',hints:['Nối mỗi hình hàng trên với một hình hàng dưới.','Đếm số hình còn thừa.'],explain:expl(`Hàng trên ${a}, hàng dưới ${b}.`,`${big} − ${sm} = ${big-sm}.`)});}
  const ans=a>b?E[0]:E[1];return Qmc('Nhóm nào nhiều hơn?',ans,[E[0],E[1]],{emo:true,visual:emoRow(Array(a).fill(E[0]))+emoRow(Array(b).fill(E[1])),sk:'so',hints:['Nối từng cặp một hình trên với một hình dưới.','Hàng còn thừa là hàng nhiều hơn.'],explain:`Có ${a} ${E[0]} và ${b} ${E[1]}, nhóm ${ans} nhiều hơn.`});};
MG.split=function(G,lv,P){const n=R(2,P.max||10),a=R(1,n-1);if(lv===2){return Qin(`${n} gồm ${a} và mấy?`,n-a,{big:`${n} = ${a} + ?`,sk:'so',hints:[`Đếm thêm từ ${a} đến ${n}.`,`${a} + mấy = ${n}?`],explain:`${n} gồm ${a} và ${n-a} vì ${a} + ${n-a} = ${n}.`});}
  return Qin(`${n} gồm ${a} và mấy?`,n-a,{visual:emoRow(Array(a).fill('🔵').concat(Array(n-a).fill('⚪'))),sk:'so',hints:['Đếm số chấm trắng.',`${a} chấm xanh, còn lại là chấm trắng.`],explain:`${n} gồm ${a} và ${n-a}.`});};
MG.readNum=function(G,lv,P){const mx=lim(G,P);let n=R(lv===0?Math.max(10,Math.floor(mx/20)):Math.floor(mx/10),mx-1);if(lv===2){const s=String(n).split('');const k=R(1,s.length-1);s[k]='0';if(s.length>3)s[s.length-2]='0';n=+s.join('');}
  const ask=Math.random()<.5;const w=vnRead(n);
  if(ask){const wr=new Set();const sw=String(n);for(let t=0;t<30&&wr.size<3;t++){let s=sw.split('');const i=R(0,s.length-1);s[i]=String((+s[i]+R(1,9))%10);if(s[0]==='0')continue;const m=+s.join('');if(m!==n)wr.add(vnRead(m));}
    return Qmc(`Số ${fN(n)} đọc là:`,w,[w,...wr].slice(0,4),{sk:'so',bigSmall:true,hints:['Đọc từ trái sang phải theo từng lớp: nghìn, rồi trăm, chục, đơn vị.','Hàng chục là 0 thì đọc “linh”, hàng trăm là 0 thì đọc “không trăm”.'],explain:`${fN(n)} đọc là: ${w}.`});}
  return Qin(`Viết số: ${w}`,n,{sk:'so',hints:['Viết từng lớp: nghìn trước, rồi trăm, chục, đơn vị.','Hàng nào không đọc tới thì viết 0.'],explain:`“${w}” viết là ${fN(n)}.`});};
const HANG=['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn'];
MG.place=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=R(Math.max(10,Math.floor(mx/10)),mx-1);const s=String(n);const k=R(lv===1?1:0,s.length-1);const d=+s[s.length-1-k];
  if(lv===0||d===0){return Qmc(`Trong số ${fN(n)}, chữ số ở hàng ${HANG[k]} là chữ số nào?`,String(d),numOpts(d,[+s[0],+s[s.length-1],(d+1)%10]).map(String),{sk:'so',hints:['Đếm hàng từ phải sang trái: đơn vị, chục, trăm, nghìn…',`Hàng ${HANG[k]} là chữ số thứ ${k+1} từ phải sang.`],explain:`${fN(n)}: hàng ${HANG[k]} là chữ số ${d}.`});}
  const v=d*Math.pow(10,k);if(lv===1)return Qmc(`Chữ số ${d} ở hàng ${HANG[k]} trong số ${fN(n)} có giá trị là bao nhiêu?`,fN(v),[fN(v),fN(d),fN(d*Math.pow(10,k+1)),fN(d*Math.pow(10,Math.max(0,k-1)))].filter((x,i,a)=>a.indexOf(x)===i),{sk:'so',hints:['Giá trị = chữ số × giá trị của hàng.',`Hàng ${HANG[k]} có giá trị ${fN(Math.pow(10,k))}.`],explain:`${d} × ${fN(Math.pow(10,k))} = ${fN(v)}.`});
  return Qin(`Viết số gồm: ${s.split('').map((c,i)=>+c?`${c} ${HANG[s.length-1-i]}`:'').filter(Boolean).join(', ')}.`,n,{sk:'so',hints:['Viết các chữ số theo hàng từ cao xuống thấp.','Hàng không được nhắc tới thì viết chữ số 0.'],explain:`Số đó là ${fN(n)}.`});};
MG.decomp=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=R(Math.max(11,Math.floor(mx/10)),mx-1);const s=String(n);const parts=s.split('').map((c,i)=>+c*Math.pow(10,s.length-1-i)).filter(x=>x>0);if(parts.length<2)return MG.decomp(G,lv,P);
  const k=R(0,parts.length-1);if(lv===2){return Qin('Điền số thích hợp vào ô trống.',n,{big:`? = ${parts.map(fN).join(' + ')}`,sk:'so',hints:['Cộng các số tròn lại với nhau.','Mỗi số nằm ở một hàng.'],explain:`${parts.map(fN).join(' + ')} = ${fN(n)}.`});}
  return Qin('Điền số thích hợp vào ô trống.',parts[k],{big:`${fN(n)} = ${parts.map((p,i)=>i===k?'?':fN(p)).join(' + ')}`,bigSmall:true,sk:'so',hints:['Tách số theo từng hàng.',`Chữ số tương ứng là ${String(parts[k])[0]}.`],explain:`${fN(n)} = ${parts.map(fN).join(' + ')}.`});};
MG.tens=function(G,lv,P){const n=R(10,99);const t=Math.floor(n/10),u=n%10;if(lv===0)return Qin(`Số gồm ${t} chục và ${u} đơn vị là số nào?`,n,{sk:'so',hints:['Viết số chục trước, số đơn vị sau.',`${t} chục là ${t*10}.`],explain:`${t} chục và ${u} đơn vị là ${n}.`});
  return Qin(`Số ${n} gồm mấy chục?`,t,{sk:'so',hints:['Chữ số bên trái là số chục.','Chữ số bên phải là số đơn vị.'],explain:`${n} gồm ${t} chục và ${u} đơn vị.`});};
MG.neighbor=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=R(G<=1?1:Math.floor(mx/10),mx-2);const after=Math.random()<.5;const tr=G<=0?(after?'đứng sau':'đứng trước'):(after?'liền sau':'liền trước');
  if(lv===2&&G>=2){const a=n,b=n+2;return Qin(`Số nào nằm giữa ${fN(a)} và ${fN(b)}?`,a+1,{sk:'so',hints:['Hai số cách nhau 2 đơn vị.','Số ở giữa hơn số bé 1 đơn vị.'],explain:`${fN(a)}, ${fN(a+1)}, ${fN(b)}.`});}
  const r=after?n+1:n-1;if(r<0)return MG.neighbor(G,lv,P);return Qin(`Số ${tr} ${fN(n)} là số nào?`,r,{sk:'so',hints:[after?'Số liền sau hơn số đã cho 1 đơn vị.':'Số liền trước kém số đã cho 1 đơn vị.',after?`${fN(n)} + 1`:`${fN(n)} − 1`],explain:`${fN(n)} ${after?'+':'−'} 1 = ${fN(r)}.`});};
MG.seq=function(G,lv,P){const mx=lim(G,P);const st=P.step?RP(P.step):RP(G<=1?[1,2,5,10]:G===2?[2,5,10,100]:G===3?[5,10,100,1000]:[100,1000,10000]);const len=5;let a=R(0,Math.max(0,Math.floor(mx/st)-len-1))*st+(lv===2&&st>=10?0:0);if(lv>=1)a+=R(0,st-1)*(st<10?1:0);
  const dec=lv===2&&Math.random()<.5;let s=[];for(let i=0;i<len;i++)s.push(a+i*st);if(dec)s.reverse();if(s.some(v=>v>mx||v<0))return MG.seq(G,lv,P);const k=R(1,len-1);
  return Qin('Viết số thích hợp vào ô trống.',s[k],{big:s.map((v,i)=>i===k?'?':fN(v)).join(', '),bigSmall:true,sk:'so',hints:['Hai số liền nhau hơn kém nhau bao nhiêu?',`Mỗi lần ${dec?'bớt':'thêm'} ${fN(st)}.`],explain:`Dãy ${dec?'giảm':'tăng'} đều ${fN(st)}: ${s.map(fN).join(', ')}.`});};
MG.compare=function(G,lv,P){const mx=lim(G,P);
  if(G===0){const a=R(0,mx);let b=R(0,mx);while(b===a)b=R(0,mx);const big=Math.random()<.5;const ans=big?Math.max(a,b):Math.min(a,b);return Qmc(`Số nào ${big?'lớn':'bé'} hơn?`,String(ans),[String(a),String(b)],{visual:emoRow([String(a),'  ',String(b)]),sk:'so',hints:['Đếm xem số nào đứng sau khi đếm 1, 2, 3…','Số đếm sau thì lớn hơn.'],explain:`${Math.max(a,b)} lớn hơn ${Math.min(a,b)}.`});}
  if(lv===0||G===0){let a=R(0,mx),b=Math.random()<.2?a:R(Math.max(0,a-Math.ceil(mx/10)),Math.min(mx,a+Math.ceil(mx/10)));if(G>=3&&Math.random()<.5){const s=String(a).split('');if(s.length>2){s[R(1,s.length-1)]=String(R(0,9));b=+s.join('');}}
    return Qsign('Chọn dấu thích hợp điền vào ô trống.',`${fN(a)} ☐ ${fN(b)}`,a,b,{sk:'so',hints:['Số nào có nhiều chữ số hơn thì lớn hơn.','Cùng số chữ số: so từng hàng từ trái sang phải.'],explain:`${fN(a)} ${sgn(a,b)} ${fN(b)}.`});}
  const L=Math.min(mx,G<=1?10:mx);if(lv===1){const a=R(1,Math.floor(L/2)),b=R(1,Math.floor(L/2));const s=a+b;const c=RP([s,s+R(1,3),Math.max(0,s-R(1,3))]);
    return Qsign('Chọn dấu thích hợp điền vào ô trống.',`${fN(a)} + ${fN(b)} ☐ ${fN(c)}`,s,c,{sk:'so',hints:['Tính vế bên trái trước.',`${fN(a)} + ${fN(b)} = ?`],explain:`${fN(a)} + ${fN(b)} = ${fN(s)}, mà ${fN(s)} ${sgn(s,c)} ${fN(c)}.`});}
  const t=G>=2&&Math.random()<.4&&P.mul?'div':'add';
  if(t==='div'){const n=RP(P.tables||[2,3,4,5]);const k=RP(P.tables||[2,3,4,5].filter(x=>x!==n));const N=n*k*R(1,2);if(N%n||N%k)return MG.compare(G,lv,P);return Qsign('Điền dấu >, <, = (không cần tính hết cũng được).',`${N} : ${n} ☐ ${N} : ${k}`,N/n,N/k,{sk:'nhanchia',hints:['Cùng số bị chia: chia cho số lớn hơn thì được kết quả bé hơn.',`${N} : ${n} và ${N} : ${k}`],explain:`${N} : ${n} = ${N/n}; ${N} : ${k} = ${N/k}. Vậy ${N/n} ${sgn(N/n,N/k)} ${N/k}.`});}
  const a=R(1,Math.floor(L/2)),b=R(1,Math.floor(L/2));const d=R(-3,3);const c=Math.max(1,a+d),dd=a+b-c+R(-1,1);if(dd<0)return MG.compare(G,lv,P);
  return Qsign('Điền dấu >, <, = (không cần tính hết cũng được).',`${fN(a)} + ${fN(b)} ☐ ${fN(c)} + ${fN(dd)}`,a+b,c+dd,{sk:'congtru',hints:['So sánh từng số hạng ở hai vế.','Hoặc tính tổng mỗi vế rồi so sánh.'],explain:`${fN(a)} + ${fN(b)} = ${fN(a+b)}; ${fN(c)} + ${fN(dd)} = ${fN(c+dd)}. Vậy ${fN(a+b)} ${sgn(a+b,c+dd)} ${fN(c+dd)}.`});};
MG.maxmin=function(G,lv,P){const mx=Math.min(lim(G,P),999999);
  if(lv===2&&G>=2){const ds=pickK([1,2,3,4,5,6,7,8,9].concat(G>=3?[0]:[]),G>=4?4:3);const big=Math.random()<.5;const sorted=ds.slice().sort((a,b)=>big?b-a:a-b);if(!big&&sorted[0]===0){const i=sorted.findIndex(x=>x>0);[sorted[0],sorted[i]]=[sorted[i],sorted[0]];}const ans=+sorted.join('');
    return Qin(`Từ các chữ số ${ds.join(', ')}, viết số ${big?'lớn':'bé'} nhất có ${ds.length} chữ số khác nhau.`,ans,{sk:'so',hints:[big?'Chữ số lớn nhất đặt ở hàng cao nhất.':'Chữ số bé nhất (khác 0) đặt ở hàng cao nhất.','Lần lượt đặt các chữ số còn lại.'],explain:`Số ${big?'lớn':'bé'} nhất là ${fN(ans)}.`});}
  const base=R(Math.floor(mx/10),mx-1);const arr=new Set([base]);while(arr.size<4){const v=G>=3?+String(base).split('').map((c,i)=>i===R(0,String(base).length-1)?R(0,9):c).join(''):R(Math.max(0,base-20),Math.min(mx,base+20));if(v>0&&v<=mx)arr.add(v);}
  const L=[...arr];const big=Math.random()<.5;const ans=big?Math.max(...L):Math.min(...L);return Qmc(`Số ${big?'lớn':'bé'} nhất trong các số dưới đây là:`,fN(ans),L.map(fN),{sk:'so',hints:['So số chữ số trước.','Cùng số chữ số thì so từng hàng từ trái sang.'],explain:`Số ${big?'lớn':'bé'} nhất là ${fN(ans)}.`});};
MG.order=function(G,lv,P){const mx=Math.min(lim(G,P),999999);const n=lv===2?5:4;const arr=new Set();while(arr.size<n){arr.add(R(G<=1?0:Math.floor(mx/10),mx));}const L=[...arr];const up=Math.random()<.5;const ans=L.slice().sort((a,b)=>up?a-b:b-a).map(fN);
  return Qord(`Xếp các số theo thứ tự từ ${up?'bé đến lớn':'lớn đến bé'}.`,ans,{sk:'so',hints:[up?'Tìm số bé nhất đặt trước.':'Tìm số lớn nhất đặt trước.','So sánh từng cặp số.'],explain:ans.join(up?' < ':' > ')});};
MG.round=function(G,lv,P){const units=P.units||(G===3?[10,100,1000]:[100,1000,10000,100000]);const u=RP(units);const n=R(u*2,Math.min(999999,u*1000))+R(1,u-1);const r=Math.round(n/u)*u;if(r>999999)return MG.round(G,lv,P);const nm={10:'chục',100:'trăm',1000:'nghìn',10000:'chục nghìn',100000:'trăm nghìn'}[u];
  return Qin(`Làm tròn số ${fN(n)} đến hàng ${nm}.`,r,{sk:'so',hints:[`Nhìn chữ số ngay bên phải hàng ${nm}.`,'Bé hơn 5 thì giữ nguyên, từ 5 trở lên thì tiến thêm 1.'],explain:expl(`Chữ số bên phải hàng ${nm} là ${Math.floor((n%u)/(u/10))}.`,`${fN(n)} làm tròn đến hàng ${nm} được ${fN(r)}.`)});};
const ROM=n=>{const T=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,c] of T)while(n>=v){s+=c;n-=v;}return s;};
MG.roman=function(G,lv,P){const n=R(1,lv===0?12:20);if(Math.random()<.5)return Qin(`Chữ số La Mã ${ROM(n)} là số mấy?`,n,{sk:'so',hints:['I = 1, V = 5, X = 10.','Chữ bé đứng trước chữ lớn thì trừ, đứng sau thì cộng.'],explain:`${ROM(n)} = ${n}.`});
  const w=new Set([ROM(n)]);[n+1,n-1,n+5,n-4,n+10].forEach(x=>{if(x>0&&x<=30&&w.size<4)w.add(ROM(x));});return Qmc(`Số ${n} viết bằng chữ số La Mã là:`,ROM(n),[...w],{sk:'so',hints:['I = 1, V = 5, X = 10.','Viết phần chục trước, rồi phần đơn vị.'],explain:`${n} = ${ROM(n)}.`});};
MG.evenOdd=function(G,lv,P){const mx=Math.min(lim(G,P),99999);if(lv===0){const ev=Math.random()<.5;const par=x=>(x%2===0)===ev;let ans=R(10,mx);if(!par(ans))ans=ans+1>mx?ans-1:ans+1;const others=new Set();while(others.size<3){let x=R(10,mx);if(par(x))x=x+1>mx?x-1:x+1;if(x!==ans)others.add(x);}
    return Qmc(`Số nào là số ${ev?'chẵn':'lẻ'}?`,fN(ans),[ans,...others].map(fN),{sk:'so',hints:['Chỉ cần nhìn chữ số tận cùng.','Tận cùng 0, 2, 4, 6, 8 là số chẵn; 1, 3, 5, 7, 9 là số lẻ.'],explain:`${fN(ans)} có chữ số tận cùng là ${ans%10} nên là số ${ev?'chẵn':'lẻ'}.`});}
  const a=R(1,200),b=a+R(5,40);const ev=Math.random()<.5;let c=0;for(let x=a;x<=b;x++)if((x%2===0)===ev)c++;return Qin(`Từ ${a} đến ${b} có bao nhiêu số ${ev?'chẵn':'lẻ'}?`,c,{sk:'so',hints:[`Tìm số ${ev?'chẵn':'lẻ'} đầu tiên và cuối cùng.`,'Hai số chẵn (lẻ) liền nhau cách nhau 2.'],explain:`Có ${c} số ${ev?'chẵn':'lẻ'}.`});};

/* -------- CỘNG, TRỪ -------- */
function pickAdd(G,P,lv){const mx=lim(G,P);const carry=P.carry||'any';for(let t=0;t<200;t++){let a,b;const dig=P.k||0;
    if(dig===1){a=R(10,Math.min(mx,99));b=R(1,9);}else if(P.small){a=R(0,mx);b=R(0,mx-a);}else{a=R(Math.floor(mx/10),mx-1);b=R(1,mx-a);}
    if(a+b>mx)continue;const c=hasCarry(a,b);if(carry==='none'&&c)continue;if(carry==='yes'&&!c)continue;return [a,b];}return [Math.floor(mx/4),Math.floor(mx/5)];}
function pickSub(G,P){const mx=lim(G,P);const carry=P.carry||'any';for(let t=0;t<200;t++){let a,b;if(P.k===1){a=R(10,Math.min(mx,99));b=R(1,9);}else if(P.small){a=R(0,mx);b=R(0,a);}else{a=R(Math.floor(mx/5),mx);b=R(1,a);}
    const c=hasBorrow(a,b);if(carry==='none'&&c)continue;if(carry==='yes'&&!c)continue;return [a,b];}return [Math.floor(mx/2),Math.floor(mx/5)];}
function hasCarry(a,b){while(a>0||b>0){if(a%10+b%10>=10)return true;a=Math.floor(a/10);b=Math.floor(b/10);}return false;}
function hasBorrow(a,b){while(b>0){if(a%10<b%10)return true;a=Math.floor(a/10);b=Math.floor(b/10);}return false;}
MG.addsub=function(G,lv,P){const opsL=P.ops||['+','−'];const op=RP(opsL);
  if(lv===2&&G>=1){const mx=lim(G,P);const a=R(1,Math.floor(mx/3)),b=R(1,Math.floor(mx/3));const c=R(1,Math.min(a+b,Math.floor(mx/3)));const o2=Math.random()<.5;const v=o2?a+b-c:a+b+c;if(v>mx||v<0)return MG.addsub(G,1,P);
    return Qin('Tính.',v,{big:`${fN(a)} + ${fN(b)} ${o2?'−':'+'} ${fN(c)} = ?`,sk:'congtru',hints:['Tính lần lượt từ trái sang phải.',`${fN(a)} + ${fN(b)} = ${fN(a+b)}`],explain:expl(`${fN(a)} + ${fN(b)} = ${fN(a+b)}`,`${fN(a+b)} ${o2?'−':'+'} ${fN(c)} = ${fN(v)}`)});}
  if(op==='+'){const [a,b]=pickAdd(G,P,lv);const col=lv===1&&G>=2&&a>=10&&b>=10;return Qin(col?'Đặt tính rồi tính.':'Tính.',a+b,{big:`${fN(a)} + ${fN(b)} = ?`,visual:col?colHTMLx(a,'+',b):'',sk:'congtru',hints:[G>=2?'Cộng từ hàng đơn vị, sang hàng chục…':'Đếm thêm từ số lớn hơn.',hasCarry(a,b)?'Hàng nào được 10 trở lên thì viết đơn vị, nhớ 1 sang hàng bên trái.':'Cộng từng hàng thẳng cột.'],explain:addSteps(a,b)});}
  const [a,b]=pickSub(G,P);const col=lv===1&&G>=2&&a>=10&&b>=10;return Qin(col?'Đặt tính rồi tính.':'Tính.',a-b,{big:`${fN(a)} − ${fN(b)} = ?`,visual:col?colHTMLx(a,'−',b):'',sk:'congtru',hints:[G>=2?'Trừ từ hàng đơn vị, sang hàng chục…':'Bớt đi rồi đếm số còn lại.',hasBorrow(a,b)?'Hàng nào không trừ được thì mượn 1 chục, rồi trả 1 vào hàng bên trái của số trừ.':'Trừ từng hàng thẳng cột.'],explain:subSteps(a,b)});};
function colHTMLx(a,op,b){const w=Math.max(String(a).length,String(b).length)+1;const pad=s=>String(s).padStart(w,' ');return `<div class="ht-col"><div>${pad(a)}</div><div><i>${op}</i>${pad(b).slice(1)}</div><div class="ln"></div></div>`;}
function addSteps(a,b){if(a<10&&b<10||a+b<20&&b<10&&a<20)return `${fN(a)} + ${fN(b)} = ${fN(a+b)}.`;const L=[];let x=a,y=b,c=0,pos=0;const H=['đơn vị','chục','trăm','nghìn','chục nghìn','trăm nghìn'];
  while(x>0||y>0||c){const s=x%10+y%10+c;if(x>0||y>0||c)L.push(`Hàng ${H[pos]}: ${x%10} + ${y%10}${c?' + 1 (nhớ)':''} = ${s}${s>=10?`, viết ${s%10} nhớ 1`:''}`);c=s>=10?1:0;x=Math.floor(x/10);y=Math.floor(y/10);pos++;if(pos>6)break;}
  return expl(...(L.length<=4?L:[]),`${fN(a)} + ${fN(b)} = ${fN(a+b)}.`);}
function subSteps(a,b){if(a<20&&b<10)return `${fN(a)} − ${fN(b)} = ${fN(a-b)}. Thử lại: ${fN(a-b)} + ${fN(b)} = ${fN(a)}.`;return expl(hasBorrow(a,b)?'Hàng nào không trừ được thì mượn 1 ở hàng bên trái.':'',`${fN(a)} − ${fN(b)} = ${fN(a-b)}.`,`Thử lại: ${fN(a-b)} + ${fN(b)} = ${fN(a)}.`);}
MG.missing=function(G,lv,P){const mx=lim(G,P);const mul=P.mulOnly||(P.mul&&Math.random()<.5);
  if(mul){const T=P.tables||[2,3,4,5,6,7,8,9];const a=RP(T),b=R(2,G<=2?5:10),c=a*b;const t=R(0,3);
    const forms=[[`? × ${a} = ${c}`,b,`Thừa số chưa biết = tích : thừa số kia: ${c} : ${a} = ${b}.`],[`${a} × ? = ${c}`,b,`${c} : ${a} = ${b}.`],[`? : ${a} = ${b}`,c,`Số bị chia = thương × số chia: ${b} × ${a} = ${c}.`],[`${c} : ? = ${b}`,a,`Số chia = số bị chia : thương: ${c} : ${b} = ${a}.`]][t];
    return Qin('Tìm số thích hợp.',forms[1],{big:forms[0],sk:'nhanchia',hints:['Dùng quan hệ giữa phép nhân và phép chia.',t<2?'Lấy tích chia cho thừa số đã biết.':t===2?'Lấy thương nhân với số chia.':'Lấy số bị chia chia cho thương.'],explain:forms[2]});}
  let a=R(1,Math.floor(mx/2)),b=R(1,Math.floor(mx/2));if(P.small){a=R(0,mx);b=R(0,mx-a);}const c=a+b;const t=R(0,3);
  const forms=[[`? + ${fN(b)} = ${fN(c)}`,a,`Số hạng = tổng − số hạng kia: ${fN(c)} − ${fN(b)} = ${fN(a)}.`,'Lấy tổng trừ số hạng đã biết.'],[`${fN(a)} + ? = ${fN(c)}`,b,`${fN(c)} − ${fN(a)} = ${fN(b)}.`,'Lấy tổng trừ số hạng đã biết.'],[`? − ${fN(b)} = ${fN(a)}`,c,`Số bị trừ = hiệu + số trừ: ${fN(a)} + ${fN(b)} = ${fN(c)}.`,'Lấy hiệu cộng số trừ.'],[`${fN(c)} − ? = ${fN(a)}`,b,`Số trừ = số bị trừ − hiệu: ${fN(c)} − ${fN(a)} = ${fN(b)}.`,'Lấy số bị trừ trừ hiệu.']][t];
  if(lv===2&&G>=2){const k=R(1,Math.floor(mx/4));const tt=R(0,1);if(tt===0){const v=a+b+k;return Qin('Tìm số thích hợp.',a,{big:`? + ${fN(b)} = ${fN(v)} − ${fN(k)}`,bigSmall:true,sk:'congtru',hints:['Tính vế phải trước.',`${fN(v)} − ${fN(k)} = ${fN(c)}`],explain:expl(`${fN(v)} − ${fN(k)} = ${fN(c)}`,`? = ${fN(c)} − ${fN(b)} = ${fN(a)}`)});}
    return Qin('Tìm số thích hợp.',c,{big:`? − ${fN(b)} = ${fN(a-k>=0?a-k:a)} + ${fN(a-k>=0?k:0)}`,bigSmall:true,sk:'congtru',hints:['Tính vế phải trước.','Số bị trừ = hiệu + số trừ.'],explain:expl(`Vế phải = ${fN(a)}`,`? = ${fN(a)} + ${fN(b)} = ${fN(c)}`)});}
  return Qin('Tìm số thích hợp.',forms[1],{big:forms[0],sk:'congtru',hints:['Nhớ tên các thành phần: số hạng, tổng, số bị trừ, số trừ, hiệu.',forms[3]],explain:forms[2]});};
/* điền số không cần tính (giữ nguyên tổng / hiệu / tích) */
MG.keep=function(G,lv,P){const mx=lim(G,P);const t=lv===2&&G>=3?RP(['mul+','mul−']):lv===0?'add':RP(['add','sub']);
  if(t==='add'){const a=R(Math.floor(mx/10),Math.floor(mx/2)),b=R(Math.floor(mx/10),Math.floor(mx/2)),k=R(1,Math.min(b-1,Math.max(1,Math.floor(mx/10))));if(b-k<=0)return MG.keep(G,lv,P);
    return Qin('Điền số thích hợp (không cần tính tổng).',b-k,{big:`${fN(a)} + ${fN(b)} = ${fN(a+k)} + ?`,bigSmall:true,sk:'congtru',hints:['Số hạng thứ nhất tăng thêm bao nhiêu?',`Số hạng thứ nhất tăng ${k} thì số hạng thứ hai phải giảm ${k} để tổng không đổi.`],explain:expl(`${fN(a+k)} hơn ${fN(a)} là ${k}.`,`Để tổng không đổi: ${fN(b)} − ${k} = ${fN(b-k)}.`)});}
  if(t==='sub'){const a=R(Math.floor(mx/3),mx-Math.floor(mx/10)),b=R(1,Math.floor(a/2)),k=R(1,Math.max(1,Math.floor(mx/10)));if(a+k>mx)return MG.keep(G,lv,P);
    return Qin('Điền số thích hợp (không cần tính hiệu).',b+k,{big:`${fN(a)} − ${fN(b)} = ${fN(a+k)} − ?`,bigSmall:true,sk:'congtru',hints:['Số bị trừ tăng thêm bao nhiêu?',`Số bị trừ tăng ${k} thì số trừ cũng phải tăng ${k} để hiệu không đổi.`],explain:expl(`${fN(a+k)} hơn ${fN(a)} là ${k}.`,`Để hiệu không đổi: ${fN(b)} + ${k} = ${fN(b+k)}.`)});}
  const a=RP(P.tables||[2,3,4,5,6,7,8,9]),b=R(2,9);const plus=t==='mul+';
  return Qin('Điền số thích hợp (không cần tính).',plus?b+1:b-1,{big:`${a} × ${b} ${plus?'+':'−'} ${a} = ${a} × ?`,sk:'nhanchia',hints:[`${a} × ${b} là ${b} lần ${a}.`,plus?`Thêm 1 lần ${a} nữa.`:`Bớt đi 1 lần ${a}.`],explain:`${a} × ${b} là ${b} lần ${a}; ${plus?'thêm':'bớt'} 1 lần ${a} được ${plus?b+1:b-1} lần ${a}: ${a} × ${plus?b+1:b-1}.`});};
MG.mental=function(G,lv,P){const u=P.round||(G<=1?10:G===2?100:1000);const n=lv===0?2:3;const xs=[];for(let i=0;i<n;i++)xs.push(R(1,9)*u);const plus=Math.random()<.5||xs[0]<xs[1];let v=plus?xs[0]+xs[1]:xs[0]-xs[1];if(n===3&&v+xs[2]>Math.max(lim(G,P),u*10))return MG.mental(G,lv,P);if(plus&&v>Math.max(lim(G,P),u*10))return MG.mental(G,lv,P);let big=`${fN(xs[0])} ${plus?'+':'−'} ${fN(xs[1])}`;
  if(n===3){v+=xs[2];big+=` + ${fN(xs[2])}`;}if(v<0)return MG.mental(G,lv,P);
  return Qin('Tính nhẩm.',v,{big:big+' = ?',sk:'congtru',hints:[`Đếm theo ${fN(u)}: coi mỗi ${fN(u)} là 1 đơn vị.`,`${xs[0]/u} ${plus?'+':'−'} ${xs[1]/u}${n===3?' + '+xs[2]/u:''}`],explain:`${xs.slice(0,n).map(x=>x/u+' '+({10:'chục',100:'trăm',1000:'nghìn'}[u]||'')).join(plus?' + ':' − ')} → ${fN(v)}.`});};
MG.expr=function(G,lv,P){const T=G>=4?[2,3,4,5,6,7,8,9,12,15,25]:[2,3,4,5,6,7,8,9];const t=lv===0?RP(['a+bc','a-bc']):lv===1?RP(['(a+b)c','(a-b):c','a:b+c']):RP(['a+bc-d','(a+b)c-d','abc']);
  for(let k=0;k<50;k++){let big,v,ex;const a=R(10,G>=4?999:99),b=R(2,9),c=RP(T),d=R(1,50);
    if(t==='a+bc'){v=a+b*c;big=`${a} + ${b} × ${c}`;ex=expl('Nhân trước, cộng sau.',`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${v}`);}
    else if(t==='a-bc'){if(a<b*c)continue;v=a-b*c;big=`${a} − ${b} × ${c}`;ex=expl('Nhân trước, trừ sau.',`${b} × ${c} = ${b*c}`,`${a} − ${b*c} = ${v}`);}
    else if(t==='(a+b)c'){const x=R(2,30),y=R(2,30);v=(x+y)*b;big=`(${x} + ${y}) × ${b}`;ex=expl('Trong ngoặc trước.',`${x} + ${y} = ${x+y}`,`${x+y} × ${b} = ${v}`);}
    else if(t==='(a-b):c'){const q=R(2,20);const y=R(1,40);const x=q*b+y;v=q;big=`(${x} − ${y}) : ${b}`;ex=expl('Trong ngoặc trước.',`${x} − ${y} = ${x-y}`,`${x-y} : ${b} = ${q}`);}
    else if(t==='a:b+c'){const q=R(2,20);v=q+d;big=`${q*b} : ${b} + ${d}`;ex=expl('Chia trước, cộng sau.',`${q*b} : ${b} = ${q}`,`${q} + ${d} = ${v}`);}
    else if(t==='a+bc-d'){if(a+b*c<d)continue;v=a+b*c-d;big=`${a} + ${b} × ${c} − ${d}`;ex=expl('Nhân trước.',`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${a+b*c}`,`${a+b*c} − ${d} = ${v}`);}
    else if(t==='(a+b)c-d'){const x=R(2,30),y=R(2,30);if((x+y)*b<d)continue;v=(x+y)*b-d;big=`(${x} + ${y}) × ${b} − ${d}`;ex=expl(`${x} + ${y} = ${x+y}`,`${x+y} × ${b} = ${(x+y)*b}`,`${(x+y)*b} − ${d} = ${v}`);}
    else{v=b*c*2;big=`${b} × ${c} × 2`;ex=expl(`${b} × ${c} = ${b*c}`,`${b*c} × 2 = ${v}`);}
    if(v<0||v>999999)continue;return Qin('Tính giá trị của biểu thức.',v,{big:big+' = ?',bigSmall:big.length>16,sk:'congtru',hints:['Trong ngoặc trước; nhân, chia trước; cộng, trừ sau.','Làm từng bước, viết kết quả từng bước ra giấy.'],explain:ex});}
  return MG.addsub(G,0,P);};
MG.quicksum=function(G,lv,P){if(G>=3&&lv===2)return TDG.quick(Math.max(3,G),2);if(G<=1)return Object.assign(TDG.quick(1,0),{sk:skOf('congtru')});return Object.assign(TDG.quick(G,lv),{sk:skOf('congtru')});};
MG.letter=function(G,lv,P){const a=R(2,50),b=R(2,9),c=R(1,99);const t=R(0,2);const big=[`a + b × c`,`(a + b) × c`,`a × b − c`][t];const v=[a+b*c,(a+b)*c,a*b-c][t];if(v<0)return MG.letter(G,lv,P);
  return Qin(`Tính giá trị của biểu thức ${big} với a = ${a}, b = ${b}, c = ${c}.`,v,{sk:'congtru',hints:['Thay số vào chữ.','Làm theo thứ tự: trong ngoặc, nhân chia, cộng trừ.'],explain:[`${a} + ${b} × ${c} = ${a} + ${b*c} = ${v}`,`(${a} + ${b}) × ${c} = ${a+b} × ${c} = ${v}`,`${a} × ${b} − ${c} = ${a*b} − ${c} = ${v}`][t]});};
