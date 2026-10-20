/* ================= BỘ ĐỀ TOÁN MỚI — dạng bổ sung cho Lớp Lá và bảng bài học từng lớp ================= */
MG.addPic=function(G,lv,P){const mx=P.max||10;const e=RP(['🍎','🍬','🎈','⭐','🍓','🐥']);const kind=P.kind||RP(['gop','them','bot']);
  if(lv===2){const x=R(1,Math.max(1,mx-3)),y=R(1,Math.min(3,mx-x));return Qin(`Bé có một số ${e}. Mẹ cho thêm ${y} ${e} thì bé có ${x+y} ${e}. Lúc đầu bé có mấy ${e}?`,x,{visual:emoRow(Array(x+y).fill(e)),voice:[['vi',`Bé có một số đồ vật. Mẹ cho thêm ${y} thì bé có ${x+y}. Lúc đầu bé có mấy?`]],sk:'congtru',hints:['Bớt đi số mẹ vừa cho thêm.',`Che đi ${y} hình rồi đếm.`],explain:`${x+y} bớt ${y} còn ${x}.`});}
  const a=R(1,mx-1),b=R(1,Math.max(1,(kind==='bot'?a:mx-a)));if(kind==='bot'){if(b>a)return MG.addPic(G,lv,P);return Qin(`Có ${a} ${e}, bớt đi ${b} ${e}. Còn lại mấy ${e}?`,a-b,{visual:emoRow(Array(a-b).fill(e).concat(Array(b).fill('✖️'))),voice:[['vi',`Có ${a}, bớt đi ${b}. Còn lại mấy?`]],sk:'congtru',hints:['Đếm các hình không bị gạch.',`${a} bớt ${b}.`],explain:`${a} bớt ${b} còn ${a-b}.`});}
  if(a+b>mx)return MG.addPic(G,lv,P);return Qin(kind==='gop'?`Gộp ${a} ${e} và ${b} ${e}. Có tất cả mấy ${e}?`:`Có ${a} ${e}, thêm ${b} ${e}. Có tất cả mấy ${e}?`,a+b,{visual:emoRow(Array(a).fill(e))+emoRow(Array(b).fill(e)),voice:[['vi',kind==='gop'?`Gộp ${a} và ${b}. Có tất cả mấy?`:`Có ${a}, thêm ${b}. Có tất cả mấy?`]],sk:'congtru',hints:['Đếm hàng trên rồi đếm tiếp hàng dưới.',`Bắt đầu từ ${a}, đếm thêm ${b}.`],explain:`${a} và ${b} là ${a+b}.`});};
MG.zero=function(G,lv,P){const e=RP(['🍎','🐟','🌸','🎈']);const t=R(0,2);if(t===0)return Qin(`Trong đĩa có mấy ${e}?`,0,{visual:'<div class="ht-big">🍽️</div>',voice:[['vi','Trong đĩa có mấy quả?']],sk:'so',hints:['Đĩa có đồ vật nào không?','Không có gì thì viết số 0.'],explain:'Đĩa trống, có 0 đồ vật.'});
  const a=R(1,9);if(t===1)return Qin(`Có ${a} ${e}, bớt đi ${a} ${e}. Còn lại mấy ${e}?`,0,{visual:emoRow(Array(a).fill('✖️')),sk:'so',hints:['Bớt hết thì còn lại bao nhiêu?',''],explain:`${a} bớt ${a} còn 0.`});
  return Qmc('Số nào bé nhất?','0',shuffle(['0',String(a),String(R(1,9)===a?a+1:R(1,9))]).filter((x,i,ar)=>ar.indexOf(x)===i),{sk:'so',hints:['0 là số bé nhất.',''],explain:'0 là số bé nhất.'});};
