'use strict';
// =============================================================================
//  OBJEC2.PAS — tEvent, tObject (базовый объект), tGroup (кольцевой список),
//  tRocet (снаряд), tRocet2 (бомба, в игре не используется).
// =============================================================================

// ---------------------------------- tEvent ----------------------------------
// Вариантная запись: поля разных вариантов лежат в одной памяти и перекрываются,
// как в Паскале. Присваивание записей (event2:=event) — копия байтов (assign).
// Указательные поля хранят адрес в байтах записи (для перекрытия вариантов),
// а рядом — ссылку на сам объект: так указатель на уже освобождённый объект
// ведёт к нему же (в DOS освобождённая память тоже сохраняла содержимое).
function TEvent() {
  this.u8 = new Uint8Array(72);
  this.dv = new DataView(this.u8.buffer);
  this.r4 = null; this.r8 = null; this.r67 = null;
}
TEvent.prototype.assign = function (src) {
  this.u8.set(src.u8);
  this.r4 = src.r4; this.r8 = src.r8; this.r67 = src.r67;
  return this;
};
TEvent.prototype.clone = function () { return new TEvent().assign(this); };
(function () {
  function def(name, off, type) {
    var d;
    switch (type) {
      case 'u8': d = { get: function () { return this.u8[off]; }, set: function (v) { this.u8[off] = v; } }; break;
      case 'bool': d = { get: function () { return this.u8[off] !== 0; }, set: function (v) { this.u8[off] = v ? 1 : 0; } }; break;
      case 'u16': d = { get: function () { return this.dv.getUint16(off, true); }, set: function (v) { this.dv.setUint16(off, v, true); } }; break;
      case 'i16': d = { get: function () { return this.dv.getInt16(off, true); }, set: function (v) { this.dv.setInt16(off, v, true); } }; break;
      case 'i32': d = { get: function () { return this.dv.getInt32(off, true); }, set: function (v) { this.dv.setInt32(off, v, true); } }; break;
      case 'ptr':
        var rk = 'r' + off;
        d = {
          get: function () {
            var a = this.dv.getUint32(off, true), r = this[rk];
            if (r !== null && r !== undefined && (r.__addr >>> 0) === a) return r;
            return deref(a);
          },
          set: function (v) { this.dv.setUint32(off, addrOf(v), true); this[rk] = v === undefined ? null : v; }
        };
        Object.defineProperty(TEvent.prototype, name + 'raw', { get: function () { return this.dv.getUint32(off, true); } });
        break;
    }
    Object.defineProperty(TEvent.prototype, name, d);
  }
  def('watch', 0, 'u16');
  // cmMouse
  def('xm', 2, 'i32'); def('ym', 6, 'i32'); def('button', 10, 'u16');
  // cmKey
  def('key', 2, 'u8'); def('scan', 3, 'u8');
  // cmEvent
  def('code', 2, 'u16'); def('otkogo', 4, 'ptr'); def('komu', 8, 'ptr');
  def('x', 12, 'i32'); def('y', 16, 'i32'); def('mvx', 20, 'i32'); def('mvy', 24, 'i32');
  def('oldx', 28, 'i32'); def('oldy', 32, 'i32'); def('newx', 36, 'i32'); def('newy', 40, 'i32');
  def('pow', 44, 'i32');
  def('tip', 48, 'u8'); def('ang', 49, 'u8'); def('ras', 50, 'u8'); def('ground', 51, 'u8');
  def('mov', 52, 'bool');
  def('tim', 53, 'i16'); def('dis', 55, 'i16'); def('dam', 57, 'i16'); def('sx', 59, 'i16');
  def('sy', 61, 'i16'); def('step', 63, 'i16'); def('tm2', 65, 'i16');
  def('buil', 67, 'ptr');
})();

// глобальные группы (objec2: var ...)
var rocet2 = null, deleting = null, rocet = null, myair = null, enemyair = null, vibortank = null,
    viborair = null, desk = null, mytank = null, enemytank = null, myhouse = null, enemyhouse = null;
var viborrobot = null, myrobot = null, enemyrobot = null, smoke = null, smoke2 = null,
    myturret = null, enemyturret = null;
var palet = null, ss = null, sel = null, selhouse = null;
var savefile = null, loadfile = null;    // BinWriter / BinReader

// New(pX, Init(...)): выделение в «куче» + конструктор
function New(Cls) {
  var o = new Cls();
  o.zero();
  heapAlloc(o, Cls.prototype.SIZE);
  return o;
}

// ---------------------------------- tObject ---------------------------------
function TObject() {}
TObject.prototype.SIZE = 111;
TObject.prototype.zero = function () {
  this.elem = null; this.next = null; this.pred = null; this.last = null; this.owner = null;
  this.iam = 0;
  this.sizex = 0; this.sizey = 0; this.kkk = 0; this.ramkax = 0; this.ramkay = 0;
  this.sprx = 0; this.spry = 0;
  this.oldx = 0; this.oldy = 0; this.x = 0; this.y = 0; this.power1 = 0; this.power = 0;
  this.oldtip = 0; this.tip = 0; this.race = 0;
  this.time3 = 0; this.time2 = 0; this.firetime = 0; this.gotime = 0;
  this.dx = 0; this.dy = 0; this.movex = 0; this.movey = 0;
  this.step = 0; this.select = 0; this.angle = 0;
  this.moving = false; this.flag = false;
  this.newx = 0; this.newy = 0;
  this.phase = 0; this.maxphase = 0; this.timephase = 0;
  this.died = false; this.distance = 0; this.oldk = 0;
  this.flagradar = [false, false];
  this.tipattack = 0; this.tiptar = 0; this.gr = 0;
  this.flagac = [0, 0]; this.kol = 0; this.timerepair = 0;
  this.repair = null;
  this.flagcloack = false; this.cloack = false; this.detector = false;
  this.color = 0; this.remont = false; this.flagsmoke = 0;
  this.energy = 0; this.energy1 = 0; this.timeinc = 0;
  this.load = [false, false]; this.kolload = 0;
};

