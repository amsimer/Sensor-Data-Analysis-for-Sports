// Model: a tiny column-oriented "DataFrame" with the pandas methods the lab uses.
// A frame is { columns: string[], data: { [column]: number[] } }. Pure functions, no DOM.

export function makeFrame(columns, data) {
  return { columns: [...columns], data };
}

export function nRows(frame) {
  return frame.columns.length ? frame.data[frame.columns[0]].length : 0;
}

// df.shape
export function shape(frame) {
  return [nRows(frame), frame.columns.length];
}

// df.dtypes: int64 if every non-missing value is an integer, else float64
export function dtypes(frame) {
  return frame.columns.map((c) => {
    const values = frame.data[c].filter((v) => !isMissing(v));
    const isInt = values.length > 0 && values.every((v) => typeof v === 'bigint' || Number.isInteger(v));
    return [c, isInt ? 'int64' : 'float64'];
  });
}

// df.head(n): array of row arrays
export function head(frame, n = 10) {
  const rows = [];
  for (let i = 0; i < Math.min(n, nRows(frame)); i++) {
    rows.push(frame.columns.map((c) => frame.data[c][i]));
  }
  return rows;
}

export function isMissing(v) {
  return v === null || v === undefined || Number.isNaN(v);
}

// df.isnull().sum()
export function isnullSum(frame) {
  return frame.columns.map((c) => [c, frame.data[c].filter(isMissing).length]);
}

// Keep the rows where keep(i) is true (like df[mask].reset_index(drop=True))
export function filterRows(frame, keep) {
  const data = {};
  for (const c of frame.columns) data[c] = [];
  const n = nRows(frame);
  for (let i = 0; i < n; i++) {
    if (!keep(i)) continue;
    for (const c of frame.columns) data[c].push(frame.data[c][i]);
  }
  return makeFrame(frame.columns, data);
}

// df.dropna().reset_index(drop=True)
export function dropna(frame) {
  return filterRows(frame, (i) => frame.columns.every((c) => !isMissing(frame.data[c][i])));
}

// Series.diff(): first element is NaN, as in pandas
export function diff(values) {
  return values.map((v, i) => (i === 0 ? NaN : v - values[i - 1]));
}

// Series.mean() (skips NaN)
export function mean(values) {
  const v = values.filter((x) => !isMissing(x));
  return v.reduce((s, x) => s + x, 0) / v.length;
}

// Series.std(): sample standard deviation, ddof = 1 (pandas default)
export function std(values) {
  const v = values.filter((x) => !isMissing(x));
  const m = mean(v);
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1));
}

// Series.quantile(q): linear interpolation (pandas default)
export function quantile(values, q) {
  const v = values.filter((x) => !isMissing(x)).sort((a, b) => a - b);
  const pos = (v.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return v[lo] + (v[hi] - v[lo]) * (pos - lo);
}

// Series.median()
export function median(values) {
  return quantile(values, 0.5);
}

export function min(values) {
  return values.reduce((m, x) => (isMissing(x) ? m : Math.min(m, x)), Infinity);
}

export function max(values) {
  return values.reduce((m, x) => (isMissing(x) ? m : Math.max(m, x)), -Infinity);
}

// df.describe(): rows count, mean, std, min, 25%, 50%, 75%, max
export function describe(frame) {
  const stats = [
    ['count', (v) => v.filter((x) => !isMissing(x)).length],
    ['mean', mean],
    ['std', std],
    ['min', min],
    ['25%', (v) => quantile(v, 0.25)],
    ['50%', (v) => quantile(v, 0.5)],
    ['75%', (v) => quantile(v, 0.75)],
    ['max', max],
  ];
  return {
    columns: frame.columns,
    // BigInt columns are summarised as ordinary numbers, as pandas does with float output.
    rows: stats.map(([name, fn]) => [name, ...frame.columns.map((c) => fn(frame.data[c].map(Number)))]),
  };
}

// df.to_csv(index=False)
export function toCsv(frame) {
  const lines = [frame.columns.join(',')];
  const n = nRows(frame);
  for (let i = 0; i < n; i++) {
    lines.push(frame.columns.map((c) => frame.data[c][i]).join(','));
  }
  return lines.join('\n') + '\n';
}