MG.updown=function(G,lv,P){const L=[['Con chim bay','phía trên','cái cây','🐦','🌳'],['Con mèo nằm','phía dưới','cái bàn','🐱','🪑'],['Mặt trời ở','phía trên','ngôi nhà','☀️','🏠'],['Con cá bơi','bên trong','bể nước','🐟','🫙'],['Bạn thỏ đứng','bên ngoài','hàng rào','🐰','🚧'],['Quả bóng ở','phía dưới','gầm giường','⚽','🛏️']];const it=RP(L);
  const opts=it[1].startsWith('bên')?['Bên trong','Bên ngoài']:['Phía trên','Phía dưới'];return Qmc(`${it[0]} ở phía nào của ${it[2]}?`,cap(it[1]),opts,{visual:`<div class="ht-big" style="font-size:52px">${it[3]} ${it[4]}</div>`,sk:'hinhhoc',hints:['Tưởng tượng cảnh đó ngoài đời thật.',''],explain:`${it[0]} ${it[1]} ${it[2]}.`});};
MG.blocks=function(G,lv,P){const n=R(2,lv?9:6);const it=RP(['✏️ Bút chì','🖍️ Bút màu','📏 Thước','🥢 Đôi đũa']);return Qin(`${it.split(' ').slice(1).join(' ')} dài bằng mấy ô vuông?`,n,{visual:`<div class="ht-big" style="font-size:30px">${it.split(' ')[0]}</div><div class="ht-emo" style="gap:2px">${Array(n).fill('<span style="display:inline-block;width:26px;height:26px;border:2px solid #1E3A8A;background:#DBEAFE"></span>').join('')}</div>`,sk:'doluong',hints:['Đếm số ô vuông nằm dưới đồ vật.',''],explain:`Dài bằng ${n} ô vuông.`});};
MG.countEmo=function(G,lv,P){const sets=[['🔺','⬜','⚪'],['🍎','🍌','🍐'],['🚗','🚲','🚌']];const s=RP(sets);const target=s[0];const n=R(1,lv?7:4);const others=Array.from({length:R(2,5)},()=>RP(s.slice(1)));const arr=shuffle(Array(n).fill(target).concat(others));
  return Qin(`Có bao nhiêu ${target}?`,n,{visual:emoRow(arr,'wrap'),sk:G===0?'hinhhoc':'so',hints:['Chỉ đếm đúng loại hình được hỏi.','Chạm vào từng hình để đếm.'],explain:`Có ${n} ${target}.`});};
MG.ordinal=function(G,lv,P){return Object.assign(TDG.la_pos(0,lv),{sk:'so'});};

