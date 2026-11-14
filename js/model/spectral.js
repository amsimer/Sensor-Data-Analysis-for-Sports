// Model: Step 4 Plot 3, cadence via a Welch power spectral density.
// Mirrors scipy.signal.welch(x, fs, nperseg=NPERSEG) with scipy's defaults:
// Hann window (periodic), 50 % overlap, constant detrend, one-sided, 'density' scaling.
// Pure functions, no DOM.

// Segment length, decided by the student: 1024 samples ≈ 10.3 s at 99.7 Hz,
// giving ≈ 0.097 Hz frequency resolution (≈ ±3 steps/min).
export const NPERSEG = 1024;

// In-place radix-2 FFT. re/im are Float64Arrays whose length is a power of 2.
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
}

// f, Pxx = scipy.signal.welch(x, fs=fs, nperseg=nperseg)
export function welch(x, fs, nperseg = NPERSEG) {
  if (nperseg & (nperseg - 1)) throw new Error('nperseg must be a power of 2');
  if (x.length < nperseg) throw new Error(`Need at least ${nperseg} samples for the PSD`);

  const step = nperseg - Math.floor(nperseg / 2);        // noverlap = nperseg // 2
  const nSeg = Math.floor((x.length - nperseg) / step) + 1;
  const win = Array.from({ length: nperseg }, (_, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / nperseg));
  const scale = 1 / (fs * win.reduce((s, w) => s + w * w, 0));
  const nFreq = nperseg / 2 + 1;
  const P = new Float64Array(nFreq);

  for (let s = 0; s < nSeg; s++) {
    const seg = x.slice(s * step, s * step + nperseg);
    const segMean = seg.reduce((a, b) => a + b, 0) / nperseg;    // detrend='constant'
    const re = Float64Array.from(seg, (v, n) => (v - segMean) * win[n]);
    const im = new Float64Array(nperseg);
    fft(re, im);
    for (let k = 0; k < nFreq; k++) {
      let p = (re[k] * re[k] + im[k] * im[k]) * scale;
      if (k !== 0 && k !== nperseg / 2) p *= 2;                  // one-sided
      P[k] += p / nSeg;                                          // average='mean'
    }
  }
  const f = Array.from({ length: nFreq }, (_, k) => (k * fs) / nperseg);
  return { f, P: Array.from(P), nSeg, resolution: fs / nperseg };
}

// Dominant frequency: f[np.argmax(Pxx[1:]) + 1] (skips the 0 Hz bin).
export function dominantPeak(f, P) {
  let k = 1;
  for (let i = 2; i < P.length; i++) if (P[i] > P[k]) k = i;
  return { index: k, f: f[k], P: P[k] };
}

// Highest PSD value within ±width Hz of a target frequency (used for the
// stride peak at about half the step frequency).
export function peakNear(f, P, target, width = 0.2) {
  let k = -1;
  for (let i = 1; i < P.length; i++) {
    if (Math.abs(f[i] - target) <= width && (k < 0 || P[i] > P[k])) k = i;
  }
  return k < 0 ? null : { index: k, f: f[k], P: P[k] };
}
