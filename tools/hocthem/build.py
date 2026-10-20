#!/usr/bin/env python3
"""Ghép src/*.js thành hocthem.js (theo thứ tự tên file)."""
import pathlib
here=pathlib.Path(__file__).resolve().parent
parts=sorted((here/'src').glob('*.js'))
out='\n'.join(p.read_text(encoding='utf-8').rstrip() for p in parts)+'\n'
(here/'hocthem.js').write_text(out,encoding='utf-8')
print('OK hocthem.js', len(out), 'bytes from', len(parts), 'files')
