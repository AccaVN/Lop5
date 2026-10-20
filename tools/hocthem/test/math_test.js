// Kiểm thử bộ đề Toán mới: sinh hàng loạt bài cho mọi lớp/chặng/bài, kiểm tra cấu trúc và tự giải lại phép tính.
const fs=require('fs'),vm=require('vm'),path=require('path');
const files=['10-cards.js','20-td.js','25-math-a.js','25-math-b.js','25-math-c.js','25-math-d.js','25-math-e.js','26-plan.js','26z-plan.js','27-mathhook.js'];
const src=files.map(f=>fs.readFileSync(path.join(__dirname,'..','src',f),'utf8')).join('\n');
const SKS={0:'quyluat,thoigian,hinhhoc,so,congtru,nhanchia,giaitoan,doluong',1:'hinhhoc,so,congtru,nhanchia,giaitoan,doluong',2:'thongke,hinhhoc,so,congtru,nhanchia,giaitoan,doluong',3:'so,congtru,nhanchia,giaitoan,doluong',4:'phanso,thongke,hinhhoc,so,congtru,nhanchia,giaitoan,doluong',5:'so,phanso,stp,tiso,giaitoan,hinhhoc,doluong,xacsuat'};
function ctx(G){const c={Math,String,Number,Array,Object,JSON,Set,Map,isNaN,console,GRADE:G,window:{}};c.SKILLS={};SKS[G].split(',').forEach(k=>c.SKILLS[k]=k);
  c.esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));c.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};c.pick=a=>a[Math.floor(Math.random()*a.length)];
  vm.createContext(c);vm.runInContext(src+';this.MG=MG;this.PLAN=PLAN;this.buildMathNew=buildMathNew;this.mgMake=mgMake;',c);return c;}