TObject.prototype.nastroika = function (holder, key, p1) {
  var p2 = holder[key], res;
  var event2 = new TEvent();
  event2.code = cmevent;
  event2.code = cmwhoisit;
  if (p2 !== null) {
    event2.otkogo = null;
    event2.watch = cmevent;
    event2.code = cmwhoisit;
    event2.komu = p2;
    this.message(p1, event2);
    if (event2.otkogo !== null) { holder[key] = event2.otkogo; res = true; }
    else res = false;
  }
  return res;        // при p2=nil результат в оригинале не определён
};

TObject.prototype.init2 = function () {
  this.next = null; this.last = null; this.elem = null; this.owner = null;
  this.iam = this.__addr;
  this.select = 0;
  this.flagradar[0] = true;
  this.flagradar[1] = true;
  return this;
};

TObject.prototype.save = function () {
  var w = savefile;
  this.iam = this.__addr;
  w.i32(this.iam);
  w.i16(this.sizex); w.i16(this.sizey); w.i16(this.ramkax); w.i16(this.ramkay);
  w.i16(this.sprx); w.i16(this.spry); w.i16(this.oldx); w.i16(this.oldy);
  w.i16(this.x); w.i16(this.y); w.i16(this.power); w.i16(this.power1);
  w.u8(this.oldtip); w.u8(this.tip); w.u8(this.race);
  w.u8(this.time3); w.u8(this.time2); w.u8(this.firetime); w.u8(this.gotime);
  w.i16(this.dx); w.i16(this.dy); w.i16(this.movex); w.i16(this.movey);
  w.u8(this.step); w.u8(this.select); w.u8(this.angle); w.bool(this.moving); w.bool(this.flag);
  w.i16(this.newx); w.i16(this.newy); w.i16(this.kkk);
  w.u8(this.phase); w.u8(this.maxphase); w.i16(this.timephase);
  w.bool(this.died); w.i16(this.distance); w.u8(this.oldk);
  w.u8(this.tipattack); w.u8(this.tiptar); w.u8(this.gr);
  w.u8(this.flagac[0]); w.u8(this.flagac[1]);
  w.u8(this.kol); w.u8(this.timerepair); w.ptr(this.repair);
  w.bool(this.flagcloack); w.bool(this.cloack); w.bool(this.detector); w.u8(this.color);
  w.bool(this.remont); w.u8(this.flagsmoke);
  w.i16(this.energy); w.i16(this.energy1); w.u8(this.timeinc);
  w.bool(this.load[0]); w.bool(this.load[1]); w.u8(this.kolload);
};

TObject.prototype.load2 = function () {
  var r = loadfile;
  this.iam = r.i32() >>> 0;
  this.sizex = r.i16(); this.sizey = r.i16(); this.ramkax = r.i16(); this.ramkay = r.i16();
  this.sprx = r.i16(); this.spry = r.i16(); this.oldx = r.i16(); this.oldy = r.i16();
  this.x = r.i16(); this.y = r.i16(); this.power = r.i16(); this.power1 = r.i16();
  this.oldtip = r.u8(); this.tip = r.u8(); this.race = r.u8();
  this.time3 = r.u8(); this.time2 = r.u8(); this.firetime = r.u8(); this.gotime = r.u8();
  this.dx = r.i16(); this.dy = r.i16(); this.movex = r.i16(); this.movey = r.i16();
  this.step = r.u8(); this.select = r.u8(); this.angle = r.u8(); this.moving = r.bool(); this.flag = r.bool();
  this.newx = r.i16(); this.newy = r.i16(); this.kkk = r.i16();
  this.phase = r.u8(); this.maxphase = r.u8(); this.timephase = r.i16();
  this.died = r.bool(); this.distance = r.i16(); this.oldk = r.u8();
  this.tipattack = r.u8(); this.tiptar = r.u8(); this.gr = r.u8();
  this.flagac[0] = r.u8(); this.flagac[1] = r.u8();
  this.kol = r.u8(); this.timerepair = r.u8(); this.repair = r.ptr();
  this.flagcloack = r.bool(); this.cloack = r.bool(); this.detector = r.bool(); this.color = r.u8();
  this.remont = r.bool(); this.flagsmoke = r.u8();
  this.energy = r.i16(); this.energy1 = r.i16(); this.timeinc = r.u8();
  this.load[0] = r.bool(); this.load[1] = r.bool(); this.kolload = r.u8();
};

TObject.prototype.seektarget2 = function (n) {
  var res = { p: null, xx: 0, yy: 0 };
  var event2 = new TEvent();
  if (n === 0)
    for (var i = maxx; i >= 0; i--)
      for (var j = maxy; j >= 0; j--)
        if (inR(gp(i, j, 0), 110, 120)) {
          event2.watch = cmevent;
          event2.code = cmwho2;
          event2.ras = 0;
          event2.x = i; event2.y = j;
          this.message(myhouse, event2);
          if (event2.code === cmitiswho) {
            res.p = event2.otkogo;
            res.xx = i;
            res.yy = j;
            return res;
          }
        }
  return res;
};

