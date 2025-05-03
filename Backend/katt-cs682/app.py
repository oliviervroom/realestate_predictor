from flask import Flask, request, render_template
import pandas as pd
from catboost import CatBoostRegressor

from predict import predict_rent_for_list_no
from optimization import rental_optimization_insight
from scoring import evaluation

app = Flask(__name__)

# Load model and dataset once at startup
df_all = pd.read_csv("cleaned_data.csv")
df_all["LIST_NO"] = df_all["LIST_NO"].astype(str)

model = CatBoostRegressor()
model.load_model("rent_predictor_model.cbm")

@app.route("/", methods=["GET", "POST"])
def index():
    result = {}
    if request.method == "POST":
        list_no = request.form.get("list_no", "").strip()

        if list_no in df_all["LIST_NO"].values:
            # Redirect outputs to variables
            result["prediction"] = predict_rent_for_list_no(list_no, df_all, model)
            result["optimization"] = rental_optimization_insight(list_no, df_all, model)
            result["evaluation"] = evaluation("cleaned_data.csv", list_no)
        else:
            result["error"] = f"LIST_NO {list_no} not found in dataset."

    return render_template("index.html", result=result)

if __name__ == "__main__":
    app.run(debug=True)
