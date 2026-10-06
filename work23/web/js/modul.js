'use strict';
// =============================================================================
//  MODUL.PAS — константы, глобальные переменные, карта, радар, загрузка
//  картинок. Имена переведены в нижний регистр (Паскаль к регистру нечувствителен).
// =============================================================================

var cmmouse = 1, cmkey = 2, cmnothing = 3, cmevent = 4, cmsdvig = 5, cmrobot = 6,
    cmtank = 7, cmair = 8, cmhouse = 9, cmnohouse = 10, cmnoputbuild = 11,
    cmputbuild = 12, cmvali = 13, cmwho = 14, cmwho2 = 15, cmwho3 = 16, cmwho4 = 17,
    cmdecnumber = 18, cmitiswho = 19, cminserttovibor = 20, cmnewgo = 21,
    cmattack = 22, cmunselect = 23, cmselect = 24, cmdecpower = 25, cmiamdied = 26,
    cmdel = 27, cmgetxy = 28, cmkoord = 29, cmobj = 30, cmfire = 31, cmgetnum = 32,
    cmradar = 33, cmgroup = 34, cmungroup = 35, cmtogroup = 36, cmunrepair = 37,
    cmincpower = 38, cmcloack = 39, cmiamcloack = 40, cmunattack = 41, cmturret = 42,
    cmputturret = 43, cmyoudied = 44, cmdecturret = 45, cmnewdefen = 46,
    cmdecdefen = 47, cmattack2 = 48, cmnewgo2 = 49, cmputhouse = 50, cmundefen = 51,
    cmunbuilder = 52, cmfreeharv = 53, cmgettip = 54, cmattack3 = 55,
    cmgettip121 = 56, cmsmoke = 57, cmchrono = 58, cmattack4 = 59, cmgetkoord = 60,
    cmload = 61, cmload2 = 62, cmallunload = 63, cmunload2 = 64, cmoneunload = 65,
    cmpal = 66, cmsave = 68, cmloadf = 69, cmnewtank = 70, cmnewair = 71,
    cmnewhouse = 72, cmnewroc = 73, cmnewroc2 = 74, cmnewsm = 75, cmnewrobot = 76,
    cmwhoisit = 77, cmrestore = 78, cmno = 79, cmyes = 80;

// типизированные константы (в Паскале — изменяемые глобальные переменные)
var flagtiberium = 0;
var flag67 = false;
var zahvat = false;      // нечто, связанное с захватом ресурсов
var attack = false;      // атака
var complet = true;
var patrol = [true, true];
var numberbuild = {120: 0, 121: 0, 122: 0, 123: 0, 124: 0, 125: 0, 126: 0};
var maxbuild = {120: 0, 121: 0, 122: 1, 123: 1, 124: 1, 125: 5, 126: 0};
var masflagbuild = {121: true, 122: false, 123: false, 124: false, 125: true, 126: false};
var masmyflagbuild = {111: true, 112: false, 113: false, 114: false, 115: true, 116: false, 117: false, 118: false};
var koltank = 5;
var kolair = 5;
var kolpatrol = [10, 10];
var inckol = [10, 10];
var maxturret = {70: 1, 71: 1};
var maxdefen = [1, 1];
var way = [[85, 57], [60, 57], [55, 70], [55, 86], [85, 86]];
var notiberium = false;
var flagnewbuild = false;
var construction = false;
var money = [9000, 9000];
var flagmenu = true;
var newmenu = [true, true];
var flagquit = false;
var failed = false;
var victory = false;
var flagplay = 10000;
var wait = 0;
var cursor = 1;
var oldcursor = 0;
var flagcursor = 0;
var oldflagcursor = 0;
var chronocur = false;
var flagchrono = false;
var maxload = 8;
var flagloadfile = false;
var prioritet = 60;
var rocetstep = 40;

var time = 0, buildtech = 11, buildhouse = 22, pouse = 30, kkkk = 20, kkktime = 20,
    kkktime2 = 40, kkktime3 = 1, size2 = 66, moneycolor = 163, maxx = 89, maxy = 89,
    radarx = 536, radary = 15, mycolor = 10, enemycolor = 12, diedcolor = 38,
    xxx = 2 + 540, yyy = 220, xxx2 = 542, yyy2 = 170, yyy3 = 140,
    menux = 110, menuy = 70, menux2 = 520 - 110, menuy2 = 480 - 70, maxicon = 30,
    time4 = 2, time5 = 1, time6 = 1, timep = 1, time7 = 3, time8 = 2, time9 = 4,
    time10 = 0, time11 = 5, time12 = 10, time13 = 10, time14 = 8, kolst = 15;

