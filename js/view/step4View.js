// View: renders Step 4 (three plots) with Plotly, styled after the handout's
// matplotlib code. No calculations here: all values come from the ViewModel.

import { renderAnswersInto } from './answersView.js';
import { el, sub } from './dom.js';

// matplotlib defaults used in the handout
const C0 = '#1f77b4';          // default line colour
const STEELBLUE = '#4682b4';
const RED = 'red';
const ORANGE = 'orange';

function themeLayout() {
  const css = getComputedStyle(document.documentElement);
  const text = css.getPropertyValue('--text').trim() || '#1c1f24';
  const grid = css.getPropertyValue('--border').trim() || '#dde1e6';
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: text, size: 12 },
    margin: { l: 60, r: 20, t: 50, b: 50 },
    xaxis: { gridcolor: grid, zerolinecolor: grid },
    yaxis: { gridcolor: grid, zerolinecolor: grid },
  };
}

const CONFIG = { responsive: true, displaylogo: false };

// Min/max without spreading large arrays into Math.min/max (call-stack limits).
const arrMax = (a) => a.reduce((m, v) => (v > m ? v : m), -Infinity);
const arrMin = (a) => a.reduce((m, v) => (v < m ? v : m), Infinity);

function code(text) {
  return el('pre', { class: 'cell-code' }, el('code', {}, text));
}

// A plot container plus its "Download PNG" button (plt.savefig equivalent).
function plotBlock(filename, widthPx, heightPx) {
  const div = el('div', { class: 'plot' });
  const btn = el('button', { type: 'button', class: 'btn btn--secondary' }, `Download ${filename}.png`);
  btn.addEventListener('click', () => {
    // figsize × dpi=150 from the handout: width/height × scale 1.5
    globalThis.Plotly.downloadImage(div, { format: 'png', filename, width: widthPx, height: heightPx, scale: 1.5 });
  });
  return { div, actions: el('p', { class: 'plot-actions' }, btn) };
}

// Plot 1 – Time series
function plot1(div, d) {
  const theme = themeLayout();
  const yMax = arrMax(d.accMag) * 1.05;
  // ax.axvline(row['time'], ...) for every outlier: one trace of vertical segments
  const vx = [];
  const vy = [];
  for (const t of d.outlierTimes) vx.push(t, t, null), vy.push(0, yMax, null);
  const traces = [
    // SVG (not WebGL) so the mean and outlier lines are drawn on top, as in matplotlib
    { type: 'scatter', mode: 'lines', x: d.time, y: d.accMag, name: 'acc magnitude', hoverinfo: 'x+y',
      line: { color: C0, width: 0.5 }, opacity: 0.8 },
    { type: 'scatter', mode: 'lines', x: [d.time[0], d.time[d.time.length - 1]], y: [d.mean, d.mean],
      name: `Mean: ${d.mean.toFixed(2)} m/s²`, line: { color: RED, dash: 'dash', width: 1.5 } },
    { type: 'scatter', mode: 'lines', x: vx, y: vy, name: `IQR outliers (${d.outlierTimes.length})`,
      line: { color: ORANGE, width: 0.8 }, opacity: 0.3, hoverinfo: 'skip' },
  ];
  globalThis.Plotly.newPlot(div, traces, {
    ...theme,
    title: { text: 'Acceleration magnitude over session' },
    xaxis: { ...theme.xaxis, title: { text: 'Time (s)' } },
    yaxis: { ...theme.yaxis, title: { text: 'Acceleration (m/s²)' }, range: [0, yMax] },
    legend: { orientation: 'h', y: -0.25 },
    height: 400,
  }, CONFIG);
}

// Plot 2 – Statistical distribution
function plot2(div, d) {
  const theme = themeLayout();
  const lo = arrMin(d.accMag);
  const hi = arrMax(d.accMag);
  const box = (y, name) => ({ type: 'box', y, name, xaxis: 'x2', yaxis: 'y2', boxpoints: 'outliers',
    quartilemethod: 'linear', marker: { color: C0, size: 3 }, line: { color: C0, width: 1 },
    fillcolor: 'rgba(0,0,0,0)', showlegend: false });
  const traces = [
    // axes[0].hist(df_clean['acc_mag'], bins=60, color='steelblue', edgecolor='white')
    { type: 'histogram', x: d.accMag, xbins: { start: lo, end: hi, size: (hi - lo) / 60 }, autobinx: false,
      marker: { color: STEELBLUE, line: { color: 'white', width: 0.5 } }, showlegend: false },
    // axes[1].boxplot([ax, ay, az], labels=['ax', 'ay', 'az'])
    box(d.ax, 'ax'), box(d.ay, 'ay'), box(d.az, 'az'),
  ];
  globalThis.Plotly.newPlot(div, traces, {
    ...theme,
    grid: { rows: 1, columns: 2, pattern: 'independent' },
    xaxis: { ...theme.xaxis, title: { text: 'Acceleration (m/s²)' }, domain: [0, 0.46] },
    yaxis: { ...theme.yaxis, title: { text: 'Count' } },
    xaxis2: { ...theme.xaxis, domain: [0.56, 1], anchor: 'y2' },
    yaxis2: { ...theme.yaxis, title: { text: 'Acceleration (m/s²)' }, anchor: 'x2' },
    annotations: [
      { text: 'Distribution of acceleration magnitude', xref: 'paper', yref: 'paper', x: 0.23, y: 1.12, showarrow: false, xanchor: 'center', font: { size: 14 } },
      { text: 'Variation per axis', xref: 'paper', yref: 'paper', x: 0.78, y: 1.12, showarrow: false, xanchor: 'center', font: { size: 14 } },
    ],
    margin: { ...theme.margin, t: 60 },
    height: 400,
  }, CONFIG);
}