TObject.prototype.seektarget = function (xx, yy, ds) {
  var i, j, xx2, yy2, xx1, yy1, p = null, v;
  var event2 = new TEvent();
  i = idiv(ds, 40);
  j = idiv(ds, 40);
  xx1 = xx - i < 0 ? 0 : xx - i;
  xx2 = xx + i > maxx ? maxx : xx + i;
  yy1 = yy - j < 0 ? 0 : yy - j;
  yy2 = yy + j > maxy ? maxy : yy + j;
  event2.watch = cmevent;
  for (i = xx1; i <= xx2 - 1; i++)
    for (j = yy1; j <= yy2 - 1; j++) {
      v = gp(i, j, 1);
      if ((this.tipattack === 1 || this.tipattack === 2) &&
          ((this.race === 1 && inR(v, 30, 39)) || (this.race === 0 && inR(v, 76, 80)))) {
        event2.code = cmwho2;
        event2.ras = 1 - this.race;
        event2.x = i; event2.y = j;
        if (this.detector) event2.pow = 111;
        if (this.race === 1) {
          this.message(viborair, event2);
          if (event2.code !== cmitiswho) this.message(myair, event2);
        } else if (this.race === 0) {
          this.message(enemyair, event2);
        }
        if (event2.code === cmitiswho) return event2.otkogo;
      }
      v = gp(i, j, 0);
      if ((this.tipattack === 0 || this.tipattack === 2) &&
          ((this.race === 1 && (inR(v, 23, 29) || inR(v, 40, 44) || v === 205)) ||
           (this.race === 0 && (inR(v, 60, 74) || inR(v, 121, 130) || v === 206)))) {
        event2.code = cmwho2;
        event2.ras = 1 - this.race;
        event2.x = i; event2.y = j;
        if (this.detector) event2.pow = 111;
        if (this.race === 1) {
          this.message(vibortank, event2);
          if (event2.code !== cmitiswho) this.message(mytank, event2);
          if (event2.code !== cmitiswho) this.message(myturret, event2);
          if (event2.code !== cmitiswho) this.message(vibortank, event2);
          if (event2.code !== cmitiswho) this.message(myturret, event2);
          if (event2.code !== cmitiswho) this.message(viborrobot, event2);
          if (event2.code !== cmitiswho) this.message(myrobot, event2);
        } else if (this.race === 0) {
          if (event2.code !== cmitiswho) this.message(enemyturret, event2);
          if (event2.code !== cmitiswho) this.message(enemytank, event2);
          if (event2.code !== cmitiswho) this.message(enemyrobot, event2);
        }
        if (event2.code === cmitiswho) return event2.otkogo;
      }
    }
  for (i = xx1; i <= xx2 - 1; i++)
    for (j = yy1; j <= yy2 - 1; j++) {
      v = gp(i, j, 0);
      if ((this.tipattack === 0 || this.tipattack === 2) &&
          (inR(v, 110, 129) || v === 200 || v === 201 || v === 205 || v === 206)) {
        event2.code = cmwho2;
        event2.ras = 1 - this.race;
        event2.x = i; event2.y = j;
        if (this.race === 1) this.message(myhouse, event2);
        else if (this.race === 0) this.message(enemyhouse, event2);
        if (event2.code === cmitiswho) return event2.otkogo;
      }
    }
  return p;
};

TObject.prototype.message = function (komu, event) {
  if (komu === null || komu === undefined) {
    console.warn('[оригинал] сообщение по nil-указателю');
    return;
  }
  komu.handleevent(event);
};

TObject.prototype.itisi = function (mx, my) {
  var k = (inR(this.tip, 30, 39) || inR(this.tip, 76, 80)) ? -this.kkk : 0;
  // BUG (оригинал): в проверке правой границы по X стоит movey вместо movex —
  // у движущейся по диагонали/вертикали техники зона клика смещена.
  return ((this.x - polex) * 40 + this.movex * this.step + this.sprx < mx) &&
         ((this.x - polex) * 40 + this.sizex + this.movey * this.step > mx) &&
         ((this.y - poley) * 40 + this.movey * this.step + k + this.spry < my) &&
         ((this.y - poley) * 40 + this.sizey + this.movey * this.step + k > my);
};

TObject.prototype.getevent = function (event) {
  var event2 = new TEvent();
  key = 0;
  if (keypressed()) key = readkey();
  if (shift() && inSet(key, [ch('!'), ch('@'), ch('#'), ch('$'), ch('%'), ch('^'), ch('&'), ch('*'), ch('('), ch(')')])) {
    event2.watch = cmevent;
    event2.code = cmungroup;
    event2.tip = nomer(key);
    this.message(mytank, event2);
    this.message(myair, event2);
    this.message(myrobot, event2);
    event2.code = cmgroup;
    this.message(vibortank, event2);
    this.message(viborair, event2);
    this.message(viborrobot, event2);
    // Event не заполняется — обработается прошлое событие (как в оригинале)
  } else if (key !== 0) {
    event.watch = cmkey;
    event.key = key;
    key = event.key;
  } else {
    event.watch = cmmouse;
    event.xm = mousex(); event.ym = mousey(); event.button = mousebutton();
    if (event.button === 2) sel = null;
  }
};

TObject.prototype.handleevent = function (event) {};