// --------------------------------- переменные --------------------------------
var filename = '', filestr = '', numfile = 0;
// Память переменной fileStr: string[32] = байт длины + 32 символа. TP7 при
// присваивании пишет только длину и символы, Delete/Insert сдвигают байты —
// за концом строки остаётся прежнее содержимое, и blockwrite записывает его
// в сохранение вместе с именем (сверено с сохранениями WORK23.EXE).
var filestrTail = new Uint8Array(33);
function fsAssign(str) {                   // fileStr := str
  filestr = str;
  filestrTail[0] = str.length & 255;
  for (var i = 0; i < str.length && i < 32; i++) filestrTail[i + 1] = str.charCodeAt(i);
}
function fsDelete(pos) {                   // Delete(fileStr, pos, 1)
  var len = filestr.length;
  if (pos < 1 || pos > len) return;
  for (var i = pos; i < len; i++) filestrTail[i] = filestrTail[i + 1];
  filestrTail[0] = len - 1;
  filestr = filestr.slice(0, pos - 1) + filestr.slice(pos);
}
function fsInsert(c, pos) {                // Insert(c, fileStr, pos), длина < 32
  var len = filestr.length;
  if (pos < 1) pos = 1;
  if (pos > len + 1) pos = len + 1;
  for (var i = len; i >= pos; i--) if (i + 1 <= 32) filestrTail[i + 1] = filestrTail[i];
  filestrTail[pos] = c.charCodeAt(0);
  filestrTail[0] = Math.min(len + 1, 32);
  filestr = (filestr.slice(0, pos - 1) + c + filestr.slice(pos - 1)).slice(0, 32);
}
var cursors = [];                 // array[0..10] of rec (1034 байта)
var massmoke = [[], []];
var timetoquit = 0;
var POLE_SIZE = 90 * 90 * 2;
var pole = new Uint8Array(POLE_SIZE), pole3 = new Uint8Array(POLE_SIZE);
var pole2 = new Uint8Array(92 * 92);
var polex = 0, poley = 0;
var energe = [0, 0], maxenerge = [0, 0];
var maxnumber = [0, 0], number = [0, 0];        // кол-во построенных роботов
var shadow = false;
var page = 0;
var flaggo2 = false, flaggo = false, fff = false;
var newhelp = [false, false], help = [false, false], newmoney = [false, false],
    newpanel = [false, false], pereris = [false, false];
var mastimebuild = new Array(131).fill(0);
var mastime = new Array(131).fill(0), masdam = new Array(131).fill(0),
    masdis = new Array(131).fill(0), maspow = new Array(131).fill(0);
var masflagicon = new Array(maxicon + 1).fill(false);
var masicon = new Array(maxicon + 1).fill(null);
var massize = [];
for (var _i = 0; _i <= 130; _i++) massize.push([0, 0]);
var mascoast = new Array(131).fill(0);
var dirt = new Array(16).fill(null);
var pict = new Array(21).fill(null);
var pictmove = new Array(3).fill(null);
var houses = [];
var tank = [];
var bullet = [];
for (_i = 0; _i <= 130; _i++) { houses.push(new Array(12).fill(null)); tank.push(new Array(12).fill(null)); }
for (_i = 0; _i <= 10; _i++) bullet.push(new Array(8).fill(null));
var key = 0;
var build = false;
var sostb = 0, sostt = 0, sosta = 0;
var x = 0;
var st = '';
var littp, gothp;

// --------------------------- доступ к карте ($R+) ---------------------------
// Чтение за краем карты в оригинале роняло программу (Runtime error 201).
// Здесь возвращается 255 («занято»), чтобы техника не уходила за край.
function gp(i, j, k) {
  if (i < 0 || i > maxx || j < 0 || j > maxy) { rangeError('pole[' + i + ',' + j + ']'); return 255; }
  return pole[(i * 90 + j) * 2 + k];
}
function sp(i, j, k, v) {
  if (i < 0 || i > maxx || j < 0 || j > maxy) { rangeError('pole[' + i + ',' + j + ']:='); return; }
  pole[(i * 90 + j) * 2 + k] = v & 255;
}
function gp3(i, j, k) {
  if (i < 0 || i > maxx || j < 0 || j > maxy) { rangeError('pole3[' + i + ',' + j + ']'); return 255; }
  return pole3[(i * 90 + j) * 2 + k];
}
function sp3(i, j, k, v) {
  if (i < 0 || i > maxx || j < 0 || j > maxy) { rangeError('pole3[' + i + ',' + j + ']:='); return; }
  pole3[(i * 90 + j) * 2 + k] = v & 255;
}
function gp2(i, j) {
  if (i < -1 || i > maxx + 1 || j < -1 || j > maxy + 1) { rangeError('pole2[' + i + ',' + j + ']'); return 0; }
  return pole2[(i + 1) * 92 + (j + 1)];
}
function sp2(i, j, v) {
  if (i < -1 || i > maxx + 1 || j < -1 || j > maxy + 1) { rangeError('pole2[' + i + ',' + j + ']:='); return; }
  pole2[(i + 1) * 92 + (j + 1)] = v & 255;
}

