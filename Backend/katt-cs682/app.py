from flask import Flask, request, render_template,jsonify
import pandas as pd
import re
from catboost import CatBoostRegressor

from predict import predict_rent_for_address
from optimization import rental_optimization_insight
from scoring import evaluation_insights
from scoring import evaluation
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Load model and dataset once at startup
df_all = pd.read_csv("cleaned_data.csv")
df_all["ADDRESS"] = df_all["ADDRESS"].astype(str).str.strip()

model = CatBoostRegressor()
model.load_model("rent_predictor_model.cbm")


@app.route("/", methods=["GET", "POST"])
def index():
    result = {}
    suggestions = []

    if request.method == "POST":
        address_input = request.form.get("ADDRESS", "").strip()

        # Case-insensitive, partial match
        matches = df_all[df_all["ADDRESS"].str.contains(address_input, case=False, na=False)]

        if not matches.empty:
            selected_address = matches.iloc[0]["ADDRESS"]
            result["prediction"] = predict_rent_for_address(selected_address, df_all, model)
            result["optimization"] = rental_optimization_insight(selected_address, df_all, model)
            if len(matches) > 1:
                suggestions = matches["ADDRESS"].tolist()
        else:
            result["error"] = f"No address matching '{address_input}' found in dataset."

    return render_template("index.html", result=result, suggestions=suggestions)

def parse_evaluation_string(evaluation_string):
    result = {}
    for line in evaluation_string.split('\n'):
        if "Risk Score:" in line:
            result["risk_score"] = float(re.findall(r"\d+\.\d+|\d+", line)[0])
        elif "Disclosure Risk:" in line:
            result["disclosure_risk"] = float(re.findall(r"\d+\.\d+|\d+", line)[0])
        elif "Renovation Candidate:" in line:
            result["renovation_candidate"] = "Yes" in line
        elif "Fraud Flag:" in line:
            result["fraud_flag"] = "Yes" in line
        elif "Total Risk Score:" in line:
            result["total_risk_score"] = float(re.findall(r"\d+\.\d+|\d+", line)[0])
    return result


@app.route("/api/rent-insights/<address>", methods=["GET"])
def rent_insights(address):
    try:
        predicted_rent = predict_rent_for_address(address,df_all, model)
        optimal_rent = rental_optimization_insight(address,df_all, model)
        insights = evaluation_insights(address)
        raw_eval = evaluation("cleaned_data.csv", address)
        parsed_eval = parse_evaluation_string(raw_eval)
        return jsonify({
            "predicted_rent": predicted_rent,
            "optimal_rent": optimal_rent,
            "median_rent": insights.get("median_rent"),
            "diff_from_median": insights.get("difference_from_median"),
            "likelihood": insights.get("likelihood"),
            "num_comps": insights.get("num_comps"),
            "risk_score": parsed_eval.get("risk_score"),
            "disclosure_risk": parsed_eval.get("disclosure_risk"),
            "renovation_candidate": parsed_eval.get("renovation_candidate"),
            "fraud_flag": parsed_eval.get("fraud_flag"),
            "total_risk_score": parsed_eval.get("total_risk_score")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)
