'use strict';
// =============================================================================
//  Запуск в браузере: цикл кадров (60 Гц — частота обратного хода луча VESA
//  640x480, на которую игра ждала через WaitVBL), ввод, вывод на canvas,
//  кнопки работы с сохранениями.
// =============================================================================

var FRAME_MS = 1000 / 60;
var MENU_ITERS = 40;             // меню в оригинале крутилось без WaitVBL — «сколько успеет»
var canvas, ctx, img, img32;
var lastT = 0, acc = 0;
var freezeCur = null, freezeLeft = 0;
var running = false;
var reportOpen = false;     // id открытого окна (доклад, отчёт) — игра на паузе

// --------------------------------- программа ---------------------------------
function tickProgram() {
  for (var guard = 0; guard < 100; guard++) {
    if (freezeQueue.length) return;
    if (prog.waitSound) {
      if (!endingplay) return;
      prog.waitSound = false;
    }
    switch (prog.state) {
      case 'init': programInit(); continue;
      case 'gamestart': programGameStart(); continue;
      case 'run':
        if (!flagmenu) {
          desk.runiteration();
          if (flagquit) prog.state = 'gameend';
          return;
        }
        for (var n = 0; n < MENU_ITERS; n++) {
          desk.runiteration();
          if (flagquit) { prog.state = 'gameend'; break; }
          if (!flagmenu || freezeQueue.length || prog.waitSound) break;
        }
        return;
      case 'gameend': programGameEnd(); continue;
      case 'exit': programExit(); continue;
      case 'leakwait':
        speakerSet(500);
        if (keypressed() || drvMouse.buttons) { readkey(); speakerSet(0); prog.state = 'dos'; }
        return;
      case 'dos':
        return;
    }
  }
}

// --------------------------------- кадр --------------------------------------
function startFreezeIfAny() {
  if (!freezeCur && freezeQueue.length) {
    freezeCur = freezeQueue.shift();
    freezeLeft = freezeCur.ms;
    speakerSet(freezeCur.tone);
  }
}
function tick(t) {
  requestAnimationFrame(tick);
  if (!running || reportOpen) { lastT = 0; return; }
  var dt = lastT ? Math.min(250, t - lastT) : FRAME_MS;
  lastT = t;
  if (freezeCur) {
    freezeLeft -= dt;
    while (freezeCur && freezeLeft <= 0) {
      var extra = -freezeLeft;
      freezeCur = freezeQueue.shift() || null;
      if (freezeCur) { freezeLeft = freezeCur.ms - extra; speakerSet(freezeCur.tone); }
    }
    if (!freezeCur) { speakerSet(speakerHz); acc = 0; }
    present();
    return;
  }
  acc += dt;
  var steps = 0;
  while (acc >= FRAME_MS - 0.5 && steps < 4) {
    tickProgram();
    releasePendingButtons();
    if (sbStallMs) { acc -= sbStallMs; sbStallMs = 0; }   // ResetDSP: Delay(10) x2
    acc -= FRAME_MS;
    steps++;
    if (freezeQueue.length) { acc = 0; break; }
  }
  if (steps >= 4) acc = 0;
  startFreezeIfAny();
  present();
}

function present() {
  if (prog.state === 'dos') { drawDos(); return; }
  if (freezeCur) presentBuffer(img32, freezeCur.snap, 0, freezeCur.pal);
  else presentBuffer(img32, vram, vxs.crtbase, dac);
  ctx.putImageData(img, 0, 0);
}

// экран после выхода из программы (текстовый режим DOS)
function drawDos() {
  var buf = new Uint8Array(640 * 480), font = asset('ASM:STANDARDFONT');
  var lines = ['', R('C:\\WORK23>'), '',
    R('  Программа завершена.'),
    R('  Нажмите любую клавишу или щёлкните, чтобы запустить снова.')];
  for (var l = 0; l < lines.length; l++) {
    var s = lines[l];
    for (var k = 0; k < s.length; k++)
      for (var r = 0; r < 16; r++) {
        var bits = font[s.charCodeAt(k) * 16 + r];
        for (var b = 0; b < 8; b++) if (bits & (0x80 >> b)) buf[(l * 16 + r) * 640 + k * 8 + b] = 7;
      }
  }
  if ((Date.now() >> 9) & 1) for (var y = 30; y < 32; y++) for (var x = 80; x < 88; x++) buf[y * 640 + x] = 7;
  presentBuffer(img32, buf, 0, standardpalette || asset('ASM:STANDARDPALETTE'));
  ctx.putImageData(img, 0, 0);
}

