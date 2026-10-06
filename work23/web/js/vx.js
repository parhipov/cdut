'use strict';
// =============================================================================
//  VX — перенос графической библиотеки VSM_2.50NB85 (VX.ASM / VX.PAS).
//  VESA 640x480x256, две видеостраницы, режимы вывода, программный курсор.
//  Алгоритмы (отсечение линий, спрайты, тени, текстуры, курсор с буфером
//  фона) повторяют ассемблерный код, включая его особенности.
// =============================================================================

var SCREENX = 640, SCREENY = 480;
var PAGE1_BASE = 5 * 65536;            // SecondPageBank = 5 -> вторая страница с 512-й строки
var vram = new Uint8Array(0x100000);   // видеопамять карты
var dac = new Uint8Array(768);         // текущие регистры DAC (6 бит)

var normalput = 0, xorput = 1, orput = 2, andput = 3, x0put = 4, shadowput = 5,
    glassput = 6, textureput = 7, maskput = 8;
var black = 42, blue = 1, green = 2, cyan = 3, red = 4, magenta = 5, brown = 6,
    lightgray = 7, darkgray = 8, lightblue = 9, lightgreen = 10, lightcyan = 11,
    lightred = 12, lightmagenta = 13, yellow = 14, white = 15;

var vxs = {
  bankadder: 0,        // база активной (рисуемой) страницы
  mousebankadder: 0,   // база «видимой» страницы по мнению библиотеки (на ней рисуется курсор)
  crtbase: 0,          // что на самом деле показывает видеокарта (начало экрана VESA)
  vpage: 0, apage: 0,
  vminx: 0, vminy: 0, vmaxx: 639, vmaxy: 479,
  color: 15, writemode: 0,
  texture: null,
  textsize: 1, textmulx: 1, textdivx: 1, textmuly: 1, textdivy: 1
};

var standardpalette, standardfont, shadowcolors = new Uint8Array(256);

// ------------------------------- спрайты ------------------------------------
// Формат файла: [W][H][W*H+4] + [W][H] + W*H пикселей (0 — прозрачный).
function Sprite(w, h, data) { this.w = w; this.h = h; this.data = data; }
function spriteAt(bytes, p) {
  var w = bytes[p] | (bytes[p + 1] << 8), h = bytes[p + 2] | (bytes[p + 3] << 8);
  return new Sprite(w, h, bytes.subarray(p + 4, p + 4 + w * h));
}
// TestRegister: если блок начинается с 6-байтного префикса, пропускаем его
function testRegister(b, p) {
  var w0 = b[p] | (b[p + 1] << 8), w2 = b[p + 2] | (b[p + 3] << 8), w4 = b[p + 4] | (b[p + 5] << 8);
  var w6 = b[p + 6] | (b[p + 7] << 8), w8 = b[p + 8] | (b[p + 9] << 8);
  if (w0 !== w6 || w2 !== w8) return p;
  var prod = w0 * w2 + 4;
  if (prod > 0xFFFF) return p;
  if (prod !== w4) return p;
  return p + 6;
}
// LoadSprite: спрайт из блока памяти (с префиксом)
function loadsprite(bytes, p) { return spriteAt(bytes, testRegister(bytes, p || 0)); }
function resSprite(name) { return spriteAt(asset('RES:' + name), 6); }  // p:=@vint; inc(p,6)

// ------------------------------- инициализация ------------------------------
function vesainit() {
  standardpalette = asset('ASM:STANDARDPALETTE');
  standardfont = asset('ASM:STANDARDFONT');
  dac.set(standardpalette);
  vxs.color = 15; vxs.writemode = 0;
  vxs.vminx = 0; vxs.vminy = 0; vxs.vmaxx = SCREENX - 1; vxs.vmaxy = SCREENY - 1;
  findShadow();
  vxs.bankadder = 0;
}
// FindShadow: для каждого цвета — ближайший из первых 224 к цвету с половинной яркостью
function findShadow() {
  var p = standardpalette;
  for (var c = 0; c < 256; c++) {
    var r = p[c * 3] >> 1, g = p[c * 3 + 1] >> 1, b = p[c * 3 + 2] >> 1;
    var best = 0xFFFF, bi = 0;
    for (var i = 0; i < 224; i++) {
      var d = sqr(p[i * 3] - r) + sqr(p[i * 3 + 1] - g) + sqr(p[i * 3 + 2] - b);
      if (d < best) { best = d; bi = i; }
    }
    shadowcolors[c] = bi;
  }
}

