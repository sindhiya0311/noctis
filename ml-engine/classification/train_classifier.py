import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

np.random.seed(42)

# Simulated data
data = pd.DataFrame({
    "distanceMoved": np.random.normal(100, 50, 500),
    "timeGap": np.random.normal(60, 20, 500),
    "isStopped": np.random.randint(0, 2, 500),
    "movementChange": np.random.normal(10, 5, 500),
    "isNight": np.random.randint(0, 2, 500)
})

# Create labels (logic-based)
def get_risk(row):
    if row["isStopped"] == 1 and row["isNight"] == 1:
        return "Emergency"
    elif row["movementChange"] > 20:
        return "Warning"
    elif row["distanceMoved"] < 20:
        return "Alert"
    else:
        return "Safe"

data["risk"] = data.apply(get_risk, axis=1)

# Features & labels
X = data.drop("risk", axis=1)
y = data["risk"]

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save model
joblib.dump(model, "../models/classifier_model.pkl")

print("Classifier model trained & saved!")