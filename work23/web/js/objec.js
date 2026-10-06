'use strict';
// =============================================================================
//  OBJEC.PAS — tTech (техника), tRobot (харвестеры и база для танков),
//  tTank (танки и пушки — «танк со скоростью 0»), tAir (авиация), tHouse (здания).
// =============================================================================

function writexy(x, y, c) { outtextxy(x, y, str(c)); }

// Рассылка «я погиб/исчез» по спискам (повторяющийся в оригинале блок)
function notifyDied(self, event2, race, lists) {
  for (var i = 0; i < lists.length; i++) self.message(lists[i], event2);
}

// ================================ tTech ======================================
function TTech() {}
TTech.prototype = Object.create(TObject.prototype);
TTech.prototype.constructor = TTech;
TTech.prototype.SIZE = 237;
TTech.prototype.zero = function () {
  TObject.prototype.zero.call(this);
  this.damage = 0; this.target = null; this.attack = false;
  this.tarx = 0; this.tary = 0; this.pag = 0; this.tiprocet = 0; this.angletime = 0;
  this.gruppa = new Array(10).fill(false);
  this.sost = 0; this.pousetime = 0; this.sxx = 0; this.syy = 0;
  this.builder = null; this.ktime = 0; this.flagk = 0; this.maxk = 0;
  this.flagsost = false; this.oldradar = false; this.oldnewx = 0; this.oldnewy = 0;
  this.defender = false; this.defenhouse = null; this.sostway = 0; this.flagfff = false;
  this.remonttime = 0; this.patr = false; this.timesmoke = 0; this.chrono = false;
  this.chron = [0, 0, 0];
  this.masload = new Array(maxload + 1).fill(null);
  this.masload2 = new Array(maxload + 1).fill(null);
};

TTech.prototype.save = function () {
  TObject.prototype.save.call(this);
  var w = savefile, i;
  w.i16(this.damage); w.ptr(this.target); w.bool(this.attack);
  w.i32(this.tarx); w.i32(this.tary); w.u8(this.pag); w.u8(this.tiprocet); w.i16(this.angletime);
  for (i = 0; i < 10; i++) w.bool(this.gruppa[i]);
  w.u8(this.sost); w.i16(this.pousetime); w.u8(this.sxx); w.u8(this.syy);
  w.ptr(this.builder); w.u8(this.ktime); w.u8(this.flagk); w.u8(this.maxk);
  w.bool(this.flagsost); w.bool(this.oldradar); w.i16(this.oldnewx); w.i16(this.oldnewy);
  w.bool(this.defender); w.ptr(this.defenhouse); w.u8(this.sostway); w.bool(this.flagfff);
  w.i16(this.remonttime); w.bool(this.patr); w.u8(this.timesmoke); w.bool(this.chrono);
  w.u8(this.chron[0]); w.u8(this.chron[1]); w.u8(this.chron[2]);
  for (i = 1; i <= maxload; i++) w.ptr(this.masload[i]);
  for (i = 1; i <= maxload; i++) w.ptr(this.masload2[i]);
};
TTech.prototype.load2 = function () {
  TObject.prototype.load2.call(this);
  var r = loadfile, i;
  this.damage = r.i16(); this.target = r.ptr(); this.attack = r.bool();
  this.tarx = r.i32(); this.tary = r.i32(); this.pag = r.u8(); this.tiprocet = r.u8(); this.angletime = r.i16();
  for (i = 0; i < 10; i++) this.gruppa[i] = r.bool();
  this.sost = r.u8(); this.pousetime = r.i16(); this.sxx = r.u8(); this.syy = r.u8();
  this.builder = r.ptr(); this.ktime = r.u8(); this.flagk = r.u8(); this.maxk = r.u8();
  this.flagsost = r.bool(); this.oldradar = r.bool(); this.oldnewx = r.i16(); this.oldnewy = r.i16();
  this.defender = r.bool(); this.defenhouse = r.ptr(); this.sostway = r.u8(); this.flagfff = r.bool();
  this.remonttime = r.i16(); this.patr = r.bool(); this.timesmoke = r.u8(); this.chrono = r.bool();
  this.chron[0] = r.u8(); this.chron[1] = r.u8(); this.chron[2] = r.u8();
  for (i = 1; i <= maxload; i++) this.masload[i] = r.ptr();
  for (i = 1; i <= maxload; i++) this.masload2[i] = r.ptr();
};

TTech.prototype.group = function (xx) {};

