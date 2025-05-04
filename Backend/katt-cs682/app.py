from flask import Flask, request, render_template
import pandas as pd
from catboost import CatBoostRegressor

from predict import predict_rent_for_address
from optimization import rental_optimization_insight
from scoring import evaluation

app = Flask(__name__)

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
            result["evaluation"] = evaluation("cleaned_data.csv", selected_address)

            if len(matches) > 1:
                suggestions = matches["ADDRESS"].tolist()
        else:
            result["error"] = f"No address matching '{address_input}' found in dataset."

    return render_template("index.html", result=result, suggestions=suggestions)


if __name__ == "__main__":
    app.run(debug=True)
