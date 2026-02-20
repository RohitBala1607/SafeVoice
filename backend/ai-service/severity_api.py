from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(title="Severity Prediction API")

# Load model and label encoder
model = joblib.load("posh_severity_model.pkl")
le = joblib.load("posh_label_encoder.pkl")

class TextInput(BaseModel):
    text: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "text": "The engine is making a loud knocking sound and smoke is coming from the hood."
                }
            ]
        }
    }

@app.get("/")
def root():
    return {"message": "Severity Prediction API is running"}

@app.post("/predict")
def predict(data: TextInput):
    # Predict numerical class
    prediction_num = model.predict([data.text])[0]
    
    # Decode numerical class to label (e.g., 'high', 'mid', 'low')
    prediction_label = le.inverse_transform([prediction_num])[0]
    
    # Get confidence score
    probability = model.predict_proba([data.text]).max()

    return {
        "weight": prediction_label,
        "confidence": round(float(probability), 2)
    }
