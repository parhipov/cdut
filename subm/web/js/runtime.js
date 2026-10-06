'use strict';
// =============================================================================
//  Окружение DOS для SUBM8: строки CP866, файлы, Crt (Delay, KeyPressed,
//  ReadKey), буфер клавиатуры BIOS, ошибки времени выполнения, Halt.
// =============================================================================

// ---- CP866 ------------------------------------------------------------------
var CP866_HI = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп' +
  '░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀' +
  'рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ';
var CP866_ENC = {};
for (var _i = 0; _i < 128; _i++) CP866_ENC[CP866_HI[_i]] = 128 + _i;
// Строка Паскаля — массив кодов CP866
function S(str) {
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    out.push(c < 128 ? c : (CP866_ENC[str[i]] || 63));
  }
  return out;
}
function cat() { var r = []; for (var i = 0; i < arguments.length; i++) r = r.concat(arguments[i]); return r; }
function str(n) { return S(String(n)); }

// ---- ресурсы ----------------------------------------------------------------
var assetCache = {};
function asset(name) {
  var k = name.toUpperCase();
  if (assetCache[k]) return assetCache[k];
  var b64 = ASSETS[k];
  if (b64 === undefined) throw new Error('нет файла ' + k);
  var bin = atob(b64), a = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return (assetCache[k] = a);
}

// ---- файлы DOS -------------------------------------------------------------
// У программы 20 дескрипторов (таблица в PSP), 5 заняты стандартными
// устройствами. Assign на открытую файловую переменную «забывает» дескриптор —
// файл остаётся открытым до конца программы.
var DOS_HANDLES = 20, dosHandlesUsed = 5;
// Assign + Reset; addr — адрес, который TP7 напечатал бы при ошибке (из SUBM8.EXE)
function dosOpen(addr) {
  if (dosHandlesUsed >= DOS_HANDLES) rte(4, addr);       // Too many open files
  dosHandlesUsed++;
}
function fileClose(fobj) { if (fobj && fobj.open) { fobj.open = false; dosHandlesUsed--; } }

// нетипизированный файл: BlockRead по порядку
function BinFile(name, addr) { dosOpen(addr); this.open = true; this.d = asset(name); this.p = 0; }
BinFile.prototype.word = function () { var v = this.d[this.p] | (this.d[this.p + 1] << 8); this.p += 2; return v; };
BinFile.prototype.int = function () { return (this.word() << 16) >> 16; };
BinFile.prototype.image = function (size) { var img = decodeImage(this.d, this.p); this.p += size; return img; };

// текстовый файл: Read(f, integer) и ReadLn(f) как в Turbo Pascal
function TextFile(name, addr) { dosOpen(addr); this.open = true; this.d = asset(name); this.p = 0; }
TextFile.prototype.readInt = function () {
  var d = this.d, n = d.length;
  while (this.p < n && d[this.p] <= 32 && d[this.p] !== 26) this.p++;
  if (this.p >= n || d[this.p] === 26) return 0;
  var neg = false;
  if (d[this.p] === 45) { neg = true; this.p++; } else if (d[this.p] === 43) this.p++;
  var v = 0, any = false;
  while (this.p < n && d[this.p] >= 48 && d[this.p] <= 57) { v = v * 10 + d[this.p] - 48; this.p++; any = true; }
  if (!any || (this.p < n && d[this.p] > 32)) rte(106);   // Invalid numeric format
  return neg ? -v : v;
};
TextFile.prototype.readln = function () {
  var d = this.d, n = d.length;
  while (this.p < n && d[this.p] !== 10 && d[this.p] !== 26) this.p++;
  if (this.p < n && d[this.p] === 10) this.p++;
};

// ---- ошибки времени выполнения и Halt --------------------------------------
function RunError(code, addr) { this.code = code; this.addr = addr || '0000:0000'; }
function HaltSignal() {}
function rte(code, addr) { throw new RunError(code, addr); }
// проверка диапазона ($R+): индекс вне границ — Runtime error 201.
// addr — адрес проверки в SUBM8.EXE (известен для мест, где ошибка достижима)
function rc(v, lo, hi, addr) { if (v < lo || v > hi) rte(201, addr); return v; }

// ---- время ------------------------------------------------------------------
// Виртуальные часы программы. Delay(ms) сдвигает их и ждёт, пока догонит
// реальное время. Рисование тоже сдвигает часы — на «стоимость» операций
// (см. bgi.js, профиль машины).
var vclock = 0, realStart = 0, paused = false;
var awaitLimit = Infinity;                  // до какого момента можно «показывать» кадры, пока программа ждёт
function nowMs() { return performance.now() - realStart; }
function delay(ms) {
  vclock += ms;
  var lag = nowMs() - vclock;
  if (lag > 250) vclock = nowMs();          // вкладка спала — не «догоняем» рывком
  awaitLimit = vclock;
  return waitUntil(vclock);
}
function waitUntil(t) {
  return new Promise(function (resolve) {
    (function check() {
      if (paused) { setTimeout(check, 50); return; }
      var rest = t - nowMs();
      if (rest <= 0) resolve(); else setTimeout(check, Math.min(rest, 50));
    })();
  });
}

// ---- клавиатура: буфер BIOS (15 нажатий) и Crt.ReadKey ---------------------
var kbdBuf = [];                            // слова (скан-код << 8) | ASCII
var crtScan = 0;                            // второй байт расширенной клавиши
var crtBreak = false;                       // Ctrl+Break: флаг из обработчика INT 1Bh модуля Crt
var kbdWaiter = null;
function kbdPush(ascii, scan) {
  if (kbdBuf.length >= 15) return;          // буфер полон — нажатие теряется
  kbdBuf.push((scan << 8) | ascii);
  if (kbdWaiter) { var w = kbdWaiter; kbdWaiter = null; w(); }
}
function keypressed() { return crtScan !== 0 || kbdBuf.length > 0; }
// ReadKey ждёт нажатия; расширенная клавиша даёт #0, затем скан-код
function readkey() {
  if (crtScan) { var s = crtScan; crtScan = 0; return Promise.resolve(s); }
  if (kbdBuf.length) { var k0 = takeKey(); return k0 < 0 ? Promise.reject(new BreakSignal()) : Promise.resolve(k0); }
  awaitLimit = Infinity;
  return new Promise(function (resolve, reject) {
    kbdWaiter = function () {
      vclock = Math.max(vclock, nowMs());
      var k = takeKey();
      if (k < 0) reject(new BreakSignal()); else resolve(k);
    };
  });
}
function takeKey() {
  var w = kbdBuf.shift(), a = w & 0xFF;
  if (a === 0) crtScan = (w >> 8) || 0;
  // Ctrl+Break: BIOS кладёт в буфер слово 0000, ReadKey возвращает #3, а Crt
  // видит флаг, чистит буфер, печатает «^C» и делает Halt(255)
  if (w === 0 && crtBreak) { crtBreak = false; crtScan = 0; kbdBuf.length = 0; return -1; }
  return a;
}
function BreakSignal() {}
