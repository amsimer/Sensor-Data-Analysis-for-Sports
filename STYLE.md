# STYLE — Architecture and code conventions

## 1. Architecture: MVVM

| Layer | Responsibility | Must NOT |
|---|---|---|
| **Model** | Pure data and analysis: CSV parsing, column mapping, cleaning, statistics, IQR, Welch PSD. Input data in, results out. | Touch the DOM or Plotly; hold UI state |
| **ViewModel** | Holds the application state (raw data, clean data, results, errors) and runs the Model in the order of the lab steps. Exposes ready-to-display values and notifies Views when state changes. | Touch the DOM directly |
| **View** | Renders state into the DOM (tables, printed output, Plotly figures) and forwards user actions (file upload, export) to the ViewModel. | Do any calculations |

Data flow is one-way: **user action → View → ViewModel → Model → ViewModel state → View re-render.**
This also matches the lab's reflection on how data flows from the sensor to the user interface.

## 2. Folder layout (planned)

```
index.html              page shell; one <section> per lab step
css/style.css
js/
  main.js               bootstraps: creates the ViewModel, wires the Views
  model/                csv.js, cleaning.js, stats.js, anomalies.js, spectral.js
  viewmodel/            labViewModel.js
  view/                 step1View.js … step5View.js, components (table, print block)
data/sensor_raw.csv     committed copy of the raw export (unmodified)
```
The final names are set when the code is built; any change will be recorded in the CONTEXT.md log.

## 3. Python parity rules
- Each Model function names the handout's Python line it mirrors in a short comment, e.g. `// df['time'].diff().median()`.
- Function names follow pandas/NumPy/SciPy where that's natural: `describe`, `quantile`, `dropna`, `diff`, `median`, `welch`.
- Numerical behaviour matches the Python defaults:
  - `quantile`: linear interpolation (pandas default)
  - `std`: sample standard deviation, ddof = 1 (pandas default)
  - `welch`: Hann window, `nperseg = 256`, 50 % overlap, constant detrend, one-sided density (scipy defaults), unless a different `nperseg` is chosen and justified on the page
- Plots copy the handout's matplotlib settings: titles, labels, colours (`steelblue`, red dashed mean, orange outlier lines), 60 histogram bins.

## 4. Libraries (loaded from a CDN, with pinned versions)
- **Papa Parse:** CSV parsing.
- **Plotly.js:** plots and PNG export.
- **marked.js** (`marked@12.0.2`): renders the Markdown answers from `WRITTEN_ANSWERS.md` on the page.

## 4a. Written answers
- `WRITTEN_ANSWERS.md` is the single source for all prose. The page fetches it and shows each answer in its step's section.
- Each answer is found by its **bold question id** (`**1.1 …**`, `**Q1.** …`) and the text after `Answer:`. **Keep the question lines and the `Answer:` labels unchanged.** Write freely in the answer space.
- An answer ends at the next question, heading or `---` line. Empty answers show as "To be filled in" on the page.
- Everything else is plain JS (no build step, no framework), so GitHub Pages can serve the repo as is.

## 5. Code conventions
- ES modules (`import`/`export`), `const`/`let`, no globals except the bootstrap in `main.js`.
- camelCase for JS identifiers. Data column names stay as in the handout (`time`, `ax`, `ay`, `az`, `acc_mag`).
- Model functions are pure and deterministic, so they are easy to check against the Python results.
- Units are always shown in the UI (m/s², s, Hz).
- Errors (a bad CSV, missing columns) appear on the page, never silently in the console only.