TTech.prototype.handleevent = function (event) {
  var event2 = new TEvent(), f4, ff, i, j;
  ff = false;
  if (this.chron[2] === 1) {
    if (this.chron[page] === 1) this.chron[page] = 0;
    else if (this.chron[1 - page] === 0 && !pereris[0] && !pereris[1]) {
      event2.watch = cmevent;
      event2.code = cmpal;
      event2.pow = 1;
      this.message(palet, event2);
      this.chron[2] = 0;
      flagchrono = false;
    }
  }
  if (event.watch !== cmevent) return;
  switch (event.code) {
    case cmrestore:
      if (this.repair !== null) f4 = this.nastroika(this, 'repair', myhouse);
      if (this.builder !== null) {
        if (this.race === 1) f4 = this.nastroika(this, 'builder', enemyhouse);
        if (this.race === 0) f4 = this.nastroika(this, 'builder', myhouse);
      }
      if (this.target !== null) {
        if (!this.attack) this.target = null;
        else {
          if (this.race === 1) {
            f4 = this.nastroika(this, 'target', mytank);
            if (!f4) f4 = this.nastroika(this, 'target', vibortank);
            if (!f4) f4 = this.nastroika(this, 'target', myair);
            if (!f4) f4 = this.nastroika(this, 'target', viborair);
            if (!f4) f4 = this.nastroika(this, 'target', myturret);
            if (!f4) f4 = this.nastroika(this, 'target', myhouse);
            if (!f4) f4 = this.nastroika(this, 'target', myrobot);
            if (!f4) f4 = this.nastroika(this, 'target', viborrobot);
          }
          if (this.race === 0) {
            f4 = this.nastroika(this, 'target', enemytank);
            if (!f4) f4 = this.nastroika(this, 'target', enemyair);
            if (!f4) f4 = this.nastroika(this, 'target', enemyturret);
            if (!f4) f4 = this.nastroika(this, 'target', enemyhouse);
            if (!f4) f4 = this.nastroika(this, 'target', enemyrobot);
          }
        }
      }
      if (this.defender) {
        if (this.race === 1) {
          f4 = this.nastroika(this, 'defenhouse', enemyhouse);
          if (!f4) this.defender = false;
        }
      }
      if (this.load[0]) {
        f4 = this.nastroika(this.masload2, 1, mytank);
        if (!f4) this.nastroika(this.masload2, 1, myrobot);
      }
      if (this.kolload !== 0) {
        for (i = 1; i <= this.kolload; i++) {
          f4 = this.nastroika(this.masload, i, mytank);
          if (!f4) this.nastroika(this.masload, i, myrobot);
        }
      }
      break;
    case cmwhoisit:
      if (this.iam === event.komuraw) {
        event.watch = cmnothing;
        event.otkogo = this;
      }
      break;
    case cmyoudied:
      this.died = true;
      break;
    case cmallunload:
      if (this.tip === 35 && this.kolload > 0 && !this.died) {
        event2.watch = cmevent;
        event2.code = cmunload2;
        j = this.kolload;
        // BUG (оригинал): массив masload не сдвигается — если кого-то высадить
        // не удалось, счётчик и индексы перестают совпадать.
        for (i = 1; i <= j; i++) {
          event2.x = this.x; event2.y = this.y;
          event2.komu = this.masload[i];
          event2.mov = false;
          this.message(this.masload[i], event2);
          if (event2.mov) this.kolload = b8(this.kolload - 1);
        }
      }
      break;
    case cmoneunload:
      if (this.tip === 35 && this.kolload > 0 && !this.died) {
        event2.watch = cmevent;
        event2.code = cmunload2;
        event2.x = this.x; event2.y = this.y;
        event2.komu = this.masload[this.kolload];
        event2.mov = false;
        this.message(this.masload[this.kolload], event2);
        if (event2.mov) this.kolload = b8(this.kolload - 1);
      }
      break;
    case cmunload2:
      if (event.komu === this) {
        ff = false;
        var ex = event.x, ey = event.y, v = gp(ex, ey, 0);
        if (v === 0 || v === 3 || v === 4) {
          ff = true;
          this.x = ex;
          this.y = ey;
        } else {
          for (i = ex - 1; i <= ex + 1; i++)
            for (j = ey - 1; j <= ey + 1; j++) {
              v = gp(i, j, 0);
              if (v === 0 || v === 3 || v === 4) {
                ff = true;
                this.x = i;
                this.y = j;
              }
            }
        }
        if (ff) {
          this.newx = this.x;
          this.newy = this.y;
          sp(this.x, this.y, 0, this.tip);
          this.load[1] = false;
          event.mov = true;
          pereris[0] = true;
          pereris[1] = true;
        }
      }
      break;
    case cmload2:
      if (this.gr === 0 && this.race === 0 && event.komu === this) {
        if (this.moving) {
          this.moving = false;
          this.newx = this.x; this.newy = this.y;
        }
        this.sost = 3;
        sp(this.x, this.y, 0, 0);
        sp(this.oldx, this.oldy, 0, 0);
        this.load[1] = true;
        event.otkogo = this;

        if (this.chrono && this.select === 1 && chronocur) chronocur = false;

        if (this.select === 1) {
          event2.watch = cmevent;
          event2.code = cminserttovibor;
          event2.otkogo = this;
          event2.tip = this.tip;
          this.message(mytank, event2);
        }

        event2.watch = cmevent;
        event2.code = cmiamdied;
        event2.otkogo = this;
        if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyrobot, enemyair, enemyturret]);
        if (this.race === 1) notifyDied(this, event2, 1, [vibortank, mytank, myrobot, viborrobot, viborair, myair, myturret]);
        this.message(rocet, event2);
        this.message(deleting, event2);

        setwsize(0, 0, 640, 480);
        putpixel(radarx + this.oldx, radary + this.oldy, diedcolor);
        putpixel(radarx + this.x, radary + this.y, diedcolor);
        setactivepage(1 - page);
        putpixel(radarx + this.oldx, radary + this.oldy, diedcolor);
        putpixel(radarx + this.x, radary + this.y, diedcolor);
        setactivepage(page);
        setwsize(0, 0, 520, 480);
        pereris[0] = true;
        pereris[1] = true;
      }
      break;
    case cmload:
      if (this.race === 0 && this.gr === 0 && this.x === event.x && event.y === this.y)
        event.otkogo = this;
      break;
    case cmchrono:
      if (!this.died) {
        this.flagradar[0] = true;
        this.flagradar[1] = true;
        putpixel(radarx + this.x, radary + this.y, diedcolor);
        setactivepage(1 - page);
        putpixel(radarx + this.x, radary + this.y, diedcolor);
        setactivepage(page);
        sp(this.oldx, this.oldy, 0, 0);
        sp(this.x, this.y, 0, 0);
        this.x = event.x;
        this.y = event.y;
        this.oldx = this.x; this.oldy = this.y;
        this.newx = this.x; this.newy = this.y;
        sp(this.x, this.y, 0, this.tip);
        this.attack = false;
        this.target = null;
        pereris[0] = true;
        pereris[1] = true;
        chronocur = false;
        this.energy = 0;
        event2.watch = cmevent;
        event2.code = cmiamdied;
        event2.otkogo = this;
        if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyrobot, enemyair, enemyturret]);
        if (this.race === 1) notifyDied(this, event2, 1, [vibortank, mytank, viborair, myair, myturret]);
        this.message(rocet, event2);
        this.message(deleting, event2);
        flagchrono = true;
        this.chron[0] = 1;
        this.chron[1] = 1;
        this.chron[2] = 1;
        event2.watch = cmevent;
        event2.code = cmpal;
        event2.pow = 0;
        this.message(palet, event2);
      }
      break;
    case cmfire:
      if (this.cloack || this.chrono) {
        if (this.timeinc > 0) this.timeinc--;
        else {
          this.timeinc = time12;
          if (this.flagcloack) {
            if (this.energy > 0) this.energy--;
            else this.flagcloack = false;
          } else if (this.energy < this.energy1) this.energy++;
        }
      }
      // Так задумано: подбитый невидимка дымит и после того, как скрылся
      // (его можно выследить по дыму), а техника дымит и во время взрыва.
      if (this.flagsmoke === 1 && !this.load[1]) {
        if (this.timesmoke > 0) this.timesmoke--;
        else {
          this.timesmoke = time9;
          event2.watch = cmevent;
          event2.code = cmsmoke;
          event2.pow = 1;
          event2.tm2 = time8;
          event2.tip = this.tip;
          event2.ang = this.angle;
          event2.mvx = this.gr;  // под/над деревьями
          event2.mvy = 0;        // тип дыма
          event2.x = this.x * 40 + this.movex * this.step + idiv(this.sizex, 2) + this.sprx - this.ramkax;
          event2.y = this.movey * this.step + this.y * 40 + idiv(this.sizey, 2) - this.kkk + this.spry - this.ramkay;
          if (this.tip === 35) { event2.x = event2.x + 5; event2.y = event2.y - 5; }
          if (inR(this.tip, 24, 25) || inR(this.tip, 65, 66)) { event2.x = event2.x - 5; event2.y = event2.y - 8; }
          if (this.tip === 27) { event2.x = event2.x - 5; event2.y = event2.y - 9; }
          if (this.tip === 29) { event2.x = event2.x - 6; event2.y = event2.y - 9; }
          this.message(desk, event2);
        }
      }
      break;
    case cmattack3:
      if (this.sostway !== 255 && !this.patr && this.race === 1) {
        this.newx = event.komu.x;
        this.newy = event.komu.y;
        this.moving = true;
        this.sost = 3;
        this.sostway = 100;
      }
      break;
    case cmattack4:
      if (this.sostway !== 255 && !this.patr && this.race === 1) {
        this.newx = event.x;
        this.newy = event.y;
        this.moving = true;
        this.sost = 3;
        this.sostway = 100;
      }
      break;
    case cmfreeharv:
      if (this.race === 1 && this.tip === 66 && this.builder === null) {
        event.pow = event.pow + 1;
        this.builder = event.otkogo;
        this.sost = 2;
      }
      break;
    case cmunbuilder:
      if (this.tip === 66 && this.builder === event.otkogo) {
        this.builder = null;
        this.sost = 3;
      }
      break;
    case cmnewgo2:
      if ((!inSet(this.sostway, [255, 100, 99]) && !this.patr) || (this.tip === 67 && !notiberium) &&
          !inSet(this.tip, [65, 66])) {
        this.newx = event.newx;
        this.newy = event.newy;
        this.sostway = 255;
        if (this.tip === 67) {
          this.newx = this.newx + 2;
          this.newy = this.newy + 5;
          var v3 = gp3(this.newx, this.newy, 0);
          if (!(v3 === 0 || v3 === 3 || v3 === 4)) {
            var v0 = gp(this.newx, this.newy, 0);
            if (!(v0 === 0 || v0 === 3 || v0 === 4)) sp(this.newx, this.newy, 0, 0);
            sp3(this.newx, this.newy, 0, 0);
          }
        }
      }
      break;
    case cmundefen:
      if (this.defender || this.step === 0) {
        this.defender = false;
        this.defenhouse = null;
        if (this.step !== 0) this.sostway = 0;
      }
      break;
    case cmattack2:
      if (this.race === 1 && this.step !== 0 && event.otkogo === this.defenhouse) {
        if (event.ground === this.tipattack || this.tipattack === 2) {
          this.attack = true;
          this.tiptar = event.ground;
          this.target = event.komu;
          this.tarx = event.komu.x * 40;
          this.tary = event.komu.y * 40;
          if (this.step !== 0 && rasst(this.x * 40, this.y * 40, this.tarx, this.tary) > this.distance) {
            this.newx = event.komu.x;
            this.newy = event.komu.y;
            this.moving = true;
            this.sost = 3;
          }
        }
      }
      break;
    case cmiamdied:
      if (this.tip === 35 && this.load[0]) {
        if (this.masload2[1] === event.otkogo) {
          this.load[0] = false;
          this.newx = this.x; this.newy = this.y;
        }
      }
      if (event.otkogo === this.defenhouse) this.defenhouse = null;
      if (this.attack && event.otkogo === this.target) {
        this.attack = false;
        this.target = null;
        if (this.moving === true && this.step !== 0) {
          this.newx = this.x + round(r48(this.movex / 10)); this.newy = this.y + round(r48(this.movey / 10));
          this.flagac[0] = 2;
          this.pag = page;
        }
        if (this.race === 1 && this.defenhouse !== null && this.step !== 0) {
          this.newx = this.defenhouse.x;
          this.newy = this.defenhouse.y;
        }
        if (!inSet(this.sostway, [255, 100]) && this.race === 1 && !inSet(this.tip, [65, 66])) {
          this.sostway = b8(this.sostway + 1);
          if (this.sostway > 4) this.sostway = 0;
          this.moving = true;
        }
        if (this.sostway === 100 && this.race === 1) {
          this.sostway = 100;
          event2.watch = cmevent;
          event2.code = cmgetkoord;
          this.message(desk, event2);
          this.newx = event2.x;
          this.newy = event2.y;
        }
        return;
      }
      break;
    case cmcloack:
      if (this.cloack && (this.energy > 25 || this.flagcloack)) {
        this.flagradar[0] = true;
        this.flagradar[1] = true;
        if (!this.flagcloack) this.energy = this.energy - 25;
        this.flagcloack = !this.flagcloack;
        if (this.flagcloack) {
          event2.watch = cmevent;
          event2.code = cmunattack;
          event2.otkogo = this;
          if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyair, enemyturret]);
          if (this.race === 1) notifyDied(this, event2, 1, [mytank, myair, vibortank, viborair, myturret]);
        }
      }
      break;
    case cmunattack:
      if (event.otkogo === this.target) {
        this.attack = false;
        this.target = null;
      }
      break;
    case cmunrepair:
      this.repair = null;
      if (this.gr === 0) {
        this.newy = this.y + 1;
        this.sost = 3;
        this.repair = null;
      }
      if (this.sost === 11 && this.gr === 1) {
        this.repair = null;
        this.flagsost = true;
        this.flagk = 2;
        this.newy = this.y + 1;
      }
      break;
    case cmincpower:
      if (this.repair === event.otkogo && this.repair !== null &&
          ((this.sost === 11 && ((this.gr === 1 && this.kkk === 0) || this.gr === 0)) ||
           (this.sost === 10 && this.gr === 0 && this.x === this.newx && this.y === this.newy)) &&
          this.power < this.power1) {
        this.power++;
        if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
        else this.flagsmoke = 0;
      }
      if (this.repair === event.otkogo && this.repair !== null && (this.sost === 10 || this.sost === 11))
        event.code = cmitiswho;
      if (this.power === this.power1 && this.gr === 0) {
        this.newy = this.y + 1;
        this.sost = 3;
        this.repair = null;
      }
      if (this.power === this.power1 && this.sost === 11 && this.gr === 1) {
        this.flagsost = true;
        this.flagk = 2;
        this.newy = this.y + 1;
        this.repair = null;
      }
      break;
    case cmgroup:
      this.gruppa[event.tip] = true;
      break;
    case cmungroup:
      this.gruppa[event.tip] = false;
      break;
    case cmtogroup:
      if (this.gruppa[event.tip] && !this.died) {
        this.select = 0;
        event2.watch = cmevent;
        event2.code = cminserttovibor;
        event2.otkogo = this;
        event2.tip = this.tip;
        this.message(this.owner, event2);
      }
      break;
    case cmradar:
      if (!this.moving && event.x === this.x && event.y === this.y && this.gr === 1) {
        this.flagradar[0] = true;
        this.flagradar[1] = true;
      }
      break;
    case cmgetxy:
      if (event.komu === this) {
        event.x = this.x; event.y = this.y;
        event.ground = this.gr;
        event.mov = false;
        if (this.flagcloack) {
          event2.watch = cmevent;
          event2.code = cmiamcloack;
          event2.x = this.x;
          event2.y = this.y;
          event2.mov = true;
          if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyair, enemyturret]);
          if (this.race === 1) notifyDied(this, event2, 1, [mytank, myair, vibortank, viborair, myturret]);
          event.mov = event2.mov;
        }
        return;
      }
      break;
    case cmiamcloack:
      if (this.detector) {
        if (rasst(this.x * 40, this.y * 40, event.x * 40, event.y * 40) <= this.distance) {
          event.mov = false;
          event.code = cmitiswho;
        }
      }
      break;
    case cmwho:
      if (this.angle !== 25 && !this.load[1] && !this.died && this.itisi(event.x, event.y)) {
        if (this.chrono && this.select === 1 && this.energy === this.energy1) {
          oldcursor = cursor;
          cursor = 5;
          setcursor(cursor);
          chronocur = true;
        }
        if (!desk.remont) {
          event2.mov = false;
          if (this.race === 1 && this.flagcloack) {
            event2.watch = cmevent;
            event2.code = cmiamcloack;
            event2.x = this.x;
            event2.y = this.y;
            event2.mov = true;
            notifyDied(this, event2, 0, [mytank, myrobot, myair, vibortank, viborair, viborrobot, myturret]);
          }
          if (!event2.mov) {
            event.watch = cmevent;
            event.otkogo = this;
            event.tip = this.tip;
            event.ground = this.gr;
            event.code = cmitiswho;
          }
        } else {
          this.remont = !this.remont;
        }
      }
      break;
    case cmwho2:
      if (!this.died && !this.load[1] && this.x === event.x && this.y === event.y && this.race === event.ras) {
        if (this.flagcloack) {
          event2.watch = cmevent;
          event2.code = cmiamcloack;
          event2.x = this.x;
          event2.y = this.y;
          event2.mov = true;
          if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyair, enemyturret, enemyrobot]);
          if (this.race === 1) notifyDied(this, event2, 1, [mytank, myrobot, viborrobot, myair, vibortank, viborair, myturret]);
        }
        if (!this.flagcloack || event.pow === 111 || !event2.mov) {
          event.watch = cmevent;
          event.otkogo = this;
          event.tip = this.tip;
          event.code = cmitiswho;
        }
      }
      break;
    case cmnewgo:
      if (this.step !== 0 && !(this.sost === 2 && this.pousetime !== pouse)) {
        if (event.newx <= 520) {
          this.load[0] = false;
          this.oldnewx = this.newx;
          this.oldnewy = this.newy;
          this.newx = idiv(event.newx, 40) + polex;
          this.newy = idiv(event.newy, 40) + poley;
          if (!(this.sost === 10 || this.sost === 11)) this.sost = 3;

          if (this.select === 1 && this.tip === 35 && this.kolload < maxload &&
              inR(gp(this.newx, this.newy, 0), 23, 29) && viborair.elem === viborair.last) {
            this.load[0] = true;
            event2.watch = cmevent;
            event2.code = cmload;
            event2.x = this.newx;
            event2.y = this.newy;
            event2.otkogo = this;
            this.message(mytank, event2);
            this.message(myrobot, event2);
            this.masload2[1] = event2.otkogo;
            this.newx = event2.x; this.newy = event2.y;
            this.moving = true;
          }
          if (inR(this.tip, 24, 25) && (gp(this.newx, this.newy, this.gr) === 112 || gp(this.newx, this.newy, this.gr) === 200)) {
            event2.x = this.newx; event2.y = this.newy;
            event2.watch = cmevent;
            event2.code = cmwho2;
            event2.ras = this.race;
            event2.pow = 0;
            this.message(myhouse, event2);
            if (event2.code === cmitiswho) {
              this.newx = event2.newx;
              this.newy = event2.newy;
              this.sxx = b8(event2.sx);
              this.syy = b8(event2.sy);
              if (event2.tip === 112) {
                this.repair = null;
                this.sost = 2;
                this.builder = event2.otkogo;
              }
            }
          }
          var vv = gp(this.newx, this.newy, 0);
          if (vv === 116 || vv === 205) {
            if (this.power < this.power1) {
              if (this.sost !== 10 && this.sost !== 11) {
                event2.x = this.newx; event2.y = this.newy;
                event2.watch = cmevent;
                event2.code = cmwho2;
                event2.pow = 111;
                event2.ras = this.race;
                event2.otkogo = this;
                this.message(myhouse, event2);
              } else {
                ff = true;
                this.newx = this.oldnewx; this.newy = this.oldnewy;
              }
              if (event2.code === cmitiswho) {
                ff = true;
                this.newx = this.oldnewx; this.newy = this.oldnewy;
              }
              if (event2.code === cmitiswho && event2.pow === 123) {
                this.newx = event2.newx + 1;
                this.newy = event2.newy;
                this.repair = event2.otkogo;
                this.attack = false;
                this.target = null;
                this.sost = 10;
              }
            } else {
              ff = true;
              this.newx = this.oldnewx; this.newy = this.oldnewy;
            }
          }
          if ((this.sost === 10 || this.sost === 11) && !ff) {
            this.repair = null;
            this.flagsost = true;
            this.flagk = 2;
            if (this.sost === 10) this.sost = 3;
          }
        } else {
          if (event.newx > radarx && event.newx < radarx + maxx && event.newy > radary && event.newy < radary + maxy) {
            this.newx = event.newx - radarx;
            this.newy = event.newy - radary;
            if (!(this.sost === 10 || this.sost === 11)) this.sost = 3;
            if (this.sost === 10 || this.sost === 11) {
              this.flagsost = true;
              this.repair = null;
              this.flagk = 2;
              if (this.owner === mytank || this.owner === vibortank) this.sost = 3;
            }
          }
        }
        if (!flaggo) {
          flaggo = true;
          this.moving = true;
        }
        this.target = null;
        this.attack = false;
      }
      break;
  }
};

TTech.prototype.init = function () {
  TObject.prototype.init.call(this);
  this.chrono = this.tip === 27;
  return this;
};
TTech.prototype.init2 = function () { TObject.prototype.init2.call(this); return this; };
TTech.prototype.done = function () { TObject.prototype.done.call(this); };
TTech.prototype.show = function () { TObject.prototype.show.call(this); };

// направления для обхода препятствий (общие для Go)
// aaa: при dx=dy=0 ни одно условие не срабатывает, и функция возвращает
// неинициализированную переменную. При {$S+} её место на стеке совпадает с
// адресом возврата из StackCheck — это всегда «большое» число, поэтому
// дальнейший перебор направлений ничего не находит и юнит стоит на месте.
var DIR_GARBAGE = 1000;
function dirNum(dx, dy) {
  var n = DIR_GARBAGE;
  if (dx === 1 && dy === 0) n = 0;
  if (dx === 1 && dy === -1) n = 1;
  if (dx === 0 && dy === -1) n = 2;
  if (dx === -1 && dy === -1) n = 3;
  if (dx === -1 && dy === 0) n = 4;
  if (dx === -1 && dy === 1) n = 5;
  if (dx === 0 && dy === 1) n = 6;
  if (dx === 1 && dy === 1) n = 7;
  return n;
}
var DIRS = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];

// ================================= tAir ======================================
function TAir() {}
TAir.prototype = Object.create(TTech.prototype);
TAir.prototype.constructor = TAir;
TAir.prototype.SIZE = 242;
TAir.prototype.zero = function () {
  TTech.prototype.zero.call(this);
  this.gotime2 = 0; this.kolstep = 0; this.timetobomb = 0; this.flagbomb = false;
};
TAir.prototype.save = function () {
  TTech.prototype.save.call(this);
  savefile.i16(this.gotime2); savefile.u8(this.kolstep); savefile.u8(this.timetobomb); savefile.bool(this.flagbomb);
};
TAir.prototype.load2 = function () {
  TTech.prototype.load2.call(this);
  this.gotime2 = loadfile.i16(); this.kolstep = loadfile.u8(); this.timetobomb = loadfile.u8(); this.flagbomb = loadfile.bool();
};

