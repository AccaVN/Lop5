/* ============ TOÁN 5: CÂU THỬ THÁCH (cuối mỗi bài) + LUYỆN ĐỀ THI ============ */
const H5I=(skill,p,a,ex,o)=>Object.assign(inp(skill,p,r6(a),Object.assign({explain:ex},o||{})),{hard:true});
const H5M=(skill,p,a,w,ex,o)=>Object.assign(mc(skill,p,String(a),shuffle([...new Set(w.map(String))].filter(x=>x!==String(a))).slice(0,3),Object.assign({explain:ex},o||{})),{hard:true});
const CH5_OLD=[
 [ // Chặng 1
  ()=>{const s=shuffle([1,2,3,4,5,6,7,8,9]).slice(0,4);s.push(0);const big=Math.random()<.5;const d=s.slice().sort((a,b)=>big?b-a:a-b);if(!big&&d[0]===0){const k=d.findIndex(x=>x>0);[d[0],d[k]]=[d[k],d[0]];}const n=+d.join('');
    return H5I('so',`Dùng cả năm chữ số ${shuffle(s).join(', ')} (mỗi chữ số dùng một lần), viết số ${big?'lớn':'bé'} nhất có năm chữ số.`,n,big?`Xếp các chữ số từ lớn đến bé: ${fmtN(n)}`:`Chữ số 0 không đứng đầu, nên chọn chữ số nhỏ nhất khác 0 đứng đầu: ${fmtN(n)}`);},
  ()=>{const n=rnd(10,40);return H5I('so',`Tính tổng các số tự nhiên từ 1 đến ${n}.`,n*(n+1)/2,`Ghép cặp: (1 + ${n}) × ${n} : 2 = ${n*(n+1)/2}`);},
  ()=>{const a=rnd(2,9);const[b,c]=[rnd(a+1,15),rnd(a+1,15)];if(b===c)return H5M('phanso','Phân số nào lớn nhất?',`${a}/${a+1}`,[`${a-1}/${a}`,`${a}/${a+3}`,`1/${a}`],'So sánh với 1: phân số nào có phần bù đến 1 nhỏ nhất thì lớn nhất.');const big=b<c?`${a}/${b}`:`${a}/${c}`;
    return H5M('phanso',`Chọn phân số lớn hơn: ${a}/${b} hay ${a}/${c}?`,big,[b<c?`${a}/${c}`:`${a}/${b}`,'Hai phân số bằng nhau'],'Hai phân số có cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn.');},
  ()=>{const k=rnd(2,4);const a=rnd(2,5)*k*3;return H5I('giaitoan',`Một cửa hàng có ${a} kg đường. Buổi sáng bán 1/3 số đường, buổi chiều bán 1/${k} số đường còn lại. Hỏi cửa hàng còn bao nhiêu ki-lô-gam đường?`,a*2/3*(k-1)/k,`Sáng bán: ${a} : 3 = ${a/3} (kg), còn ${a*2/3} kg.\nChiều bán: ${a*2/3} : ${k} = ${fd(a*2/3/k)} (kg)\nCòn lại: ${fd(a*2/3)} − ${fd(a*2/3/k)} = ${fd(a*2/3*(k-1)/k)} (kg)`,{unit:'kg',icon:'🍬'});},
  ()=>{const[n,d]=rf(9),[c,e]=rf(9);const S=fr(n*e+c*d,d*e);return H5M('phanso',`Tìm x, biết: x − ${n}/${d} = ${c}/${e}`,S,[fr(Math.abs(c*d-n*e)||1,d*e),fr(n+c,d+e),fr(n*e+c*d+1,d*e)],`x = ${c}/${e} + ${n}/${d} = ${S}`);},
  ()=>{const q=rnd(2,5),d=rnd(3,8),r=rnd(1,d-1);return H5M('phanso',`Hỗn số nào bằng ${q*d+r}/${d}?`,`${q} ${r}/${d}`,[`${q+1} ${r}/${d}`,`${r} ${q}/${d}`,`${q} ${d-r}/${d}`],`${q*d+r} : ${d} = ${q} dư ${r}`);}
 ],
 [ // Chặng 2
  ()=>{const c=rnd(6,12),k=rnd(3,5),y=rnd(3,8);const m=c*k;return H5I('giaitoan',`Năm nay mẹ ${m} tuổi, con ${c} tuổi. Hỏi sau ${y} năm nữa, mẹ hơn con bao nhiêu tuổi?`,m-c,`Hiệu số tuổi không thay đổi theo thời gian: ${m} − ${c} = ${m-c} (tuổi)`,{unit:'tuổi',icon:'👩‍👧'});},
  ()=>{const u=rnd(3,12);const S=u*5;const t=rnd(1,u*2);return H5I('giaitoan',`Tổng hai số là ${S+t}. Nếu bớt số thứ nhất đi ${t} đơn vị thì số thứ nhất bằng 2/3 số thứ hai. Tìm số thứ hai.`,u*3,`Sau khi bớt, tổng là ${S}. Tổng số phần: 2 + 3 = 5; một phần: ${S} : 5 = ${u}; số thứ hai: ${u} × 3 = ${u*3}`);},
  ()=>{const a=rnd(2,6),b=a+rnd(2,6),tot=rnd(3,9)*(a+b);const u=tot/(a+b);return H5I('giaitoan',`Một hình chữ nhật có chu vi ${tot*2} m, chiều rộng bằng ${a}/${b} chiều dài. Tính diện tích hình chữ nhật.`,a*u*b*u,`Nửa chu vi: ${tot} m. Một phần: ${tot} : ${a+b} = ${u}; rộng ${a*u} m, dài ${b*u} m; diện tích ${a*u} × ${b*u} = ${a*u*b*u} (m²)`,{unit:'m²',icon:'▭'});},
  ()=>{const w=rnd(4,8),d=rnd(10,20),add=rnd(2,4)*w/2;const work=w*d;if(work%(w+add)!==0)return H5I('giaitoan',`${w} người đắp xong một đoạn đường trong ${d} ngày. Muốn đắp xong trong ${d/2>=1?d/2:1} ngày thì cần bao nhiêu người? (sức làm như nhau)`,w*2,`Thời gian giảm 2 lần thì số người tăng 2 lần: ${w} × 2 = ${w*2} (người)`,{unit:'người',icon:'👷'});
    return H5I('giaitoan',`${w} người làm xong công việc trong ${d} ngày. Nếu thêm ${add} người nữa thì làm xong trong mấy ngày? (sức làm như nhau)`,work/(w+add),`1 người làm xong trong ${work} ngày; ${w+add} người làm xong trong ${work} : ${w+add} = ${work/(w+add)} (ngày)`,{unit:'ngày',icon:'👷'});},
  ()=>{const s=pick([200,500,1000]);const real=rnd(2,9)*s*10;return H5I('doluong',`Quãng đường dài ${fmtN(real/100)} m được vẽ trên bản đồ tỉ lệ 1 : ${fmtN(s)}. Hỏi trên bản đồ quãng đường dài bao nhiêu xăng-ti-mét?`,real/s,`${fmtN(real/100)} m = ${fmtN(real)} cm; ${fmtN(real)} : ${fmtN(s)} = ${real/s} (cm)`,{unit:'cm',icon:'🗺️'});},
  ()=>{const h=rnd(2,9);return H5I('doluong',`Một khu đất hình chữ nhật dài ${h*100} m, rộng 100 m. Diện tích khu đất là bao nhiêu héc-ta?`,h,`${h*100} × 100 = ${fmtN(h*10000)} m² = ${h} ha`,{unit:'ha',icon:'🏞️'});}
 ],
 [ // Chặng 3
  ()=>{const a=rnd(1,9);return H5I('stp',`Có bao nhiêu số thập phân có một chữ số ở phần thập phân lớn hơn ${a} và bé hơn ${a+1}?`,9,`Đó là ${a},1; ${a},2; …; ${a},9 → có 9 số.`);},
  ()=>{const d=shuffle([1,2,3,4,5,6,7,8,9]).slice(0,4);const s=d.slice().sort((a,b)=>b-a);const x=+(s[0]+'.'+s.slice(1).join(''));return H5I('stp',`Dùng cả bốn chữ số ${d.join(', ')}, viết số thập phân lớn nhất có ba chữ số ở phần thập phân.`,x,`Chữ số lớn nhất làm phần nguyên, các chữ số còn lại xếp từ lớn đến bé: ${fd(x)}`);},
  ()=>{const a=rd(1,9,2);const x=r6(a+0.005);return H5M('stp',`Số thập phân nào nằm giữa ${fd(a)} và ${fd(r6(a+0.01))}?`,fd(x),[fd(r6(a+0.02)),fd(r6(a-0.005)),fd(r6(a+0.1))],`Viết thêm chữ số 0: ${fd(a)}0 < ${fd(x)} < ${fd(r6(a+0.01))}0`);},
  ()=>{const x=rd(2,9,3);const r=r6(Math.round(x*100)/100);return H5I('stp',`Làm tròn ${fd(x)} đến hàng phần trăm rồi nhân kết quả với 100.`,r*100,`${fd(x)} ≈ ${fd(r)}; ${fd(r)} × 100 = ${fd(r*100)}`);},
  ()=>{const t=rnd(1,9),k=rnd(1,999);return H5I('stp','Điền số thích hợp (dạng số thập phân):',r6(t+k/1000),`${fmtN(k)} kg = ${fd(k/1000)} tấn`,{big:`${t} tấn ${k} kg = ? tấn`});},
  ()=>{const a=rnd(2,9),b=rnd(1,99);return H5I('stp','Điền số thích hợp (dạng số thập phân):',r6(a+b/100),`${b} dm² = ${fd(b/100)} m²`,{big:`${a} m² ${b} dm² = ? m²`});}
 ],
 [ // Chặng 4
  ()=>{const a=rd(1,9,2),b=rd(1,9,2);return H5I('stp','Tính bằng cách thuận tiện:',a*10,`${fd(a)} × (${fd(b)} + ${fd(r6(10-b))}) = ${fd(a)} × 10 = ${fd(a*10)}`,{big:`${fd(a)} × ${fd(b)} + ${fd(a)} × ${fd(r6(10-b))}`});},
  ()=>{const a=rd(10,99,2);return H5I('stp','Tính nhẩm:',a*10,`× 0,5 rồi × 20 bằng × 10: ${fd(a*10)}`,{big:`${fd(a)} × 0,5 × 20 = ?`});},
  ()=>{const x=rd(1,9,1),y=rd(1,9,1);const s=r6(x+y);const d=r6(Math.abs(x-y));if(d===0)return CH5_OLD[3][1]();const big=Math.max(x,y),sm=Math.min(x,y);return H5I('stp',`Tổng hai số thập phân là ${fd(s)}, hiệu của chúng là ${fd(d)}. Tìm số lớn.`,big,`Số lớn = (tổng + hiệu) : 2 = (${fd(s)} + ${fd(d)}) : 2 = ${fd(big)}`);},
  ()=>{const a=rd(1,5,1),k=rnd(2,4);return H5I('giaitoan',`Một tấm vải dài ${fd(a*k+1.5)} m. Người ta cắt ra ${k} mảnh, mỗi mảnh dài ${fd(a)} m. Hỏi tấm vải còn lại bao nhiêu mét?`,1.5,`${fd(a)} × ${k} = ${fd(a*k)} (m); ${fd(a*k+1.5)} − ${fd(a*k)} = 1,5 (m)`,{unit:'m',icon:'🧵'});},
  ()=>{const a=rd(1,9,1);return H5I('stp','Tìm số thích hợp thay cho ?:',a,`? × 10 + ? = ? × 11 = ${fd(a*11)} → ? = ${fd(a)}`,{big:`? × 10 + ? = ${fd(a*11)}`});},
  ()=>{const n=rd(2,9,2);return H5I('stp','Tính nhẩm:',n,`× 100 rồi × 0,01 thì số không đổi: ${fd(n)}`,{big:`${fd(n)} × 100 × 0,01 = ?`});}
 ],
 [ // Chặng 5
  ()=>{const a=rd(20,60,1),b=rd(20,60,1);const c=r6((a+b)/2+rnd(1,5));const avg=r6((a+b+c)/3);if(decPlaces(avg)>2)return CH5_OLD[4][1]();return H5I('giaitoan',`Ba bạn cân nặng lần lượt ${fd(a)} kg, ${fd(b)} kg và ${fd(c)} kg. Hỏi trung bình mỗi bạn cân nặng bao nhiêu ki-lô-gam?`,avg,`(${fd(a)} + ${fd(b)} + ${fd(c)}) : 3 = ${fd(avg)} (kg)`,{unit:'kg',icon:'⚖️'});},
  ()=>{const avg=rnd(30,50),n=4,x=rnd(3,8);return H5I('giaitoan',`Trung bình cộng của bốn số là ${avg}. Nếu thêm số thứ năm thì trung bình cộng của năm số tăng thêm ${x}. Tìm số thứ năm.`,(avg+x)*5-avg*4,`Tổng bốn số: ${avg*4}; tổng năm số: ${(avg+x)*5}; số thứ năm: ${(avg+x)*5-avg*4}`);},
  ()=>{const b=rd(0.5,4,1),q=rnd(2,9),r=rd(0.1,b-0.1,1);if(r>=b)return CH5_OLD[4][0]();const a=r6(b*q+r);return H5I('stp',`Trong phép chia ${fd(a)} : ${fd(b)}, nếu chỉ lấy thương là số tự nhiên thì số dư là bao nhiêu?`,r,`${fd(b)} × ${q} = ${fd(b*q)}; ${fd(a)} − ${fd(b*q)} = ${fd(r)}`);},
  ()=>{const x=rd(1,9,1),k=rnd(2,5);return H5I('stp','Tìm số thích hợp thay cho ?:',x,`? × ${k} + ? = ? × ${k+1} = ${fd(x*(k+1))} → ? = ${fd(x)}`,{big:`? × ${k} + ? = ${fd(x*(k+1))}`});},
  ()=>{const a=rd(1,9,2);return H5I('stp','Tính nhẩm:',a*4,`Chia cho 0,25 là nhân với 4: ${fd(a*4)}`,{big:`${fd(a)} : 0,25 = ?`});},
  ()=>{const b=rd(1.5,4.5,1),n=rnd(5,20);return H5I('giaitoan',`Cứ ${fd(b)} m vải may được 1 bộ quần áo. Có ${fd(b*n+0.6)} m vải thì may được nhiều nhất bao nhiêu bộ quần áo như thế?`,n,`${fd(b*n+0.6)} : ${fd(b)} = ${n} (dư ${fd(0.6)}) → ${n} bộ`,{unit:'bộ',icon:'👕'});}
 ],
 [ // Chặng 6
  ()=>{const a=rnd(4,20),h=rnd(4,20);return H5I('hinhhoc',`Một hình tam giác có đáy ${a} cm, chiều cao ${h} cm. Nếu tăng đáy lên gấp 2 lần và giữ nguyên chiều cao thì diện tích mới là bao nhiêu?`,a*h,`Diện tích cũ ${fd(a*h/2)} cm², tăng đáy 2 lần thì diện tích tăng 2 lần: ${a*h} cm²`,{unit:'cm²',icon:'🔺'});},
  ()=>{const r=rnd(2,10);return H5I('hinhhoc',`Bán kính hình tròn tăng gấp 2 lần thì diện tích hình tròn tăng gấp mấy lần?`,4,`r × 2 thì r × r tăng 2 × 2 = 4 lần.`,{icon:'⭕'});},
  ()=>{const a=rnd(4,12)*2;const S=a*a-(a/2)*(a/2)*3.14;return H5I('hinhhoc',`Một hình vuông cạnh ${a} cm, bên trong vẽ hình tròn có đường kính bằng cạnh hình vuông. Tính diện tích phần hình vuông nằm ngoài hình tròn.`,S,`${a} × ${a} − ${a/2} × ${a/2} × 3,14 = ${fd(S)} (cm²)`,{unit:'cm²',icon:'⬛'});},
  ()=>{const a=rnd(10,30),b=rnd(5,a-2),h=rnd(4,12),inc=rnd(2,6);return H5I('hinhhoc',`Hình thang có đáy lớn ${a} cm, đáy bé ${b} cm, chiều cao ${h} cm. Nếu kéo dài đáy bé thêm ${inc} cm thì diện tích tăng thêm bao nhiêu?`,inc*h/2,`Phần tăng là tam giác đáy ${inc} cm, cao ${h} cm: ${inc} × ${h} : 2 = ${fd(inc*h/2)} (cm²)`,{unit:'cm²',icon:'⏢'});},
  ()=>{const d=rd(0.6,1,1);const C=r6(d*3.14);const n=rnd(100,600);return H5I('giaitoan',`Bánh xe có đường kính ${fd(d)} m lăn được ${fd(C*n)} m. Hỏi bánh xe lăn bao nhiêu vòng?`,n,`Chu vi: ${fd(d)} × 3,14 = ${fd(C)} (m); số vòng: ${fd(C*n)} : ${fd(C)} = ${n}`,{unit:'vòng',icon:'🛞'});},
  ()=>{const r=rnd(2,10);return H5I('hinhhoc',`Nửa hình tròn có bán kính ${r} cm. Tính chu vi nửa hình tròn đó (gồm cả đường kính).`,r*3.14+2*r,`Nửa đường tròn: ${r} × 2 × 3,14 : 2 = ${fd(r*3.14)} (cm); cộng đường kính ${2*r} cm: ${fd(r*3.14+2*r)} (cm)`,{unit:'cm',icon:'◓'});}
 ],
 [ // Chặng 7
  ()=>{const p=pick([10,20,25]),g=rnd(10,90)*1000;return H5I('giaitoan',`Một chiếc áo giá ${fmtN(g)} đồng, nay giảm giá ${p}%. Hỏi giá mới của chiếc áo là bao nhiêu?`,g*(100-p)/100,`Số tiền giảm: ${fmtN(g)} × ${p} : 100 = ${fmtN(g*p/100)}; giá mới: ${fmtN(g*(100-p)/100)} đồng`,{unit:'đồng',icon:'👕'});},
  ()=>{const b=pick([20000,40000,50000,80000]),p=pick([10,20,25,30]);return H5I('tiso',`Một món hàng mua vào ${fmtN(b)} đồng, bán ra ${fmtN(b*(100+p)/100)} đồng. Hỏi tiền lãi bằng bao nhiêu phần trăm tiền vốn?`,p,`Lãi: ${fmtN(b*p/100)} đồng; ${fmtN(b*p/100)} : ${fmtN(b)} = ${fd(p/100)} = ${p}%`,{unit:'%',icon:'💹'});},
  ()=>{const a=rnd(2,8);return H5I('hinhhoc',`Cạnh hình lập phương gấp lên 2 lần thì thể tích gấp lên mấy lần?`,8,`2 × 2 × 2 = 8 lần`,{icon:'🧊'});},
  ()=>{const a=rnd(3,9),b=rnd(2,a),h=rnd(2,6),k=rnd(1,4);return H5I('hinhhoc',`Bể cá hình hộp chữ nhật dài ${a} dm, rộng ${b} dm. Thả hòn đá vào thì mực nước dâng thêm ${k} cm. Tính thể tích hòn đá (dm³).`,a*b*k/10,`${k} cm = ${fd(k/10)} dm; ${a} × ${b} × ${fd(k/10)} = ${fd(a*b*k/10)} (dm³)`,{unit:'dm³',icon:'🐟'});},
  ()=>{const N=pick([400,500,800]),p1=pick([40,45,50]),p2=pick([20,25,30]);return H5I('giaitoan',`Một trường có ${N} học sinh: ${p1}% học sinh thích bóng đá, ${p2}% thích bơi, còn lại thích cờ vua. Hỏi có bao nhiêu học sinh thích cờ vua?`,N*(100-p1-p2)/100,`Cờ vua chiếm 100% − ${p1}% − ${p2}% = ${100-p1-p2}%; ${N} × ${100-p1-p2} : 100 = ${N*(100-p1-p2)/100}`,{unit:'học sinh',icon:'♟️'});},
  ()=>{const a=rnd(2,6);return H5I('hinhhoc',`Hình lập phương có diện tích toàn phần ${6*a*a} cm². Tính thể tích hình lập phương đó.`,a*a*a,`Một mặt: ${6*a*a} : 6 = ${a*a} cm² → cạnh ${a} cm; V = ${a} × ${a} × ${a} = ${a*a*a} (cm³)`,{unit:'cm³',icon:'🧊'});}
 ],
 [ // Chặng 8
  ()=>{const v=rnd(15,30),w=rnd(2,5),t=pick([2,3,4]);return H5I('doluong',`Một ca nô đi xuôi dòng với vận tốc thực ${v} km/giờ, vận tốc dòng nước ${w} km/giờ. Hỏi sau ${t} giờ ca nô đi được bao nhiêu ki-lô-mét?`,(v+w)*t,`Vận tốc xuôi dòng: ${v} + ${w} = ${v+w} (km/giờ); quãng đường: ${v+w} × ${t} = ${(v+w)*t} (km)`,{unit:'km',icon:'🚤'});},
  ()=>{const h=rnd(6,8),m=pick([0,15,30]),s=rnd(4,9)*15,v=pick([30,45,60]);const T=s/v*60;const E=h*60+m+T;const ans=GP(Math.floor(E/60),E%60);return H5M('doluong',`Một ô tô khởi hành lúc ${GP(h,m)}, đi quãng đường ${s} km với vận tốc ${v} km/giờ. Hỏi ô tô đến nơi lúc mấy giờ?`,ans,[GP(Math.floor(E/60)+1,E%60),GP(Math.floor(E/60),(E+15)%60),GP(h+Math.floor(s/v),m)],`Thời gian đi: ${s} : ${v} = ${fd(s/v)} giờ = ${T} phút; ${GP(h,m)} + ${T} phút = ${ans}`,{icon:'🚗'});},
  ()=>{const v1=rnd(4,6),v2=rnd(12,18),s=rnd(6,15);const t=r6(s/(v2-v1));if(decPlaces(t)>2)return CH5_OLD[7][0]();return H5I('doluong',`Một người đi bộ với vận tốc ${v1} km/giờ, đi trước người đi xe đạp ${s} km. Người đi xe đạp đuổi theo với vận tốc ${v2} km/giờ. Hỏi sau bao nhiêu giờ thì đuổi kịp?`,t,`Hiệu vận tốc: ${v2-v1} km/giờ; ${s} : ${v2-v1} = ${fd(t)} (giờ)`,{unit:'giờ',icon:'🚲'});},
  ()=>{const y=rnd(1945,2025);return H5I('doluong',`Năm ${y} cách năm 2026 bao nhiêu năm?`,2026-y,`2026 − ${y} = ${2026-y} (năm)`);},
  ()=>{const n=pick([40,50,80,100]);const k=rnd(Math.floor(n*0.3),Math.floor(n*0.7));const p=r6(k/n*100);return H5I('xacsuat',`Tung đồng xu ${n} lần thấy ${k} lần mặt ngửa. Số lần mặt ngửa chiếm bao nhiêu phần trăm số lần tung?`,p,`${k} : ${n} = ${fd(k/n)} = ${fd(p)}%`,{unit:'%',icon:'🪙'});},
  ()=>{const a=rnd(2,4),b=rnd(10,50);return H5M('doluong',`Đổi ${a} giờ ${b} phút ra giờ (số thập phân, làm tròn đến hàng phần trăm):`,fd(r6(Math.round((a+b/60)*100)/100)),[fd(r6(a+b/100)),fd(r6(Math.round((a+b/60)*10)/10)),fd(r6(a+b/600))],`${b} phút = ${b} : 60 giờ ≈ ${fd(Math.round(b/60*100)/100)} giờ`);}
 ]
];
/* Câu thử thách xếp lại theo 8 chặng của SGK Toán 5 Kết nối tri thức */
const CH5_NEW={
  angleSum:()=>{const a=rnd(30,80),b=rnd(30,80);return H5I('hinhhoc',`Một hình tam giác có hai góc là ${a}° và ${b}°. Tính số đo góc còn lại (tổng ba góc của hình tam giác là 180°).`,180-a-b,`180° − ${a}° − ${b}° = ${180-a-b}°`,{icon:'🔺',unit:'°'});},
  timeCentury:()=>{const y=rnd(1001,2026);const c=Math.floor((y-1)/100)+1;return H5I('doluong',`Năm ${y} thuộc thế kỉ thứ mấy? (viết số)`,c,`Thế kỉ thứ ${c} gồm các năm từ ${(c-1)*100+1} đến ${c*100}.`);},
  haPlot:()=>{const a=rnd(2,9)*50,b=rnd(2,8)*25;const S=a*b;return H5I('doluong',`Một thửa ruộng hình chữ nhật dài ${a} m, rộng ${b} m. Cứ 1 ha thu hoạch được 6 tấn thóc. Hỏi thửa ruộng thu được bao nhiêu tấn thóc?`,S/10000*6,`Diện tích: ${a} × ${b} = ${fmtN(S)} m² = ${fd(S/10000)} ha; ${fd(S/10000)} × 6 = ${fd(S/10000*6)} (tấn)`,{icon:'🌾',unit:'tấn'});},
  volBoxCube:()=>{const a=rnd(2,6);const V=a*a*a;const l=a*2,w=a;const h=V/(l*w);if(!Number.isInteger(h*2))return CH5_NEW.volBoxCube();return H5I('hinhhoc',`Một hình hộp chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm và có thể tích bằng thể tích hình lập phương cạnh ${a} cm. Tính chiều cao hình hộp.`,h,`V = ${a} × ${a} × ${a} = ${V} (cm³); h = ${V} : (${l} × ${w}) = ${fd(h)} (cm)`,{icon:'📦',unit:'cm'});},
  paintBox:()=>{const a=rnd(4,9),b=rnd(3,a),c=rnd(2,5);const S=(a+b)*2*c+a*b;return H5I('hinhhoc',`Một cái bể không có nắp dạng hình hộp chữ nhật dài ${a} m, rộng ${b} m, cao ${c} m. Người ta quét vôi mặt ngoài và đáy (không quét nắp). Tính diện tích cần quét.`,S,`Sxq = (${a} + ${b}) × 2 × ${c} = ${(a+b)*2*c} (m²); thêm một đáy ${a*b} m² → ${S} m²`,{icon:'🪣',unit:'m²'});},
  timeSchedule:()=>{const h=rnd(7,9),m=pick([0,15,30]),n=rnd(3,5),d=pick([35,40,45]),r=pick([5,10]);const T=h*60+m+n*d+(n-1)*r;return H5M('doluong',`Buổi học bắt đầu lúc ${GP(h,m)}, gồm ${n} tiết, mỗi tiết ${d} phút, giữa hai tiết nghỉ ${r} phút. Buổi học kết thúc lúc mấy giờ?`,GP(Math.floor(T/60),T%60),[GP(Math.floor((T+r)/60),(T+r)%60),GP(Math.floor((T-r)/60),(T-r)%60),GP(Math.floor(T/60)+1,T%60)],`${n} × ${d} + ${n-1} × ${r} = ${n*d+(n-1)*r} phút → kết thúc lúc ${GP(Math.floor(T/60),T%60)}`);},
  speedWalk:()=>{const v=pick([4,5,6]),m=pick([15,30,45]);return H5I('doluong',`Một bạn đi bộ với vận tốc ${v} km/giờ trong ${m} phút. Bạn đó đi được bao nhiêu ki-lô-mét?`,v*m/60,`${m} phút = ${fd(m/60)} giờ; ${v} × ${fd(m/60)} = ${fd(v*m/60)} (km)`,{icon:'🚶',unit:'km'});},
  pieFind:()=>{const N=pick([200,300,400,500]),p=pick([20,25,30,40]);return H5I('xacsuat',`Biểu đồ hình quạt tròn cho biết ${p}% số học sinh của trường thích môn Toán. Trường có ${N} học sinh. Hỏi có bao nhiêu học sinh thích môn Toán?`,N*p/100,`${N} × ${p} : 100 = ${N*p/100} (học sinh)`,{icon:'🥧',unit:'học sinh'});},
  ratioRepeat:()=>{const n=pick([20,30,40,50]),k=rnd(5,n-5);return H5I('xacsuat',`Lấy ngẫu nhiên một quả bóng trong hộp rồi trả lại, làm ${n} lần thì có ${k} lần lấy được bóng đỏ. Số lần KHÔNG lấy được bóng đỏ là bao nhiêu?`,n-k,`${n} − ${k} = ${n-k} (lần); tỉ số lần lấy được bóng đỏ là ${k}/${n}.`,{icon:'🔴',unit:'lần'});}
};
const CH5=[
  CH5_OLD[0].concat([CH5_NEW.angleSum,CH5_NEW.timeCentury]),
  CH5_OLD[2].concat([CH5_OLD[1][5],CH5_NEW.haPlot]),
  CH5_OLD[3].concat(CH5_OLD[4]),
  CH5_OLD[5],
  [CH5_OLD[1][0],CH5_OLD[1][1],CH5_OLD[1][2],CH5_OLD[1][4],CH5_OLD[6][0],CH5_OLD[6][1],CH5_OLD[6][4]],
  [CH5_OLD[6][2],CH5_OLD[6][3],CH5_OLD[6][5],CH5_NEW.volBoxCube,CH5_NEW.paintBox],
  [CH5_OLD[7][1],CH5_OLD[7][3],CH5_OLD[7][5],CH5_NEW.timeSchedule,CH5_NEW.speedWalk],
  [CH5_OLD[7][4],CH5_NEW.pieFind,CH5_NEW.ratioRepeat,CH5_OLD[6][4],CH5_OLD[5][1],CH5_NEW.speedWalk]
];
function chMath(w,d){const L=CH5[w]||CH5[0];const pool=d===5?shuffle(L):shuffle(L);const out=[];const keys=new Set();for(const g of pool){if(out.length>=3)break;let q;try{q=g();}catch(e){continue;}if(!q||keys.has(q.prompt+'|'+q.big))continue;keys.add(q.prompt+'|'+q.big);q.hard=true;out.push(q);}return out;}

