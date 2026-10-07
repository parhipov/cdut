'use strict';
// =============================================================================
//  SUBM8.PAS — построчный перенос («Субмарина», ЦДЮТ, Рыбинск).
//  Имена переменных и процедур сохранены. Особенности Turbo Pascal 7:
//   * границы for вычисляются один раз, после цикла переменная равна
//     конечному значению (если цикл выполнялся) — это важно: provvzrac
//     смотрит на massv[i] после цикла;
//   * {$R+}: индексы массивов и присваивания байтовым переменным
//     проверяются (rc/b) — выход за границы даёт Runtime error 201;
//   * параметры-массивы, переданные по значению (vivod, perehod), — копии.
//  Музыка в исходнике закомментирована (обработчики INT 1Ch не ставятся),
//  поэтому релизная игра беззвучна, а «N-ВЫКЛ.МУЗЫКУ» ничего не делает.
//  Здесь эти строки можно «раскомментировать» (MUSIC = true, переключатель
//  «Музыка» внизу страницы) — «нерелизная» версия, будто музыка была.
// =============================================================================

var max = 33, nn = 15, mm = 10, bb = 75, sssr = 80;
var maxx = 26, maxxx = 129;
var MUSIC = false;                          // true — включены закомментированные строки музыки
// мелодии: частоты нот (используются обработчиками Music1/Music)
var cnll = [0, 220, 233, 262, 262, 262, 262, 262, 220, 196, 220, 175, 175, 175, 175, 175, 175, 196, 220, 196,
  175, 147, 147, 147, 175, 196, 220, 196, 196, 196, 196, 196, 196, 220, 233, 262, 262, 262,
  262, 262, 220, 196, 220, 175, 175, 175, 175, 175, 175, 196, 220, 196, 175, 147, 147, 147,
  175, 196, 220, 196, 196, 196, 196, 196, 196, 196, 196, 262, 294, 262, 294, 262, 294, 262,
  294, 196, 196, 196, 220, 196, 196, 196, 196, 220, 196, 196, 220, 196, 196, 196, 196, 175,
  175, 175, 196, 175, 175, 175, 175, 262, 294, 262, 294, 262, 294, 262, 294, 196, 196, 196,
  220, 196, 196, 196, 196, 220, 196, 196, 220, 196, 196, 196, 196, 175, 175, 175, 196, 175,
  175, 65];
var cnl = [0, 220, 165, 131, 220, 165, 131, 220, 165, 131, 262, 247, 207, 247, 220, 165, 247, 207, 165, 220,
  165, 131, 110, 110, 110, 110, 110];
var SizeEnemyTab = [[22, 20, 35], [28, 12, 15]];
function sizeenemy(k, t) { rc(k, 1, 2); rc(t, 34, 36); return SizeEnemyTab[k - 1][t - 34]; }

// ---- типы ----
function TMass() {
  this.dx = 0; this.dy = 0;
  this.x = [0, 0]; this.y = [0, 0]; this.ox = [0, 0]; this.oy = [0, 0];
  this.tip = 0; this.pox = 0; this.poy = 0; this.num = 0;
  this.opic = [null, null];
}
function copyMass(d, s) {                   // massv[i] := massv[k]: указатели копируются как есть
  d.dx = s.dx; d.dy = s.dy;
  d.x = s.x.slice(); d.y = s.y.slice(); d.ox = s.ox.slice(); d.oy = s.oy.slice();
  d.tip = s.tip; d.pox = s.pox; d.poy = s.poy; d.num = s.num;
  d.opic = s.opic.slice();
}
function newEkr() { var e = []; for (var i = 0; i < 40; i++) e.push(new Array(35).fill(0)); return e; }
function copyEkr(s) { return s.map(function (r) { return r.slice(); }); }
// ekr[i,j]: TP7 проверяет сначала второй индекс (столбец), потом первый
function EK(e, i, j, aj, ai) { rc(j, 0, 34, aj); return e[rc(i, 0, 39, ai)][j]; }
function EKset(e, i, j, v) { rc(j, 0, 34); e[rc(i, 0, 39)][j] = v; }
function MV(n) { return massv[rc(n, 1, 3)]; }
function b(v, addr) { return rc(v, 0, 255, addr); }   // присваивание байтовой переменной ($R+)
function I16(v) { if (v < -32768 || v > 32767) rte(215); return v; }   // $Q+

// ---- переменные ----
var old1c = null;
var mus = 0, pause = 0;
var zas = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
var kamx = 0, gha = false, keyekr = false;
var colkam = 0;
var kamy = [[0, 0, 0, 0], [0, 0, 0, 0]];
var kamni = false;
var o = null, u1 = null, z = null, w = null;
var ss = [];
var massv = [null, new TMass(), new TMass(), new TMass()];
var pic = {};                               // pic[i][j], i 1..8, j 34..36
var ekr = newEkr();
var fl = [false, false];
var page = 0, u = 0, stage = 0, coltor = 0, colos = 0, colfi = 0, colak = 0, col = 0, e1 = 0, e2 = 0, ko2 = 0;
var x = [0, 0], y = [0, 0], racox = [0, 0], racoy = [0, 0];
var torp = [{}, {}];                        // torp[0..1][-1..1]
var c = 0;
var opis = [null, null];
var bom = [null, null];
var sp = 0, s = 0, gd = 0, gm = 0, a = 0, saq = 0, b_ = 0, next = 0, x2 = 0, y2 = 0, tt = 0, score = 0, boj = 0, boi = 0, kolasdf = 0;
var nd = 0, x1 = 0, y1 = 0, dx = 0, dy = 0, yy = 0, yr = 0, ddy = 0, kolo2 = 0, kk = 0, dy1 = 0, akx = 0, i = 0, qq = 0, j = 0,
    i1 = 0, j1 = 0, k = 0, dxx = 0, ds = 0, dyy = 0, kolline = 0;
var size = 0;
var sub = {};                               // sub[-2..7]
var kam = null, bomb = null;
var racx = 0, racy = 0, drac = 0;
var kar = {};                               // kar[-5..max]
var key = false, o2 = false, ww = false, box = false, bomb1 = false, rac = false, rac1 = false;
var vzr = {}, mskvzr = {};                  // [1..10]
var zader = 0, keyx = 0, keyy = 0, keyi = 0, keyj = 0, o2x = 0, o2y = 0, o2i = 0, o2j = 0, bx = 0, by = 0, bi = 0, bj = 0;
var f = null, fil = null;
var viv = [];
// В Паскале глобальная b — координата лодки; здесь b_ (b занята проверкой байта).