function setcolor(c) { vxs.color = c & 255; }
function setwritemode(m) { vxs.writemode = m & 255; }
function setwsize(x1, y1, x2, y2) { vxs.vminx = x1; vxs.vminy = y1; vxs.vmaxx = x2; vxs.vmaxy = y2; }
function getmaxx() { return SCREENX - 1; }
function getmaxy() { return SCREENY - 1; }
function settexture(spr) { vxs.texture = spr; }

// ------------------------------- пиксели ------------------------------------
function texdot(rel) {
  var t = vxs.texture;
  var y = Math.floor(rel / SCREENX), x = rel - y * SCREENX;
  return t.data[(y % t.h) * t.w + (x % t.w)];
}
// LinePixel: вывод точки с учётом режима
function linepixel(a, c) {
  if (a < 0 || a >= 0x100000) return;
  switch (vxs.writemode) {
    case 0: vram[a] = c; break;
    case 1: vram[a] ^= c; break;
    case 2: vram[a] |= c; break;
    case 3: vram[a] &= c; break;
    case 4: if (c) vram[a] = c; break;
    case 5: if (c) vram[a] = shadowcolors[vram[a]]; break;
    case 6: break;                         // GlassPut — таблица в оригинале не заполнялась
    case 7: vram[a] = texdot(a - vxs.bankadder); break;
    case 8: vram[a] = c; break;
  }
}
function putpixel(x, y, c) {
  var rel = (y & 0xFFFF) * SCREENX + (x & 0xFFFF);
  linepixel(vxs.bankadder + rel, c & 255);
}
function getpixel(x, y) { return vram[vxs.bankadder + y * SCREENX + x]; }

// ConvAL — «тень» спрайта: сдвиг на 3 ступени к тёмному краю цветовой рампы
// Таблица взята из прилинкованного VX.OBJ, а не из VX.ASM: в исходнике
// `End_ db 42,68,90,113,,136,...` пустой элемент между запятыми ассемблер
// превратил в 0, а цикл (cx=9) проверяет только 9 первых значений. Поэтому
// цвета 204..219 под тенью в оригинале не темнеют.
var END_ = [42, 68, 90, 113, 0, 136, 157, 180, 203, 219];
function convAL(al) {
  if (al <= 15) return al;
  for (var i = 0; i < 9; i++) {
    if (al > END_[i]) continue;
    al += 3;
    if (al > END_[i]) al = END_[i];
    return al;
  }
  return al;
}