TAir.prototype.handleevent = function (event) {
  var i, j, tar, event2 = new TEvent(), fnew, p;
  sp2(this.x, this.y - 1, 1);
  sp2(this.x, this.y, 1);
  if (this.moving || this.died || inSet(this.tip, [31, 77, 35])) modifpole2(this.x, this.y, this.tip);
  if (this.race === 1 && this.flagcloack) {
    event2.mov = false;
    if (this.race === 1 && this.flagcloack) {
      event2.watch = cmevent;
      event2.code = cmiamcloack;
      event2.x = this.x;
      event2.y = this.y;
      event2.mov = true;
      notifyDied(this, event2, 0, [mytank, myair, vibortank, viborair, myturret]);
    }
    if (this.oldradar !== event2.mov) {
      this.oldradar = event2.mov;
      this.flagradar[0] = true;
      this.flagradar[1] = true;
    }
  }

  if (event.watch === cmevent && event.code === cmfire && this.flagradar[page]) {
    this.flagradar[page] = false;
    setwsize(0, 0, 640, 480);
    var v;
    if (this.died) {
      v = gp(this.x, this.y, 0);
      if (v === 0 || v === 3 || v === 4) putpixel(radarx + this.x, radary + this.y, diedcolor);
      else if (inSet(v, [2, 5, 6, 12])) putpixel(radarx + this.x, radary + this.y, 103);
      else if (inSet(v, [11, 8, 9, 1, 7, 233])) putpixel(radarx + this.x, radary + this.y, 59);
      else if (inSet(v, [10, 255, 254])) putpixel(radarx + this.x, radary + this.y, moneycolor);
      else if (inR(v, 50, 80) || inR(v, 121, 130) || v === 201 || v === 206) putpixel(radarx + this.x, radary + this.y, enemycolor);
      else if (inR(v, 23, 29) || inR(v, 100, 119) || v === 200 || v === 205) putpixel(radarx + this.x, radary + this.y, mycolor);
    }
    v = gp(this.oldx, this.oldy, 0);
    if (v === 0 || v === 3 || v === 4) putpixel(radarx + this.oldx, radary + this.oldy, diedcolor);
    else if (inSet(v, [2, 5, 6, 12])) putpixel(radarx + this.oldx, radary + this.oldy, 103);
    else if (inSet(v, [11, 8, 9, 1, 7, 233])) putpixel(radarx + this.oldx, radary + this.oldy, 59);
    else if (inSet(v, [10, 254, 255])) putpixel(radarx + this.oldx, radary + this.oldy, moneycolor);
    else if (inR(v, 70, 71) || inR(v, 121, 130) || v === 201 || v === 206) putpixel(radarx + this.oldx, radary + this.oldy, enemycolor);
    else if (inR(v, 100, 119) || v === 200 || v === 205) putpixel(radarx + this.oldx, radary + this.oldy, mycolor);
    if (this.race === 1 && (inR(v, 23, 29) || inR(v, 40, 41))) putpixel(radarx + this.oldx, radary + this.oldy, mycolor);
    if (this.race === 0 && (inR(v, 60, 67) || inR(v, 70, 71))) putpixel(radarx + this.oldx, radary + this.oldy, enemycolor);
    event2.mov = false;
    if (this.flagcloack && this.race === 1) {
      event2.watch = cmevent;
      event2.code = cmiamcloack;
      event2.x = this.x;
      event2.y = this.y;
      event2.mov = true;
      notifyDied(this, event2, 0, [mytank, myair, vibortank, viborair, myturret]);
    }
    if (event2.mov) this.select = 0;
    if (!this.died && !event2.mov) putpixel(radarx + this.x, radary + this.y, this.color);
    setwsize(0, 0, 520, 480);
  }
  if (this.flagac[0] !== 0) {
    if (this.flagac[0] === 2) modifpole2(this.x, this.y, this.tip);
    if (this.flagac[0] === 1) sp2(this.x, this.y - 1, 1);
    if (this.pag !== page) this.flagac[0] = 0;
  }
  if (gp(this.x, this.y, 1) === 0 && !this.died) sp(this.x, this.y, 1, this.tip);

  if (this.x === this.newx && this.y === this.newy && !this.moving && this.sost === 10 && this.maxk !== kkkk) {
    this.maxk = kkkk;
    this.kkk = kkkk;
    this.flagk = 1;
    this.sost = 11;
  }
  if (event.watch === cmevent && event.code === cmfire &&
      ((this.flagk !== 0 && !this.attack && this.x === this.newx && this.y === this.newy && !this.moving) || this.sost === 11)) {
    if (this.ktime > 0) this.ktime--;
    else {
      if (this.kkk === this.oldk && this.flagsost) {
        this.sost = 3;
        this.maxk = 1;
        this.flagsost = false;
      }
      this.ktime = kkktime;
      if (inSet(this.tip, [31, 77])) this.ktime = kkktime2;
      if (this.sost === 11) this.ktime = kkktime3;
      if (this.flagk === 1) {
        if (this.kkk > this.oldk - this.maxk) this.kkk--;
        else {
          if (this.sost !== 11) this.flagk = 2;
        }
      }
      if (this.flagk === 2) {
        if (this.kkk < this.oldk + this.maxk) this.kkk++;
        else {
          this.flagk = 1;
          this.kkk--;
        }
      }
    }
  }
  if ((this.x !== this.newx || this.y !== this.newy) && !this.moving && !flaggo2) {
    this.moving = true;
    flaggo2 = true;
  }
  if (this.died && event.watch === cmevent && event.code === cmfire) {
    if (this.phase === 0) {
      this.flagcloack = false;
      if (this.defenhouse !== null) {
        if (this.step !== 0) {
          event2.watch = cmevent;
          event2.code = cmdecdefen;
          event2.pow = this.gr;
          this.message(this.defenhouse, event2);
        }
        this.defenhouse = null;
      }
      if (this.repair !== null) {
        event2.watch = cmevent;
        event2.code = cmunrepair;
        this.message(this.repair, event2);
        this.repair = null;
      }
      sp(this.x, this.y, 1, 0);
      sp(this.oldx, this.oldy, 1, 0);
      if (this.movex > 0 && this.movey === 0) sp(this.x + 1, this.y, 1, 0);
      if (this.movey > 0 && this.movex === 0) sp(this.x, this.y + 1, 1, 0);
      if (this.movex < 0 && this.movey === 0) sp(this.x - 1, this.y, 1, 0);
      if (this.movey < 0 && this.movex === 0) sp(this.x, this.y - 1, 1, 0);
      if (this.movex < 0 && this.movey < 0) sp(this.x - 1, this.y - 1, 1, 0);
      if (this.movex > 0 && this.movey > 0) sp(this.x + 1, this.y + 1, 1, 0);
      if (this.movex < 0 && this.movey > 0) sp(this.x - 1, this.y + 1, 1, 0);
      if (this.movex > 0 && this.movey < 0) sp(this.x + 1, this.y - 1, 1, 0);
      this.select = 0;
    }
    if (this.timephase > 0) this.timephase--;
    else {
      this.timephase = 1;
      modifpole2(this.x, this.y, this.tip);
      if (this.phase <= this.maxphase) this.angle = this.phase;
      else this.angle = 25;
      if (this.phase === this.maxphase + 2) {
        event2.watch = cmevent;
        event2.otkogo = this;
        event2.code = cmdel;
        this.message(this.owner, event2);
        event2.watch = cmnothing;
      }
      this.phase = b8(this.phase + 1);
    }
  }

  if (event.watch === cmevent) {
    switch (event.code) {
      case cmunselect:
        if (this.select === 1) {
          this.select = 0;
          modifpole2(this.x, this.y, this.tip);
          fff = true;
          this.flagac[0] = 2;
          this.pag = page;
        }
        break;
      case cmattack:
        if (event.ground === this.tipattack || this.tipattack === 2) {
          event2.watch = cmevent;
          event2.code = cmgetxy;
          event2.komu = event.otkogo;
          event2.mov = false;
          this.message(event.otkogo, event2);
          if (!event2.mov) {
            this.attack = true;
            this.tiptar = event.ground;
            this.target = event.otkogo;
            this.tarx = event2.x * 40;
            this.tary = event2.y * 40;
            if (rasst(this.x * 40, this.y * 40, event.otkogo.x * 40, event.otkogo.y * 40) > this.distance) {
              this.newx = event.otkogo.x;
              this.newy = event.otkogo.y;
              this.moving = true;
            }
          }
        } else {
          this.newx = event.otkogo.x;
          this.newy = event.otkogo.y;
          this.moving = true;
        }
        break;
      case cmdecpower:
        if (event.tip === 1 && event.komu === this && !this.died) {
          var ot = event.otkogo;
          fnew = false;
          // (A) or (B and C) — в Паскале and связывает сильнее, чем or
          if ((this.x === this.newx && this.y === this.newy) ||
              ((this.sostway !== 255 && this.race === 1) && (this.attack === false || this.sostway === 100)))
            fnew = true;
          if (this.attack && this.target !== null && !fnew && this.step === 0) {
            event2.watch = cmevent;
            event2.code = cmgetxy;
            event2.komu = this.target;
            this.message(this.target, event2);
            if (!event2.mov && rasst(this.x * 40, this.y * 40, event2.x * 40, event2.y * 40) > this.distance)
              fnew = true;
          }
          if (fnew) {
            // В оригинале otkogo^.gr читается раньше проверки otkogo<>nil
            if (ot !== null && (ot.gr === this.tipattack || this.tipattack === 2) &&
                !ot.flagcloack && !this.attack) {
              this.target = ot;
              this.attack = true;
              this.tiptar = ot.gr;
              this.tarx = ot.x * 40;
              this.tary = ot.y * 40;
              if (rasst(this.x * 40, this.y * 40, ot.x * 40, ot.y * 40) > this.distance) {
                this.newx = ot.x;
                this.newy = ot.y;
                this.moving = true;
              }
            }
          }
          if (this.power - event.pow > 0) {
            this.power = this.power - event.pow;
            if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
            else this.flagsmoke = 0;
            if (this.race === 1 && this.cloack && this.energy > 25) {
              event2.watch = cmevent;
              event2.code = cmiamcloack;
              event2.x = this.x;
              event2.y = this.y;
              event2.mov = true;
              notifyDied(this, event2, 0, [mytank, myair, vibortank, viborair, myturret]);
              this.flagcloack = true;
              if (event2.mov) this.select = 0;
            }
            this.flagradar[0] = true;
            this.flagradar[1] = true;
          } else {
            if (flagplay > 250) flagplay = 250;
            if (this.race === 1 && this.step !== 0) {
              if (this.defenhouse !== null) kolair++;
              if (this.patr) {
                patrol[1] = true;
                kolpatrol[1]++;
              }
            }
            event2.watch = cmevent;
            event2.code = cmiamdied;
            event2.otkogo = this;
            if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyair, enemyturret]);
            if (this.race === 1) notifyDied(this, event2, 1, [vibortank, mytank, viborair, myair, myturret]);
            this.message(rocet, event2);
            this.message(deleting, event2);
            if (this.kolload > 0) {
              event2.watch = cmevent;
              event2.code = cmyoudied;
              for (i = 1; i <= this.kolload; i++) {
                event2.komu = this.masload[i];
                this.message(this.masload[i], event2);
              }
            }
            this.flagradar[0] = true;
            this.flagradar[1] = true;
            this.attack = false;
            this.died = true;
            this.oldtip = this.tip;
            if (this.tip === 31 || this.tip === 77) {
              this.tip = 46;
              this.maxphase = 8;
            } else {
              this.tip = 47;
              this.maxphase = 11;
            }
            return;
          }
          event.watch = cmnothing;
        }
        break;
      case cmfire:
        // (бомбардировщик tip=36 в оригинале закомментирован)
        if (this.sost !== 11 && this.moving && this.step !== 0 && !this.died) this.go();
        if (!this.died && this.owner !== deleting) {
          if (((this.x === this.newx && this.y === this.newy && this.movex === 0 && this.movey === 0) && !this.attack) ||
              (this.sostway !== 255 &&
               (!this.attack || (this.attack && rasst(this.x * 40, this.y * 40, this.tarx, this.tary) > this.distance)))) {
            p = this.seektarget(this.x, this.y, this.distance);
            if (p !== null) {
              this.moving = false;
              this.newx = this.x; this.newy = this.y;
              event2.watch = cmevent;
              event2.code = cmgetxy;
              event2.komu = p;
              this.message(p, event2);
              this.attack = true;
              this.target = p;
              this.tiptar = event2.ground;
              this.tarx = event2.x * 40;
              this.tary = event2.y * 40;
            }
          }

          if (this.firetime > 0) this.firetime--;
          if ((!this.moving || (this.sostway !== 255 && this.race === 1)) && this.target !== null && this.attack) {
            if (rasst(this.x * 40, this.y * 40, this.tarx, this.tary) > this.distance) {
              event2.watch = cmevent;
              event2.code = cmgetxy;
              event2.komu = this.target;
              this.message(this.target, event2);
              if (!event2.mov) {
                this.newx = event2.x; this.newy = event2.y;
              } else {
                this.target = null;
                this.attack = false;
                this.newx = this.x; this.newy = this.y;
              }
              this.moving = true;
            }
          }
          if (this.attack && this.target !== null) {
            event2.watch = cmevent;
            event2.code = cmgetxy;
            event2.komu = this.target;
            this.message(this.target, event2);
            if (!event2.mov) {
              this.tarx = event2.x * 40 + 10;
              this.tary = event2.y * 40 + 10;
            } else {
              this.target = null;
              this.attack = false;
              this.newx = this.x; this.newy = this.y;
            }
          }
          if (this.attack && this.moving) {
            if (rasst(this.x * 40, this.y * 40, this.tarx, this.tary) <= this.distance) {
              this.newx = this.x; this.newy = this.y;
            } else {
              event2.watch = cmevent;
              event2.code = cmgetxy;
              event2.komu = this.target;
              this.message(this.target, event2);
              if (!event2.mov) {
                this.newx = event2.x; this.newy = event2.y;
              } else {
                this.target = null;
                this.attack = false;
                this.newx = this.x; this.newy = this.y;
              }
            }
          }
          if (this.target !== null && this.firetime === 0 && this.attack === true &&
              rasst(this.x * 40, this.y * 40, this.tarx, this.tary) <= this.distance) {
            this.firetime = this.time3;
            tar = { watch: cmkoord, x: this.tarx, y: this.tary };
            if (!this.moving || this.step === 0 || (this.sostway !== 255 && this.race === 1))
              this.angle = ang(this.x, this.y, idiv(this.tarx, 40), idiv(this.tary, 40));

            if (inSet(this.tip, [31, 77]) && flagplay > 600) flagplay = 600;
            if (inSet(this.tip, [33, 79]) && flagplay > 650) flagplay = 650;
            if (!inSet(this.tip, [31, 77]) && flagplay > 700) flagplay = 700;

            this.fireRocket(tar, -this.kkk);
          }
        }
        break;
    }
  }
  TTech.prototype.handleevent.call(this, event);
};

// выстрел: позиция снаряда зависит от направления (общий код tAir/tTank)
TTech.prototype.fireRocket = function (tar, dk) {
  var sx = this.sizex, sy = this.sizey, X = this.x * 40 + this.sprx, Y = this.spry + dk + this.y * 40, px, py;
  switch (this.angle) {
    case 0: px = X + sx; py = Y + idiv(sy, 2); break;
    case 4: px = X; py = Y + idiv(sy, 2); break;
    case 2: px = X + idiv(sx, 2); py = Y; break;
    case 6: px = X + idiv(sx, 2); py = Y + sy; break;
    case 1: px = X + sx; py = Y; break;
    case 3: px = X; py = Y; break;
    case 5: px = X; py = Y + sy; break;
    case 7: px = X + sx; py = Y + sy; break;
    default: return;
  }
  rocet.insert(New(TRocet).init(px, py, 0, 0, 5, 5, tar, this.damage, this.target, this, this.tiprocet, this.tiptar));
};