// ------------------------------------ звук -----------------------------------
function play2() {
  // expl house
  if (flagplay === 200) { play('expl2.wav'); wait = 200; return; }
  // expl avia
  if (flagplay === 250 && (endingplay || wait >= 250)) { play('expl3.wav'); wait = 250; return; }
  // expl tank
  if (flagplay === 300 && (endingplay || wait >= 300)) { play('expl1.wav'); wait = 300; return; }
  // shot turrets
  if (flagplay === 500 && (endingplay || wait >= 500)) { play('shot1.wav'); wait = 500; return; }
  // shot batllecruser
  if (flagplay === 600 && (endingplay || wait >= 600)) { play('laser2.wav'); wait = 600; return; }
  // shot valkiria
  if (flagplay === 650 && (endingplay || wait >= 650)) { play('laser3.wav'); wait = 650; return; }
  // shot air
  if (flagplay === 700 && (endingplay || wait >= 700)) { play('laser1.wav'); wait = 700; return; }
  // shot chronotank
  if (flagplay === 750 && (endingplay || wait >= 750)) { play('shot2.wav'); wait = 750; return; }
  // shot tank
  if (flagplay === 800 && (endingplay || wait >= 800)) { play('shot2.wav'); wait = 800; return; }
}

function setcursor(n) {
  if (n !== 0) setusercursor(cursors[n]);
  else resetmousecursor();
}

// ------------------------------- отрисовка поля ------------------------------
function showpole(f) {
  var i, j, m1, m2, n1, n2, ii, jj, i1, i2, j1, j2, v3;
  hidemouse();
  if (!f) {
    for (i = polex; i <= polex + 12; i++)
      for (j = poley; j <= poley + 11; j++)
        if (gp2(i, j) === 1) putsprite((i - polex) * 40, (j - poley) * 40, dirt[0]);
  }
  m1 = polex - 1 > 0 ? polex - 1 : 0;
  n1 = poley - 1 > 0 ? poley - 1 : 0;
  m2 = polex + 13 < maxx ? polex + 13 : maxx;
  n2 = poley + 12 < maxy ? poley + 12 : maxy;
  for (i = m1; i <= m2; i++)
    for (j = n1; j <= n2; j++) {
      v3 = gp3(i, j, 0);
      if (gp2(i, j) === 1 || (v3 >= 25 && v3 <= 29) || v3 >= 30) {
        if (!f) {
          i1 = i - 1 > 0 ? i - 1 : 0;
          j1 = j - 1 > 0 ? j - 1 : 0;
          i2 = i + 1 < maxx ? i + 1 : maxx;
          j2 = j + 1 < maxy ? j + 1 : maxy;
          for (ii = i1; ii <= i2; ii++)
            for (jj = j1; jj <= j2; jj++)
              if (gp3(ii, jj, 0) === 12) sp2(ii, jj, 1);
        }
        var v = gp(i, j, 0);
        if (!(inR(v, 113, 126) || v === 200 || v === 201 || v === 205 || v === 206)) sp2(i, j, 0);
        if (v === 10 || v === 254 || v === 255) {
          i1 = i - 2 > 0 ? i - 1 : 0;
          j1 = j - 2 > 0 ? j - 1 : 0;
          i2 = i + 2 < maxx ? i + 1 : maxx;
          j2 = j + 2 < maxy ? j + 1 : maxy;
          for (ii = i1; ii <= i2; ii++)
            for (jj = j1; jj <= j2; jj++)
              if (gp(ii, jj, 0) === 10) putsprite((ii - polex) * 40, (jj - poley) * 40, dirt[10]);
        }
        if (v3 === 233 && !f) putsprite((i - polex - 1) * 40, (j - poley) * 40, dirt[7]);
        if (inR(v3, 1, 6) || v3 === 8 || v3 === 9 || v3 === 11 || v3 === 12) {
          if (!f && !(v3 === 1 || v3 === 3 || v3 === 4 || v3 === 9 || v3 === 11)) sp2(i, j, 1);
          else {
            if (v3 === 12) putsprite((i - polex) * 40 - 12, (j - poley) * 40 - 33, dirt[12]);
            else putsprite((i - polex) * 40, (j - poley) * 40, dirt[v3]);
          }
        }
      }
    }
  showmouse();
}