// ------------------------------- линии --------------------------------------
function between(x, x2, x1) {
  if (x1 === x2) return false;
  return Math.abs(x1 - x) + Math.abs(x2 - x) === Math.abs(x1 - x2);
}
function line(x1, y1, x2, y2) {
  var ax = x1, bx = y1, cx = x2, dx = y2, si, di;
  si = vxs.vminx;
  if (between(si, cx, ax)) {
    di = idiv((si - ax) * (dx - bx), cx - ax) + bx;
    if (ax < vxs.vminx) { ax = si; bx = di; }
    else if (cx < vxs.vminx) { cx = si; dx = di; }
  }
  si = vxs.vmaxx;
  if (between(si, cx, ax)) {
    di = idiv((si - ax) * (dx - bx), cx - ax) + bx;
    if (ax > vxs.vmaxx) { ax = si; bx = di; }
    else if (cx > vxs.vmaxx) { cx = si; dx = di; }
  }
  di = vxs.vminy;
  if (between(di, dx, bx)) {
    si = idiv((di - bx) * (cx - ax), dx - bx) + ax;
    if (bx < vxs.vminy) { ax = si; bx = di; }
    else if (dx < vxs.vminy) { cx = si; dx = di; }
  }
  di = vxs.vmaxy;
  if (between(di, dx, bx)) {
    si = idiv((di - bx) * (cx - ax), dx - bx) + ax;
    if (bx > vxs.vmaxy) { ax = si; bx = di; }
    else if (dx > vxs.vmaxy) { cx = si; dx = di; }
  }
  if (ax < vxs.vminx || ax > vxs.vmaxx || cx < vxs.vminx || cx > vxs.vmaxx ||
      bx < vxs.vminy || bx > vxs.vmaxy || dx < vxs.vminy || dx > vxs.vmaxy) return;
  x1 = ax; y1 = bx; x2 = cx; y2 = dx;
  if (y1 > y2) { var t = y1; y1 = y2; y2 = t; t = x1; x1 = x2; x2 = t; }
  var a = vxs.bankadder + y1 * SCREENX + x1;
  var neg = false, ldx = x2 - x1, ldy = y1 - y2, err, c = vxs.color;
  if (ldx < 0) { ldx = -ldx; neg = true; }
  if (ldy < 0) ldy = -ldy;
  if (ldx < ldy) { err = -(ldy >> 1) - ldx; linepixel(a, c); }
  else err = -(ldx >> 1) - ldy;
  var curx = x1, cury = y1, guard = 0;
  for (;;) {
    if (curx === x2 && cury === y2) { linepixel(a, c); return; }
    err += ldy;
    for (;;) {
      if (err <= 0) break;
      if (curx === x2 && cury === y2) break;
      cury++; a += SCREENX;
      err -= ldx;
      if (err <= 0) continue;
      linepixel(a, c);
    }
    if (curx === x2 && cury === y2) { linepixel(a, c); return; }
    linepixel(a, c);
    if (neg) { curx--; a--; } else { curx++; a++; }
    if (++guard > 4000) return;
  }
}
function rectangle(x1, y1, x2, y2, c1, c2) {
  setcolor(c1);
  line(x1, y1, x1, y2);
  line(x1, y1, x2, y1);
  setcolor(c2);
  line(x2, y1 + 1, x2, y2);
  line(x1 + 1, y2, x2, y2);
}
function bar(x1, y1, x2, y2) {
  var ax = x1, bx = x2, t;
  if ((bx & 0xFFFF) < (ax & 0xFFFF)) { t = ax; ax = bx; bx = t; }
  if (ax < vxs.vminx) ax = vxs.vminx;
  if (ax > vxs.vmaxx) ax = vxs.vmaxx;
  if (bx < vxs.vminx) bx = vxs.vminx;
  if (bx > vxs.vmaxx) bx = vxs.vmaxx;
  var w = bx - ax + 1;
  var ay = y1, si = y2;
  if ((si & 0xFFFF) < (ay & 0xFFFF)) { t = ay; ay = si; si = t; }
  if (ay < vxs.vminy) ay = vxs.vminy;
  if (ay > vxs.vmaxy) ay = vxs.vmaxy;
  if (si < vxs.vminy) si = vxs.vminy;
  if (si > vxs.vmaxy) si = vxs.vmaxy;
  var h = si - ay + 1;
  var a = vxs.bankadder + ay * SCREENX + ax, c = vxs.color;
  for (var j = 0; j < h; j++) {
    for (var i = 0; i < w; i++) { linepixel(a, c); a++; }
    a += SCREENX - w;
  }
}

// ------------------------------- текст 8x16 ---------------------------------
function outtextxy(x, y, s) {
  if (s === '' || s === undefined) return;
  s = String(s);
  var a = vxs.bankadder + (y & 0xFFFF) * SCREENX + (x & 0xFFFF), c = vxs.color, n = s.length;
  for (var row = 0; row < 16; row++) {
    for (var k = 0; k < n; k++) {
      var bits = standardfont[(s.charCodeAt(k) & 255) * 16 + row];
      for (var b = 0; b < 8; b++) {
        if (bits & 0x80) linepixel(a, c);
        bits = (bits << 1) & 255;
        a++;
      }
    }
    a += SCREENX - n * 8;
  }
}