TAir.prototype.go = function () {
  var ff, xx, yy, fx, fy, i, j, num, event2 = new TEvent(), f, self = this;

  function selectgo() {
    var n, num2;
    self.dx = 0; self.dy = 0;
    if (self.newx > self.x) self.dx = 1;
    if (self.newx < self.x) self.dx = -1;
    if (self.newy > self.y) self.dy = 1;
    if (self.newy < self.y) self.dy = -1;
    if (gp(self.x + self.dx, self.y + self.dy, 1) !== 0) {
      num2 = dirNum(self.dx, self.dy);
      n = 0;
      do {
        num2++; n++;
        if (num2 === 8) num2 = 0;
        if (num2 >= 0 && num2 <= 7) { self.dx = DIRS[num2][0]; self.dy = DIRS[num2][1]; }
        if (self.x + self.dx > maxx || self.y + self.dy > maxy || self.y + self.dy < 0 || self.x + self.dx < 0) {
          self.dx = 0; self.dy = 0;
        }
      } while (!(gp(self.x + self.dx, self.y + self.dy, 1) === 0 || n === 8));
      if (n === 8 && gp(self.x + self.dx, self.y + self.dy, 1) !== 0) {
        self.dx = 0; self.dy = 0;
      }
    }
  }

  if (this.newx < 0 || this.newx > maxx || this.newy < 0 || this.newy > maxy) {
    this.newx = this.x;
    this.newy = this.y;
    sound(100);
    delay(100);
    nosound();
  }
  if (gp(this.newx, this.newy, 1) !== 0 && this.sost !== 10 && this.sost !== 11 &&
      !(this.x === this.newx && this.y === this.newy) && this.dx === 0 && this.dy === 0 && !this.attack) {
    f = false;
    xx = this.newx; yy = this.newy;
    for (i = xx - 1; i <= xx + 1; i++)
      for (j = yy + 1; j >= yy - 1; j--)
        if (i > 0 && j > 0 && i < maxx && j < maxy) {
          if (gp(i, j, 1) === 0) {
            this.newx = i; this.newy = j; f = true;
          }
        }
    if (!f) {
      this.newx = this.x + idiv(this.movex, idiv(40, this.step));
      this.newy = this.y + idiv(this.movey, idiv(40, this.step));
    }
  }

  if (this.x === this.newx && this.y === this.newy && this.movex === 0 && this.movey === 0) {
    if (this.load[0]) {
      this.load[0] = false;
      event2.watch = cmevent;
      event2.code = cmload2;
      event2.komu = this.masload2[1];
      this.message(mytank, event2);
      this.message(vibortank, event2);
      this.message(myrobot, event2);
      this.message(viborrobot, event2);
      this.kolload = b8(this.kolload + 1);
      this.masload[this.kolload] = this.masload2[1];
      this.flagradar[0] = true;
      this.flagradar[1] = true;
    }
    if (!this.flag) sp(this.oldx, this.oldy, 1, 0);
    this.oldx = this.x; this.oldy = this.y;
    this.gotime2 = time7;
    this.kolstep = kolst;
    if (inSet(this.sostway, [255, 100, 99]) || this.race === 0) this.moving = false;
    else if (!this.attack && this.race === 1) {
      this.newx = way[this.sostway][0];
      this.newy = way[this.sostway][1];
      this.sostway = b8(this.sostway + 1);
      if (this.sostway > 4) this.sostway = 0;
    }
    this.flag = false;
    fff = false;
    return;
  }
  fff = true;
  if (this.kolstep > 0) this.kolstep--;
  if (this.gotime > 0) this.gotime--;
  else {
    fx = 2; fy = 2; ff = 0;
    if (this.gotime2 > this.time2) {
      this.gotime = b8(this.gotime2);
      if (this.kolstep === 0) {
        this.gotime2--;
        this.kolstep = kolst;
      }
    } else this.gotime = this.time2;

    if (this.movex === 0 && this.movey === 0) {
      if ((!this.flag && this.x !== this.oldx) || this.y !== this.oldy)
        sp(this.oldx, this.oldy, 1, 0);
      selectgo();
      sp(this.x + this.dx, this.y + this.dy, 1, this.tip);
      this.oldx = this.x; this.oldy = this.y;
    }
    this.stepMove();
    fx = this._fx; fy = this._fy;
    if (fx === 0) this.angle = 4;
    if (fx === 1) this.angle = 0;
    if (fy === 0) this.angle = 6;
    if (fy === 1) this.angle = 2;
    if (fx === 0 && fy === 0) this.angle = 5;
    if (fx === 0 && fy === 1) this.angle = 3;
    if (fx === 1 && fy === 0) this.angle = 7;
    if (fx === 1 && fy === 1) this.angle = 1;
  }
  if (this.load[0]) {
    event2.watch = cmevent;
    event2.code = cmgetxy;
    event2.komu = this.masload2[1];
    this.message(this.masload2[1], event2);
    this.newx = event2.x;
    this.newy = event2.y;
    this.moving = true;
  }
};

// шаг по клетке (одинаковый у tAir.Go и tRobot.Go)
TTech.prototype.stepMove = function () {
  var fx = 2, fy = 2, s = this.step;
  if (this.dx === 1) {
    fx = 1;
    if (this.movex < 20 / s - 1) this.movex++;
    else {
      this.oldx = this.x;
      this.x++; this.dx = 0;
      this.flagradar[0] = true; this.flagradar[1] = true;
      this.movex = idiv(-20, s);
    }
  }
  if (this.dx === -1) {
    fx = 0;
    if (this.movex > -20 / s + 1) this.movex--;
    else {
      this.oldx = this.x;
      this.x--; this.dx = 0;
      this.flagradar[0] = true; this.flagradar[1] = true;
      this.movex = idiv(20, s);
    }
  }
  if (this.dy === 1) {
    fy = 0;
    if (this.movey < 20 / s - 1) this.movey++;
    else {
      this.oldy = this.y;
      this.y++; this.dy = 0;
      this.flagradar[0] = true; this.flagradar[1] = true;
      this.movey = idiv(-20, s);
    }
  }
  if (this.dy === -1) {
    fy = 1;
    if (this.movey > -20 / s + 1) this.movey--;
    else {
      this.oldy = this.y;
      this.y--; this.dy = 0;
      this.flagradar[0] = true; this.flagradar[1] = true;
      this.movey = idiv(20, s);
    }
  }
  if (this.dx === 0 && this.dy === 0) {
    if (this.movey > 0) this.movey--;
    if (this.movey < 0) this.movey++;
    if (this.movex > 0) this.movex--;
    if (this.movex < 0) this.movex++;
  }
  this._fx = fx; this._fy = fy;
};

TAir.prototype.show = function () { TTech.prototype.show.call(this); };
TAir.prototype.init2 = function () { TTech.prototype.init2.call(this); return this; };

TAir.prototype.init = function (xx, yy, nwx, nwy, olx, oly, mvx, mvy, pow, pow1, ras, sel, tt, ang_,
                                 sx, sy, st, tm2, mov, ramx, ramy, dist, dam, ft, defhouse, sway, pat) {
  TTech.prototype.init.call(this);
  this.x = xx; this.y = yy; this.newx = nwx; this.newy = nwy;
  this.oldx = olx; this.oldy = oly;
  this.oldnewx = this.newx; this.oldnewy = this.newy;
  this.tip = tt; this.angle = ang_;
  sp(this.x, this.y, 1, this.tip);
  this.power1 = pow1; this.power = pow;
  this.sizex = sx; this.sizey = sy;
  this.movex = 0; this.movey = 0; this.moving = false;
  this.step = b8(st); this.time2 = b8(tm2);
  this.gotime = b8(tm2);
  this.gotime2 = time7;
  this.kolstep = kolst;
  this.select = sel; this.race = ras;
  this.moving = mov;
  this.flag = false;
  this.ramkax = ramx; this.ramkay = ramy;
  this.attack = false;
  this.damage = dam;
  this.distance = dist;
  this.time3 = b8(ft);
  this.firetime = this.time3;
  this.died = false;
  this.phase = 0;
  this.maxphase = 0;
  this.timephase = 0;
  this.sprx = 0; this.spry = 0;
  this.kkk = kkkk;
  this.oldk = kkkk;
  this.maxk = 1;
  this.flagk = 1;
  this.flagsost = false;
  this.ktime = kkktime;
  this.color = this.race === 0 ? mycolor : enemycolor;
  this.flagradar[0] = true;
  this.flagradar[1] = true;
  this.tipattack = 1;
  this.tiprocet = 2;
  this.gr = 1;
  this.cloack = false;
  this.flagcloack = false;
  this.detector = false;
  this.flagbomb = false;
  if (inSet(this.tip, [30, 32, 76, 78])) { this.ramkax = 4; this.ramkay = 4; }
  if (inSet(this.tip, [31, 33, 77, 79])) { this.ramkax = 2; this.ramkay = 2; }
  if (this.tip === 31 || this.tip === 77) {
    this.sizex = 75; this.sizey = 75;
    this.sprx = -19; this.spry = -20;
    this.tipattack = 2;
    this.tiprocet = 1;
    this.step = 1;
  }
  if (this.tip === 32 || this.tip === 78) this.step = 3;
  if (this.tip === 33 || this.tip === 79) {
    this.cloack = true;
    this.tipattack = 2;
    this.sizex = 36; this.sizey = 35;
    this.step = 2;
  }
  if (this.tip === 34 || this.tip === 80) {
    this.tipattack = 3;
    this.sizex = 37; this.sizey = 36;
    this.detector = true;
  }
  if (this.tip === 35) {
    this.tipattack = 3;
    this.sizex = 65;
    this.sizey = 65;
    this.sprx = -19; this.spry = -20;
    this.ramkax = 8;
    this.ramkay = 5;
  }
  if (this.tip === 36) {
    this.sizex = 39;
    this.sizey = 39;
    this.timetobomb = 0;
  }
  this.gruppa.fill(false);
  this.sost = 3;
  this.repair = null;
  this.defenhouse = defhouse;
  this.defender = defhouse !== null;
  this.sostway = 255;
  if (this.race === 0) this.sostway = 5;
  this.remont = false;
  this.remonttime = 0;
  this.sostway = sway;
  if (this.sostway !== 255 && this.race === 1) this.moving = true;
  this.patr = pat;
  this.timesmoke = 0;
  if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
  else this.flagsmoke = 0;
  this.energy = 0; this.energy1 = 0;
  if (this.tip === 33 || this.tip === 79) { this.energy = 100; this.energy1 = 200; }
  this.timeinc = time12;
  this.load[0] = false;
  this.load[1] = false;
  this.kolload = 0;
  this.chron[1] = 0;
  this.chron[2] = 0;
  return this;
};
TAir.prototype.done = function () { TTech.prototype.done.call(this); };

// ================================ tHouse =====================================
function THouse() {}
THouse.prototype = Object.create(TObject.prototype);
THouse.prototype.constructor = THouse;
THouse.prototype.SIZE = 141;
THouse.prototype.zero = function () {
  TObject.prototype.zero.call(this);
  this.active = 0; this.lenx = 0; this.leny = 0;
  this.num = 0; this.numicons = 0; this.ground = 0; this.timebuild = 0; this.timebuild2 = 0; this.tipbuild = 0;
  this.flagwait = false; this.flagbuild = 0; this.repairing = false;
  this.kolturret = {70: 0, 71: 0}; this.koldefen = [0, 0];
  this.remonttime = 0; this.flagfff = false; this.kolrefen = 0; this.timesmoke = 0; this.times = 0;
};
THouse.prototype.save = function () {
  TObject.prototype.save.call(this);
  var w = savefile;
  w.u8(this.active); w.i16(this.lenx); w.i16(this.leny); w.i16(this.num); w.i16(this.numicons);
  w.i16(this.ground); w.i16(this.timebuild); w.i16(this.timebuild2); w.i16(this.tipbuild);
  w.bool(this.flagwait); w.u8(this.flagbuild); w.bool(this.repairing);
  w.u8(this.kolturret[70]); w.u8(this.kolturret[71]); w.u8(this.koldefen[0]); w.u8(this.koldefen[1]);
  w.i16(this.remonttime); w.bool(this.flagfff); w.u8(this.kolrefen); w.u8(this.timesmoke); w.u8(this.times);
  w.i16(this.power); w.i16(this.power1);
};
THouse.prototype.load2 = function () {
  TObject.prototype.load2.call(this);
  var r = loadfile;
  this.active = r.u8(); this.lenx = r.i16(); this.leny = r.i16(); this.num = r.i16(); this.numicons = r.i16();
  this.ground = r.i16(); this.timebuild = r.i16(); this.timebuild2 = r.i16(); this.tipbuild = r.i16();
  this.flagwait = r.bool(); this.flagbuild = r.u8(); this.repairing = r.bool();
  this.kolturret[70] = r.u8(); this.kolturret[71] = r.u8(); this.koldefen[0] = r.u8(); this.koldefen[1] = r.u8();
  this.remonttime = r.i16(); this.flagfff = r.bool(); this.kolrefen = r.u8(); this.timesmoke = r.u8(); this.times = r.u8();
  this.power = r.i16(); this.power1 = r.i16();
  this.kkk = 0;
};

THouse.prototype.done = function () {
  var event2 = new TEvent();
  if (this.race === 1 && this.oldtip === 121) {
    event2.watch = cmevent;
    event2.code = cmgettip121;
    event2.tip = 121;
    event2.ras = 1;
    event2.mov = false;
    event2.otkogo = this;
    this.message(enemyhouse, event2);
    if (!event2.mov) construction = false;
  }
  if (this.oldtip === 112) notiberium = false;
  if (this.race === 0) {
    event2.watch = cmevent;
    event2.code = cmgettip121;
    event2.tip = this.oldtip;
    event2.ras = 0;
    event2.mov = false;
    this.message(myhouse, event2);
    if (!event2.mov) {
      switch (this.oldtip) {
        case 112:  // рефин
          masmyflagbuild[114] = false;
          masmyflagbuild[117] = false;
          masmyflagbuild[118] = false;
          newpanel[0] = true;
          newpanel[1] = true;
          break;
        case 113:  // самол завод
          break;
        case 115:  // электр
          masmyflagbuild[112] = false;
          newpanel[0] = true;
          newpanel[1] = true;
          break;
        case 114:  // танк завод
          masmyflagbuild[113] = false;
          masmyflagbuild[116] = false;
          newpanel[0] = true;
          newpanel[1] = true;
          break;
      }
    }
  }
  TObject.prototype.done.call(this);
};

THouse.prototype.init2 = function () { TObject.prototype.init2.call(this); return this; };

THouse.prototype.init = function (xx, yy, lenxx, lenyy, tt, r, pow, pow1) {
  var i, j, event2 = new TEvent();
  this.ramkax = 0; this.ramkay = 0;
  this.angle = 0;
  this.power = pow; this.power1 = pow1;
  this.movex = 0; this.movey = 0;
  this.race = r;
  this.x = xx; this.y = yy;
  this.oldtip = tt;
  this.tip = tt;
  this.sizey = lenyy * 40; this.sizex = lenxx * 40 - 20;
  if (this.tip !== 112) this.sizex = this.sizex + 20;
  if (this.tip === 112 || this.tip === 122) this.sizey = this.sizey + 10;
  this.sprx = 10; this.spry = 0;
  this.lenx = lenxx; this.leny = lenyy;
  if (this.tip === 121) construction = true;
  if (this.tip === 112) maxnumber[0] = b8(maxnumber[0] + 3);
  if (this.tip === 122) maxnumber[1] = b8(maxnumber[1] + 3);
  if (this.tip === 125) maxenerge[1] = maxenerge[1] + 6;
  if (this.tip === 115) maxenerge[0] = maxenerge[0] + 3;
  this.movex = 0; this.movey = 0;
  this.select = 0; this.active = 0;
  this.step = 0;
  for (i = 0; i <= lenxx - 1; i++)
    for (j = 0; j <= lenyy - 1; j++) {
      sp(i + this.x, j + this.y, 0, 200 + this.race);
      sp3(i + this.x, j + this.y, 0, 200 + this.race);
      if (this.tip === 116 || this.tip === 126) {
        sp(i + this.x, j + this.y, 0, 200 + this.race + 5);
        sp3(i + this.x, j + this.y, 0, 200 + this.race + 5);
      }
    }
  sp(this.x, this.y, 0, this.tip);
  sp3(this.x, this.y, 0, this.tip);
  this.flagbuild = 0;
  this.timebuild = 0;
  this.timebuild2 = 0;
  this.flagwait = false;
  this.num = 0;
  this.kkk = 0;
  this.died = false;
  this.phase = 0;
  this.maxphase = 0;
  this.timephase = 0;
  this.color = this.race === 0 ? mycolor : enemycolor;
  this.flagradar[0] = true;
  this.flagradar[1] = true;
  this.gr = 0;
  this.repairing = false;
  this.timerepair = 0;
  this.repair = null;
  this.remont = false;
  this.remonttime = 0;
  this.flagfff = false;
  if (this.race === 1) {
    koltank = koltank + maxdefen[0];
    kolair = kolair + maxdefen[1];
    this.kolturret[70] = 0; this.kolturret[71] = 0;
    this.koldefen[0] = 0; this.koldefen[1] = 0;
  }
  event2.pow = 0;
  if (this.tip === 122) {
    event2.watch = cmevent;
    event2.code = cmfreeharv;
    event2.otkogo = this;
    this.message(enemyrobot, event2);
  }
  this.kolrefen = b8(0 + event2.pow);
  number[1] = b8(number[1] + event2.pow);
  switch (this.tip) {
    case 112:  // рефин
      masmyflagbuild[114] = true;
      masmyflagbuild[117] = true;
      masmyflagbuild[118] = true;
      break;
    case 113: break;  // самол завод
    case 115:  // электр
      masmyflagbuild[112] = true;
      break;
    case 114:  // танк завод
      masmyflagbuild[113] = true;
      masmyflagbuild[116] = true;
      break;
  }
  this.timesmoke = 0;
  if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
  else this.flagsmoke = 0;
  this.kolload = 0;
  return this;
};

