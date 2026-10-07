'use strict';
// =============================================================================
//  Запуск в браузере: программа SUBM8 работает как async-функция (Delay и
//  ReadKey — это await), видимая страница видеопамяти выводится на canvas
//  каждый кадр. Клавиатура — через буфер BIOS с автоповтором как у AT:
//  задержка 500 мс, затем 10,9 нажатия в секунду.
// =============================================================================

var canvas, ctx, img, img32;
var PAL32 = new Uint32Array(16);
var progState = 'run';          // run | dos | error
var running = false;            // программа запущена (после первого нажатия — иначе браузер не даст звук)

// ---- PC-спикер: квадратная волна (в «нерелизной» версии с музыкой) ----------
var audioCtx = null, spkOsc = null, spkGain = null, spkHz = 0;
function audioInit() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
// NoSound — генератор останавливается и отключается целиком (а не просто
// приглушается): так нота гарантированно не «зависнет» ни в одном браузере
function speakerApply() {
  if (!audioCtx) return;
  var on = spkHz > 0 && MUSIC && !paused && progState === 'run';
  if (on) {
    if (!spkOsc) {
      spkOsc = audioCtx.createOscillator(); spkOsc.type = 'square';
      spkGain = audioCtx.createGain(); spkGain.gain.value = 0.05;
      spkOsc.connect(spkGain); spkGain.connect(audioCtx.destination); spkOsc.start();
    }
    spkOsc.frequency.value = spkHz;
  } else if (spkOsc) {
    try { spkOsc.stop(); } catch (e) {}
    spkOsc.disconnect(); spkGain.disconnect();
    spkOsc = null; spkGain = null;
  }
}
speakerOut = function (hz) { spkHz = hz; speakerApply(); };
var errorCode = 0;
var reportOpen = false;         // открыто окно справки или отчёта — игра на паузе

// на экран идёт последний кадр, «прочерченный» лучом (см. развёртку в bgi.js)
function present() {
  requestAnimationFrame(present);
  if (!running || progState === 'dos') return;
  if (progState === 'run') { timerPump(nowMs()); scanTo(Math.min(nowMs(), awaitLimit)); }
  var src = progState === 'run' ? dispDone : VRAM.subarray(PAGE_BASE[bgi.visual], PAGE_BASE[bgi.visual] + 640 * 350);
  for (var p = 0; p < 640 * 350; p++) img32[p] = PAL32[src[p]];
  ctx.putImageData(img, 0, 0);
}

// текст средствами BIOS: знакоместо 8x14, серый (цвет 7) на чёрном
var FONT14 = null;
function biosText(buf, base, row, col, s) {
  for (var k = 0; k < s.length && col + k < 80; k++)
    for (var yy = 0; yy < 14; yy++) {
      var bits = FONT14[s[k] * 14 + yy];
      for (var xx = 0; xx < 8; xx++) buf[base + (row * 14 + yy) * 640 + (col + k) * 8 + xx] = (bits & (0x80 >> xx)) ? 7 : 0;
    }
}
// экран DOS после выхода из программы: CloseGraph вернул текстовый режим 80x25
function showDos(lines) {
  progState = 'dos'; speakerApply();
  var t = new Uint8Array(640 * 350);
  for (var r = 0; r < lines.length; r++) biosText(t, 0, r, 0, S(lines[r]));
  for (var p = 0; p < 640 * 350; p++) img32[p] = PAL32[t[p]];
  ctx.putImageData(img, 0, 0);
  document.getElementById('dosmsg').style.display = 'flex';
}

