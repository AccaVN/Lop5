"""Kiểm thử phần mới (lần 3): mọi bài Toán tư duy, mọi bài Toán (vẽ từng câu, làm đúng),
luyện nói đoạn văn (giả lập nhận dạng giọng nói). Dùng: python3 ui_new.py <URL> <email> <mk> <thư mục ảnh>"""
import sys, json
from playwright.sync_api import sync_playwright
URL, EMAIL, PW, OUT = sys.argv[1:5]
errs = []
def log(*a): print(*a, flush=True)
def ok(c, m):
    (log('  ✓', m) if c else (errs.append('FAIL ' + m), log('  ✗', m)))
FAKE_SR = r"""
window.__SAY__=null;
class FakeSR{constructor(){this.lang='';this.continuous=false;this.interimResults=false;}
 start(){const me=this;if(window.__SAID__===window.__SAY__)return;window.__SAID__=window.__SAY__;const txt=window.__SAY__||'';const parts=txt.split(/(?<=[.!?])\s+/);let i=0;
  const push=()=>{if(i>=parts.length){if(window.__ENDSR__)setTimeout(()=>{me.onend&&me.onend();},50);return;}i++;const res=[];for(let k=0;k<i;k++){const a=[{transcript:parts[k]}];a.isFinal=true;res.push(a);}
   me.onresult&&me.onresult({results:res});setTimeout(push,30);};setTimeout(push,30);}
 stop(){setTimeout(()=>{this.onend&&this.onend();},10);} abort(){this.stop();}}
window.SpeechRecognition=FakeSR;window.webkitSpeechRecognition=FakeSR;
"""
# vẽ lần lượt từng câu của bài, kiểm tra có vùng trả lời và không lỗi
RENDER_ALL = r"""
(qs)=>{const bad=[];Q={td:-1,level:-1,qs,i:0,correct:0,coins:0,start:Date.now(),gamePlayed:true};
 for(let i=0;i<qs.length;i++){Q.i=i;try{renderQ();}catch(e){bad.push(i+': '+e.message);continue;}
  const q=qs[i];const a=document.querySelector('#ans');if(!a){bad.push(i+': không có #ans');continue;}
  if(q.type==='mc'&&document.querySelectorAll('.opt').length!==q.options.length)bad.push(i+': số lựa chọn '+document.querySelectorAll('.opt').length+'/'+q.options.length);
  if(q.type==='slots'&&!document.querySelector('.ht-slots'))bad.push(i+': thiếu ô slots');
  if(q.type==='input'&&!document.querySelector('#padwrap .key'))bad.push(i+': thiếu bàn phím');
  const t=app.innerText;if(/undefined|NaN|\[object/.test(t))bad.push(i+': chữ lỗi '+t.slice(0,80));}
 return bad;}
"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844})
    ctx.add_init_script(FAKE_SR)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto(URL); pg.wait_for_timeout(1200)
    inputs = pg.query_selector_all('input.field')
    if len(inputs) >= 2 and not pg.query_selector('.tabbar'):
        inputs[0].fill(EMAIL); inputs[1].fill(PW); pg.click('button.btn-go'); pg.wait_for_timeout(2500)
    if pg.query_selector('#obGo'): pg.click('#obGo'); pg.wait_for_timeout(800)
    pg.wait_for_selector('.tabbar', timeout=10000)
    pg.evaluate("()=>{S.autoRead=false;save();}")
    G = pg.evaluate("()=>HT.GRADE")
    log('Lớp', G)
    # ---- Toán tư duy
    pg.click('[data-act="httab"]'); pg.wait_for_timeout(500)
    n = pg.evaluate("()=>document.querySelectorAll('[data-httd]').length")
    exp = pg.evaluate("()=>(HT.GRADE===0?HT.TD_LA:HT.TD_ALL.filter(l=>HT.GRADE>=l.g[0]&&HT.GRADE<=l.g[1])).length")
    ok(n == exp and n >= (12 if G == 0 else 22 if G == 1 else 25), f'Toán tư duy có {n} bài')
    pg.screenshot(path=f'{OUT}/td_list.png', full_page=True)
    ids = pg.evaluate("()=>[...document.querySelectorAll('[data-httd]')].map(b=>+b.dataset.httd)")
    tdbad = []
    for i in ids:
        r = pg.evaluate("(id)=>{const L=(HT.GRADE===0?HT.TD_LA:HT.TD_ALL).find(l=>l.id===id);return HT.tdBuild(L,10);}", i)
        bad = pg.evaluate(RENDER_ALL, r)
        if bad: tdbad.append((i, bad[:2]))
        if i in (21, 22, 24, 27, 28, 36, 37, 6, 9, 10):
            pg.evaluate("()=>{Q.i=4;renderQ();}"); pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/td_{i}.png')
    ok(not tdbad, 'Vẽ được mọi câu Toán tư duy ' + json.dumps(tdbad, ensure_ascii=False)[:300])
    # làm hết 1 bài tư duy mới bằng giao diện
    newid = 22 if G > 0 else 7
    pg.evaluate("()=>{Q=null;HT.renderTd();}"); pg.wait_for_timeout(300)
    pg.evaluate(f"()=>HT.startTd({newid})"); pg.wait_for_timeout(300)
    for step in range(40):
        if pg.query_selector('.result'): break
        pg.evaluate("""()=>{const q=Q.qs[Q.i];if(q.type==='mc'){const o=[...document.querySelectorAll('.opt')].find(b=>q.options[+b.dataset.k]===q.answer);o&&o.click();}
          else if(q.type==='input'){for(const ch of String(q.answer)){const k=[...document.querySelectorAll('#padwrap .key')].find(b=>b.dataset.k===ch);k&&k.click();}}
          else if(q.type==='slots'){const used=new Set();for(const v of q.vals){const c=[...document.querySelectorAll('.ht-chips .chip')].find(b=>q.chips[+b.dataset.k]===v&&!used.has(b.dataset.k));used.add(c.dataset.k);c.click();}}
          const c=document.querySelector('#check');c&&c.click();}""")
        pg.wait_for_timeout(120)
        pg.evaluate("()=>{const n=document.querySelector('#next');if(n)n.click();}"); pg.wait_for_timeout(150)
    ok(pg.query_selector('.result') is not None, 'Làm xong 1 bài tư duy mới bằng giao diện')
    pg.screenshot(path=f'{OUT}/td_result.png')
    # ---- Toán: mọi bài
    mbad = []; newseen = {}
    NEW = ['trueFalse','chooseOp','numberLine','missingDigit','exprCmp','factFamily','estimate','unitChoose','clockElapsed','percentWp','wpChain','arrayMul','decTF']
    for w in range(8):
        for d in range(6):
            qs = pg.evaluate(f"()=>buildLevel({w},{d})")
            for q in qs:
                if q.get('mg') in NEW: newseen[q['mg']] = newseen.get(q['mg'], 0) + 1
            bad = pg.evaluate(RENDER_ALL, qs)
            if bad: mbad.append((w, d, bad[:2]))
    ok(not mbad, 'Vẽ được mọi câu Toán ' + json.dumps(mbad, ensure_ascii=False)[:300])
    log('  dạng mới đã gặp:', newseen)
    # chụp vài dạng mới
    k = 0
    for name in list(newseen)[:6]:
        pg.evaluate("(n)=>{for(let w=0;w<8;w++)for(let d=0;d<6;d++){const qs=buildLevel(w,d);const i=qs.findIndex(q=>q.mg===n);if(i>=0){Q={level:w*6+d,qs,i,correct:0,coins:0,start:Date.now()};renderQ();return;}}}", name)
        pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/m_{name}.png'); k += 1
    # ---- English: luyện nói đoạn văn
    pg.evaluate("()=>{Q=null;renderEnglish();}"); pg.wait_for_timeout(500)
    ok(pg.query_selector('.ht-pa-banner') is not None, 'Trang English có banner Luyện nói đoạn văn')
    nb = pg.evaluate("()=>document.querySelectorAll('.en-tools .ht-pa').length")
    nu = pg.evaluate("()=>EN_UNITS.length")
    ok(nb == nu, f'Mỗi Unit có nút Nói đoạn văn ({nb}/{nu})')
    pg.screenshot(path=f'{OUT}/en_home.png')
    pg.click('.ht-pa-banner'); pg.wait_for_timeout(400)
    rows = pg.evaluate("()=>document.querySelectorAll('[data-act=htpara]').length")
    ok(rows >= nu * 2, f'Danh sách đoạn văn có {rows} mục')
    pg.screenshot(path=f'{OUT}/pa_home.png', full_page=False)
    pg.click('.en-tools .ht-pa') if False else pg.evaluate("()=>HT.renderPara(0,0,0)")
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/pa_m0.png', full_page=True)
    txt = pg.evaluate("()=>HT.paList(0)[0].en")
    # nói đúng cả đoạn
    pg.evaluate("(t)=>{window.__SAY__=t;window.__SAID__=null;}", txt)
    pg.click('#paRec'); pg.wait_for_timeout(2500)
    pg.wait_for_selector('#paRes .rec-res', timeout=12000)
    st = pg.evaluate("()=>HT.paSt(HT.paList(0)[0].id).m[0]")
    ok(st == 5, f'Nói đúng cả đoạn được 5 sao (được {st})')
    pg.screenshot(path=f'{OUT}/pa_m0_res.png', full_page=True)
    # nói thiếu một câu ở bước che chữ
    pg.evaluate("()=>HT.renderPara(0,0,1)"); pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/pa_m1.png', full_page=True)
    half = ' '.join(txt.split(' ')[: max(2, len(txt.split(' ')) // 2)])
    pg.evaluate("(t)=>{window.__SAY__=t;window.__SAID__=null;}", half)
    pg.click('#paRec'); pg.wait_for_timeout(2500)
    pg.wait_for_selector('#paRes .rec-res', timeout=12000)
    st1 = pg.evaluate("()=>HT.paSt(HT.paList(0)[0].id).m[1]")
    ok(0 < st1 < 5, f'Nói nửa đoạn được ít sao hơn ({st1})')
    pg.screenshot(path=f'{OUT}/pa_m1_res.png', full_page=True)
    pg.evaluate("()=>HT.renderPara(0,0,2)"); pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/pa_m2.png', full_page=True)
    # từng câu
    s0 = pg.evaluate("()=>HT.paSplit(HT.paList(0)[0].en)[0]")
    pg.evaluate("()=>HT.renderPara(0,0,0)"); pg.wait_for_timeout(300)
    pg.evaluate("(t)=>{window.__SAY__=t;window.__SAID__=null;}", s0)
    pg.click('[data-rec="0"]'); pg.wait_for_timeout(5500)
    ok(pg.evaluate("()=>HT.paSt(HT.paList(0)[0].id).s[0]") == 5, 'Nói đúng câu 1 được 5 sao')
    # nói từng câu của bài
    pg.evaluate("()=>HT.renderPara(0,-1,0)"); pg.wait_for_timeout(300)
    nc = pg.evaluate("()=>document.querySelectorAll('[data-crec]').length")
    ok(nc == pg.evaluate("()=>EN_UNITS[0].c.length") and nc > 0, f'Tab Nói từng câu có {nc} câu')
    c0 = pg.evaluate("()=>EN_UNITS[0].c[0][0]")
    pg.evaluate("(t)=>{window.__SAY__=t;window.__SAID__=null;}", c0)
    pg.click('[data-crec="0"]'); pg.wait_for_timeout(5500)
    ok(pg.evaluate("()=>HT.pcS(0)[0]") == 5, 'Nói đúng câu của bài được 5 sao')
    pg.screenshot(path=f'{OUT}/pa_sent.png', full_page=True)
    # điểm đồng bộ lên máy chủ
    pg.wait_for_timeout(1500)
    pts = pg.evaluate("()=>apiGet('/student/me/home').then(r=>r&&r.student?r.student.total_points:(r&&r.total_points))")
    log('  tổng điểm máy chủ:', pts)
    pg.evaluate("()=>renderEnglish()"); pg.wait_for_timeout(300)
    ok(pg.evaluate("()=>/[1-9]\\/\\d+ đoạn/.test(document.querySelector('.ht-pa-banner').innerText)"), 'Banner cập nhật số đoạn đã đạt')
    pg.click('.en-tools .ht-pa'); pg.wait_for_timeout(300)
    ok(pg.query_selector('.pa-page') is not None, 'Nút Nói đoạn văn ở Unit mở đúng màn')
    pg.evaluate("()=>document.querySelector('#paBack').click()"); pg.wait_for_timeout(300)
    ok(pg.query_selector('.ht-pa-banner') is not None, 'Quay lại English bình thường')
    b.close()
log('\n==== KẾT QUẢ:', 'ĐẠT' if not errs else 'LỖI'); [log(e) for e in errs[:30]]
sys.exit(1 if errs else 0)