// параметры для постройки техники (повторяющийся в оригинале блок)
function fillBuildEvent(ev, tipbuild) {
  ev.tip = tipbuild;
  ev.ang = random(7);
  ev.sx = 30; ev.sy = 30;
  ev.pow = maspow[tipbuild];
  ev.step = 2;
  ev.dis = masdis[tipbuild];
  ev.tim = mastime[tipbuild];
  ev.dam = masdam[tipbuild];
  if (tipbuild === 31) { ev.sx = 75; ev.sy = 75; }
  if (tipbuild === 32) ev.step = 3;
}

THouse.prototype.handleevent = function (event) {
  var len, n, m, i, j, f4, ff, f, event2 = new TEvent();
  if (this.select === 1)
    modifpole((this.x - polex + 1) * 40, (this.y - poley) * 40, (this.x + this.lenx - polex - 1) * 40, (this.y - poley) * 40);
  if (event.watch === cmevent && event.code === cmfire && this.flagradar[page]) {
    this.flagradar[page] = false;
    setwsize(0, 0, 640, 480);
    if (!this.died) setcolor(this.color);
    else setcolor(diedcolor);
    bar(radarx + this.x, radary + this.y, radarx + this.x + this.lenx - 1, radary + this.y + this.leny - 1);
    if (this.died && (this.oldtip === 112 || this.oldtip === 122)) {
      setcolor(moneycolor);
      bar(radarx + this.x, radary + this.y, radarx + this.x + 2, radary + this.y + 1);
    }
    setwsize(0, 0, 520, 480);
  }

  if (this.flagac[0] === 5 && event.code === cmfire && event.watch === cmevent) {
    newpanel[0] = true;
    newpanel[1] = true;
    this.kol = b8(this.kol + 1);
    if (this.kol > 2) this.flagac[0] = 0;
  }

  if (this.died && event.watch === cmevent && event.code === cmfire) {
    if (this.phase === 0) {
      if (this.race === 1 && !this.flagfff) {
        if (this.oldtip !== 111) {
          numberbuild[this.oldtip] = b8(numberbuild[this.oldtip] - 1);
          flagnewbuild = true;
        }
        this.flagfff = true;
        event2.watch = cmevent;
        event2.code = cmundefen;
        this.message(enemytank, event2);
        this.message(enemyrobot, event2);
        this.message(enemyair, event2);
        this.message(enemyturret, event2);
      }
      if (this.repairing && this.repair !== null) {
        event2.watch = cmevent;
        event2.code = cmunrepair;
        this.message(this.repair, event2);
        this.repair = null;
      }
      for (i = 0; i <= this.lenx - 1; i++)
        for (j = 0; j <= this.leny - 1; j++) {
          sp(i + this.x, j + this.y, 0, 0);
          sp3(i + this.x, j + this.y, 0, 0);
        }
      if (this.oldtip === 112 || this.oldtip === 122) {
        for (i = this.x; i <= this.x + 2; i++)
          for (j = this.y; j <= this.y + 1; j++) {
            sp(i, j, 0, 255);
            sp3(i, j, 0, 255);
          }
        sp(this.x, this.y, 0, 10);
        sp(this.x + 2, this.y + 1, 0, 254);
        sp3(this.x, this.y, 0, 10);
        sp3(this.x + 2, this.y + 1, 0, 254);
      }
      if (sel === this) sel = null;
      if (selhouse === this) selhouse = null;
      this.select = 0;
      this.step = 0;
    }
    if (this.timephase > 0) this.timephase--;
    else {
      modifpole2(this.x + 1, this.y + 1, 31);
      if (this.phase <= this.maxphase) {
        this.angle = this.phase;
        this.timephase = 0;
      } else {
        this.angle = 25;
        this.timephase = 0;
      }
      if (this.phase === this.maxphase + 2) {
        // BUG (оригинал): меняется общее событие cmFire — остальные объекты
        // в этом кадре его не получат.
        event.watch = cmevent;
        event.otkogo = this;
        event.code = cmdel;
        this.message(this.owner, event);
        event.watch = cmnothing;
      }
      this.phase = b8(this.phase + 1);
    }
  }

  if (sel !== this && this.select === 1 && !flagloadfile) {
    this.select = 0;
    pereris[0] = true;
    pereris[1] = true;
    newpanel[0] = true;
    newpanel[1] = true;
  }
  if (selhouse !== this && this.active === 1 && !flagloadfile) this.active = 0;

  if (event.watch === cmevent) {
    switch (event.code) {
      case cmrestore:
        if (this.repairing && this.repair !== null) {
          f4 = this.nastroika(this, 'repair', mytank);
          if (!f4) this.nastroika(this, 'repair', myair);
          if (!f4) this.nastroika(this, 'repair', vibortank);
          if (!f4) this.nastroika(this, 'repair', viborair);
        }
        break;
      case cmwhoisit:
        if (this.iam === event.komuraw) {
          event.watch = cmnothing;
          event.otkogo = this;
        }
        break;
      case cmfire:
        if (this.flagsmoke === 1) {
          if (this.timesmoke > 0) this.timesmoke--;
          else {
            this.timesmoke = time11;
            event2.watch = cmevent;
            event2.code = cmsmoke;
            event2.pow = 2;
            event2.tm2 = 3;
            event2.tip = this.tip;
            event2.ang = 0;
            event2.sx = this.sizex;
            event2.sy = this.sizey;
            event2.x = this.x * 40;
            event2.y = this.y * 40;
            event2.mvx = this.gr;  // под/над деревьями
            event2.mvy = 0;        // тип дыма
            this.message(desk, event2);
          }
        }
        if (this.tip === 122 && this.flagbuild === 0 && !this.died && this.kolrefen < 3 &&
            number[1] < maxnumber[1]) {
          number[1] = b8(number[1] + 1);
          this.kolrefen = b8(this.kolrefen + 1);
          this.flagbuild = buildtech;
          this.flagwait = false;
          this.timebuild = mastimebuild[66];
          this.timebuild2 = this.timebuild;
          this.tipbuild = 66;
          this.ground = 0;
        }
        if (this.race === 1 && this.power < idiv(this.power1, 3) * 2) this.remont = true;
        if (this.remont) {
          if (this.remonttime > 0) this.remonttime--;
          else {
            this.movex = 1 - this.movex;
            if (this.power < this.power1) {
              this.power++;
              this.remonttime = time6;
              if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
              else this.flagsmoke = 0;
            } else this.remont = false;
          }
        }
        if (this.repairing && this.repair !== null) {
          if (this.timerepair > 0) this.timerepair--;
          else {
            this.angle = 1 - this.angle;
            this.timerepair = time5;
            event2.watch = cmevent;
            event2.code = cmincpower;
            event2.otkogo = this;
            this.message(this.repair, event2);
            if (event2.code !== cmitiswho) {
              this.angle = 0;
              this.repairing = false;
              this.repair = null;
            }
          }
        }
        break;
      case cmgettip121:
        if (this.tip === event.tip && this.race === event.ras && !this.died && event.otkogo !== this)
          event.mov = true;
        break;
      case cmgettip:
        if (event.komu === this) {
          event.tip = this.tip;
          event.code = cmitiswho;
          event.x = this.flagbuild;  // 0-не строю
        }
        break;
      case cmnewdefen:
        if (this.race === 1 && event.pow !== 2) {
          if (this.koldefen[event.pow] < maxdefen[event.pow]) {
            event.otkogo = this;
            event.x = this.x;
            event.y = this.y;
            this.koldefen[event.pow] = b8(this.koldefen[event.pow] + 1);
            event.pow = 2;
          }
        }
        break;
      case cmdecdefen:
        this.koldefen[event.pow] = b8(this.koldefen[event.pow] - 1);
        break;
      case cmdecturret:
        this.kolturret[event.tip] = b8((this.kolturret[event.tip] || 0) - 1);
        break;
      case cmturret:
        if (this.race === 1 && !this.died) {
          if (this.kolturret[70] < maxturret[70] && !this.died) {
            event.tip = 70;
            event.otkogo = this;
          }
          if (this.kolturret[71] < maxturret[71] && !this.died) {
            event.tip = 71;
            event.otkogo = this;
          }
        }
        break;
      case cmputturret:
        for (i = this.x - 2; i <= this.x + 2; i++)
          for (j = this.y - 2; j <= this.y + 2; j++)
            if (i > 0 && j > 0 && i < maxx && j < maxy && gp(i, j, 0) === 0) {
              enemyturret.insert(New(TTank).init(i, j, i, j, i, j, 0, 0,
                300, 300, 1, 0, event.tip, 4, 40, 40, 0, 100, false, 0, 0, 240 + 80, 50, 30, this, 255, false));
              this.kolturret[event.tip] = b8((this.kolturret[event.tip] || 0) + 1);
              return;
            }
        break;
      case cmunrepair:
        this.repairing = false;
        this.repair = null;
        if (!this.died) this.angle = 0;
        break;
      case cmgetnum:
        if (event.komu === this && !this.died) {
          event.tip = this.tip;
          event.x = this.num;
          event.code = cmitiswho;
        }
        break;
      case cmdecnumber:
        // BUG (оригинал): dec(kolRefen) выполняется без проверки komu
        if (event.komu === this) number[this.race] = b8(number[this.race] - 1);
        if (this.race === 1) this.kolrefen = b8(this.kolrefen - 1);
        break;
      case cmgetxy:
        if (event.komu === this) {
          event.mov = false;
          event.x = this.x + idiv(this.lenx, 2);
          event.y = this.y + idiv(this.leny, 2);
          event.ground = 0;
          return;
        }
        break;
      case cmwho:
        if (!this.died && this.itisi(event.x, event.y)) {
          event.watch = cmevent;
          event.otkogo = this;
          event.tip = this.tip;
          event.ground = 0;
          event.code = cmitiswho;
        }
        break;
      case cmwho2:
        if (!this.died && this.race === event.ras &&
            this.x <= event.x && this.y <= event.y && this.x + this.lenx > event.x && this.y + this.leny > event.y) {
          if (event.pow === 111) {
            if (this.tip === 116 && !this.repairing) {
              event.pow = 123;
              this.repairing = true;
              this.repair = event.otkogo;
            } else event.mov = false;
          }
          event.mov = false;
          event.watch = cmevent;
          event.otkogo = this;
          event.tip = this.tip;
          event.sx = this.lenx; event.sy = this.leny;
          event.newx = this.x; event.newy = this.y;
          event.code = cmitiswho;
        }
        break;
      case cmwho3:
        if (event.tip === this.tip && !this.died) {
          if (event.pow !== cmitiswho ||
              (event.pow === cmitiswho &&
               rasst(event.oldx, event.oldy, this.x, this.y) < rasst(event.oldx, event.oldy, event.x, event.y))) {
            event.pow = cmitiswho;
            event.x = this.x; event.y = this.y;
            event.sx = this.lenx; event.sy = this.leny;
          }
        }
        break;
      case cmwho4:
        if (event.komu === this) {
          event.code = cmitiswho;
          event.x = this.x; event.y = this.y;
          event.sx = this.lenx; event.sy = this.leny;
        }
        break;
      case cmnoputbuild:
        this.flagbuild = buildhouse;
        this.timebuild = 0;
        newpanel[0] = true;
        newpanel[1] = true;
        break;
      case cmputbuild:
        this.flagbuild = 0;
        this.num = 0;
        this.flagac[0] = 5;
        this.kol = 0;
        newpanel[0] = true;
        newpanel[1] = true;
        break;
      case cmdecpower:
        if (event.komu === this && !this.died) {
          if (this.power - event.pow > 0) {
            this.power = this.power - event.pow;
            if (this.race === 1 && event.otkogo !== null) {
              event2.watch = cmevent;
              event2.code = cmattack2;
              event2.komu = event.otkogo;
              event2.ground = event.otkogo.gr;
              event2.otkogo = this;
              this.message(enemytank, event2);
              this.message(enemyair, event2);
            }
          } else {
            if (flagplay > 200) flagplay = 200;
            event2.watch = cmevent;
            event2.code = cmiamdied;
            event2.otkogo = this;
            if (this.race === 0) {
              this.message(enemytank, event2);
              this.message(enemyair, event2);
            }
            if (this.race === 1) {
              this.message(vibortank, event2);
              this.message(mytank, event2);
              this.message(viborair, event2);
              this.message(myair, event2);
            }
            this.message(myturret, event2);
            this.message(enemyturret, event2);
            this.message(rocet, event2);
            this.message(deleting, event2);

            this.flagradar[0] = true;
            this.flagradar[1] = true;
            this.died = true;
            this.oldtip = this.tip;
            this.tip = 130;
            if (this.oldtip === 112 && maxnumber[0] >= 3) maxnumber[0] = maxnumber[0] - 3;
            if (this.oldtip === 122 && maxnumber[1] >= 3) maxnumber[1] = maxnumber[1] - 3;
            if (this.oldtip === 125 && maxenerge[1] >= 6) maxenerge[1] = maxenerge[1] - 6;
            if (this.oldtip === 115 && maxenerge[0] >= 3) maxenerge[0] = maxenerge[0] - 3;
            if (this.race === 1 && this.oldtip === 122) {
              event2.watch = cmevent;
              event2.code = cmunbuilder;
              event2.otkogo = this;
              this.message(enemytank, event2);
            }
            this.phase = 0;
            this.maxphase = 11;
            if (this.select === 1) {
              this.select = 0;
              pereris[0] = true;
              pereris[1] = true;
            }
            if (selhouse === this) {
              for (i = 0; i <= maxicon; i++) masflagicon[i] = false;
              newpanel[0] = true;
              newpanel[1] = true;
              this.num = 0;
              this.message(desk, event2);
            }
            return;
          }
          event.watch = cmnothing;
        }
        break;
    }
  }
  // **начало постройки**
  if (this.flagbuild !== 0 || this.flagwait) {
    if (this.timebuild >= 0 && event.code === cmfire && event.watch === cmevent) {
      if (selhouse === this) {
        setwsize(0, 0, 640, 480);
        button(0, 27, false);
        len = size2 - round(r48(r48(this.timebuild / this.timebuild2) * size2));
        hidemouse();
        putsprite(xxx2 + 2, yyy2 + 3, masicon[this.numicons]);
        showmouse();
        rectangle(xxx2 + 4, yyy2 + 32, xxx2 + 6 + size2, yyy2 + 35 + 3, 0, 15);
        setcolor(green);
        bar(xxx2 + 5, yyy2 + 33, xxx2 + 5 + len, yyy2 + 35 + 2);
        setwsize(0, 0, 520, 480);
      }
    }
  }
  if (this.flagbuild !== 0) {
    if (this.timebuild >= 0 && event.code === cmfire && event.watch === cmevent) {
      if (this.timebuild > 0) this.timebuild--;
    }
    if (selhouse === this && this.flagbuild !== 0) build = true;
    if (this.timebuild === 0 && this.flagbuild === buildtech) {
      this.flagbuild = 0;
      event2.watch = cmevent;
      f = false;
      for (i = this.x - 1; i <= this.x + this.lenx; i++)
        for (j = this.y - 1; j <= this.y + this.leny; j++)
          if (i >= 0 && j >= 0 && i <= maxx && j <= maxy) {
            var vg = gp(i, j, this.ground);
            if (vg === 0 || vg === 3 || vg === 4) {
              f = true;
              event2.x = i; event2.y = j;
            }
          }
      if (!f) {
        event2.code = cmwho2;
        event2.ras = this.race;
        n = random(13);
        m = 0;
        for (i = this.x - 1; i <= this.x + this.lenx; i++)
          for (j = this.y - 1; j <= this.y + this.leny; j++)
            if (i >= 0 && j >= 0 && i <= maxx && j <= maxy &&
                gp(i, j, this.ground) >= 25 && gp(i, j, 0) <= 32) {
              if (m === n) {
                event2.x = i; event2.y = j;
                m++;
              } else m++;
            }
        this.flagwait = true;
        if (this.race === 0) {
          if (this.ground === 0) {
            this.message(mytank, event2);
            this.message(myrobot, event2);
          } else this.message(myair, event2);
        }
        if (this.race === 1) {
          if (this.ground === 0) {
            this.message(enemytank, event2);
            this.message(enemyrobot, event2);
          } else this.message(enemyair, event2);
        }
        if (event2.code === cmitiswho) {
          var ex2 = event2.x, ey2 = event2.y;      // границы for вычисляются один раз
          for (i = ex2 - 1; i <= ex2 + 1; i++)
            for (j = ey2 - 1; j <= ey2 + 1; j++)
              if (i > 0 && j > 0 && i < maxx && j < maxy) {
                ff = false;
                var vg2 = gp(i, j, this.ground);
                if (vg2 === 0 || vg2 === 3 || vg2 === 4) {
                  ff = true;
                  var o = event2.otkogo;
                  o.moving = true;
                  o.newx = i;
                  o.newy = j;
                  if (this.race === 0) {
                    if (this.ground === 0) {
                      this.message(mytank, event2);
                      this.message(myrobot, event2);
                    } else this.message(myair, event2);
                  }
                  if (this.race === 1) {
                    if (this.ground === 0) {
                      this.message(enemytank, event2);
                      this.message(enemyrobot, event2);
                    } else this.message(enemyair, event2);
                  }
                }
                if (!ff) event2.watch = cmnothing;
              }
        } else event2.watch = cmnothing;
        return;
      }
      if (this.ground === 0) {
        if (inR(this.tipbuild, 24, 25) || this.tipbuild === 66) event2.code = cmrobot;
        else event2.code = cmtank;
      } else event2.code = cmair;
      event2.buil = this;
      event2.ras = this.race;
      fillBuildEvent(event2, this.tipbuild);
      event2.newx = event2.x; event2.newy = event2.y;
      event2.tm2 = 0;
      event2.buil = this;
      if (this.race === 0) {
        if (this.ground === 0) {
          if (inR(this.tipbuild, 24, 25)) event2.komu = myrobot;
          else event2.komu = mytank;
        } else event2.komu = myair;
      }
      if (this.race === 1) {
        if (this.ground === 0) {
          if (this.tipbuild === 66) event2.komu = enemyrobot;
          else event2.komu = enemytank;
        } else event2.komu = enemyair;
      }
      this.message(desk, event2);
      build = false;
      this.num = 0;
      newpanel[0] = true;
      newpanel[1] = true;
    }
  }
  if (this.flagwait) {
    f = false;
    for (i = this.x - 1; i <= this.x + this.lenx; i++)
      for (j = this.y - 1; j <= this.y + this.leny; j++)
        if (i > 0 && j > 0 && i < maxx && j < maxy) {
          var vw = gp(i, j, this.ground);
          if (vw === 0 || vw === 3) {
            f = true;
            event2.x = i; event2.y = j;
            event2.newx = i; event2.newy = j;
          }
        }
    if (f) {
      this.flagwait = false;
      event2.watch = cmevent;
      if (this.ground === 0) {
        if (inR(this.tipbuild, 24, 25) || this.tipbuild === 66) event2.code = cmrobot;
        else event2.code = cmtank;
      } else event2.code = cmair;
      event2.ras = this.race;
      event2.tm2 = 0;
      event2.buil = this;
      fillBuildEvent(event2, this.tipbuild);
      // BUG (оригинал): здесь получатель выбирается без учёта расы — если у
      // вражеского добытчика (122) не было места, его харвестер (66) попадает
      // в список ИГРОКА mytank.
      if (this.ground === 0) {
        if (inR(this.tipbuild, 24, 25)) event2.komu = myrobot;
        else event2.komu = mytank;
      } else event2.komu = myair;
      this.message(desk, event2);
      this.num = 0;
      build = false;
      newpanel[0] = true;
      newpanel[1] = true;
    }
  }
  // **Конец постройки**
  if (event.watch === cmmouse) {
    if (event.button === 2) {
      // BUG (оригинал): правый щелчок мимо иконок (numIcon=0) у выбранного
      // здания, которое ничего не строит (num=0), тоже срабатывает — деньги за
      // последнюю постройку возвращаются ещё раз. Возможно, только пока
      // глобальный build=true (его оставляет другое здание, стоящее в очереди).
      if (selhouse === this && numicon(event.xm, event.ym) === this.num) {
        this.num = 0;
        this.flagwait = false;
        newpanel[0] = true;
        newpanel[1] = true;
        event.watch = cmevent;
        event.code = cmnohouse;
        event.tip = this.tipbuild;
        money[0] = money[0] + mascoast[this.tipbuild];
        this.message(desk, event);
        if (this.tip === 112 && inR(this.tipbuild, 24, 25)) number[this.race] = b8(number[this.race] - 1);
        this.flagbuild = 0;
        build = false;
      }
    }
    if (event.button === 1) {
      if (selhouse === this && this.flagbuild === buildhouse && numicon(event.xm, event.ym) === this.num && this.timebuild === 0) {
        event2.watch = cmevent;
        event2.code = cmhouse;
        event2.tip = this.tipbuild;
        event2.ras = this.race;
        event2.pow = 300;
        event2.step = 0;
        event.tm2 = 10;
        event2.otkogo = this;
        this.message(desk, event2);
      }
      if (this.itisi(event.xm, event.ym) && event.xm < 520) {
        if (!desk.remont) {
          this.select = 1; sel = this;
          event.watch = cmmouse;
          event.xm = 700; event.ym = 700;
          if (this.race === 0) {
            this.active = 1;
            selhouse = this;
            for (i = 0; i <= maxicon; i++) masflagicon[i] = false;
            newpanel[0] = true;
            newpanel[1] = true;
            if (this.tip === 111) for (i = 10; i <= 17; i++) masflagicon[i] = true;
            if (this.tip === 112) { masflagicon[18] = true; masflagicon[19] = true; }
            if (this.tip === 113) for (i = 0; i <= 5; i++) masflagicon[i] = true;
            if (this.tip === 114) for (i = 20; i <= 24; i++) masflagicon[i] = true;
          }
        } else {
          this.remont = !this.remont;
        }
      }
      if (this.active === 1 && event.xm > 520 && this.flagbuild === 0 && !this.flagwait && !desk.remont) {
        var ni = numicon(event.xm, event.ym);
        if (ni !== 0) {
          newpanel[0] = true;
          newpanel[1] = true;
          var self = this;
          var startb = function (nn, icons, fb, tb, tbuild, gnd) {
            self.num = nn;
            self.numicons = icons;
            self.flagbuild = fb;
            self.flagwait = false;
            self.timebuild = mastimebuild[tb];
            self.timebuild2 = self.timebuild;
            self.tipbuild = tbuild;
            self.ground = gnd;
          };
          switch (ni) {
            case 1:
              if (this.tip === 111 && money[0] >= mascoast[111] && masmyflagbuild[111]) startb(1, 10, buildhouse, 111, 111, 0);
              if (this.tip === 113 && money[0] >= mascoast[30]) startb(1, 0, buildtech, 30, 30, 1);
              if (this.tip === 112 && money[0] >= mascoast[24] && number[this.race] < maxnumber[this.race]) {
                this.num = 1; this.numicons = 18;
                number[this.race] = b8(number[this.race] + 1);
                this.flagbuild = buildtech; this.flagwait = false;
                this.timebuild = mastimebuild[24]; this.timebuild2 = this.timebuild;
                this.tipbuild = 24; this.ground = 0;
              }
              // (оригинал: проверка денег по mascoast[27], время — по 26)
              if (this.tip === 114 && money[0] >= mascoast[27]) startb(1, 20, buildtech, 26, 26, 0);
              break;
            case 2:
              if (this.tip === 111 && money[0] >= mascoast[115] && masmyflagbuild[115]) startb(2, 11, buildhouse, 115, 115, 0);
              if (this.tip === 112 && money[0] >= mascoast[25] && number[this.race] < maxnumber[this.race]) {
                this.num = 2; this.numicons = 19;
                number[this.race] = b8(number[this.race] + 1);
                this.flagbuild = buildtech; this.flagwait = false;
                this.timebuild = mastimebuild[25]; this.timebuild2 = this.timebuild;
                this.tipbuild = 25; this.ground = 0;
              }
              if (this.tip === 113 && money[0] >= mascoast[32]) startb(2, 1, buildtech, 32, 32, 1);
              if (this.tip === 114 && money[0] >= mascoast[28]) startb(2, 21, buildtech, 28, 28, 0);
              break;
            case 3:
              if (this.tip === 111 && money[0] >= mascoast[112] && masmyflagbuild[112]) startb(3, 12, buildhouse, 112, 112, 0);
              if (this.tip === 113 && money[0] >= mascoast[31]) startb(3, 2, buildtech, 31, 31, 1);
              if (this.tip === 114 && money[0] >= mascoast[29]) startb(3, 22, buildtech, 29, 29, 0);
              break;
            case 4:
              if (this.tip === 111 && money[0] >= mascoast[114] && masmyflagbuild[114]) startb(4, 13, buildhouse, 114, 114, 0);
              if (this.tip === 113 && money[0] >= mascoast[33]) startb(4, 3, buildtech, 33, 33, 1);
              if (this.tip === 114 && money[0] >= mascoast[23]) startb(4, 23, buildtech, 23, 23, 0);
              break;
            case 5:
              if (this.tip === 111 && money[0] >= mascoast[113] && masmyflagbuild[113]) startb(5, 14, buildhouse, 113, 113, 0);
              if (this.tip === 113 && money[0] >= mascoast[34]) startb(5, 4, buildtech, 34, 34, 1);
              if (this.tip === 114 && money[0] >= mascoast[27]) startb(5, 24, buildtech, 27, 27, 0);
              break;
            case 6:
              if (this.tip === 111 && money[0] >= mascoast[116] && masmyflagbuild[116]) startb(6, 15, buildhouse, 116, 116, 0);
              if (this.tip === 113 && money[0] >= mascoast[35]) startb(6, 5, buildtech, 35, 35, 1);
              break;
            case 7:
              if (this.tip === 111 && money[0] >= mascoast[40] && masmyflagbuild[117]) startb(7, 16, buildhouse, 40, 40, 0);
              break;
            case 8:
              if (this.tip === 111 && money[0] >= mascoast[41] && masmyflagbuild[118]) startb(8, 17, buildhouse, 41, 41, 0);
              break;
          }
          if (this.flagbuild !== 0) money[0] = money[0] - mascoast[this.tipbuild];
        }
      }
    }
  }
};

