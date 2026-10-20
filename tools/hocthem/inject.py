#!/usr/bin/env python3
"""Chèn (hoặc cập nhật) lớp Học thêm (Toán tư duy, thẻ kiến thức…) vào public/index.html.
Khối HT nằm NGAY TRƯỚC khối DUO để lớp Duolingo bọc bên ngoài (làm lại câu sai chạy cho cả bài Tư duy).
Dùng: python3 tools/hocthem/inject.py public/index.html   (chạy lại bao nhiêu lần cũng được)"""
import re, sys, pathlib, subprocess
here = pathlib.Path(__file__).resolve().parent
subprocess.run([sys.executable, str(here / 'build.py')], check=True)
target = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/index.html')
js = (here / 'hocthem.js').read_text(encoding='utf-8')
block = '<!--HT:START-->\n<script>\n' + js.rstrip() + '\n</script>\n<!--HT:END-->\n'
html = target.read_text(encoding='utf-8')
pat = re.compile(r'<!--HT:START-->.*?<!--HT:END-->\n?', re.S)
html = pat.sub('', html)
i = html.find('<!--DUO:START-->')
if i < 0:
    i = html.rfind('</body>')
    if i < 0:
        sys.exit('Không thấy </body> trong ' + str(target))
html = html[:i] + block + html[i:]
target.write_text(html, encoding='utf-8')
print('OK', target)
