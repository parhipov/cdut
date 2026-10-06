'use strict';
// =============================================================================
//  Эмуляция среды Turbo Pascal 7 / DOS, в которой работала игра:
//  CP866-строки, Random, Round, буфер клавиатуры BIOS, драйвер мыши (int 33h),
//  куча (MemAvail), «указатели», файлы сохранений, блокирующие задержки.
// =============================================================================

// ---------------------------- CP866 -----------------------------------------
var CP866_HI =
  'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп' +
  '░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀' +
  'рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ';
var UNI2CP = {};
(function () {
  for (var i = 0; i < 128; i++) UNI2CP[String.fromCharCode(i)] = i;
  for (var j = 0; j < 128; j++) UNI2CP[CP866_HI[j]] = 128 + j;
})();

// Строки Паскаля храним как JS-строки, где код каждого символа = байт CP866.
function R(s) {
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = UNI2CP[s[i]];
    out += String.fromCharCode(c === undefined ? 63 : c);
  }
  return out;
}
function cpToUni(s) {
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    out += c < 128 ? String.fromCharCode(c) : CP866_HI[c - 128];
  }
  return out;
}
function ch(c) { return UNI2CP[c]; }   // символ -> код CP866 (для сравнений с key)

// ---------------------------- ресурсы ---------------------------------------
var ASSETS = {};
function b64ToBytes(s) {
  var bin = atob(s), n = bin.length, a = new Uint8Array(n);
  for (var i = 0; i < n; i++) a[i] = bin.charCodeAt(i);
  return a;
}
function asset(name) {
  var k = name.toUpperCase();
  if (!ASSETS[k]) {
    if (!ASSETS_B64[k]) throw new Error('Нет файла ' + name);
    ASSETS[k] = b64ToBytes(ASSETS_B64[k]);
  }
  return ASSETS[k];
}

// ---------------------------- Паскаль ---------------------------------------
var randseed = 0;
function randomize() { randseed = (Date.now() ^ (performance.now() * 1000)) | 0; }
// Random(N) Turbo Pascal 7: RandSeed := RandSeed*134775813+1, результат —
// старшее слово 48-битного произведения RandSeed (без знака) * N, с переносом
// из младшего слова (сверено с машинным кодом WORK23.EXE)
function random(n) {
  randseed = (Math.imul(randseed, 134775813) + 1) | 0;
  return Math.floor((randseed >>> 0) * (n & 0xFFFF) / 4294967296);
}
// Round у Real в TP: половина округляется от нуля
function round(v) { return v < 0 ? -Math.floor(-v + 0.5) : Math.floor(v + 0.5); }
function idiv(a, b) { return Math.trunc(a / b); }   // Паскалевский div
// Результат операции над 6-байтным Real ({$N-}): 40 значащих бит вместо 53
function r48(v) {
  if (v === 0 || !isFinite(v)) return v;
  var a = Math.abs(v), e = Math.floor(Math.log2(a)), sc = Math.pow(2, 39 - e);
  var r = Math.round(a * sc) / sc;
  return v < 0 ? -r : r;
}
function sqr(v) { return v * v; }
function str(v) { return String(v); }
function b8(v) { return v & 255; }                // присваивание в byte
function inSet(v, list) { return list.indexOf(v) >= 0; }
function inR(v, a, b) { return v >= a && v <= b; }

// Ошибки диапазона ($R+ в оригинале -> «Runtime error 201»). Здесь не роняем
// программу, а пишем в консоль, чтобы баги оригинала были видны.
var rangeWarned = {};
function rangeError(where) {
  if (!rangeWarned[where]) {
    rangeWarned[where] = 1;
    console.warn('[оригинал упал бы с Runtime error 201] выход за границы массива: ' + where);
  }
}

// ---------------------------- куча / указатели ------------------------------
// Каждый объект в куче получает «адрес» (как seg:ofs). Указатели в полях
// храним как ссылки на JS-объекты, а в файл сохранения пишем адрес — так же,
// как это делал blockwrite в оригинале. MemAvail считаем по реальным размерам
// объектов TP7 (с округлением до 8 байт, как у менеджера кучи TP).
//
// Начальный объём свободной кучи подобран так, чтобы в SAVE5.SAV (где компьютер
// настроил ~330 единиц техники) MemAvail оказался около 20000 — порога, после
// которого ИИ в оригинале прекращал строить (if memAvail<20000 ...).
var HEAP_INITIAL = 117000;
var heapUsed = 0;
var heapNext = 0;
var heapTable = new Map();
function heapAlloc(obj, size) {
  var sz = (size + 7) & ~7;
  obj.__size = sz;
  heapUsed += sz;
  heapNext++;
  obj.__addr = (0xA0000000 + heapNext * 8) >>> 0;
  heapTable.set(obj.__addr, obj);
  return obj;
}
function heapFree(obj) {
  if (obj.__freed) return;
  obj.__freed = true;
  heapUsed -= obj.__size;
  heapTable.delete(obj.__addr);
}
function memavail() { return HEAP_INITIAL - heapUsed; }