// ------------------------------- векторные шрифты Borland -------------------
function borlandfontinit() { vxs.textsize = 1; vxs.textmulx = vxs.textdivx = vxs.textmuly = vxs.textdivy = 1; }
function borlandsettextsize(n) { vxs.textsize = n; }
function dec7(v) {
  v &= 0x7F;
  if (v & 0x40) { var t = ((256 - v) & 0xFF) & 0x3F; v = -t; }
  return v;
}
function borlandouttextxy(x, y, msg, font) {
  if (msg === '') return;
  var f = font, p = 0;
  while (f[p] !== 0x1A) p++;
  while (f[p] !== 0x2B) p++;
  var first = f[p + 4], nch = f[p + 1];
  var offs = p + 16, strokes = offs + 3 * nch;
  var basex = x, basey = y, size = vxs.textsize;
  function sx(v) { return idiv((v * size) * vxs.textmulx, vxs.textdivx) + basex; }
  function sy(v) { return basey - idiv((v * size) * vxs.textmuly, vxs.textdivy); }
  for (var k = 0; k < msg.length; k++) {
    var code = msg.charCodeAt(k) - first;
    if (code < 0) continue;
    var bx = f[offs + code * 2] | (f[offs + code * 2 + 1] << 8);
    var q = strokes + bx;
    if (f[q] === 0) continue;
    var curx = sx(dec7(f[q])), cury = sy(dec7(f[q + 1]));
    q += 2;
    for (var g = 0; g < 500; g++) {
      var a = f[q], b = f[q + 1];
      if (a === 0) break;
      var nx = sx(dec7(a)), ny = sy(dec7(b));
      if (b & 0x80) line(curx, cury, nx, ny);
      curx = nx; cury = ny;
      q += 2;
    }
    basex = curx;
  }
}

// ------------------------------- спрайты на экран ---------------------------
function putspriteImpl(x, y, spr, shadow) {
  if (!spr) return;
  var W = spr.w, H = spr.h, d = spr.data, si = 0, ax, bx, cx;
  cx = x; bx = W;
  ax = vxs.vminx - x;
  if (ax > 0) { si += ax; bx -= ax; cx = vxs.vminx; }
  ax = x + W - vxs.vmaxx;
  if (ax > 0) bx -= ax;
  var X = cx, cnt = bx;
  var cy = y; bx = H;
  ax = vxs.vminy - y;
  if (ax > 0) { bx -= ax; si += ax * W; cy = vxs.vminy; }
  ax = y + H - vxs.vmaxy;
  if (ax > 0) bx -= ax;
  if (cnt <= 0 || bx <= 0) return;
  var a = vxs.bankadder + cy * SCREENX + X, add = W - cnt, i, p, vr = vram, stride = SCREENX - cnt;
  var aLast = a + (bx - 1) * SCREENX + cnt - 1;
  if (a < 0 || aLast >= 0x100000) {               // медленный путь с проверкой адреса
    for (; bx > 0; bx--) {
      for (i = 0; i < cnt; i++) {
        p = d[si++];
        if (p && a >= 0 && a < 0x100000) vr[a] = shadow ? CONV[vr[a]] : p;
        a++;
      }
      si += add; a += stride;
    }
    return;
  }
  if (shadow) {
    // BUG (оригинал, VX.ASM PutSpriteS): если строка пересекает границу
    // 64-килобайтного банка видеопамяти, в ветке с переключением банка нет
    // `add si,ax` — у обрезанной по ширине тени все следующие строки
    // читаются со сдвигом.
    var base = vxs.bankadder;
    for (; bx > 0; bx--) {
      var straddle = (((a - base) & 0xFFFF) + cnt) >= 65536;
      for (i = 0; i < cnt; i++, a++) if (d[si++]) vr[a] = CONV[vr[a]];
      if (!straddle) si += add;
      a += stride;
    }
  } else {
    for (; bx > 0; bx--) {
      for (i = 0; i < cnt; i++, a++) { p = d[si++]; if (p) vr[a] = p; }
      si += add; a += stride;
    }
  }
}
var CONV = new Uint8Array(256);
for (var _c = 0; _c < 256; _c++) CONV[_c] = convAL(_c);
function putsprite(x, y, spr) { putspriteImpl(x, y, spr, false); }
function putsprites(x, y, spr) { putspriteImpl(x, y, spr, true); }

