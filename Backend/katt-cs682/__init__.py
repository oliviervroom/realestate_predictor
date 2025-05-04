import pandas as pd
from catboost import CatBoostRegressor

# Importing from internal modules
from predict import predict_rent_for_address
from optimization import rental_optimization_insight
from scoring import evaluation

# === Main Run ===
if __name__ == "__main__":
    data_set = 'cleaned_data.csv'
    df_all = pd.read_csv(data_set)
    df_all["ADDRESS"] = df_all["ADDRESS"].astype(str).str.strip()

    model = CatBoostRegressor()
    model.load_model("rent_predictor_model.cbm")

    ADDRESS_input = input("Enter ADDRESS to predict rent: ").strip()
    predict_rent_for_address(ADDRESS_input, df_all, model)

    ADDRESS_input = input("Enter ADDRESS to predict rent and analyze optimization: ").strip()
    rental_optimization_insight(ADDRESS_input, df_all, model)

    ADDRESS_input = input("Enter ADDRESS to evaluate: ").strip()
    evaluation(data_set, ADDRESS_input)
