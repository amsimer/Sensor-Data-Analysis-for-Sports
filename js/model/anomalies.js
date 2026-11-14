// Model: Step 3.2 IQR anomaly detection and grouping of outliers into clusters.
// Pure functions, no DOM.

import { quantile, max } from './frame.js';

// Clustering setting, decided by the student: a new cluster starts when there
// is no outlier for more than this many seconds.
export const CLUSTER_GAP_S = 5;

// Q1 = df_clean['acc_mag'].quantile(0.25)
// Q3 = df_clean['acc_mag'].quantile(0.75)
// IQR = Q3 - Q1
// lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
export function iqrBounds(values) {
  const Q1 = quantile(values, 0.25);
  const Q3 = quantile(values, 0.75);
  const IQR = Q3 - Q1;
  return { Q1, Q3, IQR, lower: Q1 - 1.5 * IQR, upper: Q3 + 1.5 * IQR };
}

// outliers = df_clean[(df_clean['acc_mag'] < lower) | (df_clean['acc_mag'] > upper)]
// Returns the row indices of the outliers.
export function outlierIndices(values, { lower, upper }) {
  const idx = [];
  values.forEach((v, i) => { if (v < lower || v > upper) idx.push(i); });
  return idx;
}

// Group outliers: a new cluster starts where outliers['time'].diff() > gap.
// Returns [{ id, start, end, n, peak }] (times in s, peak in m/s²).
export function clusterOutliers(times, values, gap = CLUSTER_GAP_S) {
  const clusters = [];
  let current = null;
  times.forEach((t, i) => {
    if (!current || t - current.end > gap) {
      current = { id: clusters.length + 1, start: t, end: t, values: [] };
      clusters.push(current);
    }
    current.end = t;
    current.values.push(values[i]);
  });
  return clusters.map(({ values: v, ...c }) => ({ ...c, n: v.length, peak: max(v) }));
}