TObject.prototype.done = function () {
  // у объекта вне списка (pred/next=nil) оригинал писал по nil-указателю
  if (this.pred !== null) this.pred.next = this.next; else nilWrite('tObject.Done');
  if (this.next !== null) this.next.pred = this.pred; else nilWrite('tObject.Done');
  var owner = this.owner;
  if (owner === null) nilWrite('tObject.Done(owner)');
  else {
    if (owner.last === this) owner.last = this.next;
    if (owner.elem === this) owner.elem = this.next;
    if (owner.last === owner.elem) {
      if (owner.last !== null) owner.elem = owner.last.next;
      else nilWrite('tObject.Done(owner^.last)');
    }
    if (this.pred === this.next && this === this.next) {
      owner.elem = null;
      owner.last = null;
    }
  }
  if (this.race === 0 && myhouse.elem === null && mytank.elem === null && myrobot.elem === null &&
      viborrobot.elem === null && myair.elem === null && myturret.elem === null &&
      vibortank.elem === null && viborair.elem === null && !victory)
    failed = true;
  if (this.race === 1 && enemyhouse.elem === null && enemytank.elem === null && enemyrobot.elem === null &&
      enemyair.elem === null && enemyturret.elem === null && !failed)
    victory = true;
};

TObject.prototype.init = function () {
  this.next = null; this.last = null; this.elem = null; this.owner = null;
  this.iam = this.__addr;
  this.select = 0;
  return this;
};

TObject.prototype.showramka = function (xx, yy, sdv, f1, f2) {
  var len, s, k;
  var rx = this.ramkax, ry = this.ramkay, kk = this.kkk, sx = this.sizex, sy = this.sizey;
  s = f1 ? 6 : 0;
  if (this.race === 0) setcolor(white); else setcolor(12);
  line(xx + rx, yy + ry - kk, xx + rx + 4, yy + ry - kk);
  line(xx + rx, yy + ry - kk, xx + rx, yy + ry + 10 - kk);
  line(xx + rx + sx, yy + ry - kk + sy, xx + rx - 10 + s + sx, yy + sy - kk + ry);
  line(xx + rx + sx, yy + ry - kk + sy, xx + rx + sx, yy - 10 + sy - kk + ry);
  line(xx + rx + sx, yy + ry - kk, xx + rx - 4 + sx, yy - kk + ry);
  line(xx + rx + sx, yy + ry - kk, xx + rx + sx, yy + 10 - kk + ry);
  line(xx + rx, yy + ry + sy - kk, xx + rx + 10 - s, yy + sy - kk + ry);
  line(xx + rx, yy + ry + sy - kk, xx + rx, yy - 10 + sy - kk + ry);

  k = !f2 ? 15 : 20;
  if (this.race === 0) rectangle(xx + rx + 4, sdv + yy + ry - kk - 2, xx + rx + sx - 4, sdv + yy + ry - kk + 2, k, k);
  else rectangle(xx + rx + 4, sdv + yy + ry - kk - 2, xx + rx + sx - 4, sdv + yy + ry - kk + 2, 12, 12);

  if (!f2) {
    len = round(r48(r48(this.power / this.power1) * (sx - 10)));
    if (len >= 1) setcolor(red);
    if (len >= (sx - 10) * 1 / 3) setcolor(yellow);
    if (len >= (sx - 10) * 2 / 3) setcolor(green);
  } else {
    len = round(r48(r48(this.energy / this.energy1) * (sx - 10)));
    if (this.gr === 1) setcolor(167);
    else setcolor(143);
  }
  var hx = idiv(sx, 2), h10 = idiv(sx - 10, 2);
  if (len + 5 >= hx) {
    line(xx + rx + 5, sdv + yy + ry - kk - 1, xx + rx + hx, sdv + yy + ry - kk - 1);
    line(xx + rx + 5, sdv + yy + ry - kk, xx + rx + hx, sdv + yy + ry - kk);
    line(xx + rx + 5, sdv + yy + ry - kk + 1, xx + rx + hx, sdv + yy + ry - kk + 1);

    line(xx + rx + hx, sdv + yy + ry - kk - 1, xx + rx + hx + len - h10, sdv + yy + ry - kk - 1);
    line(xx + rx + hx, sdv + yy + ry - kk, xx + rx + hx + len - h10, sdv + yy + ry - kk);
    line(xx + rx + hx, sdv + yy + ry - kk + 1, xx + rx + hx + len - h10, sdv + yy + ry - kk + 1);
  } else {
    line(xx + rx + 5, sdv + yy + ry - kk - 1, xx + rx + len + 5, sdv + yy + ry - kk - 1);
    line(xx + rx + 5, sdv + yy + ry - kk, xx + rx + len + 5, sdv + yy + ry - kk);
    line(xx + rx + 5, sdv + yy + ry - kk + 1, xx + rx + len + 5, sdv + yy + ry - kk + 1);
  }
};

TObject.prototype.showload = function (xx, yy) {
  var kx1, ky1, kx2, ky2, i;
  setcolor(91);
  for (i = 1; i <= maxload; i++) {
    kx1 = xx + 7 * i + this.ramkax - 2;
    ky1 = yy + this.sizey - 1;
    kx2 = xx + 7 * i + 5 + this.ramkax - 2;
    ky2 = yy + this.sizey + 2;
    if (kx1 < 0) kx1 = 0;
    if (ky1 < 0) ky1 = 0;
    if (kx2 > 519) kx2 = 519;
    // BUG (оригинал): при ky2>479 обрезается kx2, а не ky2
    if (ky2 > 479) kx2 = 479;
    if (kx2 > 0 && ky2 > 0 && kx1 < 520 && ky1 < 640) {
      if (i <= this.kolload) bar(kx1, ky1, kx2, ky2);
      else rectangle(kx1, ky1, kx2, ky2, 15, 15);
    }
  }
};

