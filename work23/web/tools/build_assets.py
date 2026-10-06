# Собирает js/assets.js из оригинальных файлов игры (../..), чтобы игра
# работала прямо с диска (file://) без веб-сервера.
import base64, os, re, struct, sys, json
def find_originals(marker, unpacked, archive):
    # Исходные файлы игры: в репозитории — <проект>/sources (рядом с web);
    # запасные варианты — sources/<имя архива> и папка уровнем выше (старое место).
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    for c in (os.path.join(root, '..', 'sources'), os.path.join(root, '..', 'sources', unpacked), os.path.join(root, '..')):
        if os.path.exists(os.path.join(c, marker)):
            return os.path.abspath(c)
    raise SystemExit('Нет исходных файлов игры в ../sources (их архив — %s)' % archive)

SRC = find_originals('WORK23.PAS', 'WORK', 'WORK.ARJ')
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'js', 'assets.js'))

def rd(name):
    return open(os.path.join(SRC, name), 'rb').read()

def count_sprites(data):
    p = 0; n = 0
    while p < len(data):
        w, h, ln = struct.unpack_from('<HHH', data, p)
        assert ln == w*h + 4, (p, w, h, ln)
        p += ln + 6; n += 1
    assert p == len(data)
    return n

# ожидаемое количество спрайтов в .DAT (по loadpict из MODUL.PAS)
DAT = {'DIRT.DAT':12,'MYTANK.DAT':40,'MYTANK2.DAT':16,'MYTANK5.DAT':8,'MYTANK3.DAT':8,
       'ENEMTANK.DAT':32,'ENTANK.DAT':8,'MYHARV.DAT':16,'ENEMHARV.DAT':16,'VZR.DAT':45,
       'MYTUR.DAT':16,'ENEMTUR.DAT':16,'MYAIR.DAT':32,'MYAIR3.DAT':8,'MYAIR2.DAT':8,
       'ENEMAIR.DAT':32,'MYICONS.DAT':7,'ICONS2.DAT':14,'VZR2.DAT':16,'PICT.DAT':3,
       'ARROW.DAT':4,'SMOKE.DAT':6}
SPR = ['TREE.SPR','MYOBS.SPR','ENEMOBS.SPR','MYBUILD1.SPR','BUILD2.SPR','BUILD6.SPR',
       'BUILD3.SPR','BUILD4.SPR','REMONT.SPR','REMONT1.SPR','BUILD1.SPR','BUILD12.SPR',
       'BUILD10.SPR','BUILD11.SPR','BUILD13.SPR','BULLET.SPR','ROCKET.SPR','REPAIR.SPR',
       'KEY.SPR','KEY2.SPR','CDUT.SPR','KRUG.SPR','KRUG2.SPR','KREST.SPR','MOVE.SPR',
       'C_MENU.SPR','C_REPAIR.SPR','C_GO.SPR','C_FIRE.SPR','C_CHRONO.SPR','RED.SPR','GREEN.SPR']
OTHER = ['VX.PAL','EXPL1.WAV','EXPL2.WAV','EXPL3.WAV','LASER1.WAV','LASER2.WAV','LASER3.WAV',
         'SHOT1.WAV','SHOT2.WAV','WAV1.WAV','WAV2.WAV','WAV3.WAV']
SAVES = ['SAVE%d.SAV' % i for i in range(1, 12)]

files = {}
for f, n in DAT.items():
    d = rd(f); c = count_sprites(d); assert c >= n, (f, c, n); files[f] = d
    if c != n: print("note:", f, "contains", c, "sprites, game reads", n)
for f in SPR:
    d = rd(f); assert count_sprites(d) == 1, f; files[f] = d
for f in OTHER + SAVES:
    files[f] = rd(f)

# --- RESOURSE.TPU: процедуры-данные (текстуры окон) ---
tpu = rd('RESOURSE.TPU')
h = struct.unpack_from('<14H', tpu, 8)
procmap, segmap, symsize = h[2], h[3], h[10]
off = (symsize + 15) & ~15
segs = {}
p = segmap
while p + 8 <= h[4]:
    size = struct.unpack_from('<H', tpu, p + 2)[0]
    segs[p - segmap] = tpu[off:off + size]; off += size; p += 8
names = ['grass','snow','shrift','vert','sqr_','hor','text1','text_2','text_3','text_4','vint','sqr_1']
for i, nm in enumerate(names):
    seg = struct.unpack_from('<H', tpu, procmap + 8 * (i + 1) + 4)[0]
    files['RES:' + nm.upper()] = segs[seg]

# --- шрифты Borland (BINOBJ -> OMF LEDATA) ---
def omf(path):
    d = rd(path); p = 0; out = bytearray()
    while p < len(d):
        t = d[p]; ln = struct.unpack_from('<H', d, p + 1)[0]; body = d[p + 3:p + 2 + ln]
        if t == 0xA0:
            o = struct.unpack_from('<H', body, 1)[0]; data = body[3:]
            if len(out) < o + len(data): out.extend(b'\0' * (o + len(data) - len(out)))
            out[o:o + len(data)] = data
        p += 3 + ln
    return bytes(out)
files['FONT:GOTH'] = omf('GOTH.OBJ')
files['FONT:LITT'] = omf('LITT.OBJ')

def asm_bytes(fname, label, count):
    src = rd(fname).decode('cp866')
    body = src.split(label, 1)[1]
    nums = [int(x) for x in re.findall(r'\b\d+\b', body)]
    assert len(nums) >= count, (fname, len(nums))
    return bytes(nums[:count])
files['ASM:STANDARDFONT'] = asm_bytes('FONT.ASM', 'StandardFont', 4096)
files['ASM:STANDARDPALETTE'] = asm_bytes('PALETTE.ASM', 'StandardPalette', 768)
files['ASM:STANDARDCURSOR'] = asm_bytes('CURSOR.ASM', 'StandardCursor', 4 + 1024)

with open(OUT, 'w', encoding='utf-8', newline='\n') as o:
    o.write('// Сгенерировано tools/build_assets.py из оригинальных файлов игры. Не редактировать.\n')
    o.write('var ASSETS_B64 = {\n')
    for k in sorted(files):
        o.write('  %s: "%s",\n' % (json.dumps(k), base64.b64encode(files[k]).decode()))
    o.write('};\n')
print('ok', len(files), 'files ->', OUT, os.path.getsize(OUT))