function showallpole(f) {
  var i, j, m1, m2, n1, n2, ii, jj, i1, i2, j1, j2, v, v3;
  hidemouse();
  if (!f)
    for (i = polex; i <= polex + 12; i++)
      for (j = poley; j <= poley + 11; j++) {
        putsprite((i - polex) * 40, (j - poley) * 40, dirt[0]);
        v = gp(i, j, 0);
        if (v === 10) putsprite((i - polex) * 40, (j - poley) * 40, dirt[10]);
        if (v === 254) putsprite((i - polex - 2) * 40, (j - poley - 1) * 40, dirt[10]);
      }
  m1 = polex - 1 > 0 ? polex - 1 : 0;
  n1 = poley - 1 > 0 ? poley - 1 : 0;
  m2 = polex + 13 < maxx ? polex + 13 : maxx;
  n2 = poley + 12 < maxy ? poley + 12 : maxy;
  for (i = m1; i <= m2; i++)
    for (j = n1; j <= n2; j++) {
      v3 = gp3(i, j, 0);
      if (v3 === 233) putsprite((i - polex - 1) * 40, (j - poley) * 40, dirt[7]);
      v = gp(i, j, 0);
      if (v === 10 || v === 254 || v === 255) {
        i1 = i - 2 > 0 ? i - 1 : 0;
        j1 = j - 2 > 0 ? j - 1 : 0;
        i2 = i + 2 < maxx ? i + 1 : maxx;
        j2 = j + 2 < maxy ? j + 1 : maxy;
        for (ii = i1; ii <= i2; ii++)
          for (jj = j1; jj <= j2; jj++)
            if (gp(ii, jj, 0) === 10) putsprite((ii - polex) * 40, (jj - poley) * 40, dirt[10]);
      }
      if ((inR(v3, 1, 6) || v3 === 8 || v3 === 9 || v3 === 11 || v3 === 12) && f) {
        if (v3 === 12) putsprite((i - polex) * 40 - 12, (j - poley) * 40 - 33, dirt[12]);
        else putsprite((i - polex) * 40, (j - poley) * 40, dirt[v3]);
      }
    }
  showmouse();
}

function nomer(c) {
  switch (c) {
    case ch('!'): case ch('1'): return 1;
    case ch('@'): case ch('2'): return 2;
    case ch('#'): case ch('3'): return 3;
    case ch('$'): case ch('4'): return 4;
    case ch('%'): case ch('5'): return 5;
    case ch('^'): case ch('6'): return 6;
    case ch('&'): case ch('7'): return 7;
    case ch('*'): case ch('8'): return 8;
    case ch('('): case ch('9'): return 9;
    case ch(')'): case ch('0'): return 0;
  }
  return 255;
}

function prov(myx, myy, x, y, lenx, leny, flag) {
  var i, j, r = false;
  if (flag === 0) {
    for (i = x - 1; i <= x + lenx; i++)
      for (j = y - 1; j <= y + leny; j++)
        if (myx === i && myy === j) r = true;
  }
  if (flag === 1) {
    for (i = x; i <= x + lenx - 1; i++)
      for (j = y + leny + 1; j <= y + leny + 1; j++)
        if (myx === i && myy === j) r = true;
  }
  return r;
}

