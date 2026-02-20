import joblib
import pandas as pd
from sklearn.pipeline import Pipeline

# Load the trained components
model = joblib.load("posh_severity_model.pkl")
le = joblib.load("posh_label_encoder.pkl")
data = pd.read_csv("dev.csv")
data.columns = data.columns.str.strip()

print("\n--- Model Validation Test ---")
for label in sorted(data['weight'].unique()):
    sample = data[data['weight'] == label]['Description'].iloc[0]
    pred_num = model.predict([sample])[0]
    pred_label = le.inverse_transform([pred_num])[0]
    conf = model.predict_proba([sample]).max()
    print(f"[{label.upper()}] Input: {sample[:40]}... -> Predicted: {pred_label} (Conf: {conf:.2f})")
