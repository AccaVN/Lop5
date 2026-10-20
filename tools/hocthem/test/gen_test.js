// Kiểm thử bộ sinh đề Toán tư duy: sinh nhiều câu cho mọi lớp/bài/mức, kiểm tra cấu trúc + giải lại độc lập.
const fs=require('fs'),vm=require('vm'),path=require('path');
const src=['10-cards.js','20-td.js','21-td-b.js','25-math-a.js','25-math-c.js','30-lessons.js'].map(f=>fs.readFileSync(path.join(__dirname,'..','src',f),'utf8')).join('\n');
function ctxFor(G){const c={Math,String,Number,Array,Object,JSON,Set,Map,isNaN,console,GRADE:G};
  c.esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  c.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  c.pick=a=>a[Math.floor(Math.random()*a.length)];vm.createContext(c);vm.runInContext(src+'\nthis.TDG=TDG;this.TD_ALL=TD_ALL;this.TD_LA=TD_LA;this.tdMake=tdMake;this.tdBuild=tdBuild;this.TD_LIST=TD_LIST;this.KC=KC;this.fN=fN;',c);return c;}
const num=s=>Number(String(s).replace(/[\s ]/g,'').replace('−','-'));
let errs=0,checked=0,solved=0;const seenE={};const bad=(G,L,lv,msg,q)=>{const kk=L+'|'+String(msg).slice(0,14);seenE[kk]=(seenE[kk]||0)+1;if(seenE[kk]<=2)console.log('LỖI lớp',G,L,'lv',lv,msg,JSON.stringify({p:q&&q.prompt,big:q&&q.big,a:q&&q.answer,o:q&&q.options}).slice(0,400));errs++;};
const strip=h=>String(h||'').replace(/<[^>]+>/g,' ');
function solve(gen,q){/* trả về đáp án tính độc lập hoặc undefined nếu không giải */
  const p=q.prompt;let m;
  if(gen==='ap'){const a=q.big.split(',').map(s=>s.trim());const k=a.indexOf('?');const v=a.map(x=>x==='?'?null:num(x));const known=v.map((x,i)=>[i,x]).filter(t=>t[1]!=null);const d=(known[known.length-1][1]-known[0][1])/(known[known.length-1][0]-known[0][0]);for(const [i,x] of known)if(x!==known[0][1]+(i-known[0][0])*d)return 'NOT_AP';return known[0][1]+(k-known[0][0])*d;}
  if(gen==='sumdiff'&&q.type==='input'){m=/(\d[\d ]*)\s*(lít|cây)?[^\d]*?(?:nhiều hơn|hiệu hai số là)[^\d]*?(\d[\d ]*)/.exec(p.replace(/(tất cả|Tổng hai số là) /,'S:'));const S=num(/(?:tất cả|được|Tổng hai số là)\s*(\d[\d ]*)/.exec(p)[1]);const D=num(/(?:hơn [^\d]*|hiệu hai số là )(\d[\d ]*)/.exec(p)[1]);return (S-D)/2;}
  if(gen==='sumdiff'&&q.type==='slots'){const S=num(/(?:tất cả|được|Tổng hai số là)\s*(\d[\d ]*)/.exec(p)[1]);const D=num(/(?:hơn [^\d]*|hiệu hai số là )(\d[\d ]*)/.exec(p)[1]);return [(S+D)/2,(S-D)/2].join('|');}
  if(gen==='legs'){if((m=/có (\d+) con, đếm được (\d+) chân.*con (chó|gà)/.exec(p))){const H=+m[1],L=+m[2];for(let d=0;d<=H;d++)if(2*(H-d)+4*d===L)return m[3]==='chó'?d:H-d;}
    if((m=/có (\d+) chiếc xe.*được (\d+) bánh/.exec(p))){const H=+m[1],W=+m[2];for(let d=0;d<=H;d++)if(2*(H-d)+3*d===W)return d;}}
  if(gen==='shake'){if((m=/Có (\d+) bạn gặp nhau/.exec(p))||(m=/Có (\d+) đội bóng/.exec(p))){const n=+m[1];let c=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)c++;return c;}
    if((m=/Có (\d+) bạn, mỗi bạn gửi/.exec(p))){const n=+m[1];return n*(n-1);}
    if((m=/Cả giải có (\d+) trận/.exec(p))){const T=+m[1];for(let n=2;n<100;n++)if(n*(n-1)/2===T)return n;}}
  if(gen==='trees'){if((m=/cưa một khúc gỗ thành (\d+) đoạn, mỗi lần cưa mất (\d+)/i.exec(p)))return (+m[1]-1)*+m[2];
    if((m=/dài (\d+) m, người ta trồng cây cách đều nhau (\d+) m, cả hai đầu/.exec(p)))return +m[1]/+m[2]+1;
    if((m=/dài (\d+) m, cứ (\d+) m cắm một cọc/.exec(p)))return +m[1]/+m[2];
    if((m=/cách nhau (\d+) m, người ta trồng cây cách đều nhau (\d+) m/.exec(p)))return +m[1]/+m[2]-1;
    if((m=/chu vi (\d+) m, cứ (\d+) m/.exec(p)))return +m[1]/+m[2];
    if((m=/tầng 1 lên tầng (\d+) mất (\d+) giây.*lên tầng (\d+)/.exec(p)))return (+m[2]/(+m[1]-1))*(+m[3]-1);}
  if(gen==='back'){if((m=/lấy số đó (.*) thì được ([\d ]+)\./.exec(p))){const ops=m[1].split(' rồi ').map(s=>{const t=/(cộng|trừ|nhân với|chia cho) ([\d ]+)/.exec(s);return [t[1],num(t[2])];});let v=q.answer;for(const [o,k] of ops){if(o==='cộng')v+=k;else if(o==='trừ')v-=k;else if(o==='nhân với')v*=k;else{if(v%k)return 'NOT_INT';v/=k;}if(v<0)return 'NEG';}return v===num(m[2])?q.answer:'MISMATCH '+v;}
    if((m=/lúc này .* có ([\d ]+) /.exec(p))){let v=q.answer;const parts=p.split('sau đó');for(const s of p.matchAll(/(được mẹ cho thêm|cho bạn) (\d+)/g)){v+=s[1]==='cho bạn'?-(+s[2]):+s[2];if(v<0)return 'NEG';}return v===num(m[1])?q.answer:'MISMATCH';}}
  if(gen==='trial'&&q.type==='mc'&&(m=/tổng của chúng là (\d+) và tích của chúng là (\d+)/.exec(p))){const S=+m[1],P=+m[2];const ok=q.options.filter(o=>{const [a,b]=o.split(' và ').map(Number);return a+b===S&&a*b===P;});return ok.length===1?ok[0]:'AMBIG '+ok.length;}
  if(gen==='trial'&&(m=/lớn hơn số bé (\d+) đơn vị và tích của chúng là (\d+)/.exec(p))){const D=+m[1],P=+m[2];const ok=q.options.filter(o=>{const [a,b]=o.split(' và ').map(Number);return b-a===D&&a*b===P;});return ok.length===1?ok[0]:'AMBIG';}
  if(gen==='trial'&&(m=/tổng hai chữ số là (\d+) và chữ số hàng chục hơn chữ số hàng đơn vị (\d+)/.exec(p))){const ok=q.options.filter(o=>{const x=+o;return Math.floor(x/10)+x%10===+m[1]&&Math.floor(x/10)-x%10===+m[2];});return ok.length===1?ok[0]:'AMBIG';}
  if(gen==='trial'&&(m=/lớn hơn (\d+) mà khi chia cho (\d+) hay chia cho (\d+) đều dư (\d+)/.exec(p))){for(let x=+m[1]+1;x<1000;x++)if(x%+m[2]===+m[4]&&x%+m[3]===+m[4])return x;}
  if(gen==='choose'){if((m=/có (\d+) con đường, từ chợ đến trường có (\d+) con đường, từ trường đến công viên có (\d+)/.exec(p)))return +m[1]*+m[2]*+m[3];if((m=/có (\d+) con đường, từ trường đến thư viện có (\d+)/.exec(p)))return +m[1]*+m[2];if((m=/^Có (\d+) [^.]* và (\d+) /.exec(p)))return +m[1]*+m[2];}
  if(gen==='count'){if((m=/Từ (\d+) đến (\d+) có bao nhiêu số \(kể cả/.exec(p)))return +m[2]-+m[1]+1;if((m=/lớn hơn (\d+) và bé hơn (\d+)/.exec(p)))return +m[2]-+m[1]-1;
    if((m=/Từ (\d+) đến (\d+) có bao nhiêu số (chẵn|lẻ)/.exec(p))){let c=0;for(let x=+m[1];x<=+m[2];x++)if((x%2===0)===(m[3]==='chẵn'))c++;return c;}
    if((m=/dày (\d+) trang/.exec(p))){let c=0;for(let x=1;x<=+m[1];x++)c+=String(x).length;return c;}
    if((m=/Từ ba chữ số ([\d, ]+) có thể/.exec(p))){const ds=m[1].split(',').map(s=>s.trim());const rep=/giống nhau/.test(p);const set=new Set();for(const a of ds)for(const b of ds){if(!rep&&a===b)continue;set.add(a+b);}return set.size;}}
  if(gen==='line'&&q.type==='input'){if((m=/thứ (\d+) tính từ bên trái và thứ (\d+) tính từ bên phải/.exec(p)))return +m[1]+ +m[2]-1;if((m=/hàng có (\d+) bạn\. \S+ đứng thứ (\d+) tính từ bên trái/.exec(p)))return +m[1]-+m[2]+1;if((m=/đứng thứ (\d+) và \S+ đứng thứ (\d+)/.exec(p)))return +m[2]-+m[1]-1;}
  if(gen==='line'&&q.type==='mc'){const st=p.split('. ').slice(0,-1);const nm=q.options;const g={};nm.forEach(x=>g[x]=new Set());st.forEach(s=>{let t=/^(\S+) cao hơn (\S+)$/.exec(s);if(t)g[t[1]].add(t[2]);t=/^(\S+) thấp hơn (\S+)$/.exec(s);if(t)g[t[2]].add(t[1]);});
    const taller=x=>{const seen=new Set([x]);const st=[x];while(st.length){const y=st.pop();for(const z of g[y])if(!seen.has(z)){seen.add(z);st.push(z);}}return seen.size-1;};const ask=/cao nhất/.test(p);const sc=nm.map(x=>[x,taller(x)]);return ask?sc.find(t=>t[1]===nm.length-1)[0]:sc.find(t=>t[1]===0)[0];}
  if(gen==='truth'){const P=q.options;const body=p.slice(p.indexOf('nghe:')+5);const sts=[];for(const s of body.matchAll(/(\S+): “([^”]+)”/g)){const sp=s[1],t=s[2];let f;let mm;if((mm=/^Tớ không/.exec(t)))f=c=>c!==sp;else if((mm=/^(\S+) không/.exec(t))){const o=mm[1];f=c=>c!==o;}else{const o=t.split(' ')[0];f=c=>c===o;}sts.push([sp,f]);}
    const one=/Chỉ có một bạn nói thật/.test(p);const need=one?1:P.length-1;const sols=P.filter(c=>sts.filter(x=>x[1](c)).length===need);if(sols.length!==1)return 'AMBIG '+sols.length;if(/Bạn nào nói thật\?/.test(p)){const tt=sts.filter(x=>x[1](sols[0])).map(x=>x[0]);return tt.length===1?tt[0]:'AMBIG_T';}return sols[0];}
  if(gen==='peri'&&q.type==='input'){const rects=[...q.visual.matchAll(/<rect x="(\d+)" y="(\d+)"/g)].map(r=>[(+r[1]-6)/36,(+r[2]-6)/36]);const set=new Set(rects.map(r=>r.join(',')));if(/bao nhiêu ô vuông/.test(p))return rects.length;const side=+(/cạnh (\d+) cm/.exec(p)[1]);if(/Diện tích/.test(p))return rects.length*side*side;let per=0;rects.forEach(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{if(!set.has((x+a)+','+(y+b)))per++;}));return per*side;}
  if(gen==='magic'&&/tổng các số ở mỗi hàng/.test(p)){const cells=[...q.visual.matchAll(/<span class="(hid)?">([^<]*)<\/span>/g)].map(r=>r[2]);const g=[0,1,2].map(i=>cells.slice(i*3,i*3+3));const ti=cells.indexOf('?');const r=Math.floor(ti/3),c=ti%3;
    const full=g.find(row=>row.every(x=>x!=='?'&&x!=='·'));const S=full.reduce((a,x)=>a+num(x),0);const row=g[r];if(row.filter(x=>x==='?'||x==='·').length===1)return S-row.filter(x=>x!=='?').reduce((a,x)=>a+num(x),0);const col=[g[0][c],g[1][c],g[2][c]];return S-col.filter(x=>x!=='?').reduce((a,x)=>a+num(x),0);}
  if(gen==='magic'&&/tháp số/.test(p)){const rows=[...q.visual.matchAll(/<div class="pr">(.*?)<\/div>/g)].map(r=>[...r[1].matchAll(/<span[^>]*>([^<]*)<\/span>/g)].map(x=>x[1]));
    // giải: thử mọi giá trị cho ô ?
    for(let v=0;v<500;v++){const R=rows.map(r=>r.map(x=>x==='?'?v:num(x)));let ok=true;for(let i=0;i<R.length-1;i++)for(let j=0;j<R[i].length;j++)if(R[i][j]!==R[i+1][j]+R[i+1][j+1])ok=false;if(ok)return v;}return 'NOSOL';}
  if(gen==='cube'&&(m=/mỗi cạnh có (\d+) khối/.exec(p))){const n=+m[1];const k=/đúng 3 mặt/.test(p)?3:/đúng 2 mặt/.test(p)?2:/đúng 1 mặt/.test(p)?1:0;let c=0;for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++){const f=[x,y,z].filter(t=>t===0||t===n-1).length;if(f===k)c++;}return c;}
  if(gen==='shapes'&&/đoạn thẳng có hai đầu/.test(p)){const m2=+(/có (\d+) điểm/.exec(p)[1]);return m2*(m2-1)/2;}
  if(gen==='shapes'&&/bao nhiêu hình vuông/.test(p)){const k=Math.round(Math.sqrt((q.visual.match(/<rect/g)||[]).length));let c=0;for(let s=1;s<=k;s++)c+=(k-s+1)**2;return c;}
  if(gen==='shapes'&&/hình chữ nhật/.test(p)){const n=(q.visual.match(/<rect/g)||[]).length;return n*(n+1)/2;}
  if(gen==='shapes'&&/hình tam giác/.test(p)){const n=(q.visual.match(/<line/g)||[]).length-1;return n*(n-1)/2;}
  if(gen==='quick'&&q.big){const e=q.big.replace('= ?','').replace(/×/g,'*').replace(/−/g,'-');return Function('return '+e)();}
  if(gen==='quick'&&(m=/1 \+ 2 \+ 3 \+ … \+ (\d+)/.exec(p))){let s=0;for(let i=1;i<=+m[1];i++)s+=i;return s;}
  if(gen==='give'){if((m=/có (\d+) \S+ \S*, \S+ có (\d+) .*nhiều hơn .* bao nhiêu/.exec(p)))return +m[1]-+m[2];
    if((m=/có (\d+) [^,]+, \S+ có (\d+) [^.]+\. \S+ phải cho/.exec(p)))return (+m[1]-+m[2])/2;}
  if(gen==='ratio'&&q.type==='slots'&&/Tổng gồm mấy phần/.test(p)){const k=+(/gấp (\d+) lần/.exec(p)[1]);const S=num(/có ([\d ]+) \S+ \S*\. Tổng/.exec(p)?.[1]||/bạn có ([\d ]+)/.exec(p)[1]);return [k+1,S/(k+1)].join('|');}
  if(gen==='nth'&&q.type==='input'){if((m=/Dãy số (\d+), (\d+), .*Số thứ (\d+)/.exec(p)))return +m[1]+(+m[3]-1)*(+m[2]-+m[1]);if((m=/Dãy số (\d+), (\d+), .*, ([\d ]+) có bao nhiêu số/.exec(p)))return (num(m[3])-+m[1])/(+m[2]-+m[1])+1;if((m=/dãy số (\d+), (\d+), .*số ([\d ]+) đứng/.exec(p)))return (num(m[3])-+m[1])/(+m[2]-+m[1])+1;}
  if(gen==='days'&&q.type==='mc'){const WD=['thứ Hai','thứ Ba','thứ Tư','thứ Năm','thứ Sáu','thứ Bảy','Chủ nhật'];if((m=/Hôm nay là (.+?)\. Hỏi (\d+) ngày nữa/.exec(p))){const i=WD.indexOf(m[1]);const r=WD[(i+ +m[2])%7];return r.charAt(0).toUpperCase()+r.slice(1);}if((m=/Ngày (\d+) của một tháng là (.+?)\. Ngày (\d+)/.exec(p))){const i=WD.indexOf(m[2]);const r=WD[(i+ +m[3]-+m[1])%7];return r.charAt(0).toUpperCase()+r.slice(1);}}
  return undefined;}

