import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

data = pd.read_csv("../data/training_data.csv")

model = IsolationForest(
    contamination=0.1,
    random_state=42
)

model.fit(data)

joblib.dump(model, "../models/anomaly_model.pkl")

print("NOCTIS anomaly model trained")