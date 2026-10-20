/* ================= THÊM DẠNG BÀI MỚI VÀO BẢNG BÀI HỌC (10/2026, lần 3) =================
   Mỗi bài (trừ bài Ôn tập tổng hợp) được thêm tối đa 2 dạng mới hợp với nội dung đang học. */
(function(){const has=(L,n)=>L.find(s=>s[0]===n);
  const rules=(G,L)=>{const out=[];const add=(n,p)=>{if(!out.some(s=>s[0]===n)&&!L.some(s=>s[0]===n))out.push(g(n,p||{}));};
    const as=has(L,'addsub');if(as){const P=as[1]||{};const mx=P.max||lim(G,P);const ops=P.ops&&P.ops.length===1?['+','−']:(P.ops||null);
      add('trueFalse',Object.assign({max:mx},ops?{ops}:{},P.small?{small:1}:{},P.k?{k:P.k}:{}));if(G>=2&&mx>=100)add('missingDigit',{max:mx});else if(G>=1)add('chooseOp',Object.assign({max:mx,ops:['+','−']},P.small?{small:1}:{}));}
    const nb=has(L,'readNum')||has(L,'seq')||has(L,'neighbor')||has(L,'order');if(nb){const mx=(nb[1]||{}).max||lim(G,{});if(mx>=(G===0?10:20))add('numberLine',{max:Math.min(mx,999999)});}
    const cp=has(L,'compare');if(cp&&G>=1&&!(cp[1]||{}).mul){const mx=(cp[1]||{}).max||lim(G,{});if(mx>=20&&mx<=100000)add('exprCmp',{max:mx,ops:['+','−']});}
    const tb=has(L,'table');if(tb){const P=tb[1]||{};const T=P.tables;if(G<=3)add('arrayMul',T?{tables:T}:{});add('factFamily',Object.assign({mul:1},T?{tables:T}:{}));if(G>=3)add('chooseOp',Object.assign({ops:['×',':']},T?{tables:T}:{}));}
    const mi=has(L,'missing');if(mi&&!(mi[1]||{}).mulOnly)add('factFamily',{max:(mi[1]||{}).max||lim(G,{})});
    if(has(L,'mental')||has(L,'round'))if(G>=3)add('estimate',{});
    if(has(L,'mulBig')){add('missingDigit',{mul:1});if(G>=3)add('estimate',{mul:1});}
    if(has(L,'divBig'))add('trueFalse',{ops:['×',':'],big:1});
    const ms=has(L,'measOp')||has(L,'conv');if(ms&&G>=1){const k=(ms[1]||{}).kind||((ms[1]||{}).unit==='kg'?'mass':(ms[1]||{}).unit==='l'?'vol':'len');add('unitChoose',{kind:k==='area5'?'area':k});}
    if((has(L,'clock')||has(L,'timeConv')||has(L,'timeOp'))&&G>=2)add('clockElapsed',{});
    const ra=has(L,'ratio');if(ra&&G===5&&JSON.stringify(ra[1]||{}).includes('pct'))add('percentWp',{});
    if((has(L,'wp1')||has(L,'wp2')||has(L,'wpMore'))&&G>=1&&G<=4){const P=(has(L,'wp1')||has(L,'wp2')||has(L,'wpMore'))[1]||{};add('wpChain',{max:P.max||lim(G,{})});}
    if(G===0&&has(L,'addPic'))add('trueFalse',{max:(has(L,'addPic')[1]||{}).max||10,ops:['+'],small:1});
    const dop=has(L,'decOp');if(dop&&G===5){const o=((dop[1]||{}).op||['+','−','×']).filter(o=>o!==':');add('decTF',{op:o.length?o:['×']});}
    if(has(L,'decCompare')||has(L,'decRound'))add('decTF',{op:['+','−']});
    return out.slice(0,2);};
  for(const G in PLAN){PLAN[G].forEach(C=>C.forEach((L,d)=>{if(!Array.isArray(L))return;const orig=L.slice();const nw=rules(+G,L);nw.forEach(s=>L.push(s));if(nw.length&&orig.length===1)L.push(orig[0]);}));}
  /* lớp 5: chặng tỉ số phần trăm có thêm bài toán giảm giá */
})();
