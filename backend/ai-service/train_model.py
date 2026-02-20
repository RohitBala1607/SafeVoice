import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
data = pd.read_csv("dev.csv")

# Strip column names to avoid KeyError
data.columns = data.columns.str.strip()

X = data["Description"]
y = data["weight"]

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Create pipeline with improved settings
model = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1,2), max_features=1000)),
    ("clf", RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, class_weight="balanced"))
])

# Train model
print("Training model...")
model.fit(X, y_encoded)

# Save model and label encoder
joblib.dump(model, "posh_severity_model.pkl")
joblib.dump(le, "posh_label_encoder.pkl")

print("✅ Model trained and saved successfully!")

# Validation Step: Test on sample entries from each class
print("\nValidation Results:")
for label in le.classes_:
    sample_text = data[data["weight"] == label]["Description"].iloc[0]
    pred_num = model.predict([sample_text])[0]
    pred_label = le.inverse_transform([pred_num])[0]
    print(f"Target: {label} | Sample: {sample_text[:50]}... | Predicted: {pred_label}")
