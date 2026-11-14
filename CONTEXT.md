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
- App: SensorLog. Sensors: accelerometer only. Phone: trouser pocket.
- Plot 3: cadence via Welch PSD.

## Open items (to confirm before or while building)
- [ ] **SensorLog column names and units.** SensorLog may export acceleration in **g** rather than m/s², and use its own column and time names. Verify against the first real export before writing the column mapping and deciding whether to multiply by 9.81.
- [ ] SensorLog's actual sampling rate setting (can it be set to 50 Hz on this phone?).
- [ ] Pocket details: left or right, front or back.
- [ ] Session details: duration, treadmill speed(s), notable events with timestamps.
- [ ] Peer-reviewed paper (Step 5.1) and commercial product (Step 5.2) to use.

## Contribution log
Updated by Claude after every completed step. It records what was done and by whom (student vs Claude).

| # | Date | Step | What was done | Contributor |
|---|---|---|---|---|