async function runProgram() {
  try {
    await subm8();
  } catch (e) {
    if (e instanceof HaltSignal) showDos(['', 'C:\\>']);
    else if (e instanceof BreakSignal) showBreak();
    else if (e instanceof RunError) { errorCode = e.code; showRunError(e); }
    else { console.error(e); showDos(['', 'Внутренняя ошибка браузерной версии: ' + e.message]); }
  }
}
// Runtime error в графическом режиме: CloseGraph не вызывается, DOS печатает
// сообщение телетайпом BIOS поверх картинки (на видимой странице), затем
// COMMAND.COM — приглашение. Так выглядит и оригинал в DOSBox.
function showRunError(e) {
  progState = 'error'; speakerApply();
  console.warn('[оригинал] Runtime error ' + e.code + ' at ' + e.addr);
  var code = ('00' + e.code).slice(-3);
  var base = PAGE_BASE[bgi.visual];
  biosText(VRAM, base, 0, 0, S('Runtime error ' + code + ' at ' + e.addr + '.'));
  biosText(VRAM, base, 2, 0, S('C:\\>'));
  document.getElementById('dosmsg').style.display = 'flex';
}

// Ctrl+Break: Crt пишет «^C» в левый верхний угол страницы 0 и завершает
// программу без сообщения; экран остаётся в графике
function showBreak() {
  progState = 'error'; speakerApply();
  biosText(VRAM, PAGE_BASE[0], 0, 0, S('^C'));
  biosText(VRAM, PAGE_BASE[bgi.visual], 2, 0, S('C:\\>'));
  document.getElementById('dosmsg').style.display = 'flex';
}

// --------------------------------- ввод --------------------------------------
var SCAN_EXT = { ArrowUp: 72, ArrowDown: 80, ArrowLeft: 75, ArrowRight: 77, Home: 71, End: 79,
                 PageUp: 73, PageDown: 81, Insert: 82, Delete: 83 };
var FKEY = { F1: 0, F2: 1, F3: 2, F4: 3, F5: 4, F6: 5, F7: 6, F8: 7, F9: 8, F10: 9 };
// Ctrl+клавиши серого блока (их отдаёт и функция 00h INT 16h, которой пользуется ReadKey)
var CTRL_EXT = { ArrowLeft: 115, ArrowRight: 116, End: 117, PageDown: 118, Home: 119, PageUp: 132,
                 Numpad4: 115, Numpad6: 116, Numpad1: 117, Numpad3: 118, Numpad7: 119, Numpad9: 132 };
var NUMPAD_EXT = { Numpad8: 72, Numpad2: 80, Numpad4: 75, Numpad6: 77, Numpad7: 71, Numpad1: 79,
                   Numpad9: 73, Numpad3: 81, Numpad0: 82, NumpadDecimal: 83 };
// раскладка US (в DOS без русификатора / в латинском режиме keyrus)
var US = {
  Backquote: ['`', '~', 41], Digit1: ['1', '!', 2], Digit2: ['2', '@', 3], Digit3: ['3', '#', 4], Digit4: ['4', '$', 5],
  Digit5: ['5', '%', 6], Digit6: ['6', '^', 7], Digit7: ['7', '&', 8], Digit8: ['8', '*', 9], Digit9: ['9', '(', 10],
  Digit0: ['0', ')', 11], Minus: ['-', '_', 12], Equal: ['=', '+', 13], BracketLeft: ['[', '{', 26], BracketRight: [']', '}', 27],
  Backslash: ['\\', '|', 43], Semicolon: [';', ':', 39], Quote: ["'", '"', 40], Comma: [',', '<', 51], Period: ['.', '>', 52],
  Slash: ['/', '?', 53], Space: [' ', ' ', 57],
  NumpadAdd: ['+', '+', 78], NumpadSubtract: ['-', '-', 74], NumpadMultiply: ['*', '*', 55], NumpadDivide: ['/', '/', 53]
};
var LETTER_SCAN = { Q: 16, W: 17, E: 18, R: 19, T: 20, Y: 21, U: 22, I: 23, O: 24, P: 25, A: 30, S: 31, D: 32, F: 33, G: 34,
                    H: 35, J: 36, K: 37, L: 38, Z: 44, X: 45, C: 46, V: 47, B: 48, N: 49, M: 50 };
