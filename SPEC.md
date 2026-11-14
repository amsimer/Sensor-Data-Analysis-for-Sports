# SPEC — Lab A: Sensor Data Analysis for Sports

Course: CM2023/HI1033 Mobile Sports Applications · HT26 (KTH)
Source: the lab handout `LabACM2023HT26.pdf`.

## 1. Purpose

Collect raw accelerometer data while jogging on a treadmill. Process and analyse it in a **web page**, then relate the findings to one peer-reviewed study and one commercial product.

Course ILOs addressed:
- *"Apply existing data mining methods to sensor data to find patterns and insights for sports and health."*
- Higher grade: *"Explain, analyse, and critically evaluate recent trends in mobile applications for sports and health."*

## 2. Platform choice (the professor allows the lab to be built as a web page)

| Handout says | This project does |
|---|---|
| Python 3.10+ in a Jupyter Notebook | JavaScript in an HTML web page |
| `laba_<lastname>.ipynb` is the report | **The web page is the report.** It replaces the notebook. |
| pandas / NumPy | Plain JS functions that copy the handout's Python step by step (same names and logic where possible) |
| matplotlib | Plotly.js, configured to match the handout's figures (titles, axis labels, colours, line styles) |
| scipy.signal.welch | A JS Welch PSD implementation that mirrors scipy's defaults (see STYLE.md) |
| Markdown cells | HTML text sections inside the page |
| Submit `sensor_raw.csv` + notebook | Student submits `sensor_raw.csv` **manually**. The page is delivered via GitHub Pages. |

- **Hosting:** GitHub Pages (`amsimer.github.io/Sensor-Data-Analysis-for-Sports`), and runnable locally with `python -m http.server 8000`.
- **Code layout:** `index.html` plus separate JS files (ES modules), organized MVVM. See STYLE.md.
- **Data input, both ways:**
  1. Automatically load the `sensor_raw.csv` committed to the repo.
  2. A file picker for uploading a different CSV in the browser.
- **Guiding rule:** stay as close as possible to the Python code in the handout.

## 3. Session (Step 1 inputs)

| Item | Value |
|---|---|
| Sport | Jogging on a treadmill (indoor) |
| Sensor app | SensorLog |
| Sensors | Accelerometer only (ax, ay, az) |
| Phone position | Right trouser pocket |
| Sampling rate | 100 Hz, as reported by SensorLog (the handout asks for 50 Hz "or as close as your device allows") |
| Minimum duration | 5 minutes |
| Notable events | None |

## 4. Functional requirements (one page section per step)

### Step 1 — Session documentation
- A text section describing: sport and session (what, where, how long), phone position and body part, sampling rate reported by the app, and notable events with approximate timestamps.

### Step 2 — Loading and cleaning
- 2.1 Load the CSV. Show the equivalents of `df.shape`, `df.dtypes`, `df.head(10)` and `df.describe()`.
- Map/rename the SensorLog columns to `time`, `ax`, `ay`, `az` (see CONTEXT.md for open questions on units).
- 2.2 Compute `acc_mag = sqrt(ax² + ay² + az²)`.
- 2.3 Check for and report:
  - missing values (`isnull().sum()`)
  - out-of-order timestamps (`diff() < 0`)
  - sensor saturation (beyond the sensor's physical range, e.g. ±19.6 m/s² for a 2 g sensor)
  - noise at the start and end of the recording
- Drop or interpolate problem rows. Report `Kept N/M rows after cleaning`.
- Make the cleaned dataset downloadable as `sensor_clean.csv`.
- A prose section justifying each cleaning decision.

### Step 3 — Statistics and anomalies
- 3.1 A descriptive statistics table for `acc_mag`: mean, standard deviation, max, min, duration (s), sample count, effective sampling rate (Hz).
- Effective sampling rate is `fs = 1 / median(diff(time))`. Also show Nyquist = `fs/2`.
- A comment on whether the sampling rate is enough. The handout asks about 50 Hz; this recording is 100 Hz (Nyquist 50 Hz). Gait is ~1–3 Hz; jump landings reach up to ~15 Hz.
- 3.2 IQR outlier detection on `acc_mag`:
  - Q1/Q3 using pandas' default linear quantile method
  - bounds = Q1 − 1.5·IQR and Q3 + 1.5·IQR
  - show the outlier count, the percentage, and the first 10 rows (`time`, `acc_mag`)
- For each **cluster** of outliers, a prose answer to: when did it happen, what physical event likely caused it, and should it be excluded or kept as signal?

### Step 4 — Visualisation
All plots are generated in code. Each has a title and axis labels, and can be exported as PNG.
1. **Plot 1 — Time series:** `acc_mag` over time, a red dashed mean line with a mean label, orange vertical lines at the outliers. Saved as `fig1_timeseries.png`.
2. **Plot 2 — Distribution:** a histogram of `acc_mag` (60 bins, steelblue) and box plots of ax, ay and az. If distinct phases exist (warm-up, main effort, cool-down), compare them. Saved as `fig2_distribution.png`.
3. **Plot 3 — Cadence via PSD:** Welch power spectral density of `acc_mag`, with the dominant frequency peak marked and converted to steps/min.
- Under each plot, 2–4 sentences: what it shows, what is surprising, and what it reveals about the sport or the student's performance.

### Step 5 — Market and research context (written content)
- 5.1 One peer-reviewed paper on accelerometer-based running/gait analysis, cited in APA. Answers to: the variable measured vs ours, their sampling rate vs ours, their conclusion vs our data.
- 5.2 One commercial device or app: sensors, metrics shown to users, metrics available via API/export, and the **gap between the device and the research**.
- 5.3 A reflection paragraph of **150–250 words** synthesising 5.1 and 5.2.

## 5. Non-functional requirements
- Runs top to bottom without errors in a current desktop browser.
- All outputs (tables, printed values, plots) are visible on the page, like an executed notebook.
- The student must be able to explain every number and plot at the oral check.

## 6. Assessment criteria (Pass/Fail, from the handout)

| Criterion | Required for Pass |
|---|---|
| Real data | `sensor_raw.csv` is present and consistent with the analysis |
| Step 1 documentation | Session, phone position and notable events described |
| Step 2: Loading | Data loaded, shape and types inspected, effective sampling rate computed |
| Step 2: Cleaning | At least one cleaning step applied and justified in prose |
| Step 3: Statistics | Descriptive statistics table; IQR anomaly detection implemented |
| Step 3: Interpretation | Each anomaly cluster explained physically |
| Step 4: Plots | Three plots generated in code, each with axis labels and a title |
| Step 4: Interpretation | 2–4 sentences under each plot |
| Step 5: Research | One peer-reviewed paper in APA; three questions answered |
| Step 5: Commercial | One product described; market–research gap identified |
| Step 5: Reflection | A 150–250-word synthesis paragraph |

## 7. Deliverables
1. `sensor_raw.csv`: the unmodified SensorLog export, submitted manually by the student. A copy is committed to the repo so the page can auto-load it.
2. The web page on GitHub Pages: the report.
