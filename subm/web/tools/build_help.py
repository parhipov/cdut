# Переводит ../HELP.TXT (CP866, выравнивание пробелами, переносы слов) в HTML
# и вставляет его в index.html между маркерами <!--HELP--> и <!--/HELP-->.
# В DOS этот текст показывал README.BAT через просмотрщик SVIEW.EXE.
# Слова не меняются: склеиваются переносы, убираются выравнивающие пробелы,
# после знаков препинания ставится пробел, кавычки — «ёлочки».
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

SRC = os.path.join(find_originals('HELP.TXT', 'SUBM', 'SUBM.RAR'), 'HELP.TXT')
INDEX = os.path.join(ROOT, 'index.html')

lines = open(SRC, 'rb').read().decode('cp866').replace('\r', '').split('\n')
LIST_SECTIONS = ('Цели создания.', 'Управление.', 'Главное меню.')

blocks = []          # [вид, текст]: h — заголовок, p — абзац, li — пункт списка
cur = None
section = None
for raw in lines:
    if not raw.strip():
        cur = None
        if section in LIST_SECTIONS and blocks and blocks[-1][0] == 'li':
            section = None                          # пустая строка после списка — конец раздела
        continue
    lead = len(raw) - len(raw.lstrip(' '))
    s = raw.strip()
    if lead >= 10:                                  # заголовок по центру
        blocks.append(['h', s]); cur = None; section = s
    elif section in LIST_SECTIONS and lead >= 2:    # каждая строка — пункт
        cur = ['li', s.lstrip('-')]; blocks.append(cur)
    elif lead >= 2:                                 # красная строка — новый абзац
        cur = ['p', s]; blocks.append(cur)
    elif cur is not None:                           # продолжение абзаца
        if re.search(r'[А-Яа-яЁё]-$', cur[1]):      # перенос слова
            cur[1] = cur[1][:-1] + s
        else:
            cur[1] += ' ' + s
    else:
        cur = ['p', s]; blocks.append(cur)

def clean(t):
    t = re.sub(r' {2,}', ' ', t)
    t = re.sub(r' +([,.])', r'\1', t)
    t = re.sub(r'([.,:;)])(?=[А-Яа-яЁёA-Za-z(])', r'\1 ', t)
    t = re.sub(r'(?<=[А-Яа-яЁёA-Za-z])\(', ' (', t)
    t = re.sub(r'"([^"]+)"', '«\\1»', t)
    return html.escape(t, quote=False)

def clean_item(t):                                  # «'+'-увеличение» — клавиши кодом
    m = re.match(r"^'(.)'-(.*)$", t)
    if m:
        return '<code>%s</code> — %s' % (html.escape(m.group(1)), clean(m.group(2)))
    m = re.match(r'^(Стрелки)-(.*)$', t)
    if m:
        return '%s — %s' % (m.group(1), clean(m.group(2)))
    return clean(t)

out = []
i = 0
while i < len(blocks):
    kind, text = blocks[i]
    if kind == 'h':
        out.append('<h2>%s</h2>' % clean(text.rstrip('.'))); i += 1
    elif kind == 'p':
        out.append('<p>%s</p>' % clean(text)); i += 1
    else:
        out.append('<ul>')
        while i < len(blocks) and blocks[i][0] == 'li':
            out.append('<li>%s</li>' % clean_item(blocks[i][1])); i += 1
        out.append('</ul>')

fragment = '\n'.join(out)
if '--print' in sys.argv:
    sys.stdout.reconfigure(encoding='utf-8')
    print(fragment)
    sys.exit()
page = open(INDEX, encoding='utf-8').read()
new, n = re.subn(r'<!--HELP-->.*?<!--/HELP-->', '<!--HELP-->\n' + fragment.replace('\\', '\\\\') + '\n<!--/HELP-->', page, flags=re.S)
if n != 1:
    raise SystemExit('в index.html нет маркеров <!--HELP--> <!--/HELP-->')
open(INDEX, 'w', encoding='utf-8', newline='\n').write(new)
print('справка вставлена в index.html:', len(blocks), 'блоков')
