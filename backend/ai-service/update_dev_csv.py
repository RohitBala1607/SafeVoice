import pandas as pd
import joblib
import os
import sys

# Define absolute paths for Windows
BASE_DIR = r'c:\Users\SanjayRavi\OneDrive\Documents\AI_survey_model'
CSV_PATH = os.path.join(BASE_DIR, 'dev.csv')
OUTPUT_PATH = os.path.join(BASE_DIR, 'dev_updated.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'posh_severity_model.pkl')
LE_PATH = os.path.join(BASE_DIR, 'posh_label_encoder.pkl')

def main():
    try:
        print(f"Loading data from {CSV_PATH}...")
        df = pd.read_csv(CSV_PATH)

        print(f"Loading model and encoder...")
        model = joblib.load(MODEL_PATH)
        le = joblib.load(LE_PATH)

        print("Predicting categories...")
        texts = df['Description'].fillna("").astype(str).tolist()
        preds_encoded = model.predict(texts)
        preds = le.inverse_transform(preds_encoded)

        mapping = {
            'Very High': 'high',
            'High': 'high',
            'Medium': 'mid',
            'Low': 'low',
            'very high': 'high',
            'high': 'high',
            'medium': 'mid',
            'mid': 'mid',
            'low': 'low'
        }

        print("Mapping predictions and renaming column...")
        df['weight'] = [mapping.get(p.strip().lower(), 'low') for p in preds]
        df_final = df[['Description', 'weight']]

        print(f"Saving temporary result to {OUTPUT_PATH}...")
        df_final.to_csv(OUTPUT_PATH, index=False)
        
        print(f"✅ Success: Updated data saved to {OUTPUT_PATH}")
        print("\nDistribution of categories:")
        print(df_final['weight'].value_counts())
        
        # Try to replace original if possible
        try:
            if os.path.exists(CSV_PATH):
                os.remove(CSV_PATH)
                os.rename(OUTPUT_PATH, CSV_PATH)
                print(f"✅ Original file {CSV_PATH} has been replaced.")
        except Exception as e:
            print(f"⚠️ Could not replace original file (likely open in another app): {e}")
            print(f"👉 Please manually replace 'dev.csv' with 'dev_updated.csv' later.")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