// Генерация карты.
// BUG (оригинал): inc(i) внутри вложенного цикла по j меняет переменную
// ВНЕШНЕГО цикла — остаток столбца дописывается в соседний столбец, а часть
// клеток сохраняет значения с прошлой игры (после «Перезапуска» там могут
// остаться коды зданий и техники — невидимые препятствия). Воздушный слой
// pole[..,..,1] между играми вообще не очищается.
// Цикл for Turbo Pascal эмулируется точно: проверка i = конечному значению
// перед инкрементом.
function initpole(pole4, pole5) {
  var i, j, n;
  i = 0;
  for (;;) {
    for (j = 0; j <= maxy; j++) {
      n = random(2000);                   // 1,9,11-над
      if (n >= 0 && n < 30) pole4[(i * 90 + j) * 2] = 1;
      if (n > 29 && n < 70) pole4[(i * 90 + j) * 2] = 2;
      if (n > 69 && n < 120) pole4[(i * 90 + j) * 2] = 3;
      if (n > 119 && n < 160) pole4[(i * 90 + j) * 2] = 4;
      if (n > 159 && n < 180) pole4[(i * 90 + j) * 2] = 5;
      if (n > 179 && n < 200) pole4[(i * 90 + j) * 2] = 6;
      if ((n > 199 && n < 205) && i < maxx) {
        pole4[(i * 90 + j) * 2] = 7;
        pole4[((i + 1) * 90 + j) * 2] = 233;
        i++;
      }
      if (n > 204 && n < 210) pole4[(i * 90 + j) * 2] = 8;
      if (n > 209 && n < 219) pole4[(i * 90 + j) * 2] = 9;
      if (n > 218 && n < 229) pole4[(i * 90 + j) * 2] = 11;
      if (n > 222 && n < 255) pole4[(i * 90 + j) * 2] = 12;
      if (n > 254) pole4[(i * 90 + j) * 2] = 0;
    }
    if (i === maxx) break;
    i++;
  }
  function spice(x1, y1) {
    for (var a = x1; a <= x1 + 2; a++)
      for (var b = y1; b <= y1 + 1; b++) pole4[(a * 90 + b) * 2] = 255;
    pole4[(x1 * 90 + y1) * 2] = 10;
    pole4[((x1 + 2) * 90 + y1 + 1) * 2] = 254;
  }
  spice(30, 30);
  spice(76, 76);
  spice(20, 70);
  spice(70, 30);
  spice(9, 7);
  pole5.set(pole4);
}

function radar2() {
  rectangle(radarx - 2, radary - 2, radarx + maxx + 2, radary + maxy + 2, 29, 29);
  setcolor(yellow);
  line(radarx + polex, radary - 2, radarx + polex + 12, radary - 2);
  line(radarx - 2, radary + poley, radarx - 2, radary + poley + 11);
  line(radarx + polex, radary + maxy + 2, radarx + polex + 12, radary + maxy + 2);
  line(radarx + maxx + 2, radary + poley, radarx + maxx + 2, radary + poley + 11);
}

function radar() {
  for (var i = 0; i <= maxx; i++)
    for (var j = 0; j <= maxy; j++)
      switch (gp(i, j, 0)) {
        case 2: case 5: case 6: case 12: putpixel(radarx + i, radary + j, 103); break;
        case 11: case 8: case 9: case 1: case 7: case 233: putpixel(radarx + i, radary + j, 59); break;
        case 10:
          setcolor(moneycolor);
          bar(radarx + i, radary + j, radarx + i + 2, radary + j + 1);
          break;
      }
}

function button(n, c, svoistvo) {
  var colup, coldown, x1 = 0, y1 = 0, x2 = 0, y2 = 0;
  switch (n) {
    case 0: x1 = xxx2; y1 = yyy2; x2 = xxx2 + 42 + 35; y2 = yyy2 + 40; break;
    case 1: x1 = xxx; y1 = yyy; x2 = xxx + 35; y2 = yyy + 35; break;
    case 2: x1 = xxx + 42; y1 = yyy; x2 = xxx + 42 + 35; y2 = yyy + 35; break;
    case 3: x1 = xxx; y1 = yyy + 42; x2 = xxx + 35; y2 = yyy + 42 + 35; break;
    case 4: x1 = xxx + 42; y1 = yyy + 42; x2 = xxx + 42 + 35; y2 = yyy + 42 + 35; break;
    case 5: x1 = xxx; y1 = yyy + 42 * 2; x2 = xxx + 35; y2 = yyy + 42 * 2 + 35; break;
    case 6: x1 = xxx + 42; y1 = yyy + 42 * 2; x2 = xxx + 42 + 35; y2 = yyy + 42 * 2 + 35; break;
    case 7: x1 = xxx; y1 = yyy + 42 * 3; x2 = xxx + 35; y2 = yyy + 42 * 3 + 35; break;
    case 8: x1 = xxx + 42; y1 = yyy + 42 * 3; x2 = xxx + 42 + 35; y2 = yyy + 42 * 3 + 35; break;
    case 25: x1 = xxx - 7; y1 = yyy3; x2 = xxx + 20 - 7; y2 = yyy3 + 20; break;
    case 26: x1 = xxx + 20 - 3; y1 = yyy3; x2 = xxx + 60; y2 = yyy3 + 20; break;
    case 27: x1 = xxx + 60 + 4; y1 = yyy3; x2 = xxx + 60 + 20 + 4; y2 = yyy3 + 20; break;
    case 98: x1 = xxx - 3; y1 = yyy + 42 * 5 + 7; x2 = xxx + 21; y2 = yyy + 42 * 5 + 20 + 11; break;
    case 99: x1 = xxx + 27; y1 = yyy + 42 * 5 + 7; x2 = xxx + 27 + 24; y2 = yyy + 42 * 5 + 20 + 11; break;
    case 100: x1 = xxx + 57; y1 = yyy + 42 * 5 + 7; x2 = xxx + 57 + 24; y2 = yyy + 42 * 5 + 20 + 11; break;
  }
  setcolor(c);
  setwritemode(normalput);
  bar(x1, y1, x2, y2);
  if (svoistvo) { colup = 35; coldown = 22; } else { colup = 22; coldown = 35; }
  rectangle(x1, y1, x2, y2, colup, coldown);
  rectangle(x1 - 1, y1 - 1, x2 + 1, y2 + 1, 39, 39);
  if (n === 25) {
    hidemouse();
    putsprite(xxx - 5, yyy3 + 1, pict[0]);
    showmouse();
  }
  if (n >= 98 && n <= 100) {
    hidemouse();
    if (n === 98) putsprite(x1 + 2, y1 + 2, pict[9]);
    if (n === 99) putsprite(x1 + 1, y1 + 1, pict[10]);
    if (n === 100) putsprite(x1 + 2, y1 + 2, pict[11]);
    showmouse();
  }
}

