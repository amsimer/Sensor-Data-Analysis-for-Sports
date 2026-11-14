// Model: load the Sensor Logger "Accelerometer Uncalibrated" export and map it
// to the handout's column names and units. Uses Papa Parse (global `Papa`, loaded in index.html).

import { makeFrame } from './frame.js';

// Standard gravity: Sensor Logger's uncalibrated accelerometer is in g.
export const G = 9.80665;

// Columns the export must contain.
export const REQUIRED_COLUMNS = ['seconds_elapsed', 'x', 'y', 'z'];

// One CSV cell -> number. Empty/non-numeric cells become NaN, like pandas.
// Integers too large for a JS number (e.g. the nanosecond `time` column) become
// BigInt so no digits are lost (pandas keeps them as int64).
function parseValue(s) {
  if (s === undefined || s === null || String(s).trim() === '') return NaN;
  const str = String(s).trim();
  if (/^-?\d+$/.test(str) && !Number.isSafeInteger(Number(str))) return BigInt(str);
  const n = Number(str);
  return Number.isNaN(n) ? NaN : n;
}

// pd.read_csv(...)
export function readCsv(text) {
  const result = globalThis.Papa.parse(text.trim(), {
    header: true,
    dynamicTyping: false,   // parsed below, so huge integers keep every digit
    skipEmptyLines: true,
  });
  if (result.errors.length) {
    const e = result.errors[0];
    throw new Error(`CSV parse error on row ${e.row}: ${e.message}`);
  }
  const columns = result.meta.fields;
  const data = {};
  for (const c of columns) {
    data[c] = result.data.map((row) => parseValue(row[c]));
  }
  return makeFrame(columns, data);
}

// Rename to the handout's names and convert g -> m/s²:
//   time = seconds_elapsed (s since Record was pressed); ax, ay, az = x, y, z × G
export function toHandoutColumns(raw) {
  const missing = REQUIRED_COLUMNS.filter((c) => !raw.columns.includes(c));
  if (missing.length) {
    throw new Error(
      `The CSV is missing column(s): ${missing.join(', ')}. ` +
      'Expected a Sensor Logger "Accelerometer Uncalibrated" export (time, seconds_elapsed, z, y, x).'
    );
  }
  return makeFrame(['time', 'ax', 'ay', 'az'], {
    time: [...raw.data.seconds_elapsed],
    ax: raw.data.x.map((v) => v * G),
    ay: raw.data.y.map((v) => v * G),
    az: raw.data.z.map((v) => v * G),
  });
}
