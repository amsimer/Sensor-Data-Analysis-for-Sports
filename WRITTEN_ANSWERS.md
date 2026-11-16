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

Answer: I grabbed my phone and checked if the recording was still going at around a minute.


---

## Step 2 — Loading and cleaning

**2.1 Columns present:** which columns did the SensorLog export contain? Did you rename any? (Note the units: m/s² or g.)

Answer: The Sensor Logger contained the following columns:
- time: nanoseconds since epoch
- seconds_elapsed: seconds since recording started
- z, x and y: m/s^-2
The names were only changed in the code after loading the file: seconds_elapsed -> time, x y z -> ax ay az.

**2.2 Cleaning decisions:** explain *each* cleaning decision (assessed: at least one cleaning step must be justified in prose). Cover what you checked and what you did about it:

- Missing rows:

  Answer: There were none

- Timestamps out of order: 

  Answer: There were none

- Sensor saturation (values beyond the sensor's physical range):

  Answer: Values beyond +_ 19.6 m/s^2 were reported but kept in the data

- Noise at the start and end of the recording (pressing Record/Stop, putting the phone in your pocket):

  Answer: The data was kept from 4s to 312 s because I needed to remove the initial part where I started the recording and put the phone in my pocket and when I took it out to stop the recording.

- Any other step:

  Answer:


---

## Step 3 — Statistics and anomalies

**3.1 Is 50 Hz sufficient for your activity?** Comment on it using your effective sampling rate and Nyquist frequency. (Human gait cycles occur at ~1–3 Hz; jump landings contain frequencies up to ~15 Hz.)

Answer: Sensor logger used 100 Hz but it as sufficient because my jogging cycle was much slower, so the data was collected with high resolution.


**3.2 Anomaly clusters** *(assessed: each cluster must be explained physically, not just labelled "outlier")*
For **each cluster** of outliers, answer the three questions. Copy the block if you have more clusters.

### Cluster 1
1. When did it occur (timestamp)?

   Answer: 77.82 - 100.64

2. What physical event likely caused it?

   Answer: At this moment I checked my phone to see if the recording was still going.

3. Should it be excluded from further analysis, or is it meaningful signal?

   Answer: It should be excluded because it doesn't represent anything related to the motion that's being analysed.

### Cluster 2
1. When did it occur (timestamp)?

   Answer: 105.72 - 117.43

2. What physical event likely caused it?

   Answer: My phone shifted its position inside my pocket.

3. Should it be excluded from further analysis, or is it meaningful signal?

   Answer: It shouldn't be analyzed but it should be noted because it changed the output after this point.

### Cluster 3
1. When did it occur (timestamp)?

   Answer: 262.63 - 310.28 

2. What physical event likely caused it?

   Answer: Not a single physicaal event but was the result of the phone changing position inside the pocket

3. Should it be excluded from further analysis, or is it meaningful signal?

   Answer: It is a meaningful signal but it's important to understand the context of it being related to a phone movement instead of a change in the motion 


---

## Step 4 — Plot interpretations *(assessed: 2–4 sentences under each plot)*

Each interpretation should answer: **What does this plot show? What is surprising or interesting? What does it reveal about the sport or your own performance?**

**4.1 Plot 1: Time series** (acceleration magnitude over the session, with the mean and anomalies marked)

Answer: 
The signal has a very steady pace, it's visible that it goes up and down at an appropiate frecuency for jogging in a threadmill at a constant speed. Every spike in the plot is a foot strike, which due to the steady pace and lack of events, the spikes keep going at a close frecuency. There are also bigger peaks comming after around 100 s, which are attributed to the phone chaning position in my pocket. Since this data doesn't filter out gravity, the mean of 10.60 m/s^2 actually shows a load of 0.79 m/s^2.

**4.2 Plot 2: Distribution** (histogram of acceleration magnitude and box plots per axis)
If you recorded distinct phases (warm-up, main effort, cool-down), also compare them.

Answer:
The histogram shows a skewed to the right distribution, because values go up and down gradually but they are more concentrated on the left. This shows that the median is around the gravity acceleration because it's smaller than the mean because of the distribution type. The box plots show that ax and ay have the largest amount of spread and outliers, while z has much less change. This indicates that x and y make a plane paralel to me, therefore being more affected by jogging statically in a straight line, and z goes out perpendicularly.

**4.3 Plot 3: Cadence via PSD (Welch)**
Include what the dominant frequency peak represents, and the cadence in steps/min.

Answer:
The domimant frecuency is 2.73 Hz, which is 163.6 steps/min. This is an expected result because it makes sense for a light jog to have around 2.5 steps per second. There's also a smaller peak at 1.36 Hz, half of the highest one. This peak is attributed to the gait of one single leg, since the phone was placed in the right pocket. The narrow shape of the peak is also consistent with the motion's behaviour since the treadmill's pace never changed in the recording. The low frecuency of the motion indicates that 100 Hz is more than enough for this application.

---

## Step 5 — Market and research context

### 5.1 Peer-reviewed study *(assessed)*
Use a paper that uses the **same sensor type and sport** (accelerometer + running). Search Google Scholar, PubMed or IEEE Xplore, e.g. "accelerometer running gait analysis".

**Citation (APA format):**

Answer:
Zdravevski, E., Risteska Stojkoska, B., Standl, M., & Schulz, H. (2017). Automatic machine-learning based identification of jogging periods from accelerometer measurements of adolescents under field conditions. PLOS ONE, 12(9), e0184216. https://doi.org/10.1371/journal.pone.0184216 

**Q1.** What variable did the researchers measure, and how does it compare to the feature you computed?

Answer:
The researchers measured activity counts per second, which is a unitless measurement of how much movement is happening per second in 3 axis as well. Their analysis is similar to mine in that they used vector magnitude for the total acceleration. The ActiGraph device was able to count steps per second as well but it was not mentioned in the article.

**Q2.** What sampling rate did they use, and how does it relate to your own? Was your 50 Hz sufficient for the same purpose?

Answer:
Their sampling rate was 30 Hz but they stored at 1 Hz, taking activity data for each second. Yes 50 Hz would be sufficient for them, it would have more resolution than their frecuency. 

**Q3.** What did they conclude, and does your data support or contradict that finding (even informally)?

Answer:
They concluded that their machine learning model could classify movements (jogging and walking) with a 99% accuracy. The precision of the cadence peak in my findings shows that classifying movement activities with an accelerometer is viable, because dominant frecuencies could be isolated for different time periods, which supports their results.

### 5.2 Commercial product *(assessed)*
A commercial device or app that measures the same activity (e.g. Garmin Forerunner, Whoop, Apple Watch, Polar Vantage, Catapult PlayerTek).

**Product name:**

Answer: Garmin Forerunner 265


**What sensors does it use?** (accelerometer, gyro, heart rate, GPS?)

Answer:
- Accelerometer
- Garmin Elevate heart rate monitor
- Pulse oxymeter
- Barometer
- Thermometer
- Light sensor

**What metrics does it report to the user?**

Answer:
Pace, speed, distance, time, heart rate, cadence, stride length, vertical oscilation, ground contact time, training load, VO2 estimate, recovery time, training readiness, sleep, HRV, stress, Pulse Ox, etc.

**What metrics does it expose to coaches or researchers via an API or export?**

Answer:
- Manual export: Activities can be downloaded as FIT files
- APIs: Activity and health data in JSON files. The starter tier only pushes new data while the enterprise tier adds historical data and unlimited users.

**What gap exists between what the device measures and what the published research says matters?** *(the core of this step)*

Answer:
This device has very complete data, and informs the athlete about a lot of information. A gap it has is that it doesn't show raw accelereometer data, so it's difficult o validate how they filter it and interpret it. They also don't show percentile values (distribution, median, Q1, Q3, etc.), only average and real time values, which can be a limitation in describing a movement's behaviour if the full context isn't known. Some reviews state that wrist sensor values aren't as precise as they are in other body parts like the legs or hips, which is also a gap between the product and what could be considered gold standard.

### 5.3 Reflection *(assessed: 150–250 words)*
One paragraph that brings 5.1 and 5.2 together, addressing:
- Where does consumer technology lag behind research?
- Could your sensor data, if processed differently, fill any of that gap?
- What would a sports scientist want that is not available in today's consumer apps?

Answer:
Consumer technology oftern lags behing research because they normally have different goals, consumer product focus on simple and user friendly data, as well as making products more comfortable and accurate enough for the user to get valuable data and also like the functionality/aesthetics of the product. Research normally goes the other way around, it tries to push the limits of how much information and how accurate can technology be, without thinking too much of user interaction yet. So the normal workflow is that research evaluates and validates a new technology's functionality, so companies can later simplify it at make it as user friendly as possible. My sensor data could fill in information gaps for athletes who want/need more context in the data their devices are giving them, for example the distribution of their motion. I think an accelerometer based app that animates an athlete's full body motion through estimation based on physiological description and the data collected could be an intresting approach. This could be very intresting for athletes that want to see a more detailed bodily analysis without the need to use motion capture or video analysis, it could just be a sensor in each limb for example. 

Word count:
