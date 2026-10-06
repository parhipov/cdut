'use strict';
// =============================================================================
//  OBJECTS.PAS — инициализация, загрузка спрайтов, окна и кнопки.
//  Текстуры и уголки окон взяты из RESOURSE.TPU.
// =============================================================================

function initall() {
  vesainit();
  vxmouseinit();
  borlandfontinit();
}

// LoadSpr: спрайт из отдельного файла
function loadspr(name) { return loadsprite(asset(name), 0); }

// LoadSpr1: очередной спрайт из .DAT (f — {data, pos})
function openfile(name) { return { data: asset(name), pos: 0 }; }
function loadspr1(f) {
  var d = f.data, p = f.pos;
  var len = (d[p + 4] | (d[p + 5] << 8)) + 6;
  if (p + len > d.length) throw new Error('Incorrect file format.');
  f.pos = p + len;
  return loadsprite(d, p);
}

var RES = null;
function res() {
  if (!RES) RES = {
    vint: resSprite('vint'), sqr_1: resSprite('sqr_1'),
    text1: resSprite('text1'), text_2: resSprite('text_2'), text_4: resSprite('text_4'),
    hor: resSprite('hor'), vert: resSprite('vert'), sqr_: resSprite('sqr_')
  };
  return RES;
}

function drawwindow(x1, y1, x2, y2) {
  var r = res();
  setcolor(27);
  settexture(r.text_2);
  setwritemode(textureput);
  for (var i = 1; i <= 9; i++) rectangle(x1 + i, y1 + i, x2 - i, y2 - i, 0, 0);
  setwritemode(normalput);
  rectangle(x1, y1, x2, y2, 20, 37);
  putimage(x1 + 2, y1 + 2, r.vint, x0put);
  putimage(x1 + 2, y2 - 10, r.vint, x0put);
  putimage(x2 - 10, y1 + 2, r.vint, x0put);
  putimage(x2 - 10, y2 - 10, r.vint, x0put);
  rectangle(x1 + 10, y1 + 10, x2 - 10, y2 - 10, 37, 23);
  rectangle(x1 + 11, y1 + 11, x2 - 11, y2 - 11, 23, 37);
  rectangle(x1 + 12, y1 + 12, x2 - 12, y2 - 12, 20, 37);
  settexture(r.text1);
  setwritemode(textureput);
  bar(x1 + 13, y1 + 13, x2 - 13, y2 - 13);
  setwritemode(normalput);
}

function showwindow(x1, y1, x2, y2) {
  var r = res();
  setwritemode(normalput);
  rectangle(x1 + 1, y1 + 1, x2 - 1, y2 - 1, 21, 37);
  setwritemode(textureput);
  settexture(r.text_4);
  for (var i = 2; i <= 7; i++) rectangle(x1 + i, y1 + i, x2 - i, y2 - i, 23, 37);

  setwritemode(shadowput);
  bar(x1 + 9, y1 + 9, x2 - 9, y2 - 9);
  setwritemode(normalput);
  rectangle(x1 + 8, y1 + 8, x2 - 8, y2 - 8, 37, 21);

  setwritemode(textureput);
  bar(x1, y1, x1 + 9, y1 + 9);
  bar(x1, y2 - 9, x1 + 9, y2);
  bar(x2 - 9, y1, x2, y1 + 9);
  bar(x2 - 9, y2 - 9, x2, y2);
  setwritemode(normalput);
  rectangle(x1, y1, x1 + 9, y1 + 9, 21, 37);
  rectangle(x1, y2 - 9, x1 + 9, y2, 21, 37);
  rectangle(x2 - 9, y1, x2, y1 + 9, 21, 37);
  rectangle(x2 - 9, y2 - 9, x2, y2, 21, 37);
  setwritemode(normalput);
  putimage(x1 + 1, y1 + 1, r.sqr_1, x0put);
  putimage(x1 + 1, y2 - 8, r.sqr_1, x0put);
  putimage(x2 - 8, y1 + 1, r.sqr_1, x0put);
  putimage(x2 - 8, y2 - 8, r.sqr_1, x0put);
}

function drawbutton(x1, y1, x2, y2, s, press, focus) {
  var ys = idiv(y1 + y2, 2), ampl = idiv(y2 - y1, 2), r = idiv(y2 - y1 + 1, 2);
  var border = focus ? 4 : 42;
  var startcolor = press ? 21 : 20;
  var step = idiv(y2 - y1 + 1, 15);
  setwritemode(x0put);
  for (var i = y1; i <= y2; i++) {
    var y = i < ys ? r - (i - y1) : i - idiv(y1 + y2, 2);
    var value = round(Math.sqrt(sqr(r) - sqr(y)));
    setcolor(border);
    var x1_ = x1 + ampl - value, x2_ = x2 - ampl + value;
    if (i === y1 || i === y2) continue;
    line(x1_, i, x1_ + 1, i);
    line(x2_ - 1, i, x2_, i);
    if ((i - 2) < y1 || (i + 2) > y2) setcolor(border);
    else setcolor(startcolor + idiv(i - y1, step));
    line(x1_ + 2, i, x2_ - 2, i);
  }
  if (!press) setcolor(15); else setcolor(10);
  setwritemode(shadowput);
  var len = s.length;
  var x3 = idiv(x1 + x2 - len * 8, 2), y3 = idiv(y1 + y2 - 16, 2);
  outtextxy(x3, y3 + 1, s);
  outtextxy(x3 + 1, y3, s);
  outtextxy(x3 + 1, y3 + 1, s);
  setwritemode(normalput);
  outtextxy(x3 + (press ? 1 : 0), y3 + (press ? 1 : 0), s);
}
