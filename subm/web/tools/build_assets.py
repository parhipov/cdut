# Собирает js/assets.js из исходных файлов игры (папка уровнем выше).
# Файлы кладутся как есть (base64): спрайты BGI (GetImage), шрифты .CHR,
# текстовые уровни. Плюс шрифт 8x8 для встроенного шрифта BGI (DefaultFont),
# собранный так же, как его собирал драйвер (проверено по эталону в DOSBox):
#   коды 0..63    — из ПЗУ видеокарты (tools/font8x8_rom.bin, снят в DOSBox),
#                   кроме нуля: «0» без косой черты — глиф буквы O из драйвера;
#   коды 64..127  — собственная таблица драйвера EGAVGA.BGI (смещение 4983);
#   коды 128..255 — по вектору INT 1Fh, то есть от русификатора (keyrus.com);
#                   здесь — кодовая страница 866 из DOSBox (tools/font8x8_866.bin).
import base64, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def find_originals(marker, unpacked, archive):
    # Исходные файлы игры: в репозитории — <проект>/sources (рядом с web);
    # запасные варианты — sources/<имя архива> и папка уровнем выше (старое место).
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    for c in (os.path.join(root, '..', 'sources'), os.path.join(root, '..', 'sources', unpacked), os.path.join(root, '..')):
        if os.path.exists(os.path.join(c, marker)):
            return os.path.abspath(c)
    raise SystemExit('Нет исходных файлов игры в ../sources (их архив — %s)' % archive)

SRC = find_originals('SUBM8.PAS', 'SUBM', 'SUBM.RAR')
FILES = ['SUBMAR.DAT', 'KEY1.SPR', 'MINUS.SPR', 'PLUS.SPR', 'PEIZA.SPR',
         'EKRAN1.TXT', 'ZAST.TXT',
         'TRIP.CHR', 'LITT.CHR', 'SANS.CHR', 'GOTH.CHR', 'SCRI.CHR', 'SIMP.CHR',
         'TSCR.CHR', 'LCOM.CHR', 'EURO.CHR', 'BOLD.CHR']

out = ['// Сгенерировано tools/build_assets.py — не править вручную.',
       'var ASSETS = {']
for name in FILES:
    data = open(os.path.join(SRC, name), 'rb').read()
    out.append('  %s: "%s",' % (repr(name), base64.b64encode(data).decode()))
rom = open(os.path.join(ROOT, 'tools', 'font8x8_rom.bin'), 'rb').read()
ru = open(os.path.join(ROOT, 'tools', 'font8x8_866.bin'), 'rb').read()
drv = open(os.path.join(SRC, 'EGAVGA.BGI'), 'rb').read()[4983:4983 + 512]
font = bytearray(rom[:512] + drv + ru[1024:])
font[48 * 8:49 * 8] = drv[(79 - 64) * 8:(80 - 64) * 8]
font = bytes(font)
assert len(font) == 2048
out.append('  "FONT8X8": "%s",' % base64.b64encode(font).decode())
# шрифт BIOS 8x14 (DOS печатает им в графическом режиме сообщения об ошибках,
# им же показан текстовый экран 80x25 после выхода) — кодовая страница 866 из DOSBox
font14 = open(os.path.join(ROOT, 'tools', 'font8x14_866.bin'), 'rb').read()
assert len(font14) == 3584
out.append('  "FONT8X14": "%s"' % base64.b64encode(font14).decode())
out.append('};')
dst = os.path.join(ROOT, 'js', 'assets.js')
open(dst, 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')
print('assets.js:', os.path.getsize(dst), 'байт,', len(FILES) + 1, 'ресурсов')