function ang(x1, y1, x2, y2) {
  var a = 2;
  if (x1 < x2) a = 0;
  if (x1 > x2) a = 4;
  if (y1 > y2) a = 2;
  if (y1 < y2) a = 6;
  if (x1 < x2 && y1 < y2) a = 7;
  if (x1 > x2 && y1 > y2) a = 3;
  if (x1 < x2 && y1 > y2) a = 1;
  if (x1 > x2 && y1 < y2) a = 5;
  return a;
}

function numicon(mx, my) {
  var n = 0;
  if (mx > xxx && mx < xxx + 35 && my > yyy && my < yyy + 35) n = 1;
  if (mx > xxx + 42 && mx < xxx + 42 + 35 && my > yyy && my < yyy + 35) n = 2;
  if (mx > xxx && mx < xxx + 35 && my > yyy + 42 && my < yyy + 42 + 35) n = 3;
  if (mx > xxx + 42 && mx < xxx + 42 + 35 && my > yyy + 42 && my < yyy + 42 + 35) n = 4;
  if (mx > xxx && mx < xxx + 35 && my > yyy + 42 * 2 && my < yyy + 42 * 2 + 35) n = 5;
  if (mx > xxx + 42 && mx < xxx + 42 + 35 && my > yyy + 42 * 2 && my < yyy + 42 * 2 + 35) n = 6;
  if (mx > xxx && mx < xxx + 35 && my > yyy + 42 * 3 && my < yyy + 42 * 3 + 35) n = 7;
  if (mx > xxx + 42 && mx < xxx + 42 + 35 && my > yyy + 42 * 3 && my < yyy + 42 * 3 + 35) n = 8;
  if (mx > xxx - 7 && mx < xxx + 20 - 7 && my > yyy3 && my < yyy3 + 20) n = 25;
  if (mx > xxx - 3 && mx < xxx + 21 && my > yyy + 42 * 5 + 7 && my < yyy + 42 * 5 + 20 + 11) n = 98;
  if (mx > xxx + 27 && mx < xxx + 27 + 24 && my > yyy + 42 * 5 + 7 && my < yyy + 42 * 5 + 20 + 11) n = 99;
  if (mx > xxx + 57 && mx < xxx + 57 + 24 && my > yyy + 42 * 5 + 7 && my < yyy + 42 * 5 + 20 + 11) n = 100;
  return n;
}

function modifpole(x1, y1, x2, y2) {
  var i, j, i1, i2, j1, j2;
  if (x1 > x2) { i = x1; x1 = x2; x2 = i; }
  if (y1 > y2) { i = y1; y1 = y2; y2 = i; }
  i1 = idiv(x1, 40) + polex;
  j1 = idiv(y1, 40) + poley;
  i2 = idiv(x2, 40) + polex;
  j2 = idiv(y2, 40) + poley;
  for (i = i1 - 1; i <= i2 + 1; i++)
    for (j = j1 - 1; j <= j2 + 1; j++)
      if (i >= 0 && j >= 0 && i <= maxx && j <= maxy) sp2(i, j, 1);
}