// «Висячий» указатель (прочитан из файла, но не настроен через cmRestore).
// В оригинале он указывал на произвольную память; здесь — на пустышку,
// которая игнорирует сообщения.
var staleTable = new Map();
function addrOf(p) { return p === null || p === undefined ? 0 : (p.__addr >>> 0); }
function deref(a) {
  a = a >>> 0;
  if (a === 0) return null;
  var o = heapTable.get(a);
  if (o) return o;
  return stalePtr(a);
}
function stalePtr(a) {
  var o = staleTable.get(a);
  if (!o) {
    o = Object.create(TStale.prototype);
    TObject.prototype.zero.call(o);
    o.__addr = a; o.__stale = true;
    staleTable.set(a, o);
  }
  return o;
}
function TStale() {}
TStale.prototype.handleevent = function () {};
TStale.prototype.show = function () {};
TStale.prototype.done = function () {};

function dispose(obj) {
  if (!obj || obj.__stale || obj.__freed) {
    if (!dispose.warned) { dispose.warned = true; console.warn('[оригинал] dispose висячего указателя'); }
    return;
  }
  obj.done();
  heapFree(obj);
}

// ---------------------------- клавиатура BIOS -------------------------------
var kbdBuf = [];
var kbdExt = -1;
var shiftDown = false, ctrlDown = false;
function kbdPush(ascii, scan) {
  if (kbdBuf.length >= 15) return;       // буфер BIOS на 15 нажатий
  kbdBuf.push({ ascii: ascii, scan: scan });
}
function keypressed() { return kbdExt >= 0 || kbdBuf.length > 0; }
function readkey() {
  if (kbdExt >= 0) { var c = kbdExt; kbdExt = -1; return c; }
  if (!kbdBuf.length) return 0;
  var k = kbdBuf.shift();
  if (k.ascii === 0) kbdExt = k.scan;
  return k.ascii;
}
function shift() { return shiftDown; }
function control() { return ctrlDown; }

// ---------------------------- драйвер мыши (int 33h) ------------------------
var drvMouse = { x: 320, y: 240, buttons: 0 };
function mousex() { return drvMouse.x; }
function mousey() { return drvMouse.y; }
function mousebutton() { return drvMouse.buttons; }
function mouseread() { return { x: drvMouse.x, y: drvMouse.y, b: drvMouse.buttons }; }

// ---------------------------- задержки --------------------------------------
// В оригинале Delay/WaitVBL останавливали программу. Здесь игровая итерация
// дорабатывает до конца, а затем «замороженные» кадры (снимок экрана в момент
// вызова) показываются нужное время — визуально так же, как в DOS.
var freezeQueue = [];
var speakerHz = 0;
function snapshotScreen() {
  var base = vxs.crtbase;
  return vram.slice(base, base + 640 * 480);
}
function pushFreeze(ms, pal, keepSnap) {
  var last = freezeQueue.length ? freezeQueue[freezeQueue.length - 1] : null;
  var snap = keepSnap && last ? last.snap : snapshotScreen();
  freezeQueue.push({ ms: ms, snap: snap, pal: pal ? pal.slice() : dac.slice(), tone: speakerHz });
}
function delay(ms) { pushFreeze(ms, null, false); }
// один кадр ожидания обратного хода луча внутри блокирующего цикла (затемнение палитры)
function waitvblFrame(pal, first) { pushFreeze(1000 / 60, pal, !first); }
function sound(hz) { speakerHz = hz; }
function nosound() { speakerHz = 0; }