TObject.prototype.show = function () {
  var xx, yy, f, event2;
  if (this.angle === 25 || this.load[1]) return;
  if ((this.x >= polex - 1 && this.x <= polex + 13) && (this.y >= poley - 1 && this.y <= poley + 12)) {
    f = true;
    mouseread();
    if (f) hidemouse();
    xx = (this.x - polex) * 40 + this.movex * this.step + this.sprx;
    yy = (this.y - poley) * 40 + this.movey * this.step + this.spry;
    var spr = tank[this.tip] ? tank[this.tip][this.angle] : null;
    if (!this.flagcloack)
      if (inR(this.tip, 30, 36) || inR(this.tip, 76, 80) || this.tip === 46 || this.tip === 47) putsprites(xx, yy, spr);
    // 46,47 - коды взрывов
    if (!this.flagcloack) putsprite(xx, yy - this.kkk, spr);
    else {
      if (this.race === 0) putsprites(xx, yy - this.kkk, spr);
      else {
        event2 = new TEvent();
        event2.mov = false; event2.watch = cmevent;
        event2.code = cmiamcloack; event2.x = this.x; event2.y = this.y;
        event2.mov = true;
        if (this.race === 0) {
          this.message(enemytank, event2);
          this.message(enemyrobot, event2);
          this.message(enemyair, event2);
          this.message(enemyturret, event2);
        }
        if (this.race === 1) {
          this.message(mytank, event2);
          this.message(myrobot, event2);
          this.message(myair, event2);
          this.message(vibortank, event2);
          this.message(viborair, event2);
          this.message(myturret, event2);
          this.message(viborrobot, event2);
        }
        if (!event2.mov) putsprites(xx, yy - this.kkk, spr);
      }
    }
    if (this.remont && !this.died) putsprite(xx + 10, yy + 10, pict[1 + this.movex]);
    if (this.select === 1) {
      if (this.tip === 35) this.showload(xx, yy - this.kkk);
      if (this.energy1 !== 0 && this.race === 0) {
        this.showramka(xx, yy, this.sizey - 1, true, true);
        this.showramka(xx, yy, 0, true, false);
      } else this.showramka(xx, yy, 0, false, false);
    }
    if (f) showmouse();
  }
};

// Защита от зацикливания при испорченных списках (в DOS это кончалось
// порчей кучи / зависанием; здесь цикл прерывается с сообщением в консоли).
var nilWarned = {};
function nilWrite(where) {
  if (!nilWarned[where]) { nilWarned[where] = 1; console.warn('[оригинал] обращение по nil-указателю (порча памяти в DOS): ' + where); }
}
// Обход «pp:=last; repeat pp:=pp^.next; ... until pp=last» с защитой от
// разрывов и колец (в DOS испорченный список означал зависание или крах).
var visitSeq = 0;
function chainFromLast(group) {
  var out = [], last = group.last, pp = last, t = ++visitSeq;
  if (pp === null) return out;
  for (;;) {
    pp = pp.next;
    if (pp === null) { nilWrite('обход списка: разрыв'); break; }
    if (pp.__visit === t) { nilWrite('обход списка: кольцо'); break; }
    pp.__visit = t;
    out.push(pp);
    if (pp === last) break;
  }
  return out;
}
// repeat dispose(next(group)) until group.elem=nil
// Если в списке оказался уже освобождённый объект (следствие порчи списков в
// оригинале), в DOS это было бы двойное освобождение памяти. Здесь объект
// просто снимается со списка.
function disposeAll(group, next) {
  for (var g = 0; group.elem !== null; g++) {
    var p = next(group);
    if (!p || g > 20000) {
      nilWrite('dispose: список испорчен');
      group.elem = null; group.last = null;
      return;
    }
    if (p.__freed || p.__stale) {
      nilWrite('dispose: повторное освобождение (порча кучи в DOS)');
      TGroup.prototype.delete.call(group, p, group);
      continue;
    }
    dispose(p);
  }
}

// ---------------------------------- tGroup ----------------------------------
function TGroup() {}
TGroup.prototype = Object.create(TObject.prototype);
TGroup.prototype.constructor = TGroup;
TGroup.prototype.SIZE = 111;

TGroup.prototype.insert = function (p) {
  p.owner = this;
  if (this.last === null) {
    p.next = p;
    p.pred = p;
    this.elem = p;
    this.last = p;
  } else {
    p.next = this.last.next;
    p.pred = this.last;
    // при разорванном списке оригинал писал по nil-указателю (в таблицу
    // прерываний) и продолжал работу — здесь запись просто пропускается
    if (this.last.next !== null) this.last.next.pred = p;
    else nilWrite('tGroup.Insert');
    this.last.next = p;
    this.last = p;
  }
};

TGroup.prototype.delete = function (p, who) {
  if (p.next === p.pred && p.pred === p) {
    who.elem = null;
    who.last = null;
  }
  if (p.pred !== null) p.pred.next = p.next; else nilWrite('tGroup.Delete');
  if (p.next !== null) p.next.pred = p.pred; else nilWrite('tGroup.Delete');
  if (who.last === p) who.last = p.next;
  if (who.elem === p) who.elem = p.next;
  if (who.last === who.elem && who.elem !== null) who.elem = who.last.next;
  p.next = null; p.pred = null;
};

