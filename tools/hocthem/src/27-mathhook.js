/* ================= BỘ ĐỀ TOÁN MỚI — tạo bài 15 câu: 6 cơ bản, 6 vận dụng, 3 thử thách ================= */
function planFor(w,d){const C=(PLAN[GRADE]||[])[w];if(!C)return null;let L=C[d];if(L===MIX||!L){const all=[];C.forEach((x,i)=>{if(i!==d&&Array.isArray(x))x.forEach(s=>{if(!all.some(y=>y[0]===s[0]&&JSON.stringify(y[1])===JSON.stringify(s[1])))all.push(s);});});L=all;}return L&&L.length?L:null;}
function mgMake(spec,lv){const [name,P]=spec;let q=null;for(let t=0;t<8&&!q;t++){try{q=MG[name](GRADE,lv,P||{});}catch(e){q=null;}}if(!q)return null;
  const sk=skOf(q.sk||'so');delete q.sk;return Object.assign(q,{skill:sk,mg:name,mp:P||{},lv,hard:lv===2});}
const qk=q=>q.prompt+'|'+(q.big||'')+'|'+q.answer+'|'+(q.visual||'')+'|'+(q.options||[]).slice().sort().join(',');
const MATH_LV=[0,0,0,0,0,0,1,1,1,1,1,1,2,2,2];
function buildMathNew(w,d){const L=planFor(w,d);if(!L)return null;const out=[],keys=new Set();let order=shuffle(L.slice());let k=0;
  for(const lv of MATH_LV){let q=null,tries=0;while(tries<12){const spec=order[k%order.length];k++;if(k%order.length===0)order=shuffle(L.slice());q=mgMake(spec,lv);tries++;if(q&&!keys.has(qk(q)))break;}
    if(!q||keys.has(qk(q)))continue;keys.add(qk(q));out.push(q);}
  /* câu thử thách để cuối bài */
  return out.filter(q=>!q.hard).concat(out.filter(q=>q.hard));}
if(typeof buildLevel==='function'){const _bl=buildLevel;buildLevel=function(w,d){try{const qs=buildMathNew(w,d);if(qs&&qs.length>=10)return qs;}catch(e){}return _bl.apply(this,arguments);};}
window.__HT_MATH__=1;