/* ---------- bảng bài: PLAN[lớp][chặng][bài] = các dạng đề [tên, tham số]; 'mix' = ôn tổng hợp cả chặng ---------- */
const g=(n,p)=>[n,p||{}];
const MIX='mix';
const PLAN={
0:[
 [[g('count',{max:5})],[g('count',{max:5}),g('neighbor',{max:5})],[g('groups',{max:5})],[g('split',{max:5}),g('groups',{max:5})],[g('addPic',{max:5})],MIX],
 [[g('count',{max:10})],[g('count',{max:10}),g('neighbor',{max:10})],[g('zero'),g('count',{max:10}),g('neighbor',{max:10})],[g('groups',{max:10}),g('compare',{max:10})],[g('ordinal')],MIX],
 [[g('seq',{max:10,step:[1]}),g('count',{max:10})],[g('neighbor',{max:10}),g('seq',{max:10,step:[1]})],[g('compare',{max:10})],[g('maxmin',{max:10})],[g('order',{max:10})],MIX],
 [[g('addPic',{max:10,kind:'gop'})],[g('addPic',{max:10,kind:'them'})],[g('addPic',{max:10,kind:'bot'})],[g('split',{max:10})],[g('split',{max:10})],MIX],
 [[g('shapeId')],[g('shapeId')],[g('countEmo')],[g('solid')],[g('solid')],MIX],
 [[g('updown'),g('position')],[g('position')],[g('position')],[g('position')],[g('updown'),g('position')],MIX],
 [[g('sizeCmp')],[g('sizeCmp')],[g('blocks')],[g('pattern')],[g('oddOne')],MIX],
 [[g('dayPart')],[g('dayPart')],[g('calendar'),g('dayPart')],[g('clock'),g('dayPart')],[g('count',{max:10}),g('compare',{max:10})],MIX]],
1:[
 [[g('count',{max:5}),g('neighbor',{max:5})],[g('count',{max:10}),g('neighbor',{max:10}),g('seq',{max:10,step:[1]})],[g('groups',{max:10})],[g('compare',{max:10}),g('maxmin',{max:10})],[g('split',{max:10})],MIX],
 [[g('shapeId')],[g('countShapes'),g('countEmo')],[g('addsub',{ops:['+'],max:10,small:1})],[g('addsub',{ops:['+'],max:10,small:1}),g('missing',{max:10,small:1})],[g('wp1',{max:10})],MIX],
 [[g('addsub',{ops:['−'],max:10,small:1})],[g('split',{max:10}),g('addsub',{ops:['−'],max:10,small:1})],[g('addsub',{max:10,small:1}),g('missing',{max:10,small:1})],[g('compare',{max:10})],[g('wp1',{max:10})],MIX],
 [[g('solid')],[g('position')],[g('count',{max:10}),g('compare',{max:10}),g('seq',{max:10,step:[1]})],[g('addsub',{max:10,small:1}),g('missing',{max:10,small:1})],[g('shapeId'),g('solid')],MIX],
 [[g('tens')],[g('readNum',{max:100}),g('tens')],[g('compare',{max:100})],[g('seq',{max:100}),g('neighbor',{max:100})],[g('order',{max:100}),g('maxmin',{max:100})],MIX],
 [[g('blocks'),g('sizeCmp')],[g('measOp',{unit:'cm'})],[g('blocks')],[g('measOp',{unit:'cm'})],[g('measOp',{unit:'cm'})],MIX],
 [[g('addsub',{ops:['+'],max:99,k:1,carry:'none'})],[g('addsub',{ops:['+'],max:99,carry:'none'})],[g('addsub',{ops:['−'],max:99,k:1,carry:'none'})],[g('addsub',{ops:['−'],max:99,carry:'none'})],[g('wp1',{max:99}),g('wpMore',{max:99})],MIX],
 [[g('clock'),g('calendar')],[g('calendar')],[g('calendar'),g('clock')],[g('addsub',{max:10,small:1}),g('missing',{max:10,small:1})],[g('addsub',{max:99,carry:'none'}),g('compare',{max:100})],MIX]],
2:[
 [[g('readNum',{max:100}),g('compare',{max:100}),g('order',{max:100})],[g('seq',{max:100}),g('neighbor',{max:100})],[g('missing',{max:100})],[g('wpMore',{max:100})],[g('addsub',{max:100,carry:'none'})],MIX],
 [[g('addsub',{ops:['+'],max:20,carry:'yes'})],[g('addsub',{ops:['+'],max:20,carry:'yes'}),g('keep',{max:20})],[g('wp1',{max:20})],[g('addsub',{ops:['−'],max:20,carry:'yes'})],[g('wpMore',{max:20})],MIX],
 [[g('measOp',{unit:'kg'})],[g('measOp',{unit:'l'})],[g('measOp',{unit:'kg'}),g('measOp',{unit:'l'})],[g('addsub',{ops:['+'],max:100,k:1,carry:'yes'})],[g('addsub',{ops:['+'],max:100,carry:'yes'})],MIX],
 [[g('addsub',{ops:['−'],max:100,k:1,carry:'yes'})],[g('addsub',{ops:['−'],max:100,carry:'yes'})],[g('wp2',{max:100}),g('wp1',{max:100})],[g('countShapes'),g('shapeId')],[g('polyline'),g('perimeter')],MIX],
 [[g('timeConv'),g('clock')],[g('calendar')],[g('clock'),g('calendar')],[g('addsub',{max:100}),g('missing',{max:100}),g('compare',{max:100})],[g('polyline'),g('measOp'),g('perimeter')],MIX],
 [[g('table',{tables:[2,5],noDiv:1})],[g('table',{tables:[2],noDiv:1})],[g('table',{tables:[5],noDiv:1})],[g('table',{tables:[2,5]}),g('missing',{mulOnly:1,tables:[2,5]})],[g('table',{tables:[2,5]}),g('wpMul',{tables:[2,5]}),g('compare',{max:100,mul:1,tables:[2,5]})],MIX],
 [[g('solid'),g('shapeId'),g('countShapes')],[g('mental',{round:100}),g('readNum',{max:1000})],[g('readNum',{max:1000}),g('place',{max:1000}),g('decomp',{max:1000})],[g('compare',{max:1000}),g('order',{max:1000}),g('maxmin',{max:1000})],[g('conv',{kind:'len',units:['cm','dm','m','km']})],[g('money')]],
 [[g('addsub',{ops:['+'],max:1000})],[g('addsub',{ops:['−'],max:1000})],[g('tally'),g('chart')],[g('chance'),g('tally')],[g('readNum',{max:1000}),g('addsub',{max:1000}),g('missing',{max:1000})],MIX]],
3:[
 [[g('readNum',{max:1000}),g('compare',{max:1000}),g('order',{max:1000}),g('seq',{max:1000})],[g('addsub',{max:1000}),g('missing',{max:1000}),g('keep',{max:1000})],[g('table',{tables:[2,5]}),g('missing',{mulOnly:1,tables:[2,5]})],[g('wp1',{max:1000}),g('wpMore',{max:1000}),g('wp2',{max:1000})],[g('polyline'),g('perimeter'),g('conv',{kind:'len',units:['cm','dm','m']})],MIX],
 [[g('readNum',{max:1000}),g('maxmin',{max:1000}),g('seq',{max:1000,step:[3,4,6]})],[g('addsub',{max:1000,carry:'yes'}),g('expr')],[g('table',{tables:[3,4,6]}),g('keep',{tables:[3,4,6]})],[g('wpMul',{tables:[3,4,6]}),g('wp2',{max:1000})],[g('measOp'),g('clock')],MIX],
 [[g('seq',{max:1000,step:[7,8,9]}),g('compare',{max:100,mul:1,tables:[7,8,9]})],[g('addsub',{max:1000}),g('missing',{max:1000}),g('mental',{round:100})],[g('table',{tables:[7,8,9]}),g('gap')],[g('gap'),g('wpMul',{tables:[7,8,9]}),g('wp2',{max:1000})],[g('conv',{kind:'len',units:['mm','cm','dm','m']}),g('measOp')],MIX],
 [[g('compare',{max:1000}),g('evenOdd',{max:1000})],[g('addsub',{max:1000}),g('expr')],[g('divRem'),g('partOf')],[g('wp2',{max:1000}),g('wpMul',{tables:[2,3,4,5,6,7,8,9]})],[g('money'),g('clock')],MIX],
 [[g('readNum',{max:1000}),g('round',{units:[10,100]})],[g('addsub',{max:1000,carry:'yes'})],[g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('wpUnit'),g('wp2',{max:1000})],[g('midpoint'),g('angle'),g('perimeter'),g('area')],MIX],
 [[g('roman'),g('seq',{max:1000})],[g('measOp')],[g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('measOp'),g('money')],[g('conv',{kind:'len',units:['mm','cm','m','km']}),g('conv',{kind:'mass',units:['g','kg']}),g('conv',{kind:'vol'}),g('clock'),g('calendar'),g('timeConv'),g('temp')],MIX],
 [[g('readNum',{max:100000}),g('place',{max:100000}),g('compare',{max:100000}),g('round',{units:[10,100,1000,10000]}),g('order',{max:100000})],[g('addsub',{max:100000}),g('mental',{round:1000})],[g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('wpUnit'),g('wp2',{max:100000})],[g('area'),g('perimeter'),g('money')],MIX],
 [[g('readNum',{max:100000}),g('compare',{max:100000}),g('maxmin',{max:100000})],[g('expr'),g('keep',{max:1000}),g('quicksum')],[g('table'),g('divRem'),g('gap')],[g('wp2',{max:1000}),g('wpUnit'),g('wpMul')],[g('chance'),g('chart'),g('area'),g('conv',{kind:'mass',units:['g','kg']})],MIX]],
4:[
 [[g('readNum',{max:100000}),g('place',{max:100000}),g('compare',{max:100000}),g('order',{max:100000})],[g('addsub',{max:100000}),g('mulBig',{d2:1}),g('divBig',{d2:1})],[g('evenOdd')],[g('letter')],[g('wp3'),g('wp2',{max:100000})],MIX],
 [[g('angle')],[g('readNum',{max:999999}),g('place',{max:999999})],[g('place',{max:999999}),g('decomp',{max:999999})],[g('readNum',{max:999999}),g('compare',{max:999999})],[g('round',{units:[100,1000,10000,100000]}),g('compare',{max:999999})],[g('seq',{max:999999}),g('evenOdd'),g('maxmin',{max:999999})]],
 [[g('conv',{kind:'mass',units:['kg','yến','tạ','tấn']})],[g('conv',{kind:'area'})],[g('timeConv')],[g('addsub',{max:999999})],[g('quicksum'),g('keep',{max:10000})],[g('wpSumDiff')]],
 [[g('lines'),g('angle')],[g('lines'),g('angle')],[g('lines'),g('perimeter'),g('area')],[g('addsub',{max:999999}),g('mulBig',{d2:1}),g('divBig',{d2:1}),g('expr')],[g('conv',{kind:'mass',units:['kg','yến','tạ','tấn']}),g('area'),g('angle')],MIX],
 [[g('mulBig',{d2:1})],[g('divBig',{d2:1})],[g('times10')],[g('mulProp')],[g('mulProp')],MIX],
 [[g('mulBig',{d2:2})],[g('divBig',{d2:2})],[g('wpAvg')],[g('wpUnit')],[g('chart')],[g('tally'),g('chart')]],
 [[g('fracConcept')],[g('fracConcept')],[g('fracSimplify')],[g('fracSimplify')],[g('fracCompare')],MIX],
 [[g('fracOp',{op:['+']})],[g('fracOp',{op:['−']})],[g('fracOp',{op:['×']})],[g('fracOp',{op:[':']})],[g('fracOf')],MIX]],
5:[
 [[g('readNum',{max:999999}),g('place',{max:999999}),g('expr'),g('missing',{max:100000})],[g('fracSimplify'),g('fracCompare'),g('fracOf')],[g('decRead')],[g('fracOp',{op:['+','−']}),g('fracOp',{op:['×',':']})],[g('mixed')],[g('angle'),g('lines'),g('conv',{kind:'len'}),g('timeConv')]],
 [[g('decRead')],[g('decCompare')],[g('decUnit')],[g('decRound')],[g('conv',{kind:'area5'})],[g('conv',{kind:'area'}),g('conv',{kind:'area5'}),g('decUnit')]],
 [[g('decOp',{op:['+']})],[g('decOp',{op:['−']})],[g('decOp',{op:['×']})],[g('decOp',{op:[':']})],[g('decTimes10')],[g('decOp'),g('wpAvg')]],
 [[g('triTrap',{kind:'tri'})],[g('triTrap',{kind:'trap'})],[g('circle',{kind:'C'})],[g('circle',{kind:'S'})],[g('decOp'),g('decCompare'),g('decRound')],[g('triTrap'),g('circle'),g('conv',{kind:'area'}),g('decUnit')]],
 [[g('ratio',{kind:['pct']})],[g('ratio',{kind:['map']})],[g('wpRatio',{kind:'sum'})],[g('wpRatio',{kind:'diff'})],[g('ratio',{kind:['pct']})],[g('ratio',{kind:['pctOf','find']})]],
 [[g('countShapes'),g('volume',{kind:['box','cube']})],[g('volume',{kind:['conv']})],[g('volume',{kind:['conv','box']})],[g('volume',{kind:['sxq']})],[g('volume',{kind:['stp']})],[g('volume',{kind:['box','cube']})]],
 [[g('timeConv')],[g('timeOp')],[g('timeOp')],[g('motion',{kind:['v']})],[g('motion',{kind:['s','t']})],[g('motion'),g('timeOp')]],
 [[g('chart')],[g('chart')],[g('chance')],[g('readNum',{max:999999}),g('decCompare'),g('fracOp'),g('decOp')],[g('ratio'),g('triTrap'),g('circle'),g('volume'),g('conv',{kind:'area'})],MIX]]};