TGroup.prototype.handleevent = function (event) {
  var pp, num, event2;
  ss = this;
  if (event.watch === cmevent) {
    if (event.code === cmloadf) {
      if (this.elem !== null) {
        chainFromLast(this).forEach(function (o) { o.load2(); });
      }
      return;
    }
    if (event.code === cmsave) {
      num = 0;
      if (this.elem !== null) {
        num = chainFromLast(this).length;
      }
      savefile.pstr('kissmyass', 10);
      savefile.i16(num);                 // запись количества объектов в списке
      if (this.elem !== null) {
        chainFromLast(this).forEach(function (o) { o.save(); });
      }
      return;
    }
    if (event.code === cminserttovibor) {
      var o = event.otkogo, t = event.tip;
      if (o.select === 0) {
        this.delete(o, this);
        o.select = 1;
        if (inR(t, 24, 25)) viborrobot.insert(o);
        if (t <= 29 && !inR(t, 24, 25)) vibortank.insert(o);
        if (t >= 30) viborair.insert(o);
      } else {
        event2 = new TEvent();
        event2.watch = cmevent;
        event2.code = cmunselect;
        this.message(o, event2);
        if (inR(t, 24, 25)) { this.delete(o, viborrobot); myrobot.insert(o); }
        if (t <= 29 && !inR(t, 24, 25)) { this.delete(o, vibortank); mytank.insert(o); }
        if (t >= 30) { this.delete(o, viborair); myair.insert(o); }
      }
      event.watch = cmnothing;
      return;
    }
    if (event.code === cmdel) {
      var d = event.otkogo;
      this.delete(d, this);
      deleting.insert(d);
      return;
    }
  }
  if (this.elem !== null) groupHandle(this.elem, this.elem, event);
};
// procedure handle: сначала спускаемся до конца списка, затем вызываем
// HandleEvent в ОБРАТНОМ порядке (последний вставленный — первым).
function groupHandle(inp, p, event) {
  var chain = [], t = ++visitSeq;
  for (;;) {
    chain.push(p);
    p.__visit = t;
    if (p.next === inp) break;
    if (p.next === null) { nilWrite('HandleEvent: разрыв списка'); break; }
    if (p.next.__visit === t) { nilWrite('HandleEvent: кольцо в списке'); break; }
    p = p.next;
  }
  for (var i = chain.length - 1; i >= 0; i--) chain[i].handleevent(event);
}

TGroup.prototype.show = function () {
  var ch = chainFromLast(this);
  for (var i = 0; i < ch.length; i++) ch[i].show();
};

TGroup.prototype.done = function () {
  var pp;
  if (this.elem !== null) {
    pp = this.last;                         // из DeskTop-a
    disposeAll(this, function (g) { return g.elem.next; });
  }
  if (this.pred !== null) this.pred.next = this.next; else nilWrite('tGroup.Done');
  if (this.next !== null) this.next.pred = this.pred; else nilWrite('tGroup.Done');
  if (this.owner === null) { nilWrite('tGroup.Done(owner)'); return; }
  if (this.owner.last === this) this.owner.last = this.next;
  if (this.owner.elem === this) this.owner.elem = this.next;
  if (this.pred === this.next && this === this.next) this.owner.elem = null;
};

