#!/usr/bin/env python3
"""Chèn (hoặc cập nhật) lớp giao diện/bài tập kiểu Duolingo vào public/index.html.
Dùng: python3 duolingo/inject.py public/index.html   (chạy lại bao nhiêu lần cũng được)"""
import re, sys, pathlib

here = pathlib.Path(__file__).resolve().parent
target = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/index.html')
js = (here / 'duolingo.js').read_text(encoding='utf-8')
block = '<!--DUO:START-->\n<script>\n' + js.rstrip() + '\n</script>\n<!--DUO:END-->\n'

html = target.read_text(encoding='utf-8')
pat = re.compile(r'<!--DUO:START-->.*?<!--DUO:END-->\n?', re.S)
if pat.search(html):
    html = pat.sub(lambda m: block, html)
else:
    i = html.rfind('</body>')
    if i < 0:
        sys.exit('Không thấy </body> trong ' + str(target))
    html = html[:i] + block + html[i:]
target.write_text(html, encoding='utf-8')
print('OK', target)