// --------------------------------- ввод --------------------------------------
var SCAN = { ArrowUp: 72, ArrowDown: 80, ArrowLeft: 75, ArrowRight: 77, Home: 71, End: 79,
             PageUp: 73, PageDown: 81, Insert: 82, Delete: 83,
             F1: 59, F2: 60, F3: 61, F4: 62, F6: 64, F7: 65, F8: 66, F9: 67, F10: 68 };
var SHIFTDIGIT = { Digit1: '!', Digit2: '@', Digit3: '#', Digit4: '$', Digit5: '%',
                   Digit6: '^', Digit7: '&', Digit8: '*', Digit9: '(', Digit0: ')' };
function onKeyDown(e) {
  shiftDown = e.shiftKey; ctrlDown = e.ctrlKey;
  if (reportOpen) {
    if (e.key === 'Escape') { e.preventDefault(); toggleReport(false); }
    return;
  }
  if (!running) { if (!e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); startGame(); } return; }
  audioInit();
  if (prog.state === 'dos') { location.reload(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'F5' || e.key === 'F11' || e.key === 'F12') return;
  var code = e.code;
  if (SCAN[code] !== undefined || SCAN[e.key] !== undefined) {
    kbdPush(0, SCAN[code] !== undefined ? SCAN[code] : SCAN[e.key]);
    e.preventDefault(); return;
  }
  switch (e.key) {
    case 'Enter': kbdPush(13, 28); e.preventDefault(); return;
    case 'Escape': kbdPush(27, 1); e.preventDefault(); return;
    case 'Backspace': kbdPush(8, 14); e.preventDefault(); return;
    case 'Tab': kbdPush(9, 15); e.preventDefault(); return;
  }
  if (/^Digit\d$/.test(code)) {
    kbdPush(ch(e.shiftKey ? SHIFTDIGIT[code] : code.charAt(5)), 0);
    e.preventDefault(); return;
  }
  if (e.key.length === 1) {
    var c = UNI2CP[e.key];
    if (c !== undefined) { kbdPush(c, 0); e.preventDefault(); }
  }
}
function onKeyUp(e) { shiftDown = e.shiftKey; ctrlDown = e.ctrlKey; }

var pendingRelease = 0, observed = 0;
var _origMouseButton = mousebutton;
mousebutton = function () { observed |= drvMouse.buttons; return _origMouseButton(); };
function releasePendingButtons() {
  if (pendingRelease) {
    drvMouse.buttons &= ~(pendingRelease & observed);
    pendingRelease &= ~observed;
  }
}
function updateMousePos(e) {
  if (reportOpen) return;
  var r = canvas.getBoundingClientRect();
  var x = Math.floor((e.clientX - r.left) * 640 / r.width);
  var y = Math.floor((e.clientY - r.top) * 480 / r.height);
  drvMouse.x = Math.max(0, Math.min(639, x));
  drvMouse.y = Math.max(0, Math.min(479, y));
  shiftDown = e.shiftKey;
  if (running && vmouse.cur) mouseIrq();
}
function btnBit(e) { return e.button === 0 ? 1 : e.button === 2 ? 2 : 0; }
function onMouseDown(e) {
  e.preventDefault();
  if (!running) return;
  audioInit();
  if (prog.state === 'dos') { location.reload(); return; }
  updateMousePos(e);
  var b = btnBit(e);
  drvMouse.buttons |= b;
  observed &= ~b;
  pendingRelease &= ~b;
}
function onMouseUp(e) {
  var b = btnBit(e);
  if (!(drvMouse.buttons & b)) return;
  updateMousePos(e);
  if (observed & b) drvMouse.buttons &= ~b;     // нажатие уже «видела» программа
  else pendingRelease |= b;                     // короткий щелчок — держим до следующего кадра
}

