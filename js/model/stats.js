// Model: Step 3.1 descriptive statistics table. Pure functions, no DOM.

import { mean, std, max, min, nRows } from './frame.js';

/**
 * The handout's Metric/Value table for acc_mag of df_clean.
 * Returns [{ metric, value, unit }].
 */
export function descriptiveTable(clean, sampling) {
  const m = clean.data.acc_mag;
  const t = clean.data.time;
  return [
    { metric: 'Mean acceleration magnitude', value: mean(m), unit: 'm/s²' },     // df_clean['acc_mag'].mean()
    { metric: 'Std deviation', value: std(m), unit: 'm/s²' },                    // .std()
    { metric: 'Max', value: max(m), unit: 'm/s²' },                              // .max()
    { metric: 'Min', value: min(m), unit: 'm/s²' },                              // .min()
    { metric: 'Duration', value: t[t.length - 1] - t[0], unit: 's' },            // time.iloc[-1] - time.iloc[0]
    { metric: 'Sample count', value: nRows(clean), unit: '' },                   // len(df_clean)
    { metric: 'Effective sampling rate', value: sampling.fs, unit: 'Hz' },       // 1 / time.diff().median()
  ];
}
