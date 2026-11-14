# CONTEXT — Course-specific constraints

## Course
- CM2023/HI1033 Mobile Sports Applications, HT26, KTH. Lab A – Sensor Data Analysis for Sports.
- Assessed **Pass/Fail** against the criteria in SPEC.md §6.
- Deadline: see Canvas.

## Constraints from the professor and the handout
- On the professor's instructions, the lab is vibecoded as a web page. **The web page replaces the Jupyter notebook.**
- The analysis must use **real data** recorded by the student. `sensor_raw.csv` must be the original, **unmodified** app export. It is submitted manually by the student.
- Plots must be generated in code. No screenshots from spreadsheet software.
- Interpretations (cleaning decisions, anomaly clusters, plot comments, Step 5) must be about the student's **own** dataset. There is no single correct answer, but the reasoning is assessed.
- **Oral check:** at or after submission, the examiner may ask about the data (e.g. "what does the peak at 2.1 Hz represent?", "why is the spike at t=312 s noise?"). The student must be able to answer, so the page should make every value traceable.
- The recording protocol: 50 Hz, phone in one consistent position, press Record before moving, at least 5 minutes, Stop right after, export as CSV.

## Project-specific choices
- Activity: jogging on a treadmill (no GPS used).
- App: **Sensor Logger** (not SensorLog). Sensors: accelerometer only. Phone: right trouser pocket.
- Raw file: Sensor Logger's **Accelerometer Uncalibrated** export (columns `time` [ns timestamp], `seconds_elapsed`, `z`, `y`, `x`; values in **g**, gravity included), committed unchanged as `data/sensor_raw.csv`. The page converts with 9.80665 m/s² per g. The *Accelerometer* export (gravity removed, m/s²) was not used, because the handout's method assumes gravity is included.
- Recording: 31,658 samples, 317.5 s, recorded 14 Nov 2026.
- Outlier clusters: 5 s gap rule (7 clusters).
- Plot 3: Welch PSD, nperseg 1024; dominant 2.73 Hz read as step frequency (163.6 steps/min). No phase comparison in Plot 2 (steady session).
- Cleaning: keep 4.0–312.0 s (phone into/out of the pocket at the start and end); values beyond ±19.6 m/s² kept (no clipping; peak axis 4.9 g).
- Recorded at **100 Hz** instead of the handout's 50 Hz (allowed: "or as close as your device allows"). Notable events: none.
- Plot 3: cadence via Welch PSD.

## Open items (to confirm before or while building)
- [ ] Peer-reviewed paper (Step 5.1) and commercial product (Step 5.2) to use.

## Working rules
- Claude fills in **objective** written answers (values, counts, columns, settings) in WRITTEN_ANSWERS.md as each step is built. **Reflective and interpretation answers are written by the student.**
- Claude consults the student before editing any file.

## Contribution log
Updated by Claude after every completed step. It records what was done and by whom (student vs Claude).

| # | Date | Step | What was done | Contributor |
|---|---|---|---|---|
| 1 | 2026-11-14 | Setup | Created SPEC.md, STYLE.md, CONTEXT.md and the WRITTEN_ANSWERS.md template from the lab handout and the student's decisions | Claude (decisions: student) |
| 2 | 2026-11-14 | Step 1 | Built the page shell (MVVM: answers model, lab ViewModel, Step 1 view) with placeholders for Steps 2–5; Step 1 shows the answers from WRITTEN_ANSWERS.md; added marked.js; filled Step 1 answers; updated SPEC/CONTEXT to 100 Hz | Claude (session facts and approvals: student) |
| 3 | 2026-11-14 | Step 2 | Inspected both Sensor Logger exports; committed AccelerometerUncalibrated as data/sensor_raw.csv (byte-identical). Built Step 2: CSV loading (Papa Parse), pandas-like frame helpers (shape, dtypes, head, describe, quantile, std), column mapping and g→m/s², acc_mag, artefact checks, trimming, Kept N/M, sensor_clean.csv download, effective sampling rate, CSV upload. Answers parser supports sub-answers (2.2). Results checked against pandas (identical). App name corrected to Sensor Logger | Claude (file choice, g factor and cleaning decisions: student) |
| 4 | 2026-11-14 | Step 2 answers | Filled the factual parts of WRITTEN_ANSWERS.md 2.1 and 2.2 (columns, units, check results, rows dropped/kept); renamed SensorLog → Sensor Logger in question 2.1. Reasons and interpretations left for the student | Claude (rule: student) |
| 5 | 2026-11-14 | Step 3 | Built Step 3: descriptive statistics table (stats.js), IQR bounds, outliers and 5 s-gap clustering (anomalies.js), Step 3 view with notebook-style output and per-cluster answers; shared view helpers moved to dom.js. Results: 1,008 outliers (3.3 %, all high), 7 clusters. WRITTEN_ANSWERS.md: 3.1 reworded to 100 Hz, cluster questions given ids (C1.1 …), cluster times filled in. Checked against pandas | Claude (5 s gap rule: student) |
| 6 | 2026-11-14 | Step 4 | Built Step 4 with Plotly.js: Plot 1 time series (mean line, 1,008 outlier lines), Plot 2 histogram (60 bins) + per-axis box plots, Plot 3 Welch PSD (spectral.js, matches scipy to 5e-13) with step peak 2.73 Hz = 163.6 steps/min and stride peak 1.36 Hz; PNG download per plot. Filled the factual part of answer 4.3 | Claude (nperseg 1024, step-frequency reading, no phase comparison: student) |