function modifpole2(xx, yy, tip) {
  if (tip >= 30 && yy - 1 > 0) {
    sp2(xx, yy - 2, 1); sp2(xx + 1, yy - 2, 1); sp2(xx - 1, yy - 2, 1);
  }
  if ((tip === 31 || tip === 46 || tip === 77) && yy - 3 >= 0) {
    sp2(xx, yy - 3, 1); sp2(xx + 1, yy - 3, 1); sp2(xx - 1, yy - 3, 1);
  }
  sp2(xx, yy, 1);
  sp2(xx + 1, yy, 1);
  sp2(xx - 1, yy, 1);
  sp2(xx, yy + 1, 1);
  sp2(xx, yy - 1, 1);
  sp2(xx + 1, yy + 1, 1);
  sp2(xx - 1, yy - 1, 1);
  sp2(xx + 1, yy - 1, 1);
  sp2(xx - 1, yy + 1, 1);
}

function newp(n) { pole2.fill(n & 255); }

function rasst(x1, y1, x2, y2) {
  var i = round(Math.sqrt(sqr(x1 - x2) + sqr(y1 - y2)));
  i = (i << 16) >> 16;            // integer(...)
  if (i === 0) i = 1;
  return i;
}

function loadcursors() {
  function load(n, file, hx, hy) {
    var d = asset(file);
    var rec = new Uint8Array(1034);
    rec.set(d.subarray(6, Math.min(d.length, 6 + 1034)));
    rec[0] = 0; rec[1] = 0; rec[2] = hx; rec[3] = hy;
    cursors[n] = rec;
  }
  load(1, 'c_menu.spr', 5, 5);
  load(2, 'c_repair.spr', 2, 3);
  load(3, 'c_go.spr', 14, 15);
  load(4, 'c_fire.spr', 14, 15);
  load(5, 'c_chrono.spr', 14, 15);
}

function initmas() {
  build = false;
  for (x = 0; x <= maxicon; x++) masflagicon[x] = false;
  for (x = 10; x <= 130; x++) {
    maspow[x] = 200; masdam[x] = 20; masdis[x] = 240; mastime[x] = 30;
  }
  maspow[31] = 500; masdam[31] = 120; masdis[31] = 320; mastime[31] = 30;
  maspow[77] = 500; masdam[77] = 120; masdis[77] = 320; mastime[77] = 30;
  masdam[30] = 5; masdis[30] = 200; mastime[30] = 10;
  masdam[76] = 5; masdis[76] = 200; mastime[76] = 10;
  maspow[32] = 250; masdam[32] = 10; mastime[32] = 10;
  maspow[78] = 250; masdam[78] = 10; mastime[78] = 10;
  maspow[33] = 300; masdam[33] = 30; masdis[33] = 280; mastime[33] = 15;
  maspow[79] = 300; masdam[79] = 20; masdis[79] = 280; mastime[79] = 15;
  masdis[34] = 240 + 120;
  masdis[80] = 240 + 120;
  maspow[35] = 400;
  maspow[29] = 400; masdam[29] = 120; masdis[29] = 240 + 40; mastime[29] = 40;
  maspow[23] = 300; masdam[23] = 80; masdis[23] = 240 + 120; mastime[23] = 40;
  maspow[27] = 150; masdam[27] = 20; masdis[27] = 240 + 40; mastime[27] = 20;
  maspow[61] = 400; masdam[61] = 120; masdis[61] = 240 + 120; mastime[61] = 40;
  maspow[40] = 400; masdam[40] = 20; mastime[40] = 20;
  maspow[41] = 400; masdam[41] = 20; mastime[41] = 20;

  for (x = 10; x <= 130; x++) mastimebuild[x] = 150;
  mastimebuild[23] = 10; mastimebuild[26] = 10; mastimebuild[27] = 10;
  mastimebuild[28] = 10; mastimebuild[29] = 10; mastimebuild[30] = 10;
  mastimebuild[31] = 10; mastimebuild[32] = 200; mastimebuild[33] = 30;
  mastimebuild[34] = 100; mastimebuild[35] = 10; mastimebuild[36] = 5;

  for (x = 10; x <= 130; x++) mascoast[x] = 10;

  for (x = 0; x <= 130; x++) { massize[x][0] = 3; massize[x][1] = 3; }
  massize[121][1] = 4;
  massize[122][1] = 2;
  massize[125][1] = 2;
  massize[126][0] = 2;
  massize[112][0] = 4; massize[112][1] = 2;
  massize[113][0] = 3; massize[113][1] = 2;
  massize[123][1] = 2;
  massize[116][0] = 3; massize[116][1] = 2;
  massize[40][0] = 1; massize[40][1] = 1;
  massize[41][0] = 1; massize[41][1] = 1;
  massize[42][0] = 1; massize[42][1] = 1;

  maxenerge[0] = 0; maxenerge[1] = 0;
  energe[0] = 0; energe[1] = 0;
  maxnumber[0] = 0; maxnumber[1] = 0;
}

