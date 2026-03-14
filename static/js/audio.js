/* audio.js — Web Audio API sound effects */

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

function playTone(freq, dur = 0.15, type = 'sine') {
  try {
    const ac   = getAudioCtx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(0.18, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.start();
    osc.stop(ac.currentTime + dur);
  } catch (e) { /* silently ignore if audio not available */ }
}

function playChime(notes) {
  // notes: array of [freq, dur, delayMs?]
  notes.forEach(([f, d, t = 0]) => setTimeout(() => playTone(f, d), t));
}

const SFX = {
  tap:      () => playChime([[880, 0.08]]),
  nav:      () => playChime([[523, 0.10, 0], [659, 0.10, 80], [784, 0.15, 160]]),
  correct:  () => playChime([[523, 0.10, 0], [659, 0.10, 100], [784, 0.10, 200], [1047, 0.25, 300]]),
  wrong:    () => playChime([[330, 0.20, 0], [294, 0.25, 120]]),
  complete: () => playChime([[523, 0.10, 0], [659, 0.10, 80], [784, 0.10, 160], [1047, 0.12, 240], [1319, 0.30, 340]]),
};

/* Text-to-speech helper */
function speakPhrase(text, onEnd) {
  if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return; }
  window.speechSynthesis.cancel();
  const utt   = new SpeechSynthesisUtterance(text);
  utt.rate    = 0.82;
  utt.pitch   = 1.05;
  utt.onend   = () => { if (onEnd) onEnd(); };
  window.speechSynthesis.speak(utt);
}
