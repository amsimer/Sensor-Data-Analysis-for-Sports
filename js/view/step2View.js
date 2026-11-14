// View: renders Step 2 (loading and cleaning). No calculations here: it only
// formats what the ViewModel provides and forwards user actions.

import { renderAnswersInto } from './answersView.js';
import { RAW_DATA_URL } from '../viewmodel/labViewModel.js';
import { el, table, output, sub } from './dom.js';

const STEP2_IDS = ['2.1', '2.2'];

function renderData(viewModel, s) {
  const { inspect, mappedHead, g, cleaning, sampling } = s.step2;
  const frag = document.createDocumentFragment();

  // 2.1 Load and inspect
  frag.append(sub('2.1 Load and inspect'));
  frag.append(output(`df = pd.read_csv('${s.dataSource}')\nprint(df.shape)`,
    `(${inspect.shape.join(', ')})`));
  frag.append(output('print(df.dtypes)',
    inspect.dtypes.map(([c, t]) => `${c.padEnd(16)}${t}`).join('\n')));
  frag.append(el('pre', { class: 'cell-code' }, el('code', {}, 'print(df.head(10))')));
  frag.append(table(inspect.head.columns, inspect.head.rows));
  frag.append(el('pre', { class: 'cell-code' }, el('code', {}, 'print(df.describe())')));
  frag.append(table(['', ...inspect.describe.columns], inspect.describe.rows, { index: false }));

  // Column mapping
  frag.append(sub('Column mapping and units'));
  frag.append(el('p', {},
    'Sensor Logger exports the uncalibrated accelerometer in g, with gravity included. ',
    'The page uses the handout\'s names and units: ',
    el('code', {}, 'time = seconds_elapsed'), ' (seconds since Record was pressed) and ',
    el('code', {}, `ax, ay, az = x, y, z × ${g}`), ' m/s². The raw file is not modified.'));

  // 2.2 Acceleration magnitude
  frag.append(sub('2.2 Acceleration magnitude'));
  frag.append(el('pre', { class: 'cell-code' }, el('code', {},
    "df['acc_mag'] = np.sqrt(df['ax']**2 + df['ay']**2 + df['az']**2)\nprint(df.head(10))")));
  frag.append(table(mappedHead.columns, mappedHead.rows));

  // 2.3 Remove artefacts
  frag.append(sub('2.3 Remove artefacts'));
  const rows = cleaning.steps.map((st) => {
    let detail = '';
    if (st.name === 'Missing values') detail = st.detail.map(([c, n]) => `${c}: ${n}`).join(', ');
    else if (st.name.startsWith('Values beyond')) detail = st.detail.map(([c, n]) => `${c}: ${n}`).join(', ');
    else if (st.name === 'Start/end noise') detail = `kept ${st.detail[0][1]} s – ${st.detail[1][1]} s`;
    return [st.name, String(st.found), st.action, detail];
  });
  frag.append(table(['Check', 'Rows found', 'Action', 'Details'], rows, { index: false }));
  frag.append(output(
    "df_clean.to_csv('sensor_clean.csv', index=False)\nprint(f'Kept {len(df_clean)}/{len(df)} rows after cleaning')",
    `Kept ${cleaning.kept}/${cleaning.total} rows after cleaning`));

  const download = el('button', { type: 'button', class: 'btn' }, 'Download sensor_clean.csv');
  download.addEventListener('click', () => {
    const blob = new Blob([viewModel.cleanCsv()], { type: 'text/csv' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'sensor_clean.csv' });
    a.click();
    URL.revokeObjectURL(a.href);
  });
  frag.append(download);

  // Effective sampling rate (computed here, shown again in Step 3's table)
  frag.append(sub('Effective sampling rate'));
  frag.append(output(
    "dt = df_clean['time'].diff().median()\nfs = 1 / dt\nprint(f'Effective sampling rate: {fs:.1f} Hz')\nprint(f'Nyquist frequency: {fs/2:.1f} Hz  (max detectable movement frequency)')",
    `Effective sampling rate: ${sampling.fs.toFixed(1)} Hz\nNyquist frequency: ${sampling.nyquist.toFixed(1)} Hz  (max detectable movement frequency)`));

  return frag;
}

export function bindStep2View(viewModel, container) {
  // Static parts: data source controls, results area, answers area.
  const sourceLine = el('p', { class: 'source' });
  const fileInput = el('input', { type: 'file', accept: '.csv,text/csv', id: 'csv-upload' });
  const reload = el('button', { type: 'button', class: 'btn btn--secondary' }, `Use committed ${RAW_DATA_URL}`);
  const controls = el('div', { class: 'controls' },
    el('label', { for: 'csv-upload' }, 'Upload another Sensor Logger "Accelerometer Uncalibrated" CSV (values in g): '), fileInput, reload);
  const results = el('div', { 'aria-live': 'polite' });
  const answers = el('div');
  container.innerHTML = '';
  container.append(sourceLine, controls, results, sub('Written answers'), answers);

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) viewModel.loadDataFromFile(fileInput.files[0]);
  });
  reload.addEventListener('click', () => {
    fileInput.value = '';
    viewModel.loadDataFromUrl(RAW_DATA_URL);
  });

  let lastStep2 = null;
  viewModel.subscribe((state) => {
    sourceLine.textContent = state.dataSource ? `Data source: ${state.dataSource}` : '';

    if (state.dataStatus === 'error') {
      lastStep2 = null;
      results.innerHTML = '';
      results.append(el('p', { class: 'error' }, `Could not load the sensor data: ${state.dataError}`));
    } else if (state.dataStatus !== 'ready') {
      lastStep2 = null;
      results.innerHTML = '<p class="status">Loading sensor data…</p>';
    } else if (state.step2 !== lastStep2) {
      // Only re-render the (large) results when they actually changed.
      lastStep2 = state.step2;
      results.innerHTML = '';
      results.append(renderData(viewModel, state));
    }

    renderAnswersInto(answers, viewModel, state, STEP2_IDS);
  });
}