function KAR(n) { return kar[rc(n, -5, max)]; }

// --------------------------------------------------------------------------
async function vzr1(a, bb_, vzr, mskvzr, flag, d) {
  var j;
  for (j = 1; j <= 8; j++) {
    setvisualpage(page);
    setactivepage(page);
    putimage(a + 22, bb_ + 2, mskvzr[j], andput);
    putimage(a + 22, bb_ + 2, vzr[j], xorput);
    await delay(100);
  }
  if (flag) gha = true; else {
    switch (MV(i).tip) {
      case 34: colos = b(colos + 1); score = I16(score + 10); break;
      case 35: colfi = b(colfi + 1); score = I16(score + 15); break;
      case 36: colak = b(colak + 1); score = I16(score + 20); break;
    }
    for (j = 0; j <= 1; j++) {
      setactivepage(j);
      setfillstyle(1, 8);
      bar(496 + nn, 200 + mm, 640, 285 + mm);
      viv = str(colfi);
      outtextxy(496 + nn, 200 + mm, cat(S('  РЫБ-'), viv));
      viv = str(colak);
      outtextxy(496 + nn, 225 + mm, cat(S('  АКУЛ-'), viv));
      viv = str(colos);
      outtextxy(496 + nn, 250 + mm, cat(S('  ОСМИНОГОВ-'), viv));
      viv = str(score);
      outtextxy(496 + nn, 275 + mm, cat(S('ОЧКИ-'), viv));
      putimage(MV(i).x[page], MV(i).y[page], MV(i).opic[page], normalput);
    }
    copyMass(MV(i), MV(col - 1));
    col = b(col - 1);
  }
  // BUG (оригинал): d=1 передают, когда торпеда врезалась в стену. Если лодка
  // уже погибла в этом же кадре (бомба, враг, стена, камень, «q»), смерть
  // отменяется: игра идёт дальше, а самоподрыв по «q» пропадает совсем.
  if (d === 1) gha = false;
}

// vivod(kar, ekr: по значению; var massv, col; e1, e2)
// BUG (оригинал): ekr передаётся по значению, и клетки врагов обнуляются
// только в копии — убитые враги снова появляются, если выйти из комнаты
// и вернуться (ключ, баллоны и ящики main-программа стирает в самом ekr).
function vivod(ekrIn) {
  var ekr = copyEkr(ekrIn), i, j, t;
  col = 1; kamni = false; bomb1 = false; o2 = false; box = false; keyekr = false;
  for (i = e2; i <= e2 + 9; i++)
    for (j = e1; j <= e1 + 6; j++) {
      switch (EK(ekr, i, j, '0000:0516', '0000:0527')) {
        case 35:
          t = MV(col); t.tip = 35; t.oy[1] = (i - e2) * 32; t.oy[0] = (i - e2) * 32; t.ox[1] = (j - e1) * 72;
          t.ox[0] = (j - e1) * 72; t.num = 1; col = b(col + 1);
          EKset(ekr, i, j, 0);
          break;
        case 34:
          t = MV(col); t.tip = 34; t.oy[1] = (i - e2) * 32; t.ox[1] = (j - e1) * 72;
          t.oy[0] = (i - e2) * 32; t.ox[0] = (j - e1) * 72; t.num = 1; col = b(col + 1);
          EKset(ekr, i, j, 0);
          break;
        case 36:
          t = MV(col); t.tip = 36; t.oy[1] = (i - e2) * 32; t.oy[0] = (i - e2) * 32; t.ox[1] = (j - e1) * 72;
          t.ox[0] = (j - e1) * 72; t.num = 1; col = b(col + 1);
          EKset(ekr, i, j, 0);
          break;
        case 4:
          putimage((j - e1) * 72, (i - e2) * 32, KAR(0), normalput);
          boj = (j - e1) * 72; boi = (i - e2) * 32; bomb1 = true;
          break;
        case 7:
          putimage((j - e1) * 72, (i - e2) * 32, KAR(-1), normalput);
          putimage((j - e1) * 72, (i - e2) * 32 + 8, KAR(7), normalput);
          keyx = j * 72; keyy = i * 32 + 8; keyi = i; keyj = j; key = true; keyekr = true;
          break;
        case 2:
          putimage((j - e1) * 72, (i - e2) * 32, KAR(-1), normalput);
          putimage((j - e1) * 72, (i - e2) * 32, KAR(2), normalput);
          o2x = j * 72; o2y = i * 32; o2i = i; o2j = j; o2 = true;
          break;
        case 33:
          putimage((j - e1) * 72, (i - e2) * 32, KAR(-1), normalput);
          putimage((j - e1) * 72, (i - e2) * 32, KAR(33), normalput);
          bx = j * 72; by = i * 32; bi = i; bj = j; box = true;
          break;
        case 3:
          kamni = true;
          kamx = (j - e1) * 72;
          colkam = 3;
          break;
      }
      if (EK(ekr, i, j, '0000:06B4', '0000:06C5') < max)
        putimage((j - e1) * 72, (i - e2) * 32, KAR(EK(ekr, i, j)), normalput);
    }
  // BUG (оригинал): этот цикл оставляет активной страницу 1. В perehod первый
  // проход (pag=0) снимает фон под лодкой в opis[0] со страницы 1, где ещё
  // старая комната: в комнатах с камнями у входа мелькает кусок прежней.
  if (kamni)
    for (i = 0; i <= colkam; i++)
      for (j = 0; j <= 1; j++) {
        kamy[j][rc(i, 0, 3)] = i * 94;
        setactivepage(j);
        putimage(kamx, kamy[j][i], KAR(3), normalput);
      }
  t = col - 1;
  for (i = 1; i <= t; i++)
    for (j = 0; j <= 1; j++) {
      getimage(MV(i).ox[j], MV(i).oy[j], MV(i).ox[j] + 72, MV(i).oy[j] + 64, MV(i).opic[j]);
      MV(i).x[j] = MV(i).ox[j];
      MV(i).y[j] = MV(i).oy[j];
    }
}