// ---------------------------- файлы -----------------------------------------
// Сохранения: сначала ищем в localStorage (то, что сохранено в браузере),
// иначе — оригинальные SAVE1..SAVE11.SAV из папки игры.
var FS_PREFIX = 'work23:';
function bytesToB64(a) {
  var s = '';
  for (var i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
  return btoa(s);
}
function fsRead(name) {
  var k = name.toUpperCase();
  try {
    var v = localStorage.getItem(FS_PREFIX + k);
    if (v !== null) return b64ToBytes(v);
  } catch (e) {}
  if (ASSETS_B64[k]) return asset(k);
  return null;
}
function fsWrite(name, bytes) {
  var k = name.toUpperCase();
  try {
    localStorage.setItem(FS_PREFIX + k, bytesToB64(bytes));
  } catch (e) {
    console.error('Не удалось сохранить ' + k, e);
    alert('Браузер не дал сохранить файл ' + k + ' (нет места в localStorage?)');
  }
}

// Последовательное чтение/запись как BlockRead/BlockWrite
function BinWriter() { this.buf = new Uint8Array(1 << 16); this.n = 0; }
BinWriter.prototype.need = function (k) {
  if (this.n + k > this.buf.length) {
    var nb = new Uint8Array(Math.max(this.buf.length * 2, this.n + k));
    nb.set(this.buf.subarray(0, this.n)); this.buf = nb;
  }
};
BinWriter.prototype.u8 = function (v) { this.need(1); this.buf[this.n++] = v & 255; };
BinWriter.prototype.bool = function (v) { this.u8(v ? 1 : 0); };
BinWriter.prototype.u16 = function (v) { this.u8(v); this.u8(v >> 8); };
BinWriter.prototype.i16 = BinWriter.prototype.u16;
BinWriter.prototype.i32 = function (v) { this.u16(v & 0xFFFF); this.u16((v >>> 16) & 0xFFFF); };
BinWriter.prototype.ptr = function (p) { this.i32(addrOf(p)); };
BinWriter.prototype.bytes = function (a) { this.need(a.length); this.buf.set(a, this.n); this.n += a.length; };
// Паскалевская строка: длина + символы, ровно size байт (как blockwrite(s,size))
BinWriter.prototype.pstr = function (s, size, tail) {
  var b = new Uint8Array(size);
  if (tail) b.set(tail.subarray(0, size));
  b[0] = s.length & 255;
  for (var i = 0; i < s.length && i + 1 < size; i++) b[i + 1] = s.charCodeAt(i);
  this.bytes(b);
};
BinWriter.prototype.real = function (v) { this.bytes(realToBytes(v)); };
BinWriter.prototype.result = function () { return this.buf.slice(0, this.n); };

function BinReader(bytes) { this.b = bytes; this.p = 0; }
BinReader.prototype.u8 = function () { return this.p < this.b.length ? this.b[this.p++] : (this.p++, 0); };
BinReader.prototype.bool = function () { return this.u8() !== 0; };
BinReader.prototype.u16 = function () { var a = this.u8(); return a | (this.u8() << 8); };
BinReader.prototype.i16 = function () { return (this.u16() << 16) >> 16; };
BinReader.prototype.i32 = function () { var a = this.u16(); return (a | (this.u16() << 16)) | 0; };
// указатель из файла: старый адрес из прошлой сессии; настраивается через cmRestore
BinReader.prototype.ptr = function () { var a = this.i32() >>> 0; return a === 0 ? null : stalePtr(a); };
BinReader.prototype.bytes = function (n) { var r = this.b.slice(this.p, this.p + n); this.p += n; return r; };
BinReader.prototype.pstr = function (size) {
  var r = this.bytes(size), s = '';
  for (var i = 0; i < r[0] && i + 1 < size; i++) s += String.fromCharCode(r[i + 1]);
  return s;
};
BinReader.prototype.real = function () { return bytesToReal(this.bytes(6)); };

// 6-байтный Real Turbo Pascal
function bytesToReal(b) {
  var e = b[0];
  if (e === 0) return 0;
  var sign = b[5] & 0x80 ? -1 : 1;
  var frac = (b[5] & 0x7F) * 4294967296 + b[4] * 16777216 + b[3] * 65536 + b[2] * 256 + b[1];
  return sign * (1 + frac / 549755813888) * Math.pow(2, e - 129);
}
function realToBytes(v) {
  var b = new Uint8Array(6);
  if (v === 0 || !isFinite(v)) return b;
  var s = v < 0; v = Math.abs(v);
  var e = Math.floor(Math.log2(v));
  var m = v / Math.pow(2, e);
  if (m >= 2) { m /= 2; e++; }
  if (m < 1) { m *= 2; e--; }
  var frac = Math.round((m - 1) * 549755813888);
  if (frac >= 549755813888) { frac = 0; e++; }
  if (e + 129 <= 0) return b;
  b[0] = e + 129;
  var hi = Math.floor(frac / 4294967296), lo = frac - hi * 4294967296;
  b[1] = lo & 255; b[2] = (lo >>> 8) & 255; b[3] = (lo >>> 16) & 255; b[4] = (lo >>> 24) & 255;
  b[5] = (hi & 0x7F) | (s ? 0x80 : 0);
  return b;
}
