/* ================= MÀN NGOÀI TOÁN / TIẾNG VIỆT / ENGLISH: dạng danh sách bài giống trang Toán tư duy ================= */
const MAPL_CSS=`
html body .ht-list::before{display:none}
html body .ht-list .hello{margin:14px 16px 4px}
html body .ht-list .exam-banner{width:calc(100% - 32px);margin:12px 16px 0}
html body .ht-list .ht-due{margin:12px 16px 0}
html body .ht-list .stage{margin:0 16px}
html body .ht-list .stage .ht-gh{margin:22px 2px 4px}
html body .ht-list .ht-gh .num{flex:none;width:34px;height:34px;border-radius:10px;background:var(--c,var(--hv-pri));color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center}
html body .ht-list .ht-gh h2{font-size:19px;line-height:1.2}
html body .ht-list .ht-gh .lab{display:block;font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
html body .ht-list .ht-gdesc{margin:0 2px 10px 46px;color:var(--muted);font-size:13px;font-weight:600;line-height:1.35}
html body .ht-list .en-tools{margin:0 0 10px}
html body .ht-list .ht-row.cur{border-color:var(--hv-pri);box-shadow:0 0 0 3px rgba(37,99,235,.15)}
html body .ht-list .ht-row.cur .tx small{color:var(--hv-pri-d);font-weight:800}
html body .ht-list .ht-row.lock{opacity:.6}
html body .ht-list .ht-row.lock .n{background:var(--soft);color:var(--muted)}
html body .ht-list .ht-row .n{background:var(--soft);font-size:22px}
html body .ht-list .map-end{margin:18px 16px 24px}
`;
const mlEl=document.createElement('style');mlEl.id='ht-maplist';mlEl.textContent=MAPL_CSS;document.head.appendChild(mlEl);
window.addEventListener('load',()=>document.head.appendChild(mlEl));
function htListify(){const scr=document.getElementById('scr');if(!scr||scr.dataset.htl)return;const stages=scr.querySelectorAll('section.stage');if(!stages.length)return;scr.dataset.htl='1';scr.classList.add('ht-list');
  stages.forEach((st,si)=>{const head=st.querySelector('.stage-head'),path=st.querySelector('.path');if(!head||!path)return;
    const lab=(head.querySelector('.stage-num')||{}).textContent||'',title=(head.querySelector('h2')||{}).textContent||'',desc=(head.querySelector('p')||{}).textContent||'';
    let sum=0;const nodes=[...path.querySelectorAll('.node-wrap')];
    const rows=nodes.map(nw=>{const b=nw.querySelector('.node');if(!b)return '';const se=nw.querySelector('.node-stars');const dim=se&&se.querySelector('.dim')?se.querySelector('.dim').textContent.length:0;
      const s=se?Math.max(0,(se.textContent.match(/★/g)||[]).length-dim):0;sum+=s;const lock=b.classList.contains('locked'),cur=nw.classList.contains('current');
      const name=(nw.querySelector('.node-lbl')||{}).textContent||'';const sub=cur?'▶ Con đang học bài này':lock?'🔒 Hoàn thành bài trước để mở':s?`Lần gần nhất ${s}/3 sao`:'Chưa làm';
      return `<button class="ht-row${cur?' cur':''}${lock?' lock':''}" data-act="${H(b.dataset.act||'')}" data-i="${H(b.dataset.i||'')}" aria-label="${H(b.getAttribute('aria-label')||name)}"><span class="n" aria-hidden="true">${H(b.textContent.trim())}</span><span class="tx"><b>${H(name)}</b><small>${sub}</small><div class="ht-bar"><i style="width:${Math.round(s/3*100)}%"></i></div></span><span class="ht-stars">${'★'.repeat(s)}<i>${'★'.repeat(3-s)}</i></span></button>`;}).join('');
    const hd=document.createElement('div');hd.innerHTML=`<div class="ht-gh"><span class="num">${si+1}</span><h2>${lab?`<span class="lab">${H(lab)}</span>`:''}${H(title)}</h2><small>${sum}/${nodes.length*3} ⭐</small></div>${desc?`<p class="ht-gdesc">${H(desc)}</p>`:''}`;
    head.replaceWith(...hd.childNodes);const box=document.createElement('div');box.innerHTML=rows;path.replaceWith(...box.childNodes);});
  const c=scr.querySelector('.ht-row.cur');if(c&&c.scrollIntoView)c.scrollIntoView({block:'center'});}
{const _rh=renderHome;renderHome=function(){const r=_rh.apply(this,arguments);try{htListify();}catch(e){}return r;};}
if(typeof renderTv==='function'){const _rt=renderTv;renderTv=function(){const r=_rt.apply(this,arguments);try{htListify();}catch(e){}return r;};}
if(typeof renderEnglish==='function'){const _re=renderEnglish;renderEnglish=function(){const r=_re.apply(this,arguments);try{htListify();}catch(e){}return r;};}
