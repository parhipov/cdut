'use strict';
// =============================================================================
//  PALITRA.PAS — объект-палитра: вспышка/затухание при прыжке хронотанка.
//  Палитра читается из VX.PAL (первые 768 байт). SetAllPalette в оригинале
//  вызывал int 10h/1012h с CX=0FFh — то есть менялись только 255 цветов.
// =============================================================================

function TPalet() {}
TPalet.prototype = Object.create(TObject.prototype);
TPalet.prototype.constructor = TPalet;
TPalet.prototype.SIZE = 879;
TPalet.prototype.zero = function () { TObject.prototype.zero.call(this); this.pal = new Uint8Array(768); };
TPalet.prototype.done = function () { TObject.prototype.done.call(this); };
TPalet.prototype.init = function () {
  this.pal.set(asset('VX.PAL').subarray(0, 768));
  return this;
};

// каждый WaitVBL внутри цикла — отдельный «замороженный» кадр (1/60 с)
TPalet.prototype.palette = function (f) {
  var pal = this.pal, p = pal.slice(), p2, i, j, k, first = true;
  function frame(pp) { waitvblFrame(dac, first); first = false; setallpalette255(pp); }
  switch (f) {
    case 0:
      for (j = 0; j <= 63; j++) {
        for (i = 0; i < 768; i++) {
          if (p[i] < 63) p[i]++;
          if (p[i] < 63) p[i]++;
        }
        frame(p);
      }
      break;
    case 1:
      p2 = new Uint8Array(768).fill(63);
      for (j = 0; j <= 63; j++) {
        for (i = 0; i < 768; i++) if (p2[i] > pal[i]) p2[i]--;
        frame(p2);
      }
      break;
    case 2:
      for (j = 0; j <= 63; j++) {
        for (i = 0; i < 256; i++) {
          if (p[i * 3] < 63) p[i * 3]++;
          if (p[i * 3] < 63) p[i * 3]++;
        }
        frame(p);
      }
      break;
    case 3:
      p2 = pal.slice();
      for (i = 0; i < 256; i++) p2[i * 3] = 63;
      for (j = 0; j <= 63; j++) {
        for (i = 0; i < 768; i++) {
          if (p2[i] > pal[i]) p2[i]--;
          if (p2[i] > pal[i]) p2[i]--;
        }
        frame(p2);
      }
      break;
  }
};

TPalet.prototype.handleevent = function (event) {
  if (event.watch === cmevent) {
    if (event.code === cmpal) {
      if (event.pow === 0) this.palette(0);
      if (event.pow === 1) this.palette(1);
    }
  }
};
