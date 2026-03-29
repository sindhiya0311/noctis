import joblib

model = joblib.load("../models/classifier_model.pkl")

def predict_risk(data):
    prediction = model.predict([data])
    return prediction[0]