import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

# Simulated data
np.random.seed(42)

data = pd.DataFrame({
    "distanceMoved": np.random.normal(100, 50, 500),
    "timeGap": np.random.normal(60, 20, 500),
    "isStopped": np.random.randint(0, 2, 500),
    "movementChange": np.random.normal(10, 5, 500),
    "isNight": np.random.randint(0, 2, 500)
})

# Train model
model = IsolationForest(contamination=0.1)
model.fit(data)

# Save model
joblib.dump(model, "../models/anomaly_model.pkl")

print("Anomaly model trained & saved!")