// ---------------------------------- tRocet ----------------------------------
function TRocet() {}
TRocet.prototype = Object.create(TObject.prototype);
TRocet.prototype.constructor = TRocet;
TRocet.prototype.SIZE = 157;
TRocet.prototype.zero = function () {
  TObject.prototype.zero.call(this);
  this.k = 0; this.k2 = 0;
  this.ddx2 = 0; this.ddy2 = 0; this.ddx = 0; this.ddy = 0; this.lenx = 0; this.leny = 0;
  this.otkogo = null; this.kogo = null;
  this.damage = 0;
  this.target = { watch: 0, x: 0, y: 0 };
  this.pag = 0; this.tip2 = 0; this.randomx = 0; this.randomy = 0;
};
TRocet.prototype.save = function () {
  TObject.prototype.save.call(this);
  var w = savefile;
  w.real(this.k); w.real(this.k2);
  w.i16(this.ddx2); w.i16(this.ddy2); w.i16(this.ddx); w.i16(this.ddy); w.i16(this.lenx); w.i16(this.leny);
  w.ptr(this.otkogo); w.ptr(this.kogo);
  w.i16(this.damage);
  w.u16(this.target.watch); w.i16(this.target.x); w.i16(this.target.y);
  w.u8(this.pag); w.u8(this.tip2); w.i16(this.randomx); w.i16(this.randomy);
};
TRocet.prototype.load2 = function () {
  TObject.prototype.load2.call(this);
  var r = loadfile;
  this.k = r.real(); this.k2 = r.real();
  this.ddx2 = r.i16(); this.ddy2 = r.i16(); this.ddx = r.i16(); this.ddy = r.i16(); this.lenx = r.i16(); this.leny = r.i16();
  this.otkogo = r.ptr(); this.kogo = r.ptr();
  this.damage = r.i16();
  this.target.watch = r.u16(); this.target.x = r.i16(); this.target.y = r.i16();
  this.pag = r.u8(); this.tip2 = r.u8(); this.randomx = r.i16(); this.randomy = r.i16();
};
TRocet.prototype.done = function () { TObject.prototype.done.call(this); };
TRocet.prototype.init2 = function () { return this; };
TRocet.prototype.init = function (xx, yy, movx, movy, sx, sy, tar, dam, kt, otkt, tp, tp2) {
  this.tip = tp;
  this.tip2 = tp2;
  this.x = xx; this.y = yy;
  this.oldx = xx; this.oldy = yy;
  this.movex = movx; this.movey = movy;
  this.sizex = sx; this.sizey = sy;
  this.target = { watch: tar.watch, x: tar.x, y: tar.y };
  this.kogo = kt;
  this.otkogo = otkt;
  this.step = b8(rocetstep);
  this.damage = dam;
  this.kkk = 0;
  this.k = r48(this.step / rasst(this.x, this.y, this.target.x, this.target.y));
  this.ddx = round(r48(this.k * Math.abs(this.target.x - this.x)));
  this.ddy = round(r48(this.k * Math.abs(this.target.y - this.y)));
  this.dy = 0; this.dx = 0;
  switch (this.tip) {
    case 1: this.lenx = 10; break;
    case 2: this.lenx = 5; break;
  }
  this.k2 = r48(this.lenx / rasst(this.x, this.y, this.target.x, this.target.y));
  this.ddx2 = round(r48(this.k2 * Math.abs(this.target.x - this.x)));
  this.ddy2 = round(r48(this.k2 * Math.abs(this.target.y - this.y)));
  this.died = false;
  this.timephase = timep;
  this.phase = 0; this.maxphase = 7;
  this.pag = 0;
  this.randomx = random(10);
  this.randomy = random(10);
  return this;
};
TRocet.prototype.show = function () {
  var X = this.x - polex * 40 + this.movex, Y = this.y - poley * 40 + this.movey;
  if (this.died && this.phase > 16) return;
  if (this.died && this.phase < this.maxphase) {
    hidemouse();
    putsprite(X - 5, Y - 5, bullet[this.tip] ? bullet[this.tip][this.phase] : null);
    showmouse();
  }
  if (X > 0 && Y > 0 && X + this.sizex < 520 && Y + this.sizey < 480 && !this.died) {
    var ex = X + this.ddx2 * this.dx, ey = Y + this.ddy2 * this.dy;
    switch (this.tip) {
      case 1:
        setcolor(red);
        line(X, Y - 1, ex, ey - 1);
        line(X, Y + 1, ex, ey + 1);
        setcolor(yellow);
        line(X, Y, ex, ey);
        break;
      case 2:
        setcolor(96);
        line(X, Y - 1, ex, ey - 1);
        line(X, Y + 1, ex, ey + 1);
        setcolor(120);
        line(X, Y, ex, ey);
        break;
      case 0: case 3:
        hidemouse();
        putsprite(X, Y, bullet[0][0]);
        showmouse();
        break;
      case 4:
        hidemouse();
        putsprite(X, Y, bullet[1][0]);
        showmouse();
        break;
    }
  }
};
// Внимание: снаряд двигается на ЛЮБОЕ полученное сообщение (не только cmFire),
// например на cmIAmDied — так в оригинале.
TRocet.prototype.handleevent = function (event) {
  var xx = 0, yy = 0, f4, event2;
  modifpole2(idiv(this.x, 40), idiv(this.y, 40), 1);
  modifpole2(idiv(this.oldx, 40), idiv(this.oldy, 40), 1);
  if (event.watch === cmevent) {
    switch (event.code) {
      case cmrestore:
        if (this.kogo !== null) {
          f4 = this.nastroika(this, 'kogo', enemytank);
          if (!f4) f4 = this.nastroika(this, 'kogo', mytank);
          if (!f4) f4 = this.nastroika(this, 'kogo', vibortank);
          if (!f4) f4 = this.nastroika(this, 'kogo', myair);
          if (!f4) f4 = this.nastroika(this, 'kogo', viborair);
          if (!f4) f4 = this.nastroika(this, 'kogo', myturret);
          if (!f4) f4 = this.nastroika(this, 'kogo', myhouse);
          if (!f4) f4 = this.nastroika(this, 'kogo', myrobot);
          if (!f4) f4 = this.nastroika(this, 'kogo', viborrobot);
          if (!f4) f4 = this.nastroika(this, 'kogo', enemyair);
          if (!f4) f4 = this.nastroika(this, 'kogo', enemyturret);
          if (!f4) f4 = this.nastroika(this, 'kogo', enemyhouse);
          if (!f4) f4 = this.nastroika(this, 'kogo', enemyrobot);
        }
        if (this.otkogo !== null) {
          f4 = this.nastroika(this, 'otkogo', enemytank);
          if (!f4) f4 = this.nastroika(this, 'otkogo', mytank);
          if (!f4) f4 = this.nastroika(this, 'otkogo', vibortank);
          if (!f4) f4 = this.nastroika(this, 'otkogo', myair);
          if (!f4) f4 = this.nastroika(this, 'otkogo', viborair);
          if (!f4) f4 = this.nastroika(this, 'otkogo', myturret);
          if (!f4) f4 = this.nastroika(this, 'otkogo', myhouse);
          if (!f4) f4 = this.nastroika(this, 'otkogo', myrobot);
          if (!f4) f4 = this.nastroika(this, 'otkogo', viborrobot);
          if (!f4) f4 = this.nastroika(this, 'otkogo', enemyair);
          if (!f4) f4 = this.nastroika(this, 'otkogo', enemyturret);
          if (!f4) f4 = this.nastroika(this, 'otkogo', enemyhouse);
          if (!f4) f4 = this.nastroika(this, 'otkogo', enemyrobot);
        }
        break;
      case cmiamdied:
        if (event.otkogo === this.otkogo) this.otkogo = null;
        if (event.otkogo === this.kogo) this.kogo = null;
        break;
    }
  }
  if (this.died) {
    if (this.timephase > 0) this.timephase--;
    else {
      this.phase = b8(this.phase + 1);
      this.timephase = timep;
      if (this.phase === this.maxphase + 2) {
        // BUG (оригинал): меняется общее событие cmFire — до конца кадра
        // остальные объекты (и группы) его уже не получат.
        event.watch = cmevent;
        event.otkogo = this;
        event.code = cmdel;
        this.message(this.owner, event);
        event.watch = cmnothing;
      }
    }
  }
  if (this.pag === 0) {
    if (this.target.watch === cmkoord) {
      xx = this.target.x + this.randomx; yy = this.target.y + this.randomy;
    }
    if (inSet(this.tip, [3, 1, 2]) && this.kogo !== null && this.tip2 === 1) {
      this.target.x = this.kogo.x * 40 + 15 + this.randomx;
      this.target.y = this.kogo.y * 40 - 10 + this.randomy;
      xx = this.target.x; yy = this.target.y;
    }
    this.oldx = this.x; this.oldy = this.y;
    this.k = r48(this.step / rasst(this.x, this.y, xx, yy));
    this.ddx = round(r48(this.k * Math.abs(xx - this.x)));
    this.ddy = round(r48(this.k * Math.abs(yy - this.y)));
    if (xx > this.x) this.dx = 1;
    if (xx < this.x) this.dx = -1;
    if (yy > this.y) this.dy = 1;
    if (yy < this.y) this.dy = -1;
    this.x = this.x + this.dx * this.ddx; this.y = this.y + this.dy * this.ddy;
    if (this.x > xx && this.dx === 1) this.x = xx;
    if (this.x < xx && this.dx === -1) this.x = xx;
    if (this.y > yy && this.dy === 1) this.y = yy;
    if (this.y < yy && this.dy === -1) this.y = yy;
  }
  if (this.x === xx && this.y === yy && !this.died) {
    this.pag = 1;
    this.died = true;
    if (inSet(this.tip, [1, 3, 4])) this.tip = 6;
    if (inSet(this.tip, [2, 0])) this.tip = 5;
    this.phase = 0;
    event2 = new TEvent();
    event2.watch = cmevent;
    event2.code = cmdecpower;
    event2.pow = this.damage;
    event2.x = idiv(this.x, 40);
    event2.y = idiv(this.y, 40);
    event2.otkogo = this.otkogo;
    event2.komu = this.kogo;
    event2.tip = this.tip2;
    if (this.kogo !== null) this.message(this.kogo, event2);
  }
};