// perehod(ekr: по значению; var a, b, dx, dy; var massv; var col, e1, e2)
// BUG (оригинал): края карты не проверяются. Уже в первой комнате угловая
// плитка 22 не считается стеной: из левого верхнего угла лодка уходит влево
// за карту — e1:=e1-7 < 0, Runtime error 201 at 0000:12FE. Уровень 2 — желоб камней внизу
// (комната e1=14, e2=30) ведёт за карту: Runtime error 201 at 0000:0527 в vivod;
// уровень 1 — дыра камней вверху: e2:=e2-10 < 0, Runtime error 201 at 0000:1417
// (оба адреса проверены на SUBM8.EXE в DOSBox на картах с открытым проходом).
// BUG (оригинал): при смене комнаты по горизонтали обновляется только x[pag],
// по вертикали — только y[pag]: первое восстановление фона ложится со сдвигом.
function perehod(ekrIn) {
  var pag;
  if (dx > 0 && a + 72 >= 503) {
    e1 = b(e1 + 7, '0000:11E5'); a = 1;
    rac = false; rac1 = false;
    for (pag = 0; pag <= 1; pag++) {
      setactivepage(pag);
      setvisualpage(1 - pag);
      vivod(ekrIn);
      x[pag] = a;
      getimage(a, b_, a + 72, b_ + 32, opis[pag]);
    }
  }
  if (dx < 0 && a <= 1) {
    e1 = b(e1 - 7, '0000:12FE'); a = 504 - 73; rac = false; rac1 = false;
    for (pag = 0; pag <= 1; pag++) {
      setactivepage(pag);
      setvisualpage(1 - pag);
      vivod(ekrIn);
      x[pag] = a;
      getimage(a, b_, a + 72, b_ + 32, opis[pag]);
    }
  }
  if (dy < 0 && b_ <= 1) {
    e2 = b(e2 - 10, '0000:1417'); b_ = 320 - 33; rac = false; rac1 = false;
    for (pag = 0; pag <= 1; pag++) {
      setactivepage(pag);
      setvisualpage(1 - pag);
      vivod(ekrIn);
      y[pag] = b_;
      getimage(a, b_, a + 72, b_ + 32, opis[pag]);
    }
  }
  if (dy > 0 && b_ + 32 >= 319) {
    e2 = b(e2 + 10, '0000:153C'); b_ = 1; rac = false; rac1 = false;
    for (pag = 0; pag <= 1; pag++) {
      setactivepage(pag);
      setvisualpage(1 - pag);
      vivod(ekrIn);
      y[pag] = b_;
      getimage(a, b_, a + 72, b_ + 32, opis[pag]);
    }
  }
}

// BUG (оригинал): у плиток 15/16 и 17/18/24/25/28..31 две проверки подряд, и обе
// могут сработать — взрыв лодки проигрывается дважды (а ещё раз — от бомбы,
// врага или камня в том же кадре).
async function gran() {
  // (проверка по цвету пикселей вокруг лодки в исходнике закомментирована)
  if (dx > 0) j1 = Math.trunc(a / 72) + 1;
  else j1 = Math.trunc(a / 72);
  if (dy > 0) { i1 = Math.trunc(b_ / 32) + 1; dy1 = 2; }
  else { i1 = Math.trunc(b_ / 32); dy1 = -2; }
  next = EK(ekr, i1 + e2, j1 + e1, '0000:16C1', '0000:16DE');
  switch (true) {
    case (next >= 11 && next <= 14) || next === 19 || next === 20 || next === 26 || next === 27 || next === -5 || next === -4:
      if (a * dx > dx * (j1 * 72 - dx * 44)) await vzr1(a, b_, vzr, mskvzr, true, 0);
      break;
    case next === 15 || next === 16:
      if (a * dx > dx * (j1 * 72 - dx * 72)) await vzr1(a, b_, vzr, mskvzr, true, 0);
      if (b_ * dy1 / 2 > dy1 / 2 * (i1 * 32 - dy1 * 16)) await vzr1(a, b_, vzr, mskvzr, true, 0);
      break;
    case next === 1 || next === 5 || next === 8 || next === 9 || next === 21 || next === 23 || next === 32:
      if (b_ * dy1 / 2 > dy1 / 2 * (i1 * 32 - dy1 * 16)) await vzr1(a, b_, vzr, mskvzr, true, 0);
      break;
    case next === 17 || next === 18 || next === 24 || next === 25 || (next >= 28 && next <= 31):
      if (a * dx > dx * (j1 * 72 - dx * 44)) await vzr1(a, b_, vzr, mskvzr, true, 0);
      if ((b_ * dy1 / 2 > dy1 / 2 * (i1 * 32 - dy1 * 16)) && (a * dx > dx * (j1 * 72 - dx * 44))) await vzr1(a, b_, vzr, mskvzr, true, 0);
      break;
  }
}

// BUG (оригинал): второй setactivepage(1-page) не возвращает страницу, а снова
// ставит ту же. Активной остаётся 1-page — так же в текстах кислорода, скорости
// и торпед. Если подбор совпал с нажатием «+»/«−» или с попаданием торпеды,
// предмет стирается только на одной странице и мерцает, пока не уйти из комнаты.
function prov(xx, yy, xxx, yyy) {
  setfillstyle(1, 9);
  bar(xx - (e1 * 72), yy - (e2 * 32), xx - (e1 * 72) + xxx, yy - (e2 * 32) + yyy);
  setactivepage(1 - page);
  bar(xx - (e1 * 72), yy - (e2 * 32), xx - (e1 * 72) + xxx, yy - (e2 * 32) + yyy);
  setactivepage(1 - page);                  // (второй раз — та же страница)
}

async function provvz() {
  var g, h;
  g = 32 + sizeenemy(1, MV(i).tip);
  h = 16 + sizeenemy(2, MV(i).tip);
  if (Math.abs(a + 36 - sizeenemy(1, MV(i).tip) - MV(i).ox[page]) < g)
    if (Math.abs(b_ + 16 - sizeenemy(2, MV(i).tip) - MV(i).oy[page]) < h)
      await vzr1(a, b_, vzr, mskvzr, true, 0);
}

// BUG (оригинал): условие racy>=298 не смотрит, какая торпеда летит. Торпеда
// вперёд, пущенная у самого дна (b>=286), каждый кадр стирает голубыми
// полосами белую рамку внизу поля.
function provrac() {
  if ((drac > 0 && racx + 30 >= 504) || (drac < 0 && racx <= 0)) {
    rac = false;
    setfillstyle(1, 9);
    for (i = 0; i <= 1; i++) {
      setactivepage(i);
      bar(racox[i], racy, racox[i] + 30, racy + 9);
    }
    i = 1;
  }
  if (racy >= 298) {
    rac1 = false;
    setfillstyle(1, 9);
    for (i = 0; i <= 1; i++) {
      setactivepage(i);
      bar(racx, racoy[i], racx + 9, racoy[i] + 22);
    }
    i = 1;
  }
}

