# Переводит ../../DOKLAD.TXT (CP866, выравнивание пробелами) в HTML и вставляет
# его в index.html между маркерами <!--DOKLAD--> и <!--/DOKLAD-->.
# Текст не меняется — только убираются переносы строк и выравнивающие пробелы.
import html, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
def find_originals(marker, unpacked, archive):
    # Исходные файлы игры: в репозитории — <проект>/sources (рядом с web);
    # запасные варианты — sources/<имя архива> и папка уровнем выше (старое место).
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    for c in (os.path.join(root, '..', 'sources'), os.path.join(root, '..', 'sources', unpacked), os.path.join(root, '..')):
        if os.path.exists(os.path.join(c, marker)):
            return os.path.abspath(c)
    raise SystemExit('Нет исходных файлов игры в ../sources (их архив — %s)' % archive)

SRC = os.path.join(find_originals('DOKLAD.TXT', 'WORK', 'WORK.ARJ'), 'DOKLAD.TXT')
INDEX = os.path.join(ROOT, 'index.html')

lines = open(SRC, 'rb').read().decode('cp866').replace('\r', '').split('\n')

blocks = []          # ('h', text) | ('p', text) | ('li', text) | ('li2', text)
cur = None
for raw in lines:
    if not raw.strip():
        cur = None
        continue
    lead = len(raw) - len(raw.lstrip(' '))
    s = raw.strip()
    if lead >= 10 and cur is None:                  # заголовок по центру
        blocks.append(['h', s]); cur = None
    elif s.startswith('* '):                        # пункт списка
        cur = ['li', s[2:].strip()]; blocks.append(cur)
    elif s.startswith('# '):                        # вложенный пункт
        cur = ['li2', s[2:].strip()]; blocks.append(cur)
    elif lead >= 4:                                 # красная строка — новый абзац
        cur = ['p', s]; blocks.append(cur)
    elif cur is not None:                           # продолжение
        cur[1] += ' ' + s
    else:
        cur = ['p', s]; blocks.append(cur)

def clean(t):
    t = re.sub(r' {2,}', ' ', t)
    t = re.sub(r'(\w)- (\w)', r'\1-\2', t)          # «тип- объект» — след переноса строки
    t = t.replace(' - ', ' — ')
    t = re.sub(r'"([^"]+)"', '«\\1»', t)
    return html.escape(t, quote=False)

out = []
i = 0
while i < len(blocks):
    kind, text = blocks[i]
    if kind == 'h':
        out.append('<h2>%s</h2>' % clean(text)); i += 1
    elif kind == 'p':
        out.append('<p>%s</p>' % clean(text)); i += 1
    else:
        out.append('<ul>')
        while i < len(blocks) and blocks[i][0] in ('li', 'li2'):
            item = '<li>%s' % clean(blocks[i][1]); i += 1
            if i < len(blocks) and blocks[i][0] == 'li2':
                item += '<ul>'
                while i < len(blocks) and blocks[i][0] == 'li2':
                    item += '<li>%s</li>' % clean(blocks[i][1]); i += 1
                item += '</ul>'
            out.append(item + '</li>')
        out.append('</ul>')

fragment = '\n'.join(out)
if '--print' in sys.argv:
    print(fragment)
    sys.exit()
page = open(INDEX, encoding='utf-8').read()
new, n = re.subn(r'<!--DOKLAD-->.*?<!--/DOKLAD-->', '<!--DOKLAD-->\n' + fragment.replace('\\', '\\\\') + '\n<!--/DOKLAD-->', page, flags=re.S)
if n != 1:
    raise SystemExit('в index.html нет маркеров <!--DOKLAD--> <!--/DOKLAD-->')
open(INDEX, 'w', encoding='utf-8', newline='\n').write(new)
print('доклад вставлен в index.html:', len(blocks), 'блоков')