var mods = { shift: false, caps: false, num: true, ctrl: false, alt: false };

// Сочетания с Ctrl/Alt дают в DOS #0 и расширенный код. SUBM8 сравнивает эти коды
// с буквами, поэтому, например, Ctrl+← = «s», Alt+F10 = «q», Alt+1 = «x»,
// Alt+3 = «z», Alt+X = «−», Ctrl+[ = Esc — как в оригинале.
function translate(code) {                  // -> [ascii, scan] или null
  var m;
  if (FKEY[code] !== undefined) return [0, (mods.alt ? 104 : mods.ctrl ? 94 : mods.shift ? 84 : 59) + FKEY[code]];
  if (mods.alt) {
    if ((m = /^Key([A-Z])$/.exec(code))) return [0, LETTER_SCAN[m[1]]];
    if ((m = /^Digit(\d)$/.exec(code))) return [0, m[1] === '0' ? 129 : 119 + (+m[1])];
    if (code === 'Minus') return [0, 130];
    if (code === 'Equal') return [0, 131];
    return null;
  }
  if (mods.ctrl) {
    if (CTRL_EXT[code] !== undefined) return [0, CTRL_EXT[code]];
    if (code === 'BracketLeft') return [27, 26];
    if (code === 'Backslash') return [28, 43];
    if (code === 'BracketRight') return [29, 27];
    return null;                            // Ctrl+буквы оставлены браузеру (Ctrl+W, Ctrl+R…)
  }
  if (SCAN_EXT[code] !== undefined) return [0, SCAN_EXT[code]];
  if (NUMPAD_EXT[code] !== undefined) {
    if (mods.num !== mods.shift) return code === 'NumpadDecimal' ? [46, 83] : [48 + (+code.charAt(6)), NUMPAD_EXT[code]];
    return [0, NUMPAD_EXT[code]];
  }
  if (code === 'Numpad5') return mods.num ? [53, 76] : null;
  switch (code) {
    case 'Enter': case 'NumpadEnter': return [13, 28];
    case 'Escape': return [27, 1];
    case 'Backspace': return [8, 14];
    case 'Tab': return mods.shift ? [0, 15] : [9, 15];
  }
  m = /^Key([A-Z])$/.exec(code);
  if (m) {
    var up = mods.shift !== mods.caps;
    return [up ? m[1].charCodeAt(0) : m[1].toLowerCase().charCodeAt(0), LETTER_SCAN[m[1]]];
  }
  if (US[code]) return [US[code][mods.shift ? 1 : 0].charCodeAt(0), US[code][2]];
  return null;
}

// автоповтор: повторяется последняя нажатая клавиша, пока она удерживается
var heldCode = null, repeatTimer = null;
function stopRepeat() { if (repeatTimer) clearTimeout(repeatTimer); repeatTimer = null; heldCode = null; }
function startRepeat(code) {
  stopRepeat();
  heldCode = code;
  repeatTimer = setTimeout(function rep() {
    if (heldCode !== code) return;
    var k = translate(code);
    if (k && !reportOpen) kbdPush(k[0], k[1]);
    repeatTimer = setTimeout(rep, 1000 / 10.9);
  }, 500);
}
function onKeyDown(e) {
  mods.shift = e.shiftKey; mods.ctrl = e.ctrlKey; mods.alt = e.altKey;
  if (e.getModifierState) { mods.caps = e.getModifierState('CapsLock'); mods.num = e.getModifierState('NumLock'); }
  if (reportOpen) {
    if (e.key === 'Escape') { e.preventDefault(); toggleReport(false); }
    return;
  }
  if (e.metaKey) return;
  if (e.code === 'F11' || e.code === 'F12' || (e.code === 'F5' && !e.altKey && !e.shiftKey && !e.ctrlKey)) return;
  if (!running) {
    if (!e.ctrlKey && !e.altKey) { e.preventDefault(); startGame(); }
    return;
  }
  if (progState !== 'run') {
    if (e.ctrlKey || e.altKey) return;
    e.preventDefault(); if (!e.repeat) location.reload(); return;
  }
  if (e.code === 'Pause' && e.ctrlKey) {   // Ctrl+Break
    e.preventDefault(); stopRepeat();
    crtBreak = true; kbdBuf.length = 0; kbdPush(0, 0);
    return;
  }
  var k = translate(e.code);
  // любая новая клавиша (и Shift/Ctrl/Alt) перехватывает автоповтор у клавиатуры
  if (!k) { if (!e.repeat) stopRepeat(); return; }
  e.preventDefault();
  if (e.repeat) return;                     // повтор делает «клавиатура» сама
  kbdPush(k[0], k[1]);
  startRepeat(e.code);
}
function onKeyUp(e) {
  mods.shift = e.shiftKey; mods.ctrl = e.ctrlKey; mods.alt = e.altKey;
  if (e.code === heldCode) stopRepeat();
}