/* ---------- Luyện đề thi Toán: đề cuối học kì II lớp 5 (trắc nghiệm M1–M2 + tự luận + vận dụng) ---------- */
const EX5_M1=['readBigN','decRead','decWrite','decPlace','decCompare','fracToDec','pctWrite','convArea','kmHa','volConv','timeConv','shapeCount','circParts','triKind','decUnitLen','decUnitMass','angleKind','netQ','calcKeys'];
const EX5_M2=['decRound','decSort','pctOfTwo','pctValue','circS','circC','trapArea','triArea','volBox','cubeArea','boxArea','speed','distance','duration','pieChart','statTable','probab','timeAdd','timeSub','mixedToFrac','addFrac'];
const EX5_TL=['decAdd','decSub','decMulDec','decDivDec','natDivDec','decExpr','decFindX','timeMul','timeDiv','tankWp','decDivWp','sumRatio','diffRatio','mapScale2','volConv2','wheel','trapWp','pctInterest'];
/* Đề theo từng thời điểm kiểm tra (đúng phạm vi kiến thức SGK Toán 5 KNTT):
   gk1 = Giữa học kì I (Bài 1–18) · ck1 = Cuối học kì I (Bài 1–35) · gk2 = Giữa học kì II (Bài 36–55, có ôn HK I). Cuối học kì II dùng EX5_M1/M2/TL ở trên. */
