from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# load models
anomaly_model = joblib.load("models/anomaly_model.pkl")
classifier_model = joblib.load("models/classifier_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    speed = data.get("speed", 0)
    stop = data.get("stop", 0)
    night = data.get("night", 0)
    unsafe = data.get("unsafe", 0)
    deviation = data.get("deviation", 0)

    features = np.array([[speed, stop, night, unsafe, deviation]])

    # anomaly detection
    anomaly = anomaly_model.predict(features)[0]

    # classification
    cls = classifier_model.predict(features)[0]

    # convert to risk
    if anomaly == -1:
        risk = 90
        context = "AI detected abnormal behaviour"
    else:
        risk = int(cls)
        context = "AI predicted normal movement"

    return jsonify({
        "risk": risk,
        "context": context,
        "anomaly": int(anomaly == -1)
    })


if __name__ == "__main__":
    app.run(port=5001)