THouse.prototype.show = function () {
  var f, xx, yy, len;
  if (this.angle === 25) return;
  if ((this.x + this.lenx >= polex && this.x - this.lenx <= polex + 15) &&
      (this.y + this.leny >= poley && this.y - this.leny <= poley + 11)) {
    f = true;
    if (f) hidemouse();
    xx = (this.x - polex) * 40;
    yy = (this.y - poley) * 40;
    putsprite(xx, yy, houses[this.tip] ? houses[this.tip][this.angle] : null);
    if (this.remont && !this.died)
      putsprite(xx + idiv(this.sizex, 2), yy + idiv(this.sizey, 2), pict[1 + this.movex]);
    if (this.select === 1) {
      var sx = this.sizex, sy = this.sizey, rx = this.ramkax, ry = this.ramkay, kk = this.kkk;
      if (this.race === 0) setcolor(white); else setcolor(12);
      line(xx, yy, xx + 8, yy);
      line(xx, yy, xx, yy + 20);
      line(xx + sx, yy + sy, xx - 20 + sx, yy + sy);
      line(xx + sx, yy + sy - 20, xx + sx, yy + sy);
      line(xx + sx, yy, xx - 8 + sx, yy);
      line(xx + sx, yy, xx + sx, yy + 20);
      line(xx, yy + sy, xx + 20, yy + sy);
      line(xx, yy + sy - 20, xx, yy + sy);

      if (this.race === 0) rectangle(xx + rx + 9, yy + ry - kk - 2, xx + rx + sx - 9, yy + ry - kk + 2, 15, 15);
      else rectangle(xx + rx + 9, yy + ry - kk - 2, xx + rx + sx - 9, yy + ry - kk + 2, 12, 12);
      len = round(r48(r48(this.power / this.power1) * (sx - 20)));
      if (len >= 1) setcolor(red);
      if (len >= (sx - 20) * 1 / 3) setcolor(yellow);
      if (len >= (sx - 20) * 2 / 3) setcolor(green);
      var hx = idiv(sx, 2), h20 = idiv(sx - 20, 2);
      if (len + 10 >= hx) {
        line(xx + rx + 10, yy + ry - kk - 1, xx + rx + hx, yy + ry - kk - 1);
        line(xx + rx + 10, yy + ry - kk, xx + rx + hx, yy + ry - kk);
        line(xx + rx + 10, yy + ry - kk + 1, xx + rx + hx, yy + ry - kk + 1);

        line(xx + rx + hx, yy + ry - kk - 1, xx + rx + hx + len - h20, yy + ry - kk - 1);
        line(xx + rx + hx, yy + ry - kk, xx + rx + hx + len - h20, yy + ry - kk);
        line(xx + rx + hx, yy + ry - kk + 1, xx + rx + hx + len - h20, yy + ry - kk + 1);
      } else {
        line(xx + rx + 10, yy + ry - kk - 1, xx + rx + len + 10, yy + ry - kk - 1);
        line(xx + rx + 10, yy + ry - kk, xx + rx + len + 10, yy + ry - kk);
        line(xx + rx + 10, yy + ry - kk + 1, xx + rx + len + 10, yy + ry - kk + 1);
      }
    }
    if (f) showmouse();
  }
};

