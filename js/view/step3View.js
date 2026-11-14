// View: renders Step 3 (descriptive statistics and IQR anomalies). No calculations here.

import { renderAnswersInto } from './answersView.js';
import { el, table, output, sub, fmt } from './dom.js';

const CLUSTER_QUESTIONS = 3;   // C<n>.1 when, C<n>.2 cause, C<n>.3 exclude or keep

function value(v, unit) {
  const text = Number.isInteger(v) ? String(v) : v.toFixed(unit === 'Hz' ? 1 : 3);
  return unit ? `${text} ${unit}` : text;
}

function renderData(s) {
  const { stats, sampling, bounds, outlierCount, outlierPct, lowCount, highCount, outlierHead, clusters, gap } = s;
  const frag = document.createDocumentFragment();

  // 3.1 Descriptive statistics table
  frag.append(sub('3.1 Descriptive statistics'));
  frag.append(el('p', {}, 'Computed on ', el('code', {}, "df_clean['acc_mag']"), ' (after cleaning).'));
  frag.append(table(['Metric', 'Value'], stats.map((r) => [r.metric, value(r.value, r.unit)]), { index: false }));

  frag.append(output(
    "dt = df_clean['time'].diff().median()\nfs = 1 / dt\nprint(f'Effective sampling rate: {fs:.1f} Hz')\nprint(f'Nyquist frequency: {fs/2:.1f} Hz  (max detectable movement frequency)')",
    `Effective sampling rate: ${sampling.fs.toFixed(1)} Hz\nNyquist frequency: ${sampling.nyquist.toFixed(1)} Hz  (max detectable movement frequency)`));

  const answers31 = el('div', { class: 'answers', 'data-ids': '3.1' });
  frag.append(answers31);

  // 3.2 IQR anomaly detection
  frag.append(sub('3.2 Anomaly detection (IQR)'));
  frag.append(output(
    "Q1 = df_clean['acc_mag'].quantile(0.25)\nQ3 = df_clean['acc_mag'].quantile(0.75)\nIQR = Q3 - Q1\nlower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR\nprint(Q1, Q3, IQR, lower, upper)",
    `Q1 = ${fmt(bounds.Q1)}  Q3 = ${fmt(bounds.Q3)}  IQR = ${fmt(bounds.IQR)}\nlower = ${fmt(bounds.lower)}  upper = ${fmt(bounds.upper)}`));
  frag.append(output(
    "outliers = df_clean[(df_clean['acc_mag'] < lower) | (df_clean['acc_mag'] > upper)]\nprint(f'{len(outliers)} outlier samples ({100*len(outliers)/len(df_clean):.1f}%)')",
    `${outlierCount} outlier samples (${outlierPct.toFixed(1)}%)\n  below lower: ${lowCount}   above upper: ${highCount}`));
  frag.append(el('pre', { class: 'cell-code' }, el('code', {}, "print(outliers[['time', 'acc_mag']].head(10))")));
  frag.append(table(['', 'time', 'acc_mag'], outlierHead, { index: false }));

  // Clusters
  frag.append(sub('Outlier clusters'));
  frag.append(el('p', {},
    `Outliers are grouped into clusters: a new cluster starts when there is no outlier for more than ${gap} s `,
    el('code', {}, `outliers['time'].diff() > ${gap}`), '.'));
  frag.append(table(['Cluster', 'Start (s)', 'End (s)', 'Outlier samples', 'Peak acc_mag (m/s²)'],
    clusters.map((c) => [String(c.id), c.start.toFixed(2), c.end.toFixed(2), String(c.n), c.peak.toFixed(2)]),
    { index: false }));

  const clusterAnswers = clusters.map((c) => {
    const box = el('div', { class: 'answers', 'data-ids': Array.from({ length: CLUSTER_QUESTIONS }, (_, k) => `C${c.id}.${k + 1}`).join(',') });
    return [el('h4', {}, `Cluster ${c.id} · ${c.start.toFixed(1)}–${c.end.toFixed(1)} s`), box];
  });
  for (const [h, box] of clusterAnswers) frag.append(h, box);

  return frag;
}

export function bindStep3View(viewModel, container) {
  let lastStep3 = null;
  viewModel.subscribe((state) => {
    if (state.dataStatus === 'error') {
      lastStep3 = null;
      container.innerHTML = '';
      container.append(el('p', { class: 'error' }, `No statistics: the sensor data could not be loaded (${state.dataError}).`));
      return;
    }
    if (state.dataStatus !== 'ready') {
      lastStep3 = null;
      container.innerHTML = '<p class="status">Waiting for sensor data…</p>';
      return;
    }
    if (state.step3 !== lastStep3) {
      lastStep3 = state.step3;
      container.innerHTML = '';
      container.append(renderData(state.step3));
    }
    // Fill every answers box with its questions from WRITTEN_ANSWERS.md.
    for (const box of container.querySelectorAll('.answers')) {
      renderAnswersInto(box, viewModel, state, box.dataset.ids.split(','));
    }
  });
}
