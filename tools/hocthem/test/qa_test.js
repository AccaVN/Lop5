// Kiểm thử Hỏi đáp tiếng Anh (92-qa-data.js, 93-qa.js): cấu trúc ngân hàng câu hỏi + bộ chấm trên máy.
// Chạy: node tools/hocthem/test/qa_test.js   (đọc normEn từ public/index.html của app này)
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','..','..','public','index.html'),'utf8');
const fnSrc=name=>{const i=html.indexOf(name);if(i<0)throw new Error('Không thấy '+name);let d=0,j=html.indexOf('{',i);for(;j<html.length;j++){if(html[j]==='{')d++;else if(html[j]==='}'&&!--d)break;}return html.slice(i,j+1);};
const lib=[html.match(/const N2W=\[.*?\];/)[0],fnSrc('function normEn('),html.match(/const EN_SAME=.*\n/)[0],'const enCanon=w=>EN_SAME[w]||w;'].join('\n');
const KEY=(html.match(/const KEY='([^']+)'/)||[])[1]||'';const KM=/^lop(la|\d)_/.exec(KEY);const MYG=KM?(KM[1]==='la'?0:+KM[1]):3;
const EN_UNITS=JSON.parse(html.match(/const EN_UNITS=(\[.*?\]);\n/s)[1]);
const src=fs.readFileSync(path.join(__dirname,'..','src','93-qa.js'),'utf8');
const engine=src.slice(src.indexOf('/* ---------- dữ liệu ---------- */'),src.indexOf('/* ---------- chấm bằng AI'));
const data=fs.readFileSync(path.join(__dirname,'..','src','92-qa-data.js'),'utf8');
const c={S:{},GRADE:MYG,EN_UNITS,console};vm.createContext(c);
vm.runInContext(lib+'\n'+data+'\n'+engine+'\nthis.QA_DATA=QA_DATA;this.qaParse=qaParse;this.qaGrade=qaGrade;this.qaFill=qaFill;this.qaList=qaList;',c);
let errs=0,n=0;const bad=(...a)=>{errs++;if(errs<=40)console.log('LỖI',...a);};
const fill=(it,ex)=>ex.replace(/[{}]/g,'');
const OFF=['The weather is nice and I really love my grandmother very much today','My cat is sleeping under the big table in the kitchen now'];
for(const g of [0,1,2,3,4,5]){const D=c.QA_DATA[g];if(!Array.isArray(D)){bad('thiếu lớp',g);continue;}
  D.forEach((U,u)=>{if(!Array.isArray(U)||U.length<3)bad(`lớp ${g} unit ${u}: cần ≥3 câu`);
    U.forEach((s,i)=>{n++;const it=c.qaParse(s,u,i);const tag=`lớp ${g} u${u} c${i} "${it.q}"`;
      if(String(s).split('|').length<3||!it.q||!it.vi||!it.ex)bad(tag,'thiếu trường');
      it.exs.forEach(ex=>{const r=c.qaGrade(it,[fill(it,ex)]);if(r.stars!==5)bad(tag,'câu mẫu chỉ được',r.stars+'★',ex,r.kind);});
      it.exs.forEach(ex=>{const r=c.qaGrade(it,[fill(it,ex).replace(/\bI am\b/,"I'm").replace(/\bIt is\b/,"It's")]);if(r.stars!==5)bad(tag,'câu mẫu viết tắt',r.stars+'★');});
      const m=it.ex.match(/\{([^}]*)\}/);
      if(m&&!it.open){const r=c.qaGrade(it,[m[1]]);if(r.stars!==3)bad(tag,'trả lời 1 từ',m[1],'→',r.stars+'★');if(!/[a-z]/i.test(r.better||''))bad(tag,'không có câu gợi ý');}
      if(/^(yes|no)\b/i.test(it.ex)){const r=c.qaGrade(it,['yes']);if(r.stars!==3)bad(tag,'"yes" →',r.stars+'★');}
      OFF.forEach((o,k)=>{const r=c.qaGrade(it,[o]);if(r.stars>(k?3:2)&&!it.open)bad(tag,'lạc đề mà được',r.stars+'★',o);});
      const e=c.qaGrade(it,['']);if(e.stars!==0)bad(tag,'câu rỗng',e.stars);});});}
// trường hợp cụ thể — chấm chặt: thiếu/sai a/an/the, thiếu/thừa s cuối, nghe nhầm từ đều không được 5★
const G=(g,u,i,ans)=>{c.GRADE=g;const it=c.qaList(u)[i];c.GRADE=MYG;return c.qaGrade(it,Array.isArray(ans)?ans:[ans]);};
const want=(g,u,i,ans,stars,better)=>{const r=G(g,u,i,ans);n++;if(r.stars!==stars||(better&&r.better!==better))bad(`lớp ${g} u${u} c${i}`,JSON.stringify(ans),'→',r.stars+'★',r.better,'(cần',stars+'★',better||'',')');};
want(0,1,2,'I like pink',5);want(0,1,2,'pink',3,'I like pink.');want(0,1,0,'it is blue',3,'It is red.');
want(5,0,3,'My favorite color is purple',5);want(5,0,3,'purple',3,'My favourite colour is purple.');
want(5,0,2,"um it's the elephant",5);want(3,0,1,'8',3,'I am eight.');want(3,0,1,"I'm 9 years old",5);
want(4,3,0,"My birthday is in May",5);want(4,3,0,'in may',3);want(4,3,0,'I like pizza',1);
want(5,11,1,"We'll go to the flower market",5);want(5,4,2,"She'd like to be a doctor",5);
want(3,5,0,'no',3,"No, I don't.");want(3,5,0,"No I don't",5);want(1,4,0,'I like chicken and chips',5);
want(5,14,0,'I have a toothache',5);want(5,14,0,'I have a pen',3);want(2,13,1,'This is my grandma',5);
// mạo từ
want(0,4,0,'It is cow',4,'It is a cow.');want(0,6,2,'It is a orange',4,'It is an orange.');want(5,0,2,"It's dolphin",4,"It's the dolphin.");
// âm s cuối
want(0,6,0,'I like banana',4,'I like bananas.');want(0,8,2,'I have two eye',4,'I have two eyes.');want(3,14,0,'These are computer',4,'These are computers.');
// nghe nhầm từ (giọng Việt) không được tha
want(3,0,1,'I am tree',3);want(0,15,2,'I can wun',3,'I can run.');
// chỉ chấm câu máy nghe được đầu tiên, không chọn phương án khác
want(0,4,0,['It is cow','It is a cow'],4);
console.log(`Đã kiểm ${n} câu/trường hợp, lớp app này = ${MYG} (${EN_UNITS.length} unit, ngân hàng ${c.QA_DATA[MYG].length} unit). Lỗi: ${errs}`);
if(c.QA_DATA[MYG].length!==EN_UNITS.length){console.log('LỖI số unit không khớp EN_UNITS');errs++;}
process.exit(errs?1:0);