function solve2(gen,q){const p=q.prompt;let m;const vtx=strip(q.visual);
  if(gen==='matchSeq'){const a=+/Hình 1 dùng (\d+) que/.exec(p)[1],b=+/Hình 2 dùng (\d+) que/.exec(p)[1],c=+/Hình 3 dùng (\d+) que/.exec(p)[1];if(c-b!==b-a)return 'NOT_AP';const d=b-a;if((m=/Hình (\d+) dùng bao nhiêu/.exec(p)))return a+(+m[1]-1)*d;if((m=/Với (\d+) que/.exec(p))){for(let n=1;n<500;n++)if(a+(n-1)*d===+m[1])return n;return 'NOSOL';}}
  if(gen==='machine'){const cells=[...q.visual.matchAll(/<span class="([^"]*)">([^<]*)<\/span>/g)].map(r=>r[2]);const X=cells.slice(1,5),Y=cells.slice(6,10);const pts=[];let tx,ty;X.forEach((x,i)=>{if(x==='?')tx=i;else if(Y[i]==='?')ty=i;else pts.push([num(x),num(Y[i])]);});
    const [[x1,y1],[x2,y2],[x3,y3]]=pts;const k=(y2-y1)/(x2-x1),b=y1-k*x1;if(Math.abs(k*x3+b-y3)>1e-9)return 'NOT_LINEAR';if(ty!=null)return k*num(X[ty])+b;return (num(Y[tx])-b)/k;}
  if(gen==='letters'){const toks=q.big.replace(', ?','').split(', ');const L=toks.map(t=>'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(t[0])),N=toks.map(t=>t.length>1?+t.slice(1):null);
    const ext=a=>{const n=a.length;const d=a[1]-a[0];if(a.every((x,i)=>x===a[0]+i*d))return a[0]+n*d;const ev=a.filter((_,i)=>i%2===0),od=a.filter((_,i)=>i%2===1);const nx=n%2===0?ev:od;const dd=nx[1]-nx[0];if(nx.every((x,i)=>x===nx[0]+i*dd))return nx[0]+nx.length*dd;return null;};
    const l=ext(L);const ns=N[0]==null?'':ext(N);return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[l]+(N[0]==null?'':ns);}
  if(gen==='paths'){m=/lưới \((\d+) hàng, (\d+) cột/.exec(p);const a=+m[1],b=+m[2];const g=[];for(let i=0;i<=a;i++){g[i]=[];for(let j=0;j<=b;j++)g[i][j]=i===0||j===0?1:g[i-1][j]+g[i][j-1];}return g[a][b];}
  if(gen==='coins'){const V=[...p.split('Có bao')[0].matchAll(/(\d+) nghìn/g)].map(r=>+r[1]);const N=+/đúng (\d+) nghìn/.exec(p)[1];let c=0;const go=(i,l)=>{if(i===V.length){if(!l)c++;return;}for(let k=0;k*V[i]<=l;k++)go(i+1,l-k*V[i]);};go(0,N);return c;}
  if(gen==='digitSum'){let c=0;const S=+(/bằng (\d+)\?/.exec(p)||/hơn chữ số hàng đơn vị (\d+)/.exec(p))[1];const three=/ba chữ số/.test(p);for(let n=three?100:10;n<=(three?999:99);n++){const d=String(n).split('').map(Number);if(/tổng/.test(p)&&d.reduce((a,b)=>a+b)===S)c++;else if(/tích/.test(p)&&d[0]*d[1]===S)c++;else if(/hơn chữ số hàng đơn vị/.test(p)&&d[0]-d[1]===S)c++;}return c;}
  if(gen==='balance'){const eqs=[...q.visual.matchAll(/<div class="ht-eq">([^<]*)<\/div>/g)].map(r=>r[1].split(' = ').map(s=>s.split(' + ')));const syms=[...new Set(eqs.flat(2).filter(t=>!/^\d/.test(t)))];const ask=/Tìm số của (\S+)\./.exec(p)[1];
    const val=t=>/^\d/.test(t)?num(t):V[t];let V={};const sols=new Set();const go=i=>{if(i===syms.length){if(eqs.every(([l,r])=>l.reduce((a,t)=>a+val(t),0)===r.reduce((a,t)=>a+val(t),0)))sols.add(V[ask]);return;}for(let v=1;v<=(syms.length===3?100:200);v++){V[syms[i]]=v;go(i+1);}};go(0);return sols.size===1?[...sols][0]:'SOLS '+sols.size;}
  if(gen==='whoWhat'){const head=/^(.+?) mỗi bạn (.+?) một thứ khác nhau: (.+?)\. (.*) Hỏi (\S+) /.exec(p);const P=head[1].split(', '),verb=head[2],I=head[3].split(', ');const cl=head[4].split(/(?<=\.) /).map(x=>{const r=new RegExp('^(\\S+) (không )?'+verb+' (.+)\\.$').exec(x);return {p:r[1],neg:!!r[2],it:r[3]};});
    const per=a=>a.length<=1?[a]:a.flatMap((x,i)=>per(a.slice(0,i).concat(a.slice(i+1))).map(r=>[x,...r]));const ok=per(I).filter(pm=>cl.every(c=>(pm[P.indexOf(c.p)]===c.it)!==c.neg));if(ok.length!==1)return 'AMBIG '+ok.length;return ok[0][P.indexOf(head[5])];}
  if(gen==='pigeon'){if((m=/có (\d+) viên bi đỏ và (\d+) viên bi xanh/.exec(p))){const a=+m[1],b=+m[2];// mô phỏng xui nhất
      if(/ít nhất 1 viên bi đỏ/.test(p))return b+1;if(/đủ cả hai màu/.test(p))return Math.max(a,b)+1;}
    const c=(/các màu ([^.(]+)/.exec(p)[1].split(', ')).length;if((m=/có (\d+) viên cùng màu/.exec(p))){const k=+m[1];return c*(k-1)+1;}if(/2 viên cùng màu/.test(p))return c+1;}
  if(gen==='age'){if((m=/Năm nay \S+ (\d+) tuổi, \S+ của \S+ (\d+) tuổi\. Hỏi khi \S+ (\d+) tuổi/.exec(p)))return +m[2]+(+m[3]-+m[1]);
    if((m=/hơn \S+ (\d+) tuổi\. Sau (\d+) năm nữa, tổng số tuổi .* là (\d+)\./.exec(p))){const D=+m[1],n=+m[2],S=+m[3];for(let c=1;c<100;c++)if((c+n)+(c+D+n)===S)return c;}
    if((m=/hơn \S+ (\d+) tuổi\. Tổng số tuổi .* là (\d+)\./.exec(p))){const D=+m[1],S=+m[2];for(let c=1;c<100;c++)if(c+c+D===S)return c;}
    if((m=/gấp (\d+) lần tuổi \S+, \S+ hơn \S+ (\d+) tuổi/.exec(p))){const k=+m[1],D=+m[2];for(let c=1;c<100;c++)if(k*c-c===D)return c;}}
  if(gen==='sum3'){if((m=/có tất cả ([\d ]+) [^.]+\. \S+ có ([\d ]+) [^,]+, \S+ có ([\d ]+) /.exec(p)))return num(m[1])-num(m[2])-num(m[3]);
    if((m=/có tất cả ([\d ]+) [^.]+\. \S+ có nhiều hơn \S+ ([\d ]+) [^,]+, \S+ có nhiều hơn \S+ ([\d ]+) /.exec(p))){const S=num(m[1]),d1=num(m[2]),d2=num(m[3]);for(let c=0;c<=S;c++)if(c+(c+d2)+(c+d2+d1)===S)return c;return 'NOSOL';}
    if((m=/Trung bình cộng của ba số là ([\d ]+)\. Số thứ nhất là ([\d ]+), số thứ hai là ([\d ]+)\./.exec(p)))return 3*num(m[1])-num(m[2])-num(m[3]);}
  if(gen==='fracRatio'){m=/bằng (\d+)\/(\d+)/.exec(p);const a=+m[1],b=+m[2];if((m=/Tổng hai số là ([\d ]+)\./.exec(p))){const S=num(m[1]);const x=S*a/(a+b);return q.type==='slots'?[x,S-x].join('|'):x;}m=/Hiệu hai số là ([\d ]+)\./.exec(p);const D=num(m[1]);return D*b/(b-a);}
  if(gen==='snail'){m=/cột cao (\d+) m\. Ban ngày ốc leo được (\d+) m, ban đêm lại tụt xuống (\d+) m/.exec(p);let h=0;for(let d=1;d<1000;d++){h+=+m[2];if(h>=+m[1])return d;h-=+m[3];}}
  if(gen==='half'){for(let s=1;s<20000;s++){let x=s,ok=true;const half=()=>{if(x%2){ok=false;}x=x/2;};
      if((m=/cho \S+ một nửa số bi, rồi cho \S+ (\d+) viên thì còn lại (\d+) viên/.exec(p))){half();x-=+m[1];if(ok&&x===+m[2])return s;continue;}
      if((m=/Buổi sáng bán một nửa số trứng và thêm (\d+) quả thì còn lại (\d+) quả/.exec(p))){half();x-=+m[1];if(ok&&x===+m[2])return s;continue;}
      if((m=/Ngày thứ nhất bán một nửa số trứng và thêm (\d+) quả\. Ngày thứ hai bán một nửa số trứng còn lại và thêm (\d+) quả thì còn (\d+) quả/.exec(p))){half();x-=+m[1];if(x<0)continue;half();x-=+m[2];if(ok&&x===+m[3])return s;continue;}
      return 'NOPAT';}return 'NOSOL';}
  if(gen==='digits2'){const ok=[];for(let n=10;n<=99;n++){const a=Math.floor(n/10),b=n%10;let g=true;if((m=/hơn chữ số hàng đơn vị (\d+)/.exec(p)))g=g&&a-b===+m[1];if((m=/gấp (\d+) lần/.exec(p)))g=g&&a===+m[1]*b;if((m=/tổng hai chữ số bằng (\d+)/.exec(p)))g=g&&a+b===+m[1];if((m=/bé hơn số cũ (\d+)/.exec(p)))g=g&&b>0&&n-(b*10+a)===+m[1];if(g)ok.push(n);}return ok.length===1?ok[0]:'SOLS '+ok.length;}
  if(gen==='rects'){m=/lưới (\d+) hàng, (\d+) cột/.exec(p);const a=+m[1],b=+m[2];let c=0;for(let r1=0;r1<=a;r1++)for(let r2=r1+1;r2<=a;r2++)for(let c1=0;c1<=b;c1++)for(let c2=c1+1;c2<=b;c2++)c++;const cells=(q.visual.match(/<rect/g)||[]).length;if(cells!==a*b)return 'BADFIG';return c;}
  if(gen==='clockAng'){if((m=/Lúc (\d+) giờ đúng/.exec(p))){const h=+m[1];const d=Math.min(h,12-h)*30;if(q.type==='input')return d;if(q.options.length===2)return d===90?'Góc vuông':'Góc không vuông';return d===90?'Góc vuông':d===180?'Góc bẹt':d<90?'Góc nhọn':'Góc tù';}
    if((m=/Từ (\d+) giờ đến (\d+) giờ/.exec(p)))return +m[2]-+m[1];if((m=/Trong (\d+) giờ, kim giờ/.exec(p)))return +m[1]*360/12;}
  if(gen==='fold'){if((m=/Gấp đôi một tờ giấy (\d+) lần/.exec(p))){let L=1;for(let i=0;i<+m[1];i++)L*=2;return L;}
    if((m=/Gấp đôi một sợi dây (\d+) lần/.exec(p))){// mô phỏng: điểm cắt trên dây độ dài 1
      const k=+m[1];const n=2**k;const pts=new Set();for(let i=0;i<n;i++)pts.add(((i+0.5)/n).toFixed(6));return pts.size+1;}
    if((m=/tổng cộng (\d+) lần cắt/.exec(p))){let c=1;for(let i=0;i<+m[1];i++)c+=3;return c;}}
  if(gen==='sumSeq'){const t=q.big.replace(' = ?','').split(' + ').map(x=>x.trim());const a=num(t[0]),b=num(t[1]),e=num(t[t.length-1]);let s=0;for(let x=a;x<=e;x+=b-a)s+=x;return s;}
  if((gen==='mulTrick'||gen==='pairTen')&&q.big)return Function('return '+q.big.replace('= ?','').replace(/×/g,'*').replace(/[  ]/g,''))();
  if(gen==='lastDigit'){if((m=/có (\d+) thừa số (\d+)/.exec(p))){let r=1;for(let i=0;i<+m[1];i++)r=r*+m[2]%10;return String(r);}if((m=/… × (\d+) có/.exec(p))){let r=1;for(let i=1;i<=+m[1];i+=2)r=r*i%10;return String(r);}if((m=/… \+ (\d+) có/.exec(p))){let r=0;for(let i=1;i<=+m[1];i++)r=(r+i)%10;return String(r);}}
  if(gen==='la_seqnum'){const a=q.big.replace(', ?','').split(', ').map(Number);return String(a[2]+(a[1]-a[0]));}
  if(gen==='la_scale'){const L=(/Bên trái: ([^<]*)</.exec(q.visual)[1].match(/\p{Extended_Pictographic}/gu)||[]).length,Rr=(/Bên phải: ([^<]*)</.exec(q.visual)[1].match(/\p{Extended_Pictographic}/gu)||[]).length;return q.type==='input'?L-Rr:((L>Rr)===/nặng hơn\?$/.test(p)?'Bên trái':'Bên phải');}
  if(gen==='la_shape'){const e=/(\S+)\?$/.exec(p)[1];return (q.visual.match(new RegExp(e,'gu'))||[]).length;}
  return undefined;}
const N=+process.argv[2]||400;
for(let G=0;G<=5;G++){const c=ctxFor(G);const list=c.TD_LIST();const used=new Set(list.map(l=>l.gen));
  for(const L of list){for(let lv=0;lv<=2;lv++){for(let t=0;t<N;t++){let q;try{q=c.tdMake(L,lv);}catch(e){bad(G,L.gen,lv,'EXC '+e.stack.split('\n').slice(0,2).join(' '));continue;}checked++;
    const all=[q.prompt,q.big,q.explain,(q.hints||[]).join(' '),strip(q.visual),(q.options||[]).join(' '),(q.chips||[]).join(' '),q.answer].join(' ');
    if(/NaN|undefined|Infinity|\[object/.test(all)){bad(G,L.gen,lv,'chuỗi lỗi',q);continue;}
    if(!q.prompt||q.prompt==='Tính.'){bad(G,L.gen,lv,'không sinh được câu',q);continue;}
    if(!q.hints||q.hints.length<1)bad(G,L.gen,lv,'thiếu gợi ý',q);if(!q.explain)bad(G,L.gen,lv,'thiếu lời giải',q);
    if(q.type==='mc'){if(!q.options.includes(q.answer))bad(G,L.gen,lv,'đáp án không có trong lựa chọn',q);if(new Set(q.options).size!==q.options.length)bad(G,L.gen,lv,'lựa chọn trùng',q);if(q.options.length<2)bad(G,L.gen,lv,'ít lựa chọn',q);}
    else if(q.type==='input'){if(!Number.isInteger(q.answer)||q.answer<0)bad(G,L.gen,lv,'đáp án không phải số tự nhiên',q);if(String(q.answer).length>6)bad(G,L.gen,lv,'đáp án quá 6 chữ số (bàn phím giới hạn)',q);}
    else if(q.type==='slots'){const pool=q.chips.slice();for(const v of q.vals){const i=pool.indexOf(v);if(i<0){bad(G,L.gen,lv,'thiếu thẻ đáp án',q);break;}pool.splice(i,1);}if(q.vals.some(v=>!Number.isInteger(+v)||+v<0))bad(G,L.gen,lv,'giá trị ô không hợp lệ',q);}
    else bad(G,L.gen,lv,'kiểu lạ '+q.type,q);
    let s=solve(L.gen,q);if(s===undefined)s=solve2(L.gen,q);if(s!==undefined){solved++;const exp=q.type==='slots'?q.vals.join('|'):String(q.answer);if(String(s)!==exp)bad(G,L.gen,lv,'GIẢI LẠI KHÁC: '+s+' vs '+exp,q);}
  }}}
  // thử bài 10 câu không trùng
  for(const L of list){const qs=c.tdBuild(L,10);if(qs.length!==10)bad(G,L.gen,0,'bài không đủ 10 câu');}
}
console.log('Đã sinh',checked,'câu, giải lại độc lập',solved,'câu, lỗi:',errs);process.exit(errs?1:0);