// provvzrac(var tor, tor1) — вызывается только как provvzrac(rac, rac1)
async function provvzrac() {
  var g, h, xr, yr_;
  if (col !== 1) {
    // BUG (оригинал): i здесь — значение после цикла «for i:=1 to col-1 do provvz»,
    // то есть всегда последний враг на экране. Торпеда проходит сквозь
    // остальных, пока последний жив.
    if (rac) {
      g = 15 + sizeenemy(1, MV(i).tip);
      h = 4.5 + sizeenemy(2, MV(i).tip);
      xr = racx; yr_ = racy;
    } else {
      g = 11 + sizeenemy(1, MV(i).tip);
      h = 4.5 + sizeenemy(2, MV(i).tip);
      xr = racx; yr_ = racy;
    }
    if (Math.abs(xr + (g - sizeenemy(1, MV(i).tip)) - sizeenemy(1, MV(i).tip) - MV(i).ox[page]) < g)
      if (Math.abs(yr_ + (h - sizeenemy(2, MV(i).tip)) - sizeenemy(2, MV(i).tip) - MV(i).oy[page]) < h) {
        await vzr1(MV(i).ox[page] - 15, MV(i).oy[page], vzr, mskvzr, false, 0); setfillstyle(1, 9);
        for (i = 0; i <= 1; i++) {
          setactivepage(i);
          if (rac)
            bar(racox[i], racy, racox[i] + 30, racy + 9);
          if (rac1)
            bar(racx, racoy[i], racx + 9, racoy[i] + 22);
        }
        i = 1;
        if (rac) rac = false; else rac1 = false;
      }
  }
}

function loadSpr(name, addr) {              // assign/reset/blockread(x,2),(y,2),(size,2)/getmem/blockread/close
  f = new BinFile(name, addr);
  x[0] = f.int();                           // blockread(f,x,2) пишет в x[0] — как в оригинале
  y[0] = f.int();
  size = f.word();
  var img = f.image(size);
  fileClose(f);
  return img;
}
// BUG (оригинал): каждая новая партия снова делает GetMem под эти спрайты
// (и под opis, см. ниже) и не освобождает старые — около 3,4 КБ на партию.
// До нехватки памяти дело не доходит: раньше кончаются дескрипторы файлов.
function loadfon() {
  w = loadSpr('key1.spr', '0000:24AD');
  o = loadSpr('minus.spr', '0000:255F');
  u1 = loadSpr('plus.spr', '0000:2611');
}

function ramka() {
  setcolor(15);
  line(0, 320, 504, 320);
  line(504, 0, 504, 320);
  setcolor(7);
  line(0, 321, 504, 321);
  line(505, 0, 505, 321);
  setcolor(6);
  line(0, 322, 504, 322);
  line(506, 0, 506, 322);
  setcolor(2);
}

function interfon() {
  setfillstyle(1, 8);
  bar(504, 93, 640, 350);
  bar(0, 320, 640, 350);
  setcolor(2);
  setfillstyle(1, 9);
  settextstyle(0, 0, 1);
  outtextxy(496 + nn, 100 + mm, S('УРОВЕНЬ-1'));
  outtextxy(496 + nn, 125 + mm, S('ТОРПЕДЫ-5'));
  outtextxy(496 + nn, 150 + mm, S('СКОРОСТЬ-0'));
  outtextxy(496 + nn, 175 + mm, S('УБИТО:'));
  outtextxy(496 + nn, 200 + mm, S('  РЫБ-0'));
  outtextxy(496 + nn, 225 + mm, S('  АКУЛ-0'));
  outtextxy(496 + nn, 250 + mm, S('  ОСМИНОГОВ-0'));
  outtextxy(496 + nn, 275 + mm, S('ОЧКИ-0'));
  outtextxy(310 + nn, 332, S('КИСЛОРОД-100%'));
  putimage(496 + nn, 290 + mm, w, normalput);
  putimage(540 + nn, 298 + mm, o, normalput);
  ramka();
}

function pstage() {
  if (dx > 0) j1 = Math.trunc(a / 72) + 1;
  else j1 = Math.trunc(a / 72);
  if (dy > 0) i1 = Math.trunc(b_ / 32) + 1;
  else i1 = Math.trunc(b_ / 32);
  next = EK(ekr, i1 + e2, j1 + e1, '0000:296E', '0000:298B');
  if (next === 15)
    if (b_ >= 127 && b_ <= 133) { ww = true; stage = b(stage + 1, '0000:29CE'); }
}

async function provracgran1() {
  var flag1 = false;
  i1 = Math.trunc(racy / 32) + 1;
  j1 = Math.trunc(racx / 72);
  next = EK(ekr, i1 + e2, j1 + e1, '0000:2A38', '0000:2A55');
  switch (next) {
    case 5: case 21: case 1: case 6: flag1 = true; break;
    case 31: case 17: case 11: case 19: if (racx < j1 * 72 + 45) flag1 = true; break;
  }
  if (flag1) {
    await vzr1(racx - 30, racy, vzr, mskvzr, true, 1);
    setfillstyle(1, 9);
    setactivepage(1 - page);
    bar(racx - 10, racoy[page] - 5, racx + 20, racoy[page] + 31);
    setactivepage(page);
    bar(racx - 10, racoy[page] - 5, racx + 20, racoy[page] + 31);
    rac1 = false;
  }
}

async function provracgran() {
  var flag1 = false, flag2 = false;
  if (drac > 0) j1 = Math.trunc(racx / 72) + 1; else j1 = Math.trunc(racx / 72);
  i1 = Math.trunc(racy / 32);
  next = EK(ekr, i1 + e2, j1 + e1, '0000:2C61', '0000:2C7E');
  switch (next) {
    case 16: flag1 = true; break;
    case 15: if (racx > j1 * 72 - 39) flag2 = true; break;
    case 17: case 19: case 14: case 11: case 31: case 28: if (racx < j1 * 72 + 52) flag1 = true; break;
    case 13: case 12: case 29: case 30: case 18: case 20: if (racx > j1 * 72 - 13) flag2 = true; break;
  }
  if (flag1) {
    await vzr1(racx - 20, racy - 12, vzr, mskvzr, true, 1);
    setfillstyle(1, 9);
    setactivepage(1 - page);
    bar(racx, racy - 10, racx + 50, racy + 21);
    setactivepage(page);
    bar(racx, racy - 10, racx + 50, racy + 21);
    rac = false;
  }
  if (flag2) {
    await vzr1(racx - 25, racy - 12, vzr, mskvzr, true, 1);
    setfillstyle(1, 9);
    setactivepage(1 - page);
    bar(racx - 17, racy - 10, racx + 29, racy + 21);
    setactivepage(page);
    bar(racx - 17, racy - 10, racx + 29, racy + 21);
    rac = false;
  }
}

