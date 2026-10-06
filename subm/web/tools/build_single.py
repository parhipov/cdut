# Собирает index.html и все js/*.js в один файл для отправки: Submarina.html
# Запуск: python tools/build_single.py
import os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'Submarina.html')

html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()

def inline(m):
    src = m.group(1)
    code = open(os.path.join(ROOT, src), encoding='utf-8').read()
    if '</script' in code.lower():
        raise SystemExit('в %s встречается </script — встраивать нельзя' % src)
    return '<script>\n/* %s */\n%s\n</script>' % (src, code)

out, n = re.subn(r'<script src="([^"]+)"></script>', inline, html)
open(OUT, 'w', encoding='utf-8', newline='\n').write(out)
print('встроено скриптов:', n, '->', OUT, os.path.getsize(OUT), 'байт')