// ----------------------------- сохранения: zip/импорт ------------------------
var CRC_T = (function () {
  var t = new Uint32Array(256);
  for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(d) { var c = 0xFFFFFFFF; for (var i = 0; i < d.length; i++) c = CRC_T[(c ^ d[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  var parts = [], central = [], offset = 0;
  function u16(a, v) { a.push(v & 255, (v >> 8) & 255); }
  function u32(a, v) { a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); }
  files.forEach(function (f) {
    var name = new TextEncoder().encode(f.name), crc = crc32(f.data), h = [];
    u32(h, 0x04034b50); u16(h, 10); u16(h, 0); u16(h, 0); u16(h, 0); u16(h, 0x21);
    u32(h, crc); u32(h, f.data.length); u32(h, f.data.length); u16(h, name.length); u16(h, 0);
    parts.push(new Uint8Array(h), name, f.data);
    var c = [];
    u32(c, 0x02014b50); u16(c, 20); u16(c, 10); u16(c, 0); u16(c, 0); u16(c, 0); u16(c, 0x21);
    u32(c, crc); u32(c, f.data.length); u32(c, f.data.length); u16(c, name.length);
    u16(c, 0); u16(c, 0); u16(c, 0); u16(c, 0); u32(c, 0); u32(c, offset);
    central.push(new Uint8Array(c), name);
    offset += h.length + name.length + f.data.length;
  });
  var csize = central.reduce(function (s, a) { return s + a.length; }, 0), e = [];
  u32(e, 0x06054b50); u16(e, 0); u16(e, 0); u16(e, files.length); u16(e, files.length);
  u32(e, csize); u32(e, offset); u16(e, 0);
  return new Blob(parts.concat(central, [new Uint8Array(e)]), { type: 'application/zip' });
}
function exportSaves() {
  var files = [];
  for (var i = 1; i <= 12; i++) {
    var d = fsRead('save' + i + '.sav');
    if (!d) break;
    files.push({ name: 'SAVE' + i + '.SAV', data: d });
  }
  var a = document.createElement('a');
  a.href = URL.createObjectURL(makeZip(files));
  a.download = 'work23_saves.zip';
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
}
function refreshMenuFiles() {
  if (menu && !menu.flagstr) {
    var ev = new TEvent(); ev.watch = cmevent; ev.code = cmrestore;
    menu.handleevent(ev);
    if (flagmenu && (menu.sost === 6 || menu.sost === 8)) newmenu[0] = true;
  }
}
function importSaves(fileList) {
  var arr = Array.prototype.slice.call(fileList), bad = [];
  var left = arr.length;
  if (!left) return;
  arr.forEach(function (f) {
    var m = /save(\d+)\.sav$/i.exec(f.name);
    if (!m || +m[1] < 1 || +m[1] > 12) { bad.push(f.name); if (--left === 0) done(); return; }
    f.arrayBuffer().then(function (buf) {
      fsWrite('SAVE' + (+m[1]) + '.SAV', new Uint8Array(buf));
      if (--left === 0) done();
    });
  });
  function done() {
    refreshMenuFiles();
    if (bad.length) alert('Файлы должны называться SAVE1.SAV … SAVE12.SAV:\n' + bad.join('\n'));
  }
}
function resetSaves() {
  if (!confirm('Вернуть оригинальные сохранения SAVE1–SAVE11 и удалить сделанные в браузере?')) return;
  var keys = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && k.indexOf(FS_PREFIX) === 0) keys.push(k);
  }
  keys.forEach(function (k) { localStorage.removeItem(k); });
  refreshMenuFiles();
}

// --------------------------------- старт -------------------------------------
function boot() {
  canvas = document.getElementById('screen');
  ctx = canvas.getContext('2d');
  img = ctx.createImageData(640, 480);
  img32 = new Uint32Array(img.data.buffer);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('mousemove', updateMousePos);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.getElementById('btn-full').onclick = function () {
    var el = document.getElementById('crt');
    if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen();
  };
  document.getElementById('btn-export').onclick = exportSaves;
  document.getElementById('btn-import').onclick = function () { document.getElementById('file-import').click(); };
  document.getElementById('file-import').onchange = function (e) { importSaves(e.target.files); e.target.value = ''; };
  document.getElementById('btn-reset').onclick = resetSaves;
  Object.keys(READERS).forEach(function (id) {
    document.getElementById('btn-' + id).onclick = function () { toggleReport(reportOpen === id ? false : id); };
    document.getElementById(id + '-close').onclick = function () { toggleReport(false); };
  });
  document.getElementById('start').addEventListener('click', function (e) { e.preventDefault(); startGame(); });
  requestAnimationFrame(tick);
}
// окна для чтения поверх игры: id окна → надпись на его кнопке
var READERS = { doklad: 'Доклад', otchet: 'Отчёт о переезде' };
function toggleReport(which) {
  reportOpen = which || false;
  Object.keys(READERS).forEach(function (id) {
    document.getElementById(id).classList.toggle('open', id === reportOpen);
    document.getElementById('btn-' + id).textContent = id === reportOpen ? 'К игре' : READERS[id];
  });
  if (reportOpen) speakerSet(0);
  else canvas.focus();
}
function startGame() {
  document.getElementById('start').style.display = 'none';
  audioInit();
  if (!running) { running = true; canvas.focus(); }
}
window.addEventListener('load', boot);
