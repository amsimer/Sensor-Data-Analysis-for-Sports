// ViewModel: holds the page state and runs the Model in lab-step order.
// Views subscribe and re-render when the state changes. No DOM access here.

import { loadAnswers, wordCount } from '../model/answers.js';
import { readCsv, toHandoutColumns, G } from '../model/csv.js';
import { addAccMag, clean, samplingRate, CLEANING } from '../model/cleaning.js';
import { shape, dtypes, head, describe, toCsv, mean } from '../model/frame.js';
import { descriptiveTable } from '../model/stats.js';
import { iqrBounds, outlierIndices, clusterOutliers, CLUSTER_GAP_S } from '../model/anomalies.js';
import { welch, dominantPeak, peakNear, NPERSEG } from '../model/spectral.js';

export const RAW_DATA_URL = 'data/sensor_raw.csv';

export class LabViewModel {
  constructor() {
    this.state = {
      answersStatus: 'idle',   // 'idle' | 'loading' | 'ready' | 'error'
      answersError: null,
      answers: new Map(),

      dataStatus: 'idle',      // 'idle' | 'loading' | 'ready' | 'error'
      dataError: null,
      dataSource: null,        // e.g. 'data/sensor_raw.csv' or the uploaded file name
      step2: null,             // results for the Step 2 view
      step3: null,             // results for the Step 3 view
      step4: null,             // plot data for the Step 4 view
    };
    this.cleanFrame = null;    // df_clean, used by later steps
    this.outlierIdx = [];      // row indices of the IQR outliers in df_clean
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener(this.state));
  }

  load() {
    return Promise.all([this.loadAnswers(), this.loadDataFromUrl(RAW_DATA_URL)]);
  }

  async loadAnswers() {
    this.setState({ answersStatus: 'loading', answersError: null });
    try {
      this.setState({ answersStatus: 'ready', answers: await loadAnswers() });
    } catch (err) {
      this.setState({ answersStatus: 'error', answersError: err.message });
    }
  }

  async loadDataFromUrl(url) {
    this.setState({ dataStatus: 'loading', dataError: null, dataSource: url });
    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Could not load ${url} (HTTP ${response.status}).`);
      this.runPipeline(await response.text(), url);
    } catch (err) {
      this.setState({ dataStatus: 'error', dataError: err.message });
    }
  }

  async loadDataFromFile(file) {
    this.setState({ dataStatus: 'loading', dataError: null, dataSource: file.name });
    try {
      this.runPipeline(await file.text(), file.name);
    } catch (err) {
      this.setState({ dataStatus: 'error', dataError: err.message });
    }
  }

  // Step 2, in the handout's order.
  runPipeline(text, source) {
    // 2.1 Load and inspect (raw columns, as exported)
    const raw = readCsv(text);
    const inspect = {
      shape: shape(raw),
      dtypes: dtypes(raw),
      head: { columns: raw.columns, rows: head(raw, 10) },
      describe: describe(raw),
    };

    // Rename to the handout's columns, g -> m/s²
    const mapped = toHandoutColumns(raw);

    // 2.2 Acceleration magnitude
    const df = addAccMag(mapped);

    // 2.3 Artefacts and cleaning
    const result = clean(df);
    this.cleanFrame = result.clean;
    const sampling = samplingRate(result.clean);

    // Step 3.1 Descriptive statistics
    const c = result.clean;
    const stats = descriptiveTable(c, sampling);

    // Step 3.2 IQR anomaly detection and clusters
    const bounds = iqrBounds(c.data.acc_mag);
    const idx = outlierIndices(c.data.acc_mag, bounds);
    this.outlierIdx = idx;
    const outTimes = idx.map((i) => c.data.time[i]);
    const outMags = idx.map((i) => c.data.acc_mag[i]);
    const clusters = clusterOutliers(outTimes, outMags, CLUSTER_GAP_S);

    // Step 4 Plot 3: Welch PSD of acc_mag and cadence
    const psd = welch(c.data.acc_mag, sampling.fs, NPERSEG);
    const peak = dominantPeak(psd.f, psd.P);
    const stride = peakNear(psd.f, psd.P, peak.f / 2);

    this.setState({
      dataStatus: 'ready',
      dataSource: source,
      step2: {
        inspect,
        mappedHead: { columns: df.columns, rows: head(df, 10) },
        g: G,
        cleaning: { ...result, settings: CLEANING, clean: undefined },
        sampling,
      },
      step3: {
        stats,
        sampling,
        bounds,
        outlierCount: idx.length,
        outlierPct: (100 * idx.length) / c.data.time.length,
        lowCount: outMags.filter((v) => v < bounds.lower).length,
        highCount: outMags.filter((v) => v > bounds.upper).length,
        outlierHead: idx.slice(0, 10).map((i) => [i, c.data.time[i], c.data.acc_mag[i]]),
        clusters,
        gap: CLUSTER_GAP_S,
      },
      step4: {
        time: c.data.time,
        accMag: c.data.acc_mag,
        ax: c.data.ax,
        ay: c.data.ay,
        az: c.data.az,
        mean: mean(c.data.acc_mag),
        outlierTimes: outTimes,
        psd: { f: psd.f, P: psd.P, resolution: psd.resolution, nSeg: psd.nSeg, nperseg: NPERSEG },
        fs: sampling.fs,
        peak: { ...peak, cadence: peak.f * 60 },
        stride,
      },
    });
  }

  /** df_clean.to_csv('sensor_clean.csv', index=False) */
  cleanCsv() {
    return this.cleanFrame ? toCsv(this.cleanFrame) : '';
  }

  /** Word count of an answer and whether it is inside [min, max]. */
  wordCountFor(id, min, max) {
    const item = this.state.answers.get(id);
    const words = item ? wordCount(item.answer) : 0;
    return { words, min, max, ok: words >= min && words <= max };
  }

  /** Answers for the given ids, ready to display: [{ id, question, answer, parts, isEmpty, missing }]. */
  answerItems(ids) {
    return ids.map((id) => {
      const item = this.state.answers.get(id);
      if (!item) {
        return { id, question: `Question ${id}`, answer: '', parts: [], isEmpty: true, missing: true };
      }
      const parts = item.parts.map((p) => ({ ...p, isEmpty: p.answer === '' }));
      const isEmpty = item.answer === '' && parts.every((p) => p.isEmpty);
      return { ...item, parts, isEmpty };
    });
  }
}