// ================================ tRobot =====================================
function TRobot() {}
TRobot.prototype = Object.create(TTech.prototype);
TRobot.prototype.constructor = TRobot;
TRobot.prototype.SIZE = 237;
TRobot.prototype.save = function () { TTech.prototype.save.call(this); };
TRobot.prototype.load2 = function () { TTech.prototype.load2.call(this); };

TRobot.prototype.checktarget = function () {
  var event2 = new TEvent();
  switch (this.sost) {
    case 1:  // ищем свой ref
      if (prov(this.x, this.y, this.newx, this.newy, this.sxx, this.syy, 0) || !this.moving) {
        this.newx = this.x; this.newy = this.y;
        this.sost = 3;
        event2.watch = cmevent;
        event2.code = cmwho4;
        event2.komu = this.builder;
        if (this.race === 0) this.message(myhouse, event2);
        else this.message(enemyhouse, event2);
        if (event2.code === cmitiswho) {
          this.newx = event2.x;
          this.newy = event2.y;
          this.sxx = b8(event2.sx);
          this.syy = b8(event2.sy);
          this.moving = true;
          this.sost = 2;
          if (money[this.race] <= 100000 - 5) money[this.race] = money[this.race] + 5;
          if (this.race === 0) {
            newmoney[0] = true;
            newmoney[1] = true;
          }
        }
      }
      break;
    case 2:  // ищем ближ центр
      if (prov(this.x, this.y, this.newx + 1, this.newy + 1, this.sxx, this.syy, 0)) {
        this.newx = this.x; this.newy = this.y;
        if (this.pousetime === pouse) {
          sp(this.x, this.y, 0, 0);
          this.angle = 25;
          // =====IAmDied===========
          event2.watch = cmevent;
          event2.code = cmiamdied;
          event2.otkogo = this;
          if (this.race === 0) {
            this.message(enemytank, event2);
            this.message(enemyair, event2);
          }
          if (this.race === 1) {
            this.message(vibortank, event2);
            this.message(mytank, event2);
            this.message(viborair, event2);
            this.message(myair, event2);
            this.message(myhouse, event2);
            this.message(myturret, event2);
          }
          this.message(rocet, event2);
          this.message(deleting, event2);
          // =====IAmDied===========
        }
        if (this.pousetime > 0) this.pousetime--;
        else {
          this.angle = random(7);
          this.sost = 3;
          this.pousetime = pouse;
          sp(this.x, this.y, 0, this.tip);
          event2.watch = cmevent;
          event2.code = cmwho3;
          event2.tip = 111 + 10 * this.race;
          event2.oldx = this.x; event2.oldy = this.y;
          if (this.race === 0) this.message(myhouse, event2);
          else this.message(enemyhouse, event2);
          if (event2.pow === cmitiswho) {
            this.newx = event2.x;
            this.newy = event2.y;
            this.sxx = b8(event2.sx);
            this.syy = b8(event2.sy);
            this.moving = true;
            this.sost = 1;
          }
        }
      }
      break;
  }
};

TRobot.prototype.handleevent = function (event) {
  var fnew, event2 = new TEvent(), v;
  if (this.step === 0) {
    sp2(this.x, this.y, 1);
    if (this.tip === 41) {
      sp2(this.x, this.y - 1, 1);
      sp2(this.x + 1, this.y, 1);
      sp2(this.x + 1, this.y - 1, 1);
    }
  } else if (this.moving) modifpole2(this.x, this.y, this.tip);
  else sp2(this.x, this.y, 1);
  if (event.watch === cmevent && event.code === cmfire && !this.attack && this.tip === 41 &&
      !(this.step === 0 && maxenerge[this.race] < energe[this.race])) {
    if (this.angletime > 0) this.angletime--;
    else {
      this.angle = b8(this.angle + 1);
      this.angletime = time4;
    }
    if (this.angle > 7) this.angle = 0;
  }

  if (this.flagradar[page] && event.watch === cmevent && event.code === cmfire) {
    this.flagradar[page] = false;
    setwsize(0, 0, 640, 480);
    putpixel(radarx + this.oldx, radary + this.oldy, diedcolor);
    v = gp(this.oldx, this.oldy, 0);
    if (v === 116 || v === 205) putpixel(radarx + this.oldx, radary + this.oldy, mycolor);
    if (v === 126 || v === 206) putpixel(radarx + this.oldx, radary + this.oldy, enemycolor);
    v = gp(this.oldx, this.oldy, 1);
    if (v !== 0) {
      event2.watch = cmevent;
      event2.code = cmradar;
      event2.x = this.oldx;
      event2.y = this.oldy;
      if (inR(v, 30, 34)) {
        this.message(myair, event2);
        this.message(viborair, event2);
      }
      if (inR(v, 76, 80)) this.message(enemyair, event2);
    }
    if (this.died && gp(this.x, this.y, 1) === 0) putpixel(radarx + this.x, radary + this.y, diedcolor);
    if (gp(this.x, this.y, 1) === 0 && !this.died && this.owner !== deleting && (!this.flagcloack || this.race === 0))
      putpixel(radarx + this.x, radary + this.y, this.color);
    setwsize(0, 0, 520, 480);
  }
  if (this.flagac[0] !== 0) {
    if (this.flagac[0] === 2) modifpole2(this.x, this.y, 1);
    if (this.flagac[0] === 1) sp2(this.x, this.y - 1, 1);
    if (this.pag !== page) this.flagac[0] = 0;
  }

  if (this.died && event.watch === cmevent && event.code === cmfire) {
    if (!this.flagfff && this.angle === 25 && this.race === 1) {
      if (this.step === 0) flagnewbuild = true;
      if (this.tip === 67) {
        zahvat = false;
        flag67 = false;
        complet = true;
        event2.watch = cmevent;
        event2.code = cmputhouse;
        event2.x = this.x;
        event2.y = this.y;
        this.message(desk, event2);
        this.flagfff = true;
        maxbuild[122] = b8(maxbuild[122] + 1);
        flagtiberium = 5;
        flagnewbuild = true;
      }
    }
    if (this.phase === 0) {
      if (this.defenhouse !== null) {
        if (this.step === 0) {
          event2.watch = cmevent;
          event2.code = cmdecturret;
          event2.tip = this.oldtip;
          this.message(this.defenhouse, event2);
        }
        if (this.step !== 0) {
          event2.watch = cmevent;
          event2.code = cmdecdefen;
          event2.pow = this.gr;
          this.message(this.defenhouse, event2);
        }
        this.defenhouse = null;
      }
      if (this.repair !== null) {
        event2.watch = cmevent;
        event2.code = cmunrepair;
        this.message(this.repair, event2);
        this.repair = null;
      }
      this.flagcloack = false;
      if (this.race === 1 && this.step !== 0) {
        // BUG (оригинал): defenHouse к этому моменту уже обнулён — счётчик
        // охраны (kolTank) никогда не восстанавливается.
        if (this.defenhouse !== null) koltank++;
        if (this.patr) {
          patrol[0] = true;
          kolpatrol[0]++;
        }
      }
      v = gp(this.x, this.y, 0);
      if ((this.race === 0 && !(v === 116 || v === 205)) || (this.race === 1 && !(v === 126 || v === 206)))
        sp(this.x, this.y, 0, 0);
      v = gp(this.oldx, this.oldy, 0);
      if ((this.race === 0 && !(v === 116 || v === 205)) || (this.race === 1 && !(v === 126 || v === 206)))
        sp(this.oldx, this.oldy, 0, 0);
      if (this.movex > 0 && this.movey === 0) sp(this.x + 1, this.y, 0, 0);
      if (this.movey > 0 && this.movex === 0) sp(this.x, this.y + 1, 0, 0);
      if (this.movex < 0 && this.movey === 0) sp(this.x - 1, this.y, 0, 0);
      if (this.movey < 0 && this.movex === 0) sp(this.x, this.y - 1, 0, 0);
      if (this.movex < 0 && this.movey < 0) sp(this.x - 1, this.y - 1, 0, 0);
      if (this.movex > 0 && this.movey > 0) sp(this.x + 1, this.y + 1, 0, 0);
      if (this.movex < 0 && this.movey > 0) sp(this.x - 1, this.y + 1, 0, 0);
      if (this.movex > 0 && this.movey < 0) sp(this.x + 1, this.y - 1, 0, 0);
      this.select = 0;
    }
    if (this.timephase > 0) this.timephase--;
    else {
      this.timephase = 1;
      modifpole2(this.x, this.y, this.tip);
      if (this.phase <= this.maxphase) this.angle = this.phase;
      else this.angle = 25;
      if (this.phase === this.maxphase + 2) {
        event2.watch = cmevent;
        event2.otkogo = this;
        event2.code = cmdel;
        this.message(this.owner, event2);
        event2.watch = cmnothing;
      }
      this.phase = b8(this.phase + 1);
    }
  }

  if (gp(this.x, this.y, 0) === 0 && !this.load[1] && !this.died && this.sost !== 2) sp(this.x, this.y, 0, this.tip);
  if ((this.x !== this.newx || this.y !== this.newy) && !this.moving && !flaggo && this.step !== 0) {
    this.moving = true;
    flaggo = true;
  }
  if (event.watch === cmevent) {
    switch (event.code) {
      case cmfire:
        if (this.race === 1 && this.power < idiv(this.power1, 3) * 2 && this.step === 0) this.remont = true;
        if (this.remont) {
          if (this.remonttime > 0) this.remonttime--;
          else {
            // (оригинал: у подвижной техники в режиме ремонта это дёргает movex)
            this.movex = 1 - this.movex;
            if (this.power < this.power1) {
              this.power++;
              this.remonttime = time6;
              if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
              else this.flagsmoke = 0;
            } else this.remont = false;
          }
        }
        this.checktarget();
        if (!this.died && this.moving && this.step !== 0) this.go();
        break;
      case cmselect:
        if (this.select === 0) this.select = 1;
        if (inR(this.tip, 40, 45)) sel = this;
        break;
      case cmunselect:
        if (this.select === 1) {
          this.select = 0;
          modifpole2(this.x, this.y, this.tip);
          fff = true;
          this.flagac[0] = 2;
          this.pag = page;
        }
        break;
      case cmdecpower:
        if (event.tip === 0 && event.otkogo !== this && event.komu === this &&
            ((event.x === this.x && event.y === this.y) || (event.x === this.oldx && event.y === this.oldy)) &&
            !this.died) {
          var ot = event.otkogo;
          fnew = false;
          if ((this.x === this.newx && this.y === this.newy) ||
              (this.sostway !== 255 && this.race === 1) && this.attack === false && this.distance !== 0)
            fnew = true;
          if (this.attack && this.target !== null && !fnew && this.step === 0) {
            event2.watch = cmevent;
            event2.code = cmgetxy;
            event2.komu = this.target;
            this.message(this.target, event2);
            if (rasst(this.x * 40, this.y * 40, event2.x * 40, event2.y * 40) > this.distance) fnew = true;
          }
          if (fnew) {
            if (ot !== null && !inSet(this.tip, [24, 25])) {
              if (ot.gr === this.tipattack || this.tipattack === 2) {
                this.target = ot;
                this.attack = true;
                this.tiptar = ot.gr;
                this.tarx = ot.x * 40;
                this.tary = ot.y * 40;
                if (rasst(this.x * 40, this.y * 40, ot.x * 40, ot.y * 40) > this.distance) {
                  this.newx = ot.x;
                  this.newy = ot.y;
                  this.moving = true;
                }
              }
            }
          }
          if (this.power - event.pow > 0) {
            this.power = this.power - event.pow;
            if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
            else this.flagsmoke = 0;
          } else {
            if (flagplay > 300) flagplay = 300;
            event2.watch = cmevent;
            if (this.builder !== null) {
              event2.code = cmdecnumber;
              event2.komu = this.builder;
              this.message(this.builder, event2);
              this.builder = null;
            }
            event2.code = cmiamdied;
            event2.otkogo = this;
            if (this.race === 0) {
              this.message(enemytank, event2);
              this.message(enemyrobot, event2);
              this.message(enemyair, event2);
              this.message(enemyturret, event2);
              if (this.gr === 0) this.message(myair, event2);
            }
            if (this.race === 1) notifyDied(this, event2, 1, [vibortank, mytank, viborrobot, myrobot, viborair, myair, myturret]);
            this.message(rocet, event2);
            this.message(deleting, event2);

            if (this.chrono && this.select === 1 && chronocur) chronocur = false;
            this.flagradar[0] = true;
            this.flagradar[1] = true;
            this.attack = false;
            this.oldtip = this.tip;
            this.died = true;
            this.phase = 0;
            this.tip = 45;
            this.maxphase = 11;
            return;
          }
          event.watch = cmnothing;
        }
        break;
    }
  }
  TTech.prototype.handleevent.call(this, event);
};