// ---------------------------------- tRocet2 ---------------------------------
function TRocet2() {}
TRocet2.prototype = Object.create(TObject.prototype);
TRocet2.prototype.constructor = TRocet2;
TRocet2.prototype.SIZE = 118;
TRocet2.prototype.zero = function () {
  TObject.prototype.zero.call(this);
  this.target = { watch: 0, x: 0, y: 0 };
  this.pag = 0;
};
// BUG (оригинал): save пишет 94 байта, а загрузка (унаследованная от tObject)
// читает 87 — файл бы «съехал». В игре бомбардировщик отключён, список пуст.
TRocet2.prototype.save = function () {
  TObject.prototype.save.call(this);
  savefile.u16(this.target.watch); savefile.i16(this.target.x); savefile.i16(this.target.y);
  savefile.u8(this.pag);
};
TRocet2.prototype.done = function () { TObject.prototype.done.call(this); };
TRocet2.prototype.init2 = function () { return this; };
TRocet2.prototype.init = function (xx, yy, tp) {
  this.tip = tp;
  this.died = false;
  this.timephase = timep;
  this.phase = 0; this.maxphase = 7;
  this.pag = 0;
  this.x = xx;
  this.y = yy;
  this.target.x = this.x;
  this.target.y = this.y + 20;
  return this;
};
TRocet2.prototype.show = function () {
  if (this.died && this.phase > 16) return;
  if (this.died && this.phase < this.maxphase) {
    hidemouse();
    putsprite(this.x - polex * 40 - 20, this.y - poley * 40 - 20, tank[this.tip][this.phase]);
    showmouse();
  }
  if (this.x - polex * 40 > 0 && this.y - poley * 40 > 0 && this.x - polex * 40 < 520 && this.y - poley * 40 < 480 && !this.died) {
    if (this.tip === 7) {
      hidemouse();
      putsprite(this.x - polex * 40, this.y - poley * 40, bullet[1][0]);
      showmouse();
    }
  }
};
TRocet2.prototype.handleevent = function (event) {
  modifpole2(idiv(this.x, 40), idiv(this.y, 40), 1);
  if (this.died) {
    if (this.timephase > 0) this.timephase--;
    else {
      this.phase = b8(this.phase + 1);
      this.timephase = timep;
      if (this.phase === this.maxphase + 2) {
        event.watch = cmevent;
        event.otkogo = this;
        event.code = cmdel;
        this.message(this.owner, event);
        event.watch = cmnothing;
      }
    }
  }
  if (this.pag === 0) {
    if (this.x < this.target.x) this.x++;
    if (this.y < this.target.y - 1) this.y = this.y + 2;
  }
  if (this.x === this.target.x && this.y === this.target.y && !this.died) {
    this.pag = 1;
    this.died = true;
    if (random(10) < 5) this.tip = 47;
    else this.tip = 45;
    this.phase = 0;
  }
};
