import numpy as np
import pandas as pd

np.random.seed(42)

rows = 50000

data = []

for i in range(rows):

    speed = np.random.normal(35, 10)
    stop = np.random.exponential(30)
    deviation = np.random.choice([0,1], p=[0.9,0.1])
    night = np.random.choice([0,1], p=[0.7,0.3])
    unsafe = np.random.choice([0,1], p=[0.85,0.15])
    entropy = np.random.normal(4,2)

    # anomalies
    if np.random.rand() < 0.12:
        speed = np.random.uniform(0,10)
        stop = np.random.uniform(200,800)
        deviation = 1
        entropy = np.random.uniform(8,20)
        unsafe = 1

    data.append([
        speed,
        stop,
        deviation,
        night,
        unsafe,
        entropy
    ])

df = pd.DataFrame(data, columns=[
    "speed",
    "stopDuration",
    "deviation",
    "night",
    "unsafe",
    "entropy"
])

df.to_csv("training_data.csv", index=False)

print("NOCTIS dataset generated (50k rows)")