// procedure Music1; interrupt; — мелодия заставки, нота каждые 4 тика (~0,22 с)
function Music1() {
  pause = pause + 1;
  if (pause === 5) {                        // {<<<<<-----pause=задержка}
    sound(cnll[rc(mus, 1, maxxx)]);
    mus = mus + 1;
    pause = 1;
  }
  if (mus >= maxxx) mus = 1;
}
// procedure Music; interrupt; — мелодия «ДОИГРАЛСЯ», нота каждые 5 тиков (~0,27 с)
function Music() {
  pause = pause + 1;
  if (pause === 6) {                        // {<<<<<-----pause=задержка}
    sound(cnl[rc(mus, 1, maxx)]);
    mus = mus + 1;
    pause = 1;
  }
  if (mus >= maxx) mus = 1;
}
// закомментированные в исходнике строки: { getintvec($1C,Old1C); setintvec($1C,@...); }
// и { setintvec($1C,old1c); nosound; } — выполняются только в «нерелизной» версии
function musicOn(handler) { if (MUSIC) { old1c = getintvec(0x1C); setintvec(0x1C, handler); } }
function musicOff() { if (old1c !== null || int1C) { setintvec(0x1C, old1c); nosound(); } }

function odd(n) { return (n & 1) === 1; }
function ch(s1) { return s1.charCodeAt(0); }

