from fastapi import FastAPI
from pydantic import BaseModel
import joblib

# Initialize FastAPI app
app = FastAPI(title="Text Severity Prediction API")

# Load trained model and label encoder
model = joblib.load("posh_severity_model.pkl")
le = joblib.load("posh_label_encoder.pkl")

# Define request schema
class TextInput(BaseModel):
    text: str

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Text Severity Prediction API!"}

# Prediction endpoint
@app.post("/predict")
def predict_severity(input: TextInput):
    # Make prediction
    pred_num = model.predict([input.text])
    # Convert numeric label to original label
    pred_label = le.inverse_transform(pred_num)
    return {"weight": pred_label[0]}