function putimage(x, y, spr, op) {
  var W = spr.w, H = spr.h, d = spr.data, si = 0;
  if (x <= 0 && -x >= W) return;
  if (y <= 0) {
    if (-y >= H) return;
    si += (-y) * W; H += y; y = 0;
  }
  for (var j = 0; j < H; j++) {
    var Y = y + j;
    for (var i = 0; i < W; i++, si++) {
      var X = x + i;
      if (X < 0 || Y < 0 || X >= SCREENX || Y >= SCREENY) continue;
      var a = vxs.bankadder + Y * SCREENX + X, al = d[si];
      switch (op) {
        case 0: vram[a] = al; break;
        case 1: vram[a] ^= al; break;
        case 2: vram[a] |= al; break;
        case 3: vram[a] &= al; break;
        case 4: if (al) vram[a] = al; break;
        default: if (al) vram[a] = convAL(vram[a]);
      }
    }
  }
}

// ------------------------------- страницы -----------------------------------
// SetVisualPage_: HideMouse; страница; ShowMouse; int 10h AX=4F07h с BL=0.
// BUG (оригинал): если ShowMouse действительно показывает курсор, его вызов
// int 33h/AX=3 оставляет в BX кнопки мыши — при зажатой кнопке функция VESA
// получает BL<>0 и экран НЕ переключается, хотя программа считает иначе.
function setvisualpage(p) {
  p &= 1;
  hidemouse();
  vxs.vpage = p;
  vxs.mousebankadder = p ? PAGE1_BASE : 0;
  var before = vmouse.visible, bl = 0;
  showmouse();
  if (before === 0 && vmouse.visible === 1) bl = drvMouse.buttons & 0xFF;
  if (bl === 0) vxs.crtbase = vxs.mousebankadder;
}
function setactivepage(p) {
  p &= 1;
  vxs.apage = p;
  vxs.bankadder = p ? PAGE1_BASE : 0;
}

// ------------------------------- палитра ------------------------------------
function setallpalette255(p) { dac.set(p.subarray(0, 255 * 3)); }   // int10h/1012h, CX=0FFh

