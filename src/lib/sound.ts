// Tiny WebAudio layer: ambient city hum + UI clicks. Browser-only; call from effects/handlers.
let ctx: AudioContext | null = null;
let ambient: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

const KEY = "abujalife:sound";
export const getSoundPref = () => (typeof window === "undefined" ? false : localStorage.getItem(KEY) === "1");

function ac() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function setSound(on: boolean) {
  localStorage.setItem(KEY, on ? "1" : "0");
  if (on) startAmbient(); else stopAmbient();
}

export function startAmbient() {
  if (ambient) return;
  const c = ac();
  const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3; }
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 500;
  const gain = c.createGain(); gain.gain.value = 0.12;
  src.connect(lp).connect(gain).connect(c.destination);
  src.start();
  ambient = { src, gain };
}

export function stopAmbient() {
  ambient?.src.stop();
  ambient = null;
}

export function click(kind: "ok" | "err" = "ok") {
  if (!getSoundPref()) return;
  const c = ac();
  const o = c.createOscillator(); const g = c.createGain();
  o.frequency.value = kind === "ok" ? 880 : 220; o.type = "sine";
  g.gain.setValueAtTime(0.08, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.2);
}

let radioTimer: ReturnType<typeof setInterval> | null = null;
/** Procedural radio loop: a different groove per station. */
export function playRadio(station: number) {
  stopRadio();
  const c = ac();
  const bpm = [104, 118, 96, 124][station % 4]!;
  const notes = [[220, 262, 330, 294], [196, 247, 294, 247], [174, 220, 262, 330], [247, 294, 370, 330]][station % 4]!;
  let step = 0;
  const beat = 60 / bpm / 2;
  radioTimer = setInterval(() => {
    const t = c.currentTime;
    if (step % 4 === 0 || (station % 2 && step % 8 === 6)) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.2); }
    if (step % 2 === 1) { const o = c.createOscillator(), g = c.createGain(); o.type = "square"; o.frequency.value = 6000 + (step % 3) * 500; g.gain.setValueAtTime(0.015, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.05); }
    if (step % 2 === 0) { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = notes[(step / 2) % 4]!; g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8); o.connect(g).connect(c.destination); o.start(t); o.stop(t + beat * 2); }
    step = (step + 1) % 16;
  }, beat * 1000);
}
export function stopRadio() { if (radioTimer) clearInterval(radioTimer); radioTimer = null; }
export const radioPlaying = () => radioTimer !== null;