const N=+process.argv[2]||20;let errs=0,checked=0,verified=0,minLen=99;const seen={};
const bad=(G,w,d,name,msg,q)=>{errs++;const k=(name==='build'?'G'+G+'C'+(w+1)+'B'+(d+1)+'|':'')+name+'|'+msg.slice(0,18);seen[k]=(seen[k]||0)+1;if(seen[k]<=2)console.log(`LỖI lớp ${G} C${w+1}B${d+1} ${name}: ${msg}`,JSON.stringify({p:q&&q.prompt,b:q&&q.big,a:q&&q.answer,o:q&&q.options,v:q&&q.vals}).slice(0,330));};
const strip=h=>String(h||'').replace(/<[^>]+>/g,' ');
// tính biểu thức số học (hỗ trợ phân số a/b và số thập phân có dấu phẩy)
function ev(e){e=e.replace(/(\d)[  ](?=\d{3}\b)/g,'$1').replace(/(\d),(\d)/g,'$1.$2').replace(/(\d+)\/(\d+)/g,'($1/$2)').replace(/×/g,'*').replace(/ : /g,'/').replace(/−/g,'-').trim();if(!/^[\d+\-*/().\s]+$/.test(e))return null;try{const v=Function('return ('+e+')')();return Number.isFinite(v)?v:null;}catch(x){return null;}}
const OPX={'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,':':(a,b)=>b&&a%b===0?a/b:NaN};const nn=x=>Number(String(x).replace(/[  ]/g,''));
function verify2(q){const p=q.prompt,big=q.big||'';let m;
  if(q.mg==='trueFalse'){m=/^([\d  ]+) (\S) ([\d  ]+) = ([\d  ]+)$/.exec(big);return (OPX[m[2]](nn(m[1]),nn(m[3]))===nn(m[4])?'Đúng':'Sai')===q.answer?true:'sai Đúng/Sai';}
  if(q.mg==='chooseOp'){m=/^([\d  ]+) ☐ ([\d  ]+) = ([\d  ]+)$/.exec(big);const fit=q.options.filter(o=>OPX[o](nn(m[1]),nn(m[2]))===nn(m[3]));return fit.length===1&&fit[0]===q.answer?true:'dấu: '+fit.join(',');}
  if(q.mg==='numberLine'){m=/data-nl="(\d+),(\d+),(\d+)"/.exec(q.visual);const labs=[...q.visual.matchAll(/<text[^>]*>([\d  ]+)<\/text>/g)].map(r=>nn(r[1]));const x0=nn(m[1]),d=nn(m[2]),pos=+m[3];// kiểm tra nhãn khớp tia số
      if(labs[0]!==x0)return 'nhãn đầu sai';return x0+pos*d===q.answer?true:'tia số sai';}
  if(q.mg==='decTF'){const [L,Rr]=big.split(' = ');const l=ev(L),r=ev(Rr);return ((Math.abs(l-r)<1e-9?'Đúng':'Sai')===q.answer)?true:'decTF';}
  if(q.mg==='factFamily'){const tv=e=>{const r=/^([\d  ]+) (\S) ([\d  ]+) = ([\d  ]+)$/.exec(e);return OPX[r[2]](nn(r[1]),nn(r[3]))===nn(r[4]);};const t=q.options.filter(tv);return t.length===1&&t[0]===q.answer?true:'gia đình: '+t.join(';');}
  if(q.mg==='estimate'){if((m=/Ước lượng: ([\d  ]+) × (\d+)/.exec(p))){const a=nn(m[1]),b=+m[2];const u=a>=100&&/hàng trăm/.test(q.hints[0])?100:/hàng trăm/.test(q.hints[0])?100:10;return Math.round(a/u)*u*b===nn(q.answer)?true:'ước lượng nhân';}
    m=/Ước lượng: ([\d  ]+) (\S) ([\d  ]+) khoảng.*hàng (chục|trăm|nghìn)/.exec(p);const u={chục:10,trăm:100,nghìn:1000}[m[4]];const r=x=>Math.round(x/u)*u;return OPX[m[2]](r(nn(m[1])),r(nn(m[3])))===nn(q.answer)?true:'ước lượng';}
  if(q.mg==='clockElapsed'){const tt=s=>{const r=/(\d+) giờ(?: (\d+) phút)?/.exec(s);return +r[1]*60+(+r[2]||0);};if((m=/lúc (\d+ giờ(?: \d+ phút)?), xong lúc (\d+ giờ(?: \d+ phút)?)\./.exec(p)))return tt(m[2])-tt(m[1])===q.answer?true:'thời gian';
    m=/lúc (\d+ giờ(?: \d+ phút)?) và .* trong (\d+) phút/.exec(p);const v=tt(m[1])+ +m[2];return tt(q.answer)===v?true:'giờ xong';}
  if(q.mg==='percentWp'){const nums=[...p.matchAll(/([\d][\d  ]*)(%| đồng)/g)].map(r=>[nn(r[1]),r[2]]);const pc=nums.find(x=>x[1]==='%')[0],pr=nums.find(x=>x[1]===' đồng')[0];
    if(/bao nhiêu tiền/.test(p))return pr*pc/100===q.answer||'pt1';if(/sau khi giảm là/.test(p))return pr-pr*pc/100===q.answer||'pt2';if(/bán lãi/.test(p))return pr+pr*pc/100===q.answer||'pt3';if(/lúc chưa giảm/.test(p))return Math.abs(q.answer*(100-pc)/100-pr)<1e-6||'pt4';}
  if(q.mg==='wpChain'){const n=[...p.matchAll(/(\d[\d  ]*)/g)].map(r=>nn(r[1]));const v=/còn lại/.test(p)&&/thêm/.test(p)?n[0]+n[1]-n[2]:/còn lại/.test(p)?n[0]-n[1]-n[2]:n[0]+n[1]+n[2];return v===q.answer?true:'nhiều bước';}
  if(q.mg==='arrayMul'){const e=/mỗi hàng \d+ (\S+)\./.exec(p)[1];const cnt=(q.visual.match(new RegExp(e,'gu'))||[]).length;if(q.type==='input')return cnt===q.answer?true:'mảng';const r=/^(\d+) × (\d+)$/.exec(q.answer);return r&&+r[1]*+r[2]===cnt?true:'mảng mc';}
  return null;}
function verify(q){const v2=verify2(q);if(v2!==null)return v2;const big=q.big;if(!big)return null;
  if(q.type==='input'&&/[?]/.test(big)&&big.includes('=')){const [L,Rr]=big.split('=');const l=ev(L.replace('?',String(q.answer))),r=ev(Rr.replace('?',String(q.answer)));if(l==null||r==null)return null;return Math.abs(l-r)<1e-9?true:`${l} ≠ ${r}`;}
  if(q.type==='mc'&&big.includes('☐')&&['>','<','='].includes(q.answer)){const [L,Rr]=big.split('☐');const l=ev(L),r=ev(Rr);if(l==null||r==null)return null;const s=Math.abs(l-r)<1e-9?'=':l>r?'>':'<';return s===q.answer?true:`dấu đúng là ${s}`;}
  if(q.type==='mc'&&/= \?$/.test(big)){const l=ev(big.replace('= ?',''));const a=ev(String(q.answer));if(l==null||a==null)return null;return Math.abs(l-a)<1e-9?true:`${l} ≠ ${a}`;}
  return null;}
for(let G=0;G<=5;G++){const c=ctx(G);const P=c.PLAN[G];if(!P||P.length!==8){console.log('Thiếu bảng bài lớp',G);errs++;continue;}
  for(let w=0;w<8;w++){if(P[w].length!==6){console.log('Chặng thiếu bài',G,w);errs++;}for(let d=0;d<6;d++){
    for(let t=0;t<N;t++){let qs;try{qs=c.buildMathNew(w,d);}catch(e){bad(G,w,d,'build','EXC '+e.message);continue;}
      if(qs)minLen=Math.min(minLen,qs.length);if(!qs||qs.length<10){bad(G,w,d,'build','bài thiếu câu: '+(qs&&qs.length));}
      if(qs&&new Set(qs.map(q=>q.prompt+'|'+(q.big||'')+'|'+q.answer+'|'+(q.visual||'')+'|'+(q.options||[]).slice().sort().join(','))).size!==qs.length)bad(G,w,d,'build','câu trùng trong bài');
      (qs||[]).forEach(q=>{checked++;const nm=q.mg;const all=[q.prompt,q.big,q.explain,(q.hints||[]).join(' '),strip(q.visual),(q.options||[]).join(' '),(q.chips||[]).join(' '),q.answer].join(' ');
        if(/NaN|undefined|Infinity|\[object|null/.test(all))return bad(G,w,d,nm,'chuỗi lỗi',q);
        if(!q.explain)bad(G,w,d,nm,'thiếu lời giải',q);if(!q.hints||!q.hints[0])bad(G,w,d,nm,'thiếu gợi ý',q);if(!c.SKILLS[q.skill])bad(G,w,d,nm,'kỹ năng lạ '+q.skill,q);
        if(q.type==='mc'){if(!q.options.includes(q.answer))bad(G,w,d,nm,'đáp án không có trong lựa chọn',q);if(new Set(q.options).size!==q.options.length)bad(G,w,d,nm,'lựa chọn trùng',q);if(q.options.length<2)bad(G,w,d,nm,'ít lựa chọn',q);}
        else if(q.type==='input'){if(!Number.isInteger(q.answer)||q.answer<0)bad(G,w,d,nm,'đáp án không phải số tự nhiên',q);if(String(q.answer).length>6)bad(G,w,d,nm,'quá 6 chữ số',q);}
        else if(q.type==='slots'){const pool=q.chips.slice();for(const v of q.vals){const i=pool.indexOf(v);if(i<0){bad(G,w,d,nm,'thiếu thẻ',q);break;}pool.splice(i,1);}}
        else if(q.type==='order'){if(q.items.slice().sort().join('|')!==q.answer.slice().sort().join('|'))bad(G,w,d,nm,'thẻ xếp không khớp',q);}
        else bad(G,w,d,nm,'kiểu lạ '+q.type,q);
        const v=verify(q);if(v!==null){verified++;if(v!==true)bad(G,w,d,nm,'GIẢI LẠI SAI: '+v,q);}
        // lặp lại câu cùng dạng
        const n2=c.mgMake([q.mg,q.mp],q.lv);if(!n2)bad(G,w,d,nm,'không sinh lại được câu cùng dạng',q);});}}}}
console.log(JSON.stringify(seen));console.log('Độ dài bài ngắn nhất:',minLen);console.log('Đã sinh',checked,'câu Toán, tự giải lại',verified,'câu, lỗi:',errs);process.exit(errs?1:0);