TRobot.prototype.go = function () {
  var xx, yy, fx, fy, i, j, f, ffff, event2 = new TEvent(), self = this, v;

  function free(vv) { return vv === 0 || vv === 3 || vv === 4; }
  function own(r, vv) { return (r === 0 && !(vv === 116 || vv === 205)) || (r === 1 && !(vv === 126 || vv === 206)); }
  function selectgo() {
    var n, num;
    self.dx = 0; self.dy = 0;
    if (self.newx > self.x) self.dx = 1;
    if (self.newx < self.x) self.dx = -1;
    if (self.newy > self.y) self.dy = 1;
    if (self.newy < self.y) self.dy = -1;
    var t = gp(self.x + self.dx, self.y + self.dy, 0);
    if (!free(t) && !((t === 116 || t === 205) && (self.sost === 10 || self.sost === 11))) {
      num = dirNum(self.dx, self.dy);
      n = 0;
      do {
        num++; n++;
        if (num === 8) num = 0;
        if (num >= 0 && num <= 7) { self.dx = DIRS[num][0]; self.dy = DIRS[num][1]; }
        if (self.x + self.dx > maxx || self.y + self.dy > maxy || self.y + self.dy < 0 || self.x + self.dx < 0) {
          self.dx = 0; self.dy = 0;
        }
        t = gp(self.x + self.dx, self.y + self.dy, 0);
      } while (!(t === 0 || t === 3 || n === 8));
      if (n === 8 && !free(gp(self.x + self.dx, self.y + self.dy, 0))) {
        self.dx = 0; self.dy = 0;
      }
    }
  }

  if (this.x === this.newx && this.y === this.newy && this.movex === 0 && this.movey === 0) {
    if (!this.flag && own(this.race, gp(this.oldx, this.oldy, 0)) && !(this.oldx === this.x && this.oldy === this.y))
      sp(this.oldx, this.oldy, 0, 0);
    if (this.tip === 67) {
      this.died = true;
      event2.watch = cmevent;
      event2.code = cmiamdied;
      event2.otkogo = this;
      if (this.race === 0) notifyDied(this, event2, 0, [enemytank, enemyrobot, enemyair, enemyturret]);
      if (this.race === 1) notifyDied(this, event2, 1, [vibortank, mytank, viborrobot, myrobot, viborair, myair, myturret]);
      this.message(rocet, event2);
      this.message(deleting, event2);
    }

    this.oldx = this.x; this.oldy = this.y;
    if (inSet(this.sostway, [255, 100]) || inR(this.tip, 24, 25) || this.tip === 66 || this.race === 0)
      this.moving = false;
    else if (!this.attack && this.race === 1) {
      this.newx = way[this.sostway][0];
      this.newy = way[this.sostway][1];
      this.sostway = b8(this.sostway + 1);
      if (this.sostway > 4) this.sostway = 0;
    }
    this.flag = false;
    fff = false;
    modifpole2(this.x, this.y, this.tip);
    return;
  }
  fff = true;
  modifpole2(this.x, this.y, this.tip);
  if (this.gotime > 0) this.gotime--;
  else {
    fx = 2; fy = 2;
    this.gotime = this.time2;
    modifpole2(this.x, this.y, this.tip);
    if (this.newx < 0 || this.newx > maxx || this.newy < 0 || this.newy > maxy) {
      this.newx = this.x;
      this.newy = this.y;
      sound(500);
      delay(100);
      nosound();
    }
    // BUG (оригинал): условие «not(x=newx) and (y=newy)» — скобки стоят так,
    // что объезд занятой цели срабатывает только по горизонтали.
    if (!free(gp(this.newx, this.newy, 0)) && (!(this.x === this.newx) && this.y === this.newy) &&
        this.dx === 0 && this.dy === 0 && !(this.sost === 10 || this.sost === 11)) {
      ffff = false;
      if (!ffff) {
        f = false;
        xx = this.newx; yy = this.newy;
        for (i = xx - 1; i <= xx + 1; i++)
          for (j = yy + 1; j >= yy - 1; j--)
            if (i > 0 && j > 0 && i < maxx && j < maxy) {
              if (gp(i, j, 0) === 0) {
                this.newx = i; this.newy = j; f = true;
              }
            }
        if (!f) {
          this.newx = this.x + idiv(this.movex, idiv(40, this.step));
          this.newy = this.y + idiv(this.movey, idiv(40, this.step));
        }
      }
    }

    if (this.movex === 0 && this.movey === 0) {
      if ((!this.flag && this.x !== this.oldx) || this.y !== this.oldy)
        if (own(this.race, gp(this.oldx, this.oldy, 0))) sp(this.oldx, this.oldy, 0, 0);
      selectgo();
      if (own(this.race, gp(this.x + this.dx, this.y + this.dy, 0)))
        sp(this.x + this.dx, this.y + this.dy, 0, this.tip);
      this.oldx = this.x; this.oldy = this.y;
    }
    this.stepMove();
    fx = this._fx; fy = this._fy;
    if (fx === 0) this.angle = 4;
    if (fx === 1) this.angle = 0;
    if (fy === 0) this.angle = 6;
    if (fy === 1) this.angle = 2;
    if (fx === 0 && fy === 0) this.angle = 5;
    if (fx === 0 && fy === 1) this.angle = 3;
    if (fx === 1 && fy === 0) this.angle = 7;
    if (fx === 1 && fy === 1) this.angle = 1;
  }
};

TRobot.prototype.init2 = function () {
  TTech.prototype.init2.call(this);
  this.target = null;
  return this;
};

TRobot.prototype.init = function (xx, yy, nwx, nwy, olx, oly, mvx, mvy, pow, pow1, ras, sel_, tt, ang_,
                                   sx, sy, st, tm2, mov, ramx, ramy, buil) {
  var event2 = new TEvent();
  this.tip = tt; this.angle = ang_;
  TTech.prototype.init.call(this);
  this.x = xx; this.y = yy; this.newx = nwx; this.newy = nwy;
  this.oldx = olx; this.oldy = oly;
  this.oldnewx = this.newx; this.oldnewy = this.newy;
  sp(this.x, this.y, 0, this.tip);
  this.power1 = pow1; this.power = pow;
  this.energy = 0; this.energy1 = 0;
  this.timeinc = time12;
  this.sizex = sx; this.sizey = sy;
  this.movex = 0; this.movey = 0; this.moving = false;
  this.step = b8(st); this.time2 = b8(tm2);
  this.gotime = b8(tm2);
  this.select = sel_; this.race = ras;
  this.moving = mov;
  this.flag = false;
  this.ramkax = ramx; this.ramkay = ramy;
  this.flagac[0] = 0;
  this.flagac[1] = 0;
  this.firetime = 50;
  this.sprx = 0; this.spry = 0;
  this.attack = false;
  this.died = false;
  this.phase = 0;
  this.maxphase = 0;
  this.timephase = 0;
  this.sost = 2;
  this.builder = buil;
  this.pousetime = pouse;
  this.kkk = 0;
  this.color = this.race === 0 ? mycolor : enemycolor;
  this.flagradar[0] = true;
  this.flagradar[1] = true;
  event2.watch = cmevent;
  event2.code = cmwho4;
  event2.komu = this.builder;
  this.message(myhouse, event2);
  if (event2.code === cmitiswho) {
    this.newx = event2.x;
    this.newy = event2.y;
    this.sxx = b8(event2.sx);
    this.syy = b8(event2.sy);
    this.moving = true;
    this.sost = 1;
  }
  this.tipattack = 0;
  this.gr = 0;
  this.tiprocet = 0;
  this.cloack = false;
  this.flagcloack = false;
  this.detector = false;
  this.gruppa.fill(false);
  this.repair = null;
  this.sostway = 255;
  if (this.race === 0) this.sostway = 5;
  this.remont = false;
  this.defenhouse = null;
  this.patr = false;
  this.timesmoke = 0;
  if ((this.power / this.power1) <= 1 / 3) this.flagsmoke = 1;
  else this.flagsmoke = 0;
  this.load[0] = false;
  this.load[1] = false;
  this.chron[1] = 0;
  this.chron[2] = 0;
  this.kolload = 0;
  return this;
};
TRobot.prototype.done = function () { TTech.prototype.done.call(this); };
TRobot.prototype.show = function () { TTech.prototype.show.call(this); };

// ================================= tTank =====================================
function TTank() {}
TTank.prototype = Object.create(TRobot.prototype);
TTank.prototype.constructor = TTank;
TTank.prototype.SIZE = 237;
TTank.prototype.save = function () { TRobot.prototype.save.call(this); };
TTank.prototype.load2 = function () { TRobot.prototype.load2.call(this); };
TTank.prototype.checktarget = function () {};

TTank.prototype.handleevent = function (event) {
  var tar, event2 = new TEvent(), p;
  if (event.watch === cmevent) {
    switch (event.code) {
      case cmattack:
        if (this.race === 0 && !(this.step === 0 && this.select === 0)) {
          var ot = event.otkogo;
          if (event.ground === this.tipattack || this.tipattack === 2) {
            this.attack = true;
            this.tiptar = event.ground;
            this.target = ot;
            this.tarx = ot.x * 40;
            this.tary = ot.y * 40;
            if (rasst(this.x * 40, this.y * 40, this.tarx, this.tary) > this.distance) {
              if (this.step !== 0) {
                this.newx = ot.x;
                this.newy = ot.y;
                this.moving = true;
                this.sost = 3;
              } else {
                this.attack = false;
                this.target = null;
              }
            }
          } else {
            this.newx = ot.x;
            this.newy = ot.y;
            this.moving = true;
            this.sost = 3;
          }
        }
        break;
      case cmfire:
        if (!this.died && !(this.step === 0 && maxenerge[this.race] < energe[this.race])) {
          if (((this.x === this.newx && this.y === this.newy) ||
               (this.movex === 0 && this.movey === 0 && (this.sostway !== 255 && this.race === 1))) &&
              this.attack === false) {
            p = this.seektarget(this.x, this.y, this.distance);
            if (p !== null) {
              this.newx = this.x; this.newy = this.y;
              event2.watch = cmevent;
              event2.code = cmgetxy;
              event2.komu = p;
              this.message(p, event2);
              this.attack = true;
              this.target = p;
              this.tiptar = event2.ground;
              this.tarx = event2.x * 40;
              this.tary = event2.y * 40;
            }
          }
          if (this.firetime > 0) this.firetime--;
          if (this.target !== null && this.attack) {
            if ((((this.x === this.newx && this.y === this.newy)) || this.step === 0) &&
                rasst(this.x * 40, this.y * 40, this.tarx, this.tary) > this.distance) {
              if (this.step !== 0) {
                event2.watch = cmevent;
                event2.code = cmgetxy;
                event2.komu = this.target;
                this.message(this.target, event2);
                if (!event2.mov) {
                  this.newx = event2.x; this.newy = event2.y;
                } else {
                  this.target = null;
                  this.attack = false;
                  this.newx = this.x; this.newy = this.y;
                }
                this.moving = true;
              } else {
                this.attack = false;
                this.target = null;
              }
            }
          }
          if (this.attack && this.target !== null && this.firetime === 0) {
            event2.watch = cmevent;
            event2.code = cmgetxy;
            event2.komu = this.target;
            this.message(this.target, event2);
            if (!event2.mov) {
              if (event2.x <= 100 || event2.x >= 0) this.tarx = event2.x * 40 + 10;
              if (event2.y <= 100 || event2.y >= 0) this.tary = event2.y * 40 + 10;
            } else {
              this.target = null;
              this.attack = false;
              this.newx = this.x; this.newy = this.y;
            }
          }
          if (this.step !== 0 && this.attack && this.moving) {
            if (rasst(this.x * 40, this.y * 40, this.tarx, this.tary) <= this.distance) {
              this.newx = this.x; this.newy = this.y;
            } else {
              event2.mov = true;
              event2.watch = cmevent;
              event2.code = cmgetxy;
              event2.komu = this.target;
              this.message(this.target, event2);
              if (!event2.mov) {
                this.newx = event2.x; this.newy = event2.y;
              } else {
                this.target = null;
                this.attack = false;
                this.newx = this.x; this.newy = this.y;
              }
              this.moving = true;
            }
          }
          if (this.target !== null && this.firetime === 0 && this.attack === true &&
              rasst(this.x * 40, this.y * 40, this.tarx, this.tary) <= this.distance) {
            this.firetime = this.time3;
            tar = { watch: cmkoord, x: this.tarx, y: this.tary };
            if (!this.moving || this.step === 0 || (this.sostway !== 255 && this.race === 1))
              this.angle = ang(this.x, this.y, idiv(this.tarx, 40), idiv(this.tary, 40));

            if (this.step === 0 && flagplay > 500) flagplay = 500;
            if (this.step !== 0) {
              if (flagplay > 800) flagplay = 800;
              if (this.tip === 27 && flagplay > 750) flagplay = 750;
            }
            this.fireRocket(tar, 0);
          }
        }
        break;
    }
  }
  TRobot.prototype.handleevent.call(this, event);
};

TTank.prototype.init2 = function () { TRobot.prototype.init2.call(this); return this; };

TTank.prototype.init = function (xx, yy, nwx, nwy, olx, oly, mvx, mvy, pow, pow1, ras, sel_, tt, ang_,
                                  sx, sy, st, tm2, mov, ramx, ramy, dist, dam, ft, defhouse, sway, pat) {
  TRobot.prototype.init.call(this, xx, yy, nwx, nwy, olx, oly, mvx, mvy, pow, pow1,
    ras, sel_, tt, ang_, sx, sy, st, tm2, mov, ramx, ramy, null);
  if (inR(this.tip, 40, 42)) energe[this.race]++;
  if (inR(this.tip, 70, 72)) energe[this.race]++;
  this.damage = dam;
  this.target = null;
  this.distance = dist;
  this.time3 = b8(ft);
  this.firetime = this.time3;
  if (this.tip === 41) this.spry = -7;
  if (this.tip === 26) {
    this.sizex = 32; this.sizey = 32;
    this.ramkax = 2; this.ramkay = 2;
  }
  if (this.tip === 28) {
    this.ramkax = 2; this.ramkay = 3;
    this.sizex = 34; this.sizey = 34;
  }
  if (this.tip === 29) {
    this.sprx = 1; this.spry = 1;
    this.sizex = 36; this.sizey = 36;
  }
  if (this.tip === 23 || this.tip === 61) {
    this.sprx = 1; this.spry = 1;
    if (this.tip === 23) {
      this.ramkay = 3;
      this.sprx = 1; this.spry = 1;
      this.sizex = 35; this.sizey = 35;
    }
  }
  this.builder = null;
  this.kkk = 0;
  this.sxx = 0; this.syy = 0;
  this.color = this.race === 0 ? mycolor : enemycolor;
  this.flagradar[0] = true;
  this.flagradar[1] = true;
  this.tipattack = 0;
  this.cloack = false;
  this.flagcloack = false;
  this.detector = false;
  if (inSet(this.tip, [40, 70, 71])) {
    this.sizex = 37; this.sizey = 37;
    this.ramkay = 2;
  }
  if (inR(this.tip, 41, 42) || inR(this.tip, 71, 72)) {
    this.tipattack = 1;
    this.sizex = 37;
    this.sizey = 37;
    this.ramkay = 2;
    this.detector = true;
  }
  if (this.tip === 41) {
    this.angletime = time4;
    this.sizex = 40; this.sizey = 40;
    this.ramkay = 3;
  }
  this.gr = 0;
  this.tiprocet = 4;
  if (this.tip === 41 || this.tip === 71) this.tiprocet = 3;
  this.gruppa.fill(false);
  this.sost = 3;
  this.repair = null;
  this.defenhouse = defhouse;
  this.defender = defhouse !== null;
  this.sostway = sway;
  if (this.race === 0) this.sostway = 5;
  if (this.sostway !== 255 && this.race === 1) this.moving = true;
  this.flagfff = false;
  this.remont = false;
  this.remonttime = 0;
  if (this.tip === 67) this.tipattack = 3;
  this.patr = pat;
  if (this.tip === 27) {
    this.energy = 100;
    this.energy1 = 100;
  }
  this.chron[1] = 0;
  this.chron[2] = 0;
  return this;
};

TTank.prototype.done = function () {
  if (inR(this.oldtip, 40, 42)) energe[this.race]--;
  if (inR(this.oldtip, 70, 72)) energe[this.race]--;
  TRobot.prototype.done.call(this);
};
TTank.prototype.show = function () { TRobot.prototype.show.call(this); };
