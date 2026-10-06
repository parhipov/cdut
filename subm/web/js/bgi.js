'use strict';
// =============================================================================
//  BGI — модуль Graph Turbo Pascal 7 с драйвером EGAVGA.BGI, режим VGAMed:
//  640x350, 16 цветов, две видеостраницы.
//
//  Видеопамять VGA — 4 плоскости по 64 КБ; страница 0 начинается с A000:0000,
//  страница 1 — с A000:8000. Здесь она хранится «распакованной»: один байт
//  на пиксель, 65536*8 пикселей; адрес пикселя = база страницы + y*640 + x,
//  по модулю 64К*8 — как в железе. Поэтому всё, что рисуется без отсечения
//  за краями экрана (строки 350..409 — невидимый «зазор» между страницами),
//  ведёт себя так же, как в DOS.
// =============================================================================

var VRAM = new Uint8Array(524288);
var VRAM_MASK = 524287;
var PAGE_BASE = [0, 262144];               // A000:0000 и A000:8000, в пикселях
var MAXX = 639, MAXY = 349;

var bgi = {
  active: 0, visual: 0,
  color: 15, fillStyle: 1, fillColor: 15,
  font: 0, dir: 0, size: 1,
  graph: false
};

// стандартная палитра EGA (в режиме VGA — через регистры палитры в DAC)
var EGA_RGB = [
  [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170], [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
  [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255], [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255]
];
var black = 0, blue = 1, green = 2, cyan = 3, red = 4, magenta = 5, brown = 6, lightgray = 7,
    darkgray = 8, lightblue = 9, lightgreen = 10, lightcyan = 11, lightred = 12, lightmagenta = 13,
    yellow = 14, white = 15;
var normalput = 0, xorput = 1, orput = 2, andput = 3, notput = 4;
var vga = 9, vgamed = 1;

function initgraph() {
  VRAM.fill(0);
  bgi.active = 0; bgi.visual = 0; bgi.color = 15; bgi.fillStyle = 1; bgi.fillColor = 15;
  bgi.font = 0; bgi.dir = 0; bgi.size = 1; bgi.graph = true;
}
function closegraph() { bgi.graph = false; }
function setactivepage(p) { bgi.active = p & 1; }
// драйвер переключает страницу через INT 10h AH=05h — без ожидания луча;
// видеокарта подхватит новый адрес только на обратном ходу (см. развёртку ниже)
function setvisualpage(p) { scanTo(vclock); bgi.visual = p & 1; spend(10, 40); }
function setcolor(c) { bgi.color = c & 15; }
function setbkcolor(c) { /* палитра 0 и так чёрная; в игре вызывается только setbkcolor(0) */ }
function setfillstyle(style, c) { bgi.fillStyle = style; bgi.fillColor = c & 15; }

function pset(x, y, c) {                    // точка с отсечением по окну (весь экран)
  if (x < 0 || x > MAXX || y < 0 || y > MAXY) return;
  VRAM[PAGE_BASE[bgi.active] + y * 640 + x] = c;
}

// --- линии ---------------------------------------------------------------
// Как в BGI: линия всегда идёт сверху вниз (концы меняются местами), шаг по
// младшей оси — когда ошибка d = 2*dmin - dmax ... становится >= 0.
// Сверено с эталоном попиксельно на векторных шрифтах.
function lineRaw(x1, y1, x2, y2, c) {
  var t;
  if (y1 > y2) { t = x1; x1 = x2; x2 = t; t = y1; y1 = y2; y2 = t; }
  var dx = Math.abs(x2 - x1), dy = y2 - y1;
  var sx = x1 < x2 ? 1 : -1, n, d;
  scanTo(vclock); spend(2 * (Math.max(dx, dy) + 1) + 4, Math.max(dx, dy) + 1 + 10);
  if (dx >= dy) {
    d = 2 * dy - dx;
    for (n = 0; n <= dx; n++) {
      pset(x1, y1, c);
      if (d >= 0) { y1++; d -= 2 * dx; }
      x1 += sx; d += 2 * dy;
    }
  } else {
    d = 2 * dx - dy;
    for (n = 0; n <= dy; n++) {
      pset(x1, y1, c);
      if (d >= 0) { x1 += sx; d -= 2 * dy; }
      y1++; d += 2 * dx;
    }
  }
}
function line(x1, y1, x2, y2) { lineRaw(x1, y1, x2, y2, bgi.color); }
function rectangle(x1, y1, x2, y2) {
  line(x1, y1, x2, y1); line(x2, y1, x2, y2); line(x2, y2, x1, y2); line(x1, y2, x1, y1);
}

// --- bar: заливка прямоугольника, с отсечением по окну ------------------
function bar(x1, y1, x2, y2) {
  var t;
  if (x1 > x2) { t = x1; x1 = x2; x2 = t; }
  if (y1 > y2) { t = y1; y1 = y2; y2 = t; }
  if (x1 < 0) x1 = 0; if (y1 < 0) y1 = 0;
  if (x2 > MAXX) x2 = MAXX; if (y2 > MAXY) y2 = MAXY;
  if (x1 > x2 || y1 > y2) return;
  scanTo(vclock); spend((y2 - y1 + 1) * ((x2 >> 3) - (x1 >> 3) + 3) + 6, (y2 - y1 + 1) * 4 + 20);
  var c = bgi.fillStyle === 0 ? 0 : bgi.fillColor, base = PAGE_BASE[bgi.active];
  for (var y = y1; y <= y2; y++) VRAM.fill(c, base + y * 640 + x1, base + y * 640 + x2 + 1);
}

// --- образы (GetImage/PutImage) -----------------------------------------
// Образ BGI: слово ширина-1, слово высота-1, затем по строкам 4 плоскости
// по ceil(w/8) байт. Здесь образ хранится распакованным: {w, h, pix}.
// Буфер, выделенный GetMem, — тот же объект: GetImage пишет В НЕГО, поэтому
// два указателя на один буфер (как после копирования записей) видят одно.
function newImageBuf() { return { w: 0, h: 0, pix: new Uint8Array(0) }; }
var PLANE_ORDER = [3, 2, 1, 0];             // в строке образа сначала плоскость 3 (старший бит цвета)
function decodeImage(bytes, off) {
  var w = (bytes[off] | (bytes[off + 1] << 8)) + 1;
  var h = (bytes[off + 2] | (bytes[off + 3] << 8)) + 1;
  var rb = (w + 7) >> 3, p = off + 4;
  var pix = new Uint8Array(w * h);
  for (var y = 0; y < h; y++) {
    for (var pl = 0; pl < 4; pl++) {
      var bit = 1 << PLANE_ORDER[pl];
      for (var x = 0; x < w; x++) if (bytes[p + (x >> 3)] & (0x80 >> (x & 7))) pix[y * w + x] |= bit;
      p += rb;
    }
  }
  return { w: w, h: h, pix: pix };
}
function imagesize(x1, y1, x2, y2) { return 6 + ((x2 - x1 + 8) >> 3) * 4 * (y2 - y1 + 1); }

// Драйвер считает адрес как y*80 + (x shr 3) со сдвигом БЕЗ знака: при x < 0
// образ уезжает на 65536 пикселей дальше (на 102 строки вниз и 256 вправо).
// Отсечения нет ни в Graph, ни в драйвере. (Отрицательный x1 при x2 >= 0
// Graph ещё и переставил бы углы — в игре такого не бывает.)
function imgX(x) { return x < 0 ? x + 65536 : x; }
function getimage(x1, y1, x2, y2, buf) {
  var w = x2 - x1 + 1, h = y2 - y1 + 1;
  if (buf.pix.length < w * h) buf.pix = new Uint8Array(w * h);
  buf.w = w; buf.h = h;
  var nb = ((x1 + w - 1) >> 3) - (x1 >> 3) + 1;
  scanTo(vclock); spend(h * 4 * (nb + 1), h * 4 * nb + 30);
  var base = PAGE_BASE[bgi.active];
  for (var y = 0; y < h; y++)
    for (var x = 0; x < w; x++) buf.pix[y * w + x] = VRAM[(base + (y1 + y) * 640 + imgX(x1) + x) & VRAM_MASK];
}
function putimage(x, y, img, mode) {
  var w = img.w, h = img.h, pix = img.pix, base = PAGE_BASE[bgi.active];
  var nb = ((x + w - 1) >> 3) - (x >> 3) + 1;
  scanTo(vclock);
  if (mode === 0 || mode === 4) spend(h * 4 * (nb + 2), h * 4 * nb + 30);
  else spend(h * 4 * (nb * 2 + 2), h * 4 * nb + 30);
  for (var yy = 0; yy < h; yy++) {
    var row = base + (y + yy) * 640 + imgX(x), src = yy * w;
    for (var xx = 0; xx < w; xx++) {
      var a = (row + xx) & VRAM_MASK, s = pix[src + xx];
      switch (mode) {
        case 0: VRAM[a] = s; break;
        case 1: VRAM[a] ^= s; break;
        case 2: VRAM[a] |= s; break;
        case 3: VRAM[a] &= s; break;
        case 4: VRAM[a] = (~s) & 15; break;
      }
    }
  }
}

// --- текст ---------------------------------------------------------------
var FONT8 = null;                           // 256 символов 8x8
var CHR_FILES = [null, 'TRIP.CHR', 'LITT.CHR', 'SANS.CHR', 'GOTH.CHR', 'SCRI.CHR', 'SIMP.CHR',
                 'TSCR.CHR', 'LCOM.CHR', 'EURO.CHR', 'BOLD.CHR'];
var chrCache = {};
// множители размера для векторных шрифтов (размер 4 — «родной»)
var SIZE_MUL = [1, 3, 2, 3, 1, 4, 5, 2, 5, 3, 4];
var SIZE_DIV = [1, 5, 3, 4, 1, 3, 3, 1, 2, 1, 1];

function loadChr(n) {
  if (chrCache[n]) return chrCache[n];
  var d = asset(CHR_FILES[n]);
  var e = 0; while (d[e] !== 0x1A) e++;
  var hs = d[e + 1] | (d[e + 2] << 8);
  var p = hs;
  var nch = d[p + 1] | (d[p + 2] << 8), first = d[p + 4];
  var soff = d[p + 5] | (d[p + 6] << 8);
  var top = (d[p + 8] << 24) >> 24, base = (d[p + 9] << 24) >> 24, desc = (d[p + 10] << 24) >> 24;
  var offs = [], widths = [], i;
  for (i = 0; i < nch; i++) offs.push(d[p + 16 + i * 2] | (d[p + 17 + i * 2] << 8));
  for (i = 0; i < nch; i++) widths.push(d[p + 16 + nch * 2 + i]);
  var glyphs = [];
  for (i = 0; i < nch; i++) {
    var q = p + soff + offs[i], ops = [];
    for (;;) {
      var b1 = d[q], b2 = d[q + 1]; q += 2;
      var op = ((b1 & 0x80) >> 6) | ((b2 & 0x80) >> 7);
      if (op === 0) break;
      var x = ((b1 & 0x7F) << 25) >> 25, y = ((b2 & 0x7F) << 25) >> 25;
      ops.push([op, x, y]);                 // 2 — перейти, 3 — провести линию
    }
    glyphs.push(ops);
  }
  return (chrCache[n] = { first: first, n: nch, top: top, base: base, desc: desc, widths: widths, glyphs: glyphs });
}

function settextstyle(font, dir, size) {
  bgi.font = font; bgi.dir = dir; bgi.size = size;
  if (font > 0) loadChr(font);
}

function outtextxy(x, y, s) {
  if (bgi.font === 0) outDefault(x, y, s);
  else outStroke(x, y, s);
}

// встроенный шрифт 8x8; символ, не помещающийся в окно целиком, не выводится;
// строка, начинающаяся левее окна, не выводится вовсе; #0 обрывает строку
function outDefault(x, y, s) {
  var n = bgi.size < 1 ? 1 : bgi.size, c = bgi.color, cell = 8 * n;
  if (x < 0) return;
  for (var k = 0; k < s.length; k++) {
    var ch = s[k], gx, gy;
    if (ch === 0) break;
    if (bgi.dir === 0) { gx = x + k * cell; gy = y; } else { gx = x; gy = y - (k + 1) * cell + 1; }
    if (gx < 0 || gy < 0 || gx + cell - 1 > MAXX || gy + cell - 1 > MAXY) continue;
    scanTo(vclock); spend(8 * n * 6, 64 * n * n + 20);
    for (var r = 0; r < 8; r++) {
      var bits = FONT8[ch * 8 + r];
      if (!bits) continue;
      for (var b = 0; b < 8; b++) {
        if (!(bits & (0x80 >> b))) continue;
        for (var yy = 0; yy < n; yy++) for (var xx = 0; xx < n; xx++) {
          if (bgi.dir === 0) pset(gx + b * n + xx, gy + r * n + yy, c);
          else pset(gx + r * n + yy, gy + (7 - b) * n + (n - 1 - xx), c);
        }
      }
    }
  }
}

// векторный шрифт: штрихи масштабируются множителем размера (с отбрасыванием
// дробной части); ось Y шрифта направлена вверх от базовой линии. При TopText
// базовая линия лежит ниже y на (высота заглавных + глубина выносных).
// Вертикальный текст (направление <> 0): буквы повёрнуты на 90° против часовой,
// строка идёт снизу вверх и заканчивается на y. Направление 2 в документации
// не описано, но SUBM8 его использует («ЦДЮТ»), и BGI рисует его так же.
function outStroke(x, y, s) {
  var f = loadChr(bgi.font), mul = SIZE_MUL[bgi.size] || 1, div = SIZE_DIV[bgi.size] || 1;
  var c = bgi.color, k, gi;
  var sc = function (v) { return Math.trunc(v * mul / div); };
  var drop = sc(f.top) + sc(-f.desc);
  var len = 0;
  for (k = 0; k < s.length; k++) { gi = s[k] - f.first; if (gi >= 0 && gi < f.n) len += sc(f.widths[gi]); }
  var pen = 0;
  for (k = 0; k < s.length; k++) {
    gi = s[k] - f.first;
    if (gi < 0 || gi >= f.n) continue;
    var ops = f.glyphs[gi], cx = 0, cy = 0;
    spend(0, 40 + ops.length * 12);
    for (var t = 0; t < ops.length; t++) {
      var nx = sc(ops[t][1]), ny = sc(ops[t][2]);
      if (ops[t][0] === 3) {
        if (bgi.dir === 0) lineRaw(x + pen + cx, y + drop - cy, x + pen + nx, y + drop - ny, c);
        else lineRaw(x + drop - cy, y + len - pen - cx, x + drop - ny, y + len - pen - nx, c);
      }
      cx = nx; cy = ny;
    }
    pen += sc(f.widths[gi]);
  }
}

// =============================================================================
//  Время и развёртка. В DOS рисование занимало время, а видеокарта показывала
//  страницу построчно, 70 кадров в секунду (режим 640x350). Адрес видимой
//  страницы она подхватывает на обратном ходу луча, поэтому после
//  SetVisualPage ещё до 14 мс показывает старую страницу — ту самую, которую
//  программа в это время стирает и перерисовывает. Отсюда мерцание оригинала.
//  Каждая операция BGI сдвигает виртуальные часы на свою «стоимость»
//  (обращения к видеопамяти + работа процессора), а развёртка копирует строки
//  видимой страницы в кадр по мере того, как их проходит луч.
// =============================================================================
var CPU_PROFILES = {
  '486':     { acc: 0.50, cpu: 0.12 },        // 486DX2-66, видеокарта на шине ISA
  'pentium': { acc: 0.12, cpu: 0.03 },        // Pentium-100, видеокарта PCI
  'instant': { acc: 0, cpu: 0 }               // рисование мгновенно — мерцания нет
};
var cpu = CPU_PROFILES['486'];
function spend(acc, ops) { vclock += (acc * cpu.acc + ops * cpu.cpu) / 1000; }

var FRAME_MS = 1000 / 70.086, LINES = 449, LINE_MS = FRAME_MS / LINES, LATCH_LINE = 387;
var disp = new Uint8Array(640 * 350), dispDone = new Uint8Array(640 * 350);
var scanFrame = 0, scanLine = 0, scanBase = 0, latchBase = 0;
var onFrameDone = null;                     // для тестов: вызывается на каждом готовом кадре
function scanReset(t) {
  scanFrame = Math.floor(t / FRAME_MS); scanLine = 0;
  scanBase = latchBase = PAGE_BASE[bgi.visual];
}
function copyRow(dst, base, l) {
  var a = (base + l * 640) & VRAM_MASK;
  dst.set(VRAM.subarray(a, a + 640), l * 640);
}
function scanTo(t) {
  var tf = Math.floor(t / FRAME_MS);
  var tl = Math.floor((t - tf * FRAME_MS) / LINE_MS);
  if (tf < scanFrame || (tf === scanFrame && tl < scanLine)) return;
  if (tf > scanFrame + 1) {                   // долгая пауза: память не менялась
    scanFrame = tf; scanLine = 0;
    scanBase = latchBase = PAGE_BASE[bgi.visual];
    for (var l = 0; l < 350; l++) copyRow(dispDone, scanBase, l);
    if (onFrameDone) onFrameDone();
  }
  while (scanFrame < tf || (scanFrame === tf && scanLine <= tl)) {
    if (scanLine < 350) {
      copyRow(disp, scanBase, scanLine);
      if (scanLine === 349) { dispDone.set(disp); if (onFrameDone) onFrameDone(); }
    } else if (scanLine === LATCH_LINE) latchBase = PAGE_BASE[bgi.visual];
    if (++scanLine >= LINES) { scanLine = 0; scanFrame++; scanBase = latchBase; }
  }
}