const EX5_HK={
  gk1:{m1:['readBigN','placeBig','simplify','compareFrac','decFracWrite','mixedToFrac','decRead','decWrite','decPlace','decCompare','fracToDec','kmHa'],
       m2:['roundBig','sortFrac','fracOfQty','addFrac','mulFrac','divFrac','fracToMixed','decSort','decRound','decUnitLen','decUnitMass','convArea','areaUnits'],
       tl:['calcNat','exprNat','findX','wpFrac','decUnitBack','convArea','addFrac','mulFracNat']},
  ck1:{m1:['decRead','decPlace','decCompare','fracToDec','decUnitLen','decUnitMass','kmHa','triKind','circParts','decMul10','decDiv10','convArea'],
       m2:['decRound','decSort','decMul01','decDiv01','triArea','trapArea','circC','circS','average','mixedToFrac','decUnitBack'],
       tl:['decAdd','decSub','decMulDec','decDivDec','natDivDec','decExpr','decFindX','decDivWp','decMulWp','trapWp','wheel','geoMix']},
  gk2:{m1:['ratio','pctWrite','ratioFrac','mapScale','cubeCount','shapeCount','volConv','netQ','calcKeys','decCompare','decRound'],
       m2:['pctOfTwo','pctValue','pctCalc','boxArea','cubeArea','volBox','volCube','circS','trapArea'],
       tl:['sumRatio','diffRatio','sumRatioAge','diffRatio2','mapScale2','volConv2','tankWp','pctInterest','decExpr']}};
function buildExamToanHK(h,k){const P=EX5_HK[h];const rot=(arr,n,off)=>{const out=[];for(let i=0;i<n;i++)out.push(arr[(off+i*5)%arr.length]);return out;};
  const names=rot(P.m1,6,k*3).concat(rot(P.m2,6,k*4+1),rot(P.tl,6,k*5+2));
  return uniqList(names.map(n=>()=>M5[n]()));}
function buildExamToan(k,adv){const rot=(arr,n,off)=>{const out=[];for(let i=0;i<n;i++)out.push(arr[(off+i*5)%arr.length]);return out;};
  if(adv){const qs=[];CH5.forEach((L,w)=>{const g=L[(k*2+w)%L.length];qs.push(g());});return shuffle(CH5.flat()).slice(0,4).map(g=>g()).concat(qs).slice(0,12);}
  const names=rot(EX5_M1,6,k).concat(rot(EX5_M2,6,k*2),rot(EX5_TL,6,k*3));
  return uniqList(names.map(n=>()=>M5[n]()));}
