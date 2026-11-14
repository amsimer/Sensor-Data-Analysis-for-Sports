// Model: Step 2.2 (acceleration magnitude) and 2.3 (artefact checks and cleaning).
// Pure functions, no DOM.

import { makeFrame, nRows, isnullSum, dropna, filterRows, diff, median } from './frame.js';

// Cleaning settings, decided by the student (see WRITTEN_ANSWERS.md 2.2).
export const CLEANING = {
  // Handout example: ±19.6 m/s² for a 2 g accelerometer. Values beyond it are
  // reported but KEPT: no axis plateaus at a ceiling, so they are real foot strikes.
  saturationLimit: 19.6,
  // Start/end noise: phone going into / out of the pocket. Keep only this window (s).
  keepFrom: 4.0,
  keepTo: 312.0,
};

// df['acc_mag'] = np.sqrt(df['ax']**2 + df['ay']**2 + df['az']**2)
export function addAccMag(frame) {
  const { ax, ay, az } = frame.data;
  return makeFrame([...frame.columns, 'acc_mag'], {
    ...frame.data,
    acc_mag: ax.map((_, i) => Math.sqrt(ax[i] ** 2 + ay[i] ** 2 + az[i] ** 2)),
  });
}

// Run every check from handout 2.3 and apply the cleaning. Returns the clean
// frame plus a report of what was found and removed at each step.
export function clean(df, settings = CLEANING) {
  const total = nRows(df);
  const steps = [];

  // Missing rows: df.isnull().sum()  ->  df.dropna()
  const nulls = isnullSum(df);
  let out = dropna(df);
  steps.push({ name: 'Missing values', found: total - nRows(out), detail: nulls, action: 'dropped' });

  // Timestamps out of order: (df['time'].diff() < 0).sum()  ->  drop those rows
  const d = diff(out.data.time);
  const backwards = d.filter((x) => x < 0).length;
  out = filterRows(out, (i) => !(d[i] < 0));
  steps.push({ name: 'Timestamps out of order', found: backwards, action: 'dropped' });

  // Sensor saturation: any axis beyond ±limit  ->  reported, kept
  const lim = settings.saturationLimit;
  const perAxis = ['ax', 'ay', 'az'].map((c) => [c, out.data[c].filter((v) => Math.abs(v) > lim).length]);
  const rowsBeyond = out.data.ax.filter((_, i) =>
    ['ax', 'ay', 'az'].some((c) => Math.abs(out.data[c][i]) > lim)).length;
  steps.push({ name: `Values beyond ±${lim} m/s²`, found: rowsBeyond, detail: perAxis, action: 'kept' });

  // Recording start/end noise  ->  keep only [keepFrom, keepTo]
  const before = nRows(out);
  const t = out.data.time;
  out = filterRows(out, (i) => t[i] >= settings.keepFrom && t[i] <= settings.keepTo);
  steps.push({
    name: 'Start/end noise',
    found: before - nRows(out),
    detail: [['start', settings.keepFrom], ['end', settings.keepTo]],
    action: 'dropped',
  });

  return { clean: out, steps, total, kept: nRows(out) };
}

// dt = df_clean['time'].diff().median(); fs = 1 / dt
export function samplingRate(frame) {
  const dt = median(diff(frame.data.time));
  return { dt, fs: 1 / dt, nyquist: 1 / dt / 2 };
}
