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
CORS(app)  # Allow frontend (React) to access

# -------------------
# Load model and dataset once at startup
# -------------------
try:
    print("Loading assets (data and model)...")
    df = pd.read_csv("data/Rental_Dataset.csv")
    model = load_model("data/rent_predictor_model.cbm")  # Make sure this path and model exist
    features_used = ["ZIP_CODE", "PROP_TYPE", "SQUARE_FEET", "NO_BEDROOMS", "TOTAL_BATHS"]
    print(" Assets loaded successfully!")
except Exception as e:
    print(f" Failed to load assets: {e}")
    raise e

# -------------------
# API endpoint
# -------------------
@app.route('/predict_rent', methods=['POST'])
def predict_rent():
    """
    Receives JSON input (property features), returns predicted rent and risk evaluation.
    """
    try:
        query = request.get_json()
        if not query:
            return jsonify({"error": "No input data provided"}), 400

        print(f"Received query: {query}")

        result = evaluate_listing(query, df, model, features_used)

        print(f"Evaluation complete, sending back result.")
        return jsonify(result), 200

    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({"error": str(e)}), 500

# -------------------
# Start Flask app
# -------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)