function loadpict() {
  var f, i, j;
  f = openfile('dirt.dat');                   // 10- spice
  for (i = 0; i <= 11; i++) dirt[i] = loadspr1(f);
  dirt[12] = loadspr('tree.spr');

  f = openfile('mytank.dat');                 // загрузка танков (всех)
  for (i = 23; i <= 27; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  f = openfile('mytank2.dat');
  for (i = 28; i <= 29; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  f = openfile('mytank5.dat');
  for (j = 0; j <= 7; j++) tank[23][j] = loadspr1(f);
  f = openfile('mytank3.dat');
  for (j = 0; j <= 7; j++) tank[26][j] = loadspr1(f);
  f = openfile('enemtank.dat');
  for (i = 60; i <= 63; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  f = openfile('entank.dat');
  for (j = 0; j <= 7; j++) tank[67][j] = loadspr1(f);
  f = openfile('myharv.dat');
  for (i = 24; i <= 25; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  f = openfile('enemharv.dat');
  for (i = 65; i <= 66; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);

  f = openfile('vzr.dat');
  for (j = 0; j <= 11; j++) tank[45][j] = loadspr1(f);
  for (j = 0; j <= 8; j++) tank[46][j] = loadspr1(f);
  for (j = 0; j <= 11; j++) houses[130][j] = loadspr1(f);
  for (j = 0; j <= 11; j++) tank[47][j] = loadspr1(f);

  f = openfile('mytur.dat');
  for (i = 40; i <= 41; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  f = openfile('enemtur.dat');
  for (i = 70; i <= 71; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  f = openfile('myair.dat');
  for (i = 30; i <= 33; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  for (i = 0; i <= 7; i++) tank[34][i] = loadspr('myobs.spr');
  f = openfile('myair3.dat');
  for (i = 0; i <= 7; i++) tank[35][i] = loadspr1(f);
  f = openfile('myair2.dat');
  for (i = 0; i <= 7; i++) tank[36][i] = loadspr1(f);
  f = openfile('enemair.dat');
  for (i = 76; i <= 76 + 3; i++) for (j = 0; j <= 7; j++) tank[i][j] = loadspr1(f);
  for (i = 0; i <= 7; i++) tank[80][i] = loadspr('enemobs.spr');

  houses[113][0] = loadspr('mybuild1.spr');
  houses[111][0] = loadspr('build2.spr');
  houses[112][0] = loadspr('build6.spr');
  houses[114][0] = loadspr('build3.spr');
  houses[115][0] = loadspr('build4.spr');
  houses[116][0] = loadspr('remont.spr');
  houses[116][1] = loadspr('remont1.spr');

  houses[123][0] = loadspr('build1.spr');
  houses[121][0] = loadspr('build12.spr');
  houses[122][0] = loadspr('build10.spr');
  houses[124][0] = loadspr('build3.spr');
  houses[125][0] = loadspr('build11.spr');
  houses[126][0] = loadspr('build13.spr');

  f = openfile('myicons.dat');                // загрузка иконок (всех)
  for (i = 0; i <= 6; i++) masicon[i] = loadspr1(f);
  f = openfile('icons2.dat');
  for (i = 10; i <= 23; i++) masicon[i] = loadspr1(f);
  masicon[24] = tank[27][7];

  bullet[0][0] = loadspr('bullet.spr');
  bullet[1][0] = loadspr('rocket.spr');

  f = openfile('vzr2.dat');
  for (i = 5; i <= 6; i++) for (j = 0; j <= 7; j++) bullet[i][j] = loadspr1(f);

  pict[0] = loadspr('repair.spr');
  pict[1] = loadspr('key.spr');
  pict[2] = loadspr('key2.spr');
  pict[5] = loadspr('cdut.spr');
  pict[6] = loadspr('krug.spr');
  pict[7] = loadspr('krug2.spr');
  pict[8] = loadspr('krest.spr');

  f = openfile('pict.dat');
  for (i = 9; i <= 11; i++) pict[i] = loadspr1(f);
  f = openfile('arrow.dat');
  for (i = 12; i <= 15; i++) pict[i] = loadspr1(f);

  pictmove[0] = loadspr('move.spr');

  f = openfile('smoke.dat');
  for (i = 0; i <= 5; i++) massmoke[0][i] = loadspr1(f);

  loadcursors();

  pict[16] = loadspr('red.spr');
  pict[17] = loadspr('green.spr');
}

function modulInit() {
  gothp = asset('FONT:GOTH');
  littp = asset('FONT:LITT');
}