// ------------------------------- курсор мыши --------------------------------
// Курсор рисуется прямо в видеопамять видимой страницы, под ним сохраняется
// фон 32x32 (как DrawMouseCursor/DrawMouseSwap). Видимость — счётчик
// (_MouseVisible, байт со знаком).
var vmouse = {
  visible: 0, x: 320, y: 240, hotx: 0, hoty: 0,
  cur: null, curofs: 0,        // текущий кадр курсора
  area: null, areaofs: 0,      // курсор «особой области» (весь экран)
  swap: new Uint8Array(1024)
};
function mouseCursorBlocks() {
  return { std: asset('ASM:STANDARDCURSOR') };
}
function drawMouseImpl(save) {
  var bx = vmouse.x - vmouse.hotx, by = vmouse.y - vmouse.hoty, base = vxs.mousebankadder;
  var i0 = bx < 0 ? -bx : 0, i1 = bx + 32 > SCREENX ? SCREENX - bx : 32;
  var j0 = by < 0 ? -by : 0, j1 = by + 32 > SCREENY ? SCREENY - by : 32;
  var swap = vmouse.swap, cur = vmouse.cur, co = vmouse.curofs, vr = vram;
  for (var j = j0; j < j1; j++) {
    var a = base + (by + j) * SCREENX + bx, k = j * 32;
    if (save) {
      for (var i = i0; i < i1; i++) {
        swap[k + i] = vr[a + i];
        var c = cur[co + k + i];
        if (c) vr[a + i] = c;
      }
    } else {
      for (var i2 = i0; i2 < i1; i2++) vr[a + i2] = swap[k + i2];
    }
  }
}
function drawMouseCursor() { drawMouseImpl(true); }
function drawMouseSwap() { drawMouseImpl(false); }
function changeCursorRaw(block, ofs) {
  vmouse.hotx = block[ofs + 2];
  vmouse.hoty = block[ofs + 3];
  vmouse.cur = block;
  vmouse.curofs = ofs + 4;
}
function changeCursor(block, ofs) {
  if (vmouse.visible > 0) drawMouseSwap();
  changeCursorRaw(block, ofs);
  if (vmouse.visible > 0) drawMouseCursor();
}
function selectArea() { changeCursor(vmouse.area, vmouse.areaofs); }
function selectArea2() {
  if (vmouse.cur !== vmouse.area || vmouse.curofs !== vmouse.areaofs + 4) changeCursorRaw(vmouse.area, vmouse.areaofs);
}
function sbyte(v) { return (v << 24) >> 24; }
function showmouse() {
  vmouse.visible = sbyte(vmouse.visible + 1);
  if (vmouse.visible !== 1) return;
  vmouse.x = drvMouse.x; vmouse.y = drvMouse.y;
  selectArea2();
  drawMouseCursor();
}
function hidemouse() {
  vmouse.visible = sbyte(vmouse.visible - 1);
  if (vmouse.visible !== 0) return;
  drawMouseSwap();
}
// обработчик прерывания мыши (int 33h, функция 0Ch) — вызывается при движении
function mouseIrq() {
  var cx = drvMouse.x, dx = drvMouse.y;
  if (!(vmouse.visible > 0)) { vmouse.x = cx; vmouse.y = dx; return; }
  if (cx === vmouse.x && dx === vmouse.y) return;
  drawMouseSwap();
  vmouse.x = cx; vmouse.y = dx;
  selectArea2();
  drawMouseCursor();
}
function vxmouseinit() {
  var std = asset('ASM:STANDARDCURSOR');
  vmouse.area = std; vmouse.areaofs = 0;
  // INT 33h AX=4 (320,240) вызывается до установки диапазонов AX=7/8, и драйвер
  // ограничивает y своим исходным диапазоном 0..199: курсор встаёт в (320,199)
  vmouse.x = SCREENX >> 1; vmouse.y = Math.min(SCREENY >> 1, 199);
  drvMouse.x = vmouse.x; drvMouse.y = vmouse.y;
  changeCursor(std, 0);
}
function resetmousecursor() {
  var std = asset('ASM:STANDARDCURSOR');
  changeCursor(std, 0);
  vmouse.area = std; vmouse.areaofs = 0;
  selectArea();
}
function setusercursor(block) {
  var di = testRegister(block, 0);
  if (di !== 0) { block[di] = 0; block[di + 1] = 0; block[di + 2] = 0; block[di + 3] = 0; }
  changeCursor(block, di);
  vmouse.area = block; vmouse.areaofs = di;
  selectArea();
}

// ------------------------------- вывод на canvas ----------------------------
var lut = new Uint32Array(256);
function buildLut(pal) {
  for (var i = 0; i < 256; i++) {
    var r = pal[i * 3] & 63, g = pal[i * 3 + 1] & 63, b = pal[i * 3 + 2] & 63;
    r = (r << 2) | (r >> 4); g = (g << 2) | (g >> 4); b = (b << 2) | (b >> 4);
    lut[i] = 0xFF000000 | (b << 16) | (g << 8) | r;
  }
}
function presentBuffer(img32, src, srcOfs, pal) {
  buildLut(pal);
  for (var i = 0, n = SCREENX * SCREENY; i < n; i++) img32[i] = lut[src[srcOfs + i]];
}