// ------------------------------ окна чтения ---------------------------------
var READERS = { help: 'Справка', otchet: 'Отчёт о переезде' };
function toggleReport(which) {
  reportOpen = which || false;
  paused = !!reportOpen;
  stopRepeat();
  Object.keys(READERS).forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('open', id === reportOpen);
    document.getElementById('btn-' + id).textContent = id === reportOpen ? 'К игре' : READERS[id];
  });
  speakerApply();
  if (!reportOpen) canvas.focus();
}

function boot() {
  canvas = document.getElementById('screen');
  ctx = canvas.getContext('2d');
  img = ctx.createImageData(640, 350);
  img32 = new Uint32Array(img.data.buffer);
  for (var n = 0; n < 16; n++) PAL32[n] = 0xFF000000 | (EGA_RGB[n][2] << 16) | (EGA_RGB[n][1] << 8) | EGA_RGB[n][0];
  FONT8 = asset('FONT8X8');
  FONT14 = asset('FONT8X14');
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('blur', stopRepeat);
  document.getElementById('btn-full').onclick = function () {
    var el = document.getElementById('crt');
    if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen();
  };
  Object.keys(READERS).forEach(function (id) {
    var btn = document.getElementById('btn-' + id);
    if (!btn || !document.getElementById(id)) return;
    btn.onclick = function () { toggleReport(reportOpen === id ? false : id); };
    document.getElementById(id + '-close').onclick = function () { toggleReport(false); };
  });
  document.getElementById('dosmsg').onclick = function () { location.reload(); };
  canvas.addEventListener('mousedown', function () { canvas.focus(); });
  var sel = document.getElementById('cpu');
  try { var saved = localStorage.getItem('subm:cpu'); if (saved && CPU_PROFILES[saved]) sel.value = saved; } catch (e) {}
  cpu = CPU_PROFILES[sel.value];
  sel.onchange = function () {
    cpu = CPU_PROFILES[sel.value];
    try { localStorage.setItem('subm:cpu', sel.value); } catch (e) {}
    canvas.focus();
  };
  var mus = document.getElementById('music');
  try { var savedMus = localStorage.getItem('subm:music'); if (savedMus === 'on' || savedMus === 'off') mus.value = savedMus; } catch (e) {}
  MUSIC = mus.value === 'on';
  mus.onchange = function () {
    MUSIC = mus.value === 'on';
    try { localStorage.setItem('subm:music', mus.value); } catch (e) {}
    audioInit(); speakerApply(); canvas.focus();
  };
  document.getElementById('start').addEventListener('click', function (e) { e.preventDefault(); startGame(); });
  requestAnimationFrame(present);
}
// запуск по первому щелчку или клавише: SUBM8.EXE «запускается» с этого момента
function startGame() {
  if (running) return;
  document.getElementById('start').style.display = 'none';
  audioInit();
  running = true;
  realStart = performance.now(); vclock = 0; scanReset(0); tickNo = -1;
  canvas.focus();
  runProgram();
}
window.addEventListener('load', boot);
