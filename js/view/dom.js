// View helpers: small DOM builders and pandas-like number formatting.

// Number formatting close to pandas' default display.
export function fmt(v) {
  if (typeof v === 'bigint') return v.toString();
  if (typeof v !== 'number' || Number.isNaN(v)) return 'NaN';
  if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
  if (Math.abs(v) >= 1e9) return v.toExponential(6);
  return v.toFixed(6);
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  node.append(...children);
  return node;
}

// A pandas-style table: optional index column, then the data columns.
export function table(columns, rows, { index = true, caption } = {}) {
  const wrap = el('div', { class: 'table-wrap' });
  const t = el('table', { class: 'df' });
  if (caption) t.append(el('caption', {}, caption));
  const headRow = el('tr', {}, ...(index ? [el('th', {}, '')] : []), ...columns.map((c) => el('th', {}, c)));
  t.append(el('thead', {}, headRow));
  const body = el('tbody');
  rows.forEach((row, i) => {
    const cells = row.map((v) => el('td', {}, typeof v === 'string' ? v : fmt(v)));
    body.append(el('tr', {}, ...(index ? [el('th', {}, String(i))] : []), ...cells));
  });
  t.append(body);
  wrap.append(t);
  return wrap;
}

// A notebook-style "printed output" block, labelled with the Python it mirrors.
export function output(code, text) {
  return el('div', { class: 'cell' },
    el('pre', { class: 'cell-code' }, el('code', {}, code)),
    el('pre', { class: 'cell-out' }, text));
}

export function sub(title) {
  return el('h3', {}, title);
}