// Plot 3 – Cadence via Welch PSD
function plot3(div, d) {
  const theme = themeLayout();
  const { psd, peak, stride } = d;
  const traces = [
    { type: 'scatter', mode: 'lines', x: psd.f, y: psd.P, name: 'PSD of acc_mag', line: { color: C0, width: 1.2 } },
    { type: 'scatter', mode: 'markers+text', x: [peak.f], y: [peak.P], name: 'Dominant peak (step frequency)',
      marker: { color: RED, size: 9 }, text: [`${peak.f.toFixed(2)} Hz = ${peak.cadence.toFixed(1)} steps/min`],
      textposition: 'middle right' },
  ];
  if (stride) {
    traces.push({ type: 'scatter', mode: 'markers+text', x: [stride.f], y: [stride.P], name: 'Stride peak (one leg)',
      marker: { color: ORANGE, size: 8 }, text: [`${stride.f.toFixed(2)} Hz`], textposition: 'top center' });
  }
  globalThis.Plotly.newPlot(div, traces, {
    ...theme,
    title: { text: 'Power spectral density of acceleration magnitude (Welch)' },
    xaxis: { ...theme.xaxis, title: { text: 'Frequency (Hz)' }, range: [0, 10] },
    yaxis: { ...theme.yaxis, title: { text: 'PSD ((m/s²)²/Hz)' } },
    legend: { orientation: 'h', y: -0.25 },
    height: 400,
  }, CONFIG);
}

function renderData(d) {
  const frag = document.createDocumentFragment();
  const boxes = {};
  const answerBox = (id) => (boxes[id] = el('div', { class: 'answers', 'data-ids': id }));

  if (!globalThis.Plotly) {
    frag.append(el('p', { class: 'error' }, 'Plotly.js could not be loaded, so the plots cannot be drawn.'));
    return { frag, draw: () => {} };
  }

  // Plot 1
  frag.append(sub('Plot 1 – Time series'));
  frag.append(code(
    "fig, ax = plt.subplots(figsize=(12, 4))\nax.plot(df_clean['time'], df_clean['acc_mag'], linewidth=0.5, alpha=0.8, label='acc magnitude')\n" +
    "ax.axhline(df_clean['acc_mag'].mean(), color='red', linestyle='--', label=f\"Mean: {df_clean['acc_mag'].mean():.2f} m/s²\")\n" +
    "for _, row in outliers.iterrows():\n    ax.axvline(row['time'], color='orange', alpha=0.3, linewidth=0.8)\n" +
    "ax.set_xlabel('Time (s)'); ax.set_ylabel('Acceleration (m/s²)')\nax.set_title('Acceleration magnitude over session')\nplt.savefig('fig1_timeseries.png', dpi=150)"));
  const p1 = plotBlock('fig1_timeseries', 1200, 400);
  frag.append(p1.div, p1.actions, answerBox('4.1'));

  // Plot 2
  frag.append(sub('Plot 2 – Statistical distribution'));
  frag.append(code(
    "fig, axes = plt.subplots(1, 2, figsize=(10, 4))\naxes[0].hist(df_clean['acc_mag'], bins=60, color='steelblue', edgecolor='white')\n" +
    "axes[1].boxplot([df_clean['ax'], df_clean['ay'], df_clean['az']], labels=['ax', 'ay', 'az'])\nplt.savefig('fig2_distribution.png', dpi=150)"));
  const p2 = plotBlock('fig2_distribution', 1000, 400);
  frag.append(p2.div, p2.actions, answerBox('4.2'));

  // Plot 3
  frag.append(sub('Plot 3 – Cadence via power spectral density'));
  frag.append(code(
    `from scipy.signal import welch\nf, Pxx = welch(df_clean['acc_mag'], fs=fs, nperseg=${d.psd.nperseg})\n` +
    "peak = f[np.argmax(Pxx[1:]) + 1]\nprint(f'Dominant frequency: {peak:.2f} Hz = {peak*60:.1f} steps/min')"));
  frag.append(el('pre', { class: 'cell-out' },
    `Dominant frequency: ${d.peak.f.toFixed(2)} Hz = ${d.peak.cadence.toFixed(1)} steps/min\n` +
    (d.stride ? `Stride peak (≈ half the step frequency): ${d.stride.f.toFixed(2)} Hz\n` : '') +
    `nperseg = ${d.psd.nperseg} (${(d.psd.nperseg / d.fs).toFixed(1)} s), ${d.psd.nSeg} segments, resolution ${d.psd.resolution.toFixed(3)} Hz`));
  const p3 = plotBlock('fig3_psd_cadence', 1200, 400);
  frag.append(p3.div, p3.actions, answerBox('4.3'));

  const draw = () => { plot1(p1.div, d); plot2(p2.div, d); plot3(p3.div, d); };
  return { frag, draw };
}

export function bindStep4View(viewModel, container) {
  let last = null;
  viewModel.subscribe((state) => {
    if (state.dataStatus === 'error') {
      last = null;
      container.innerHTML = '';
      container.append(el('p', { class: 'error' }, `No plots: the sensor data could not be loaded (${state.dataError}).`));
      return;
    }
    if (state.dataStatus !== 'ready') {
      last = null;
      container.innerHTML = '<p class="status">Waiting for sensor data…</p>';
      return;
    }
    if (state.step4 !== last) {
      last = state.step4;
      container.innerHTML = '';
      const { frag, draw } = renderData(state.step4);
      container.append(frag);
      draw();   // the plot divs must be in the page before Plotly draws them
    }
    for (const box of container.querySelectorAll('.answers')) {
      renderAnswersInto(box, viewModel, state, box.dataset.ids.split(','));
    }
  });
}
