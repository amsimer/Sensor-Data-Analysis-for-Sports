# Written Answers — Lab A: Sensor Data Analysis for Sports

Every written (prose) item the lab handout asks for, in order. Write your answers under each **Answer:** line.
These texts will be placed in the matching sections of the web page.

> The interpretations must be about **your own dataset**, and you must be able to explain them at the oral check.

---

## Step 1 — Data collection documentation *(assessed)*

**1.1 Sport and session:** what did you do, where, and for how long? (e.g. "8 km outdoor run, Djurgårdsparken, 42 min")

Answer: Jogging on a treadmill.


**1.2 Phone position:** pocket, armband or other? Which body part? (Left or right, front or back pocket?)

Answer: Right trouser pocket.


**1.3 Sampling rate** as reported by the app:

Answer: 100 Hz.


**1.4 Notable events** during the session (sprint, fall, break, equipment change, speed changes on the treadmill), with approximate timestamps:

Answer: None.


---

## Step 2 — Loading and cleaning

**2.1 Columns present:** which columns did the Sensor Logger export contain? Did you rename any? (Note the units: m/s² or g.)

Answer: The Sensor Logger *Accelerometer Uncalibrated* export has 5 columns: `time` (timestamp in nanoseconds), `seconds_elapsed` (seconds since Record was pressed), `z`, `y` and `x` (acceleration in **g**, gravity included). In the analysis, `seconds_elapsed` is used as `time`, and `x`, `y`, `z` are renamed to `ax`, `ay`, `az` and converted to m/s² by multiplying by 9.80665. The raw file itself is not modified.


**2.2 Cleaning decisions:** explain *each* cleaning decision (assessed: at least one cleaning step must be justified in prose). Cover what you checked and what you did about it:

- Missing rows:

  Answer: Checked with `df.isnull().sum()`: 0 missing values in every column. No rows were dropped.

- Timestamps out of order:

  Answer: Checked with `(df['time'].diff() < 0).sum()`: 0 timestamps out of order. No rows were dropped.

- Sensor saturation (values beyond the sensor's physical range):

  Answer: 1,981 rows have at least one axis beyond ±19.6 m/s² (ax: 144, ay: 1,899, az: 14). The largest single-axis value is 4.90 g (48.0 m/s², on y). Each axis reaches its maximum and minimum only once, so there are no flat plateaus at a ceiling. These rows were kept.

- Noise at the start and end of the recording (pressing Record/Stop, putting the phone in your pocket):

  Answer: Only the data from 4.0 s to 312.0 s was kept. 949 rows were dropped: 395 from the start (0.04–4.0 s) and 554 from the end (312.0–317.55 s). Result: kept 30,709 of 31,658 rows.

- Any other step:

  Answer: None.


---

## Step 3 — Statistics and anomalies

**3.1 Is 50 Hz sufficient for your activity?** Comment on it using your effective sampling rate and Nyquist frequency. (Human gait cycles occur at ~1–3 Hz; jump landings contain frequencies up to ~15 Hz.)

Answer:


**3.2 Anomaly clusters** *(assessed: each cluster must be explained physically, not just labelled "outlier")*
For **each cluster** of outliers, answer the three questions. Copy the block if you have more clusters.

### Cluster 1
1. When did it occur (timestamp)?

   Answer:

2. What physical event likely caused it?

   Answer:

3. Should it be excluded from further analysis, or is it meaningful signal?

   Answer:

### Cluster 2
1. When did it occur (timestamp)?

   Answer:

2. What physical event likely caused it?

   Answer:

3. Should it be excluded from further analysis, or is it meaningful signal?

   Answer:

### Cluster 3
1. When did it occur (timestamp)?

   Answer:

2. What physical event likely caused it?

   Answer:

3. Should it be excluded from further analysis, or is it meaningful signal?

   Answer:


---

## Step 4 — Plot interpretations *(assessed: 2–4 sentences under each plot)*

Each interpretation should answer: **What does this plot show? What is surprising or interesting? What does it reveal about the sport or your own performance?**

**4.1 Plot 1: Time series** (acceleration magnitude over the session, with the mean and anomalies marked)

Answer:


**4.2 Plot 2: Distribution** (histogram of acceleration magnitude and box plots per axis)
If you recorded distinct phases (warm-up, main effort, cool-down), also compare them.

Answer:


**4.3 Plot 3: Cadence via PSD (Welch)**
Include what the dominant frequency peak represents, and the cadence in steps/min.

Answer:


---

## Step 5 — Market and research context

### 5.1 Peer-reviewed study *(assessed)*
Use a paper that uses the **same sensor type and sport** (accelerometer + running). Search Google Scholar, PubMed or IEEE Xplore, e.g. "accelerometer running gait analysis".

**Citation (APA format):**

Answer:


**Q1.** What variable did the researchers measure, and how does it compare to the feature you computed?

Answer:


**Q2.** What sampling rate did they use, and how does it relate to your own? Was your 50 Hz sufficient for the same purpose?

Answer:


**Q3.** What did they conclude, and does your data support or contradict that finding (even informally)?

Answer:


### 5.2 Commercial product *(assessed)*
A commercial device or app that measures the same activity (e.g. Garmin Forerunner, Whoop, Apple Watch, Polar Vantage, Catapult PlayerTek).

**Product name:**

Answer:


**What sensors does it use?** (accelerometer, gyro, heart rate, GPS?)

Answer:


**What metrics does it report to the user?**

Answer:


**What metrics does it expose to coaches or researchers via an API or export?**

Answer:


**What gap exists between what the device measures and what the published research says matters?** *(the core of this step)*

Answer:


### 5.3 Reflection *(assessed: 150–250 words)*
One paragraph that brings 5.1 and 5.2 together, addressing:
- Where does consumer technology lag behind research?
- Could your sensor data, if processed differently, fill any of that gap?
- What would a sports scientist want that is not available in today's consumer apps?

Answer:


Word count:
