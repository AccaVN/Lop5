/* màn hình đầu tiên đã vẽ trước khi lớp này chạy → vẽ lại để có tab Tư duy và các mục mới */
try{if(document.querySelector('#scr')&&document.querySelector('.tab[data-t="map"].on'))renderHome();
  else{const tb=document.querySelector('nav.tabbar');if(tb){const on=tb.querySelector('.tab.on');const t=on?on.dataset.t:'';const d=document.createElement('div');d.innerHTML=tabbar(t);if(d.firstElementChild)tb.replaceWith(d.firstElementChild);}}}catch(e){}
window.HT={TDG,TD_ALL,TD_LA,KC,tdBuild,tdMake,kcFor,kcForChapter,bankQs,cardForQ,GRADE,similarQ,polyomino,MG,PLAN,renderTd,startTd,renderPara,renderParaHome,paList,paSt,paSplit,pcS,PARA,QA_DATA,qaList,qaGrade,qaStart,renderQaHome};
})();
