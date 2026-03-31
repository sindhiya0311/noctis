from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

anomaly_model = joblib.load("models/anomaly_model.pkl")
classifier_model = joblib.load("models/classifier_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    speed = data.get("speed", 0)
    stop = data.get("stopDuration", 0)
    deviation = data.get("deviation", 0)
    night = data.get("night", 0)
    unsafe = data.get("unsafe", 0)
    entropy = data.get("entropy", 0)

    features = np.array([[speed, stop, deviation, night, unsafe, entropy]])

    anomaly = anomaly_model.predict(features)[0]
    risk = classifier_model.predict(features)[0]

    if anomaly == -1:
        risk = min(100, risk + 20)
        context = "AI detected abnormal behaviour"
    else:
        context = "AI behaviour normal"

    return jsonify({
        "risk": int(risk),
        "context": context,
        "anomaly": int(anomaly == -1)
    })


if __name__ == "__main__":
    app.run(port=5001)