// ============================== основная программа ==========================
async function subm8() {
  var t;
  f = new BinFile('submar.dat', '0000:3115');
  for (i = -2; i <= 7; i++) {
    x2 = f.int(); y2 = f.int(); size = f.word();
    sub[i] = f.image(size);
  }
  for (i = 1; i <= 10; i++) { x2 = f.int(); y2 = f.int(); size = f.word(); vzr[i] = f.image(size); }
  for (i = 1; i <= 10; i++) { x2 = f.int(); y2 = f.int(); size = f.word(); mskvzr[i] = f.image(size); }
  for (j = 34; j <= 36; j++)
    for (i = 1; i <= 8; i++) {
      x2 = f.int(); y2 = f.int(); size = f.word();
      if (!pic[i]) pic[i] = {};
      pic[i][j] = f.image(size);
    }
  for (i = -5; i <= max; i++) { x2 = f.int(); y2 = f.int(); size = f.word(); kar[i] = f.image(size); }
  x2 = f.int(); y2 = f.int(); size = f.word();
  bom[1] = f.image(size);
  bom[0] = newImageBuf();                   // getmem(bom[0],size) — и тут же
  bom[0] = KAR(4);                          // bom[0]:=kar[4] (выделенная память теряется)
  for (i = 0; i <= 1; i++)
    for (j = -1; j <= 1; j++) { x2 = f.int(); y2 = f.int(); size = f.word(); torp[i][j] = f.image(size); }
  i = 1; j = 1;
  fileClose(f);
  gd = vga;
  gm = vgamed;
  initgraph(gd, gm, '');
  for (i = 1; i <= 3; i++)
    for (j = 0; j <= 1; j++)
      massv[i].opic[j] = newImageBuf();     // getmem(...,3000)
  i = 3; j = 1;
  do {
    colak = 0; colfi = 0; colos = 0; score = 0;
    stage = 1; gha = false;
    setfillstyle(1, 8);
    // BUG (оригинал): Assign на ещё открытый EKRAN1.TXT прошлой партии теряет
    // его дескриптор. Каждая партия оставляет открытым один файл; на 15-й партии
    // подряд дескрипторы кончаются, и Reset в loadfon падает: Runtime error 004
    // at 0000:24AD (проверено на оригинальном SUBM8.EXE в DOSBox).
    fil = new TextFile('zast.txt', '0000:378C');
    for (i = 0; i <= 3; i++) {
      for (j = 0; j <= 7; j++)
        zas[i][j] = fil.readInt();
      fil.readln();
    }
    fileClose(fil);
    i = 3; j = 7;
    for (qq = 0; qq <= 1; qq++) {
      setactivepage(page);
      bar(0, 0, 640, 350);
      for (i = 0; i <= 3; i++)
        for (j = 0; j <= 7; j++)
          putimage(30 + j * 72, 210 + i * 32, KAR(zas[i][j]), normalput);
      i = 3; j = 7;
      settextstyle(4, 0, 4);
      a = 40; x[page] = a; b_ = 250; tt = 0; ss = S('СУБМАРИНА'); ddy = 0;
      setcolor(0);
      outtextxy(21, 51, S('S-СТАРТ'));
      outtextxy(21, 91, S('Q-ВЫХОД'));
      outtextxy(21, 131, S('N-ВЫКЛ.МУЗЫКУ'));
      setcolor(red);
      outtextxy(20, 50, S('S-СТАРТ'));
      outtextxy(20, 90, S('Q-ВЫХОД'));
      outtextxy(20, 130, S('N-ВЫКЛ.МУЗЫКУ'));
      setcolor(15);
      rectangle(29, 209, 606, 338);
      rectangle(250 + sssr, 67, 575 - bb + sssr, 165);
      setcolor(7);
      rectangle(28, 208, 607, 339);
      rectangle(249 + sssr, 66, 576 - bb + sssr, 166);
      setcolor(6);
      rectangle(248 + sssr, 65, 577 - bb + sssr, 167);
      rectangle(27, 207, 608, 340);
      setcolor(yellow);
      settextstyle(0, 0, 1);
      outtextxy(300 + sssr, 75, S('УПРАВЛЕНИЕ'));
      outtextxy(255 + sssr, 90, S('СТРЕЛКИ-ДВИЖЕНИЕ ЛОДКИ'));
      outtextxy(255 + sssr, 105, S('"+"-УВЕЛИЧЕНИЕ СКОРОСТИ'));
      outtextxy(255 + sssr, 120, S('"-"-УМЕНЬШЕНИЕ СКОРОСТИ'));
      outtextxy(255 + sssr, 135, S('"Z","X"-ЗАПУСК ТОРПЕД'));
      outtextxy(255 + sssr, 150, S('"Q"-ВЫХОД'));
      outtextxy(50, 200, S('АВТОРЫ: Кузнецов Сергей, Архипов Павел, Зайцев Алексей.'));
      settextstyle(8, 2, 4);
      setcolor(red);
      outtextxy(469 + sssr - 20, 69, S('ЦДЮТ'));
      setcolor(yellow);
      outtextxy(471 + sssr - 20, 71, S('ЦДЮТ'));
      setcolor(blue);
      outtextxy(470 + sssr - 20, 70, S('ЦДЮТ'));
      setvisualpage(page); page = b(1 - page);
    }
    qq = 1;
    sp = 5; saq = 1;
    mus = 1; pause = 1;
    musicOn(Music1);                        // { getintvec($1C,Old1C); setintvec($1C,@Music1); }
    settextstyle(4, 0, 4);
    do {
      await delay(50);
      setvisualpage(page);
      page = b(1 - page);
      setactivepage(page);
      setfillstyle(1, 9);
      bar(x[page], b_, x[page] + 72, b_ + 27);
      setfillstyle(1, 8);
      bar(180, 10, 430, 60);
      putimage(a, b_, sub[7], andput);
      putimage(a, b_, sub[2], xorput);
      x[page] = a;
      ddy = ddy + saq;
      for (kk = 1; kk <= 9; kk++) {
        if (odd(kk)) yy = 11 + ddy;
        else yy = 11 - ddy;
        setcolor(0);
        outtextxy(181 + (kk - 1) * 26, yy, [ss[rc(kk, 1, ss.length) - 1]]);
        setcolor(green);
        outtextxy(180 + (kk - 1) * 26, yy - 1, [ss[kk - 1]]);
      }
      kk = 9;
      if (ddy > 4) saq = -1; if (ddy < -4) saq = 1;
      if (a >= 605 - 78) a = 40;
      if (sp > 9) sp = 9;
      if (sp < 1) sp = 0;
      a = a + sp;
      if (keypressed()) {
        c = await readkey();
        switch (c) {
          case ch('q'): musicOff(); closegraph(); throw new HaltSignal();   // {setintvec($1C,old1c);nosound;}
          case ch('n'): musicOff(); break;  // { setintvec($1C,old1c); nosound; }
          case ch('+'): sp = sp + 1; break;
          case ch('-'): sp = sp - 1; break;
        }
      }
      // BUG (оригинал): c не сбрасывается между партиями. Если последней
      // клавишей прошлой игры была «s» (пропуск уровня), заставка мелькает
      // на один кадр и новая игра начинается сама.
    } while (c !== ch('s'));
    musicOff();                             // {setintvec($1C,old1c); nosound;}
    settextstyle(0, 0, 6);
    fil = new TextFile('ekran1.txt', '0000:3E85');   // закрывается только после «until 1=2»
    loadfon();
    f = new BinFile('peiza.spr', '0000:3EAA');
    x[0] = f.int();
    y[0] = f.int();
    size = f.word();
    z = f.image(size);
    setactivepage(0);
    putimage(494, 0, z, normalput);
    setactivepage(1);
    putimage(494, 0, z, normalput);
    z = null;                               // freemem(z,size)
    fileClose(f);
    do {
      for (i = 0; i <= 39; i++) {
        for (j = 0; j <= 34; j++)
          ekr[i][j] = fil.readInt();
        fil.readln();
      }
      i = 39; j = 34;
      setactivepage(0);
      e1 = 0; e2 = 0; ww = false;
      bomb1 = false; kolo2 = 301; page = 0;
      interfon();
      viv = str(stage);
      setfillstyle(1, 8);
      bar(496 + nn, 100 + mm, 640, 110 + mm);
      outtextxy(496 + nn, 100 + mm, cat(S('УРОВЕНЬ-'), viv));
      setactivepage(1);
      interfon();
      viv = str(stage);
      setfillstyle(1, 8);
      bar(496 + nn, 100 + mm, 640, 110 + mm);
      outtextxy(496 + nn, 100 + mm, cat(S('УРОВЕНЬ-'), viv));
      setactivepage(0);
      setfillstyle(1, 9);
      setcolor(red);
      viv = str(stage);
      settextstyle(4, 0, 6);
      for (i = 0; i <= 1; i++) {
        setactivepage(i);
        bar(0, 0, 503, 319);
        outtextxy(100, 100, cat(S('УРОВЕНЬ '), viv));
      }
      i = 1;
      await delay(1000);
      settextstyle(0, 0, 1);
      a = 72;
      b_ = 130;
      j1 = 1;
      i1 = 4;
      x[1] = a; y[1] = b_; x[0] = a; y[0] = b_;
      setbkcolor(0);
      setfillstyle(1, 9);
      // BUG (оригинал): dy (а с ним zader и drac) не сбрасывается. Если последней
      // нажатой стрелкой была вверх/вниз, новый уровень или новая игра начинаются
      // с дрейфом лодки на 3 пикселя за кадр — например, в пол.
      sp = 0; s = 2; k = 2; coltor = 5; col = 1; u = 0; ds = 0; dx = 1; rac = false; rac1 = false;
      setvisualpage(1 - page); setactivepage(page); vivod(ekr); col = 1;
      setvisualpage(page); setactivepage(1 - page); vivod(ekr);
      t = col - 1;
      for (i = 1; i <= t; i++)
        for (j = 0; j <= 1; j++) {
          MV(i).num = 1;
          MV(i).dx = 0; MV(i).dy = 0;
        }
      if (t >= 1) { i = t; j = 1; }
      size = imagesize(1, 1, 73, 33);
      // if stage>1 then freemem(opis[0..1]) — на первом уровне новой партии
      // буферы прошлой партии не освобождаются (утечка, см. loadfon)
      opis[0] = newImageBuf();
      opis[1] = newImageBuf();
      getimage(a, b_, a + 72, b_ + 32, opis[0]); getimage(a, b_, a + 72, b_ + 32, opis[1]);
      key = true; setcolor(2); ko2 = 4;
      for (j = 0; j <= 1; j++) {
        fl[j] = false;
        setactivepage(j);
        for (i = 10; i <= 310; i++)
          line(i, 330, i, 340);
        i = 310;
      }
      j = 1;
      do {
        ko2 = b(ko2 - 1); await delay(20);
        if (ko2 === 0) { kolo2 = kolo2 - 1; ko2 = 15; fl[0] = true; fl[1] = true; }
        if (kolo2 % 3 === 0) {
          setfillstyle(1, 8);
          outtextxy(310 + nn, 332, S('КИСЛОРОД-100%'));
          viv = str(Math.trunc(kolo2 / 3));
          bar(310 + nn, 332, 640, 342);
          outtextxy(310 + nn, 332, cat(S('КИСЛОРОД-'), viv, S('%')));
          setactivepage(1 - page);
          bar(310 + nn, 332, 640, 342);
          outtextxy(310 + nn, 332, cat(S('КИСЛОРОД-'), viv, S('%')));
          setactivepage(1 - page);
        }
        if (fl[page]) {
          setfillstyle(1, 8); fl[page] = false;
          bar(kolo2 + 10, 330, kolo2 + 13, 340);
          setcolor(2);
        }
        setvisualpage(page);
        page = b(1 - page); u = b(1 - u);
        setactivepage(page);
        if (bomb1) putimage(boj, boi, bom[page], normalput);
        t = col - 1;
        for (i = 1; i <= t; i++)
          putimage(MV(i).x[page], MV(i).y[page], MV(i).opic[page], normalput);
        if (t >= 1) i = t;
        putimage(x[page], y[page], opis[page], normalput);

        if (rac) {
          setfillstyle(1, 9);
          bar(racox[page], racy, racox[page] + 30, racy + 9);
        }
        if (rac1) {
          setfillstyle(1, 9);
          bar(racx, racoy[page], racx + 9, racoy[page] + 22);
        }
        if (kamni) {
          setfillstyle(1, 9);
          for (i = 0; i <= colkam; i++)
            bar(kamx, kamy[page][rc(i, 0, 3)], kamx + 72, kamy[page][i] + 30);
          if (kamy[page][rc(colkam, 0, 3)] > 283) {
            setfillstyle(1, 9);
            setactivepage(1 - page);
            bar(kamx, kamy[page][colkam], kamx + 72, kamy[page][colkam] + 30);
            setactivepage(page);
            colkam = b(colkam - 1);
          }
          for (i = 0; i <= colkam; i++)
            kamy[page][rc(i, 0, 3)] = kamy[page][i] + 5;
          if (kamy[page][0] > 96) {
            colkam = b(colkam + 1);
            for (i = colkam; i >= 1; i--)
              for (j = 0; j <= 1; j++)
                kamy[j][rc(i, 0, 3)] = kamy[j][rc(i - 1, 0, 3)];
            if (colkam >= 1) { i = 1; j = 1; }
            kamy[0][0] = 0; kamy[1][0] = 0;
          }
        }
        t = col - 1;
        for (i = 1; i <= t; i++)
          getimage(MV(i).ox[page], MV(i).oy[page], MV(i).ox[page] + 72, MV(i).oy[page] + 64, MV(i).opic[page]);
        getimage(a, b_, a + 72, b_ + 32, opis[page]);
        for (i = 1; i <= t; i++) {
          putimage(MV(i).ox[page], MV(i).oy[page], pic[rc(u + MV(i).num + 4, 1, 8)][MV(i).tip], andput);
          putimage(MV(i).ox[page], MV(i).oy[page], pic[rc(u + MV(i).num, 1, 8)][MV(i).tip], xorput);
          MV(i).x[page] = MV(i).ox[page];
          MV(i).y[page] = MV(i).oy[page];
        }
        if (t >= 1) i = t;
        if (kamni) {
          for (i = 0; i <= colkam; i++)
            putimage(kamx, kamy[page][rc(i, 0, 3)], KAR(3), normalput);
          i = colkam;
        }
        if (rac) {
          putimage(racx, racy, torp[1][drac], andput);
          putimage(racx, racy, torp[0][drac], xorput);
        }
        if (rac1) {
          putimage(racx, racy, torp[1][0], andput);
          putimage(racx, racy, torp[0][0], xorput);
        }
        putimage(a, b_, sub[s + 5], andput);
        putimage(a, b_, sub[s], xorput);
        if (bomb1)
          if (Math.abs(a + 36 - boj - 16) < 50 && Math.abs(b_ + 16 - boi - 16) < 25) await vzr1(a, b_, vzr, mskvzr, true, 0);
        x[page] = a; y[page] = b_; racox[page] = racx; racoy[page] = racy;
        t = col - 1;
        for (i = 1; i <= t; i++) await provvz();
        if (t >= 1) i = t;
        if (rac || rac1) await provvzrac();
        if (keypressed()) {
          c = await readkey(); if (c === 0) c = await readkey();
          dxx = dx; dyy = dy;
          dy = 0;
          switch (c) {
            case 27: closegraph(); throw new HaltSignal();
            case ch('q'): await vzr1(a, b_, vzr, mskvzr, true, 0); break;
            case ch('s'):                   // отладочный пропуск уровня — остался в игре
              // BUG (оригинал): если лодка в этот момент стоит в трубе EXIT с ключом,
              // pstage прибавит уровень ещё раз: с 2-го — сразу «МОЛОДЕЦ», с 3-го —
              // уровень 5, который читается за концом EKRAN1.TXT (пустое море без выхода).
              stage = b(stage + 1, '0000:52A5'); ww = true;
              break;
            // BUG (оригинал): после «if c=#0 then c:=readkey» коды стрелок совпадают
            // с заглавными буквами: H — вверх, P — вниз, M — вправо, K — влево.
            // И наоборот, расширенные коды других клавиш совпадают с буквами игры:
            // Ctrl+← = «s» (пропуск уровня), Alt+F10 = «q» (подрыв), Alt+1 = «x»,
            // Alt+3 = «z» (торпеды), Alt+X = «−», а Ctrl+[ — это Esc (выход в DOS).
            case 72: dy = -3; break;
            case 80: dy = 3; break;
            case 77:
              if (dxx === -1) {
                ds = 1;
                zader = 5;
              } else dx = 1;
              break;
            case 75:
              if (dxx === 1) {
                ds = -1;
                zader = 5;
              } else dx = -1;
              break;
            case ch('-'):
              if (sp > 0) {
                setfillstyle(1, 8);
                sp--; viv = str(sp);
                bar(496 + nn, 150 + mm, 640, 160 + mm);
                outtextxy(496 + nn, 150 + mm, cat(S('СКОРОСТЬ-'), viv));
                setactivepage(1 - page);
                bar(496 + nn, 150 + mm, 640, 160 + mm);
                outtextxy(496 + nn, 150 + mm, cat(S('СКОРОСТЬ-'), viv));
                setactivepage(1 - page);
              }
              break;
            case ch('+'):
              if (sp < 9) {
                setfillstyle(1, 8);
                sp++;
                viv = str(sp);
                bar(496 + nn, 150 + mm, 640, 160 + mm);
                outtextxy(496 + nn, 150 + mm, cat(S('СКОРОСТЬ-'), viv));
                setactivepage(1 - page);
                bar(496 + nn, 150 + mm, 640, 160 + mm);
                outtextxy(496 + nn, 150 + mm, cat(S('СКОРОСТЬ-'), viv));
                setactivepage(1 - page);
              }
              break;
            case ch('z'):
              if (rac === false && rac1 === false && coltor > 0) {
                rac = true; coltor = b(coltor - 1, '0000:5513');
                if (dx > 0) racx = a + 70; else racx = a - 30;
                drac = dx; racy = b_ + 12; racox[0] = racx; racox[1] = racx;
              }
              break;
            case ch('x'):
              if (rac === false && rac1 === false && coltor > 0) {
                racx = a + 32;
                racy = b_ + 32; racoy[0] = racy; racoy[1] = racy;
                if (EK(ekr, Math.trunc(racy / 32) + 1 + e2, Math.trunc(racx / 72) + e1, '0000:55D7', '0000:5606') === -1 ||
                    EK(ekr, Math.trunc(racy / 32) + 1 + e2, Math.trunc(racx / 72) + e1, '0000:5639', '0000:5668') === 0) {
                  rac1 = true; coltor = b(coltor - 1, '0000:5696');
                }
              }
              break;
          }
        }
        await delay(50);
        if (zader > 0)
          zader--;
        if (ds !== 0 && zader === 0) {
          s = s + ds;
          if (s === -2 || s === 2) {
            dx = ds;
            ds = 0;
          }
          zader = 3;
        }
        if ((b_ + dy) > 300 || (b_ + dy) < 0)
          dy = 0;
        t = col - 1;
        for (i = 1; i <= t; i++) {
          if (a < MV(i).ox[page]) {
            MV(i).dx = -1; MV(i).num = 1;
          } else {
            MV(i).dx = 1; MV(i).num = 3;
          }
          if (b_ < MV(i).oy[page]) MV(i).dy = -1; else MV(i).dy = 1;
        }
        for (i = 1; i <= t; i++) {
          if (MV(i).tip === 35) {
            MV(i).ox[page] = MV(i).ox[page] + MV(i).dx * 2;
            MV(i).oy[page] = MV(i).oy[page] + MV(i).dy * 2;
          } else {
            MV(i).ox[page] = MV(i).ox[page] + MV(i).dx;
            MV(i).oy[page] = MV(i).oy[page] + MV(i).dy;
          }
        }
        if (t >= 1) i = t;
        if (key === false) pstage();
        if (ww === false) await gran();
        if (kamni) {
          for (i = 0; i <= colkam; i++)
            if (Math.abs(a - kamx) < 72 && Math.abs(b_ - kamy[page][rc(i, 0, 3)]) < 27) await vzr1(a, b_, vzr, mskvzr, true, 0);
          i = colkam;
        }
        a = a + dx * sp; b_ = b_ + dy;
        if (rac1) await provracgran1();
        if (rac) await provracgran();
        if (rac)
          racx = racx + drac * 10;
        if (rac1)
          racy = racy + 5;
        // BUG (оригинал): подбор предметов проверяет только одну сторону (без abs):
        // ключ, баллон и ящик берутся из любой точки левее и ниже предмета в комнате.
        if (key && (a + e1 * 72 <= keyx + 34) && (b_ + e2 * 32 + 8 >= keyy - 27) && keyekr) {
          EKset(ekr, keyi, keyj, 0); key = false; prov(keyx, keyy, 32, 25); setactivepage(1 - page);
          putimage(555, 298 + mm, u1, normalput); setactivepage(page);
          putimage(555, 298 + mm, u1, normalput);
        }
        if ((a + e1 * 72 <= o2x + 40) && (b_ + e2 * 32 + 8 >= o2y - 23) && o2) {
          kolasdf = kolo2;
          if (kolasdf >= 201) kolo2 = 301;
          else kolo2 = kolasdf + 100;
          setfillstyle(1, 2);
          setactivepage(page);
          bar(kolasdf + 10, 330, kolo2 + 10, 340);
          setactivepage(1 - page);
          bar(kolasdf + 10, 330, kolo2 + 10, 340);
          setactivepage(page);
          EKset(ekr, o2i, o2j, 0); prov(o2x, o2y, 32, 32); o2 = false;
        }
        if ((a + e1 * 72 <= bx + 40) && (b_ + e2 * 32 + 8 >= by - 23) && box) {
          EKset(ekr, bi, bj, 0); prov(bx, by, 32, 32); box = false; coltor = b(coltor + 5);
        }
        perehod(ekr);
        if (rac || rac1) provrac();
        setfillstyle(1, 8);
        setcolor(green);
        viv = str(coltor);
        bar(496 + nn, 125 + mm, 640, 135 + mm);
        outtextxy(496 + nn, 125 + mm, cat(S('ТОРПЕДЫ-'), viv));
        setactivepage(1 - page);
        bar(496 + nn, 125 + mm, 640, 135 + mm);
        outtextxy(496 + nn, 125 + mm, cat(S('ТОРПЕДЫ-'), viv));
        setactivepage(1 - page);
      } while (!(kolo2 === 0 || ww || gha));
    } while (!(!ww || stage === 4 || gha));
    if (!ww || gha) {
      setfillstyle(1, 9);
      setcolor(red);
      settextstyle(7, 0, 6);
      for (i = 0; i <= 1; i++) {
        setactivepage(i);
        bar(0, 0, 503, 319);
        outtextxy(62, 100, S('ДОИГРАЛСЯ'));
      }
      i = 1;
      await readkey();
      mus = 1; pause = 1;
      // В исходнике мелодия «ДОИГРАЛСЯ» включается ПОСЛЕ нажатия клавиши и
      // выключается через Delay(10) («{<<<--и(не в цикле) }» — недоделано):
      // за 10 мс таймер не доходит до первой ноты, мелодия не звучит. Так и оставлено.
      musicOn(Music);                       // { getintvec($1C,Old1C); setintvec($1C,@Music); }
      await delay(10);
      musicOff();                           // { setintvec($1C,old1c); nosound; }
    }
    if (stage === 4) {
      settextstyle(7, 0, 6);
      setfillstyle(1, 9);
      setcolor(red);
      for (i = 0; i <= 1; i++) {
        setactivepage(i);
        bar(0, 0, 503, 319);
        outtextxy(100, 100, S('МОЛОДЕЦ'));
      }
      i = 1;
      await readkey();
    }
  } while (true);
}
