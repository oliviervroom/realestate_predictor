# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from model.model_loader import load_model
from evaluate.evaluator import evaluate_listing

# -------------------
# Initialize Flask app
# -------------------
app = Flask(__name__)
CORS(app)  # Allow React frontend to access API

# -------------------
# Load model and dataset once at startup
# -------------------
try:
    print("Loading assets (data and model)...")
    df = pd.read_csv("data/Rental_Dataset.csv")
    model = load_model("data/rent_predictor_model.cbm")
    features_used = ["ZIP_CODE", "PROP_TYPE", "SQUARE_FEET", "NO_BEDROOMS", "TOTAL_BATHS"]
    print("Assets loaded successfully!")
except Exception as e:
    print(f"Failed to load assets: {e}")
    raise e

# -------------------
# Predict rent directly from transformed input
# -------------------
@app.route('/predict_rent', methods=['POST'])
def predict_rent():
    try:
        query = request.get_json()
        if not query:
            return jsonify({"error": "No input data provided"}), 400

        print(f"Received query for prediction: {query}")
        result = evaluate_listing(query, df, model, features_used)
        return jsonify(result), 200

    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({"error": str(e)}), 500

# -------------------
# Evaluate from address or ZIP code
# -------------------
@app.route('/evaluate_by_location', methods=['POST'])
def evaluate_by_location():
    try:
        query = request.get_json()
        if not query:
            return jsonify({"error": "No input data provided"}), 400

        address_line = query.get("line", "").strip().lower()
        zip_code = query.get("ZIP_CODE")

        matched = None
        if address_line:
            matched = df[df["ADDRESS"].str.lower().str.strip() == address_line]
        elif zip_code:
            matched = df[df["ZIP_CODE"] == zip_code]

        if matched is None or matched.empty:
            return jsonify({"error": "No matching property found in dataset"}), 404

        row_dict = matched.iloc[0].to_dict()
        result = evaluate_listing(row_dict, df, model, features_used)

        return jsonify(result), 200

    except Exception as e:
        print(f"Error during evaluation by location: {e}")
        return jsonify({"error": str(e)}), 500

# -------------------
# Start Flask app
# -------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
