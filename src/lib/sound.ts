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
