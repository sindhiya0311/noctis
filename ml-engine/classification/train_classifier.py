import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

data = pd.read_csv("../data/training_data.csv")

def classify(row):
    score = 0

    if row["stopDuration"] > 180:
        score += 1

    if row["deviation"] == 1:
        score += 1

    if row["night"] == 1:
        score += 1

    if row["unsafe"] == 1:
        score += 1

    if row["entropy"] > 10:
        score += 1

    if score >= 4:
        return 90
    elif score == 3:
        return 70
    elif score == 2:
        return 40
    else:
        return 10

data["risk"] = data.apply(classify, axis=1)

X = data.drop("risk", axis=1)
y = data["risk"]

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X, y)

joblib.dump(model, "../models/classifier_model.pkl")

print("NOCTIS classifier trained")