'use strict';
// =============================================================================
//  SBPLAY — проигрывание WAV через Sound Blaster (SBPLAY.PAS) и PC-спикер.
//  Как в оригинале: один канал; новый Play обрывает текущий звук; из файла
//  пропускаются первые 58 байт, остальное до конца файла играется как
//  8-битный звук; частота задаётся константой времени DSP:
//  TC = 256 - 1000000 div Freq  (для 11025 Гц реально выходит 11111 Гц).
// =============================================================================

var flagsound = true;
var endingplay = true;
var audioCtx = null;
var sbSource = null;
var wavCache = {};
var speakerOsc = null, speakerGain = null;
var sbStallMs = 0;                   // задержки ResetDSP, которые «съедают» время кадров

function audioInit() {
  if (audioCtx) { if (audioCtx.state === 'suspended') audioCtx.resume(); return; }
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { audioCtx = null; }
}

function wavBuffer(name) {
  var k = name.toUpperCase();
  if (wavCache[k]) return wavCache[k];
  var d = asset(k);
  var freq = d[24] | (d[25] << 8);
  var tc = 256 - Math.trunc(1000000 / freq);
  var rate = 1000000 / (256 - tc);
  // Обработчик IRQ проверяет Eof(f) только на прерывании ПОСЛЕ последнего
  // чтения и тогда сбрасывает DSP: последний прочитанный блок не звучит.
  // Блоки по 2048 байт, первый буфер 4096 (Play читает его заранее).
  var D = Math.max(1, d.length - 58);
  var n = D <= 4096 ? Math.min(D, 2048) : Math.min(D, 2048 * (1 + Math.ceil((D - 4096) / 2048)));
  var buf = audioCtx.createBuffer(1, n, Math.round(rate));
  var ch0 = buf.getChannelData(0);
  for (var i = 0; i < n; i++) ch0[i] = ((d[58 + i] | 0) - 128) / 128;
  wavCache[k] = buf;
  return buf;
}

function play(name) {
  if (!flagsound) return;
  if (!audioCtx) { endingplay = true; return; }
  if (!endingplay && sbSource) {
    try { sbSource.onended = null; sbSource.stop(); } catch (e) {}
    sbSource = null;
    sbStallMs += 20;                 // ResetDSP: два Delay(10) — игра стоит
  }
  endingplay = false;
  var src = audioCtx.createBufferSource();
  src.buffer = wavBuffer(name);
  var g = audioCtx.createGain();
  g.gain.value = 0.6;
  src.connect(g); g.connect(audioCtx.destination);
  src.onended = function () { if (sbSource === src) { endingplay = true; sbSource = null; sbStallMs += 20; } };
  sbSource = src;
  src.start();
}

function donespb() {
  if (sbSource) { try { sbSource.onended = null; sbSource.stop(); } catch (e) {} }
  sbSource = null; endingplay = true;
}

// PC-спикер (Sound/NoSound) — квадратная волна
function speakerSet(hz) {
  if (!audioCtx) return;
  if (hz > 0) {
    if (!speakerOsc) {
      speakerOsc = audioCtx.createOscillator();
      speakerOsc.type = 'square';
      speakerGain = audioCtx.createGain();
      speakerGain.gain.value = 0.08;
      speakerOsc.connect(speakerGain); speakerGain.connect(audioCtx.destination);
      speakerOsc.start();
    }
    speakerOsc.frequency.value = hz;
  } else if (speakerOsc) {
    try { speakerOsc.stop(); } catch (e) {}
    speakerOsc.disconnect(); speakerOsc = null;
  }
}
