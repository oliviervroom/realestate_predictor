import pandas as pd
from catboost import CatBoostRegressor

# Importing from internal modules
from predict import predict_rent_for_list_no
from optimization import rental_optimization_insight
from scoring import evaluation

# === Main Run ===
if __name__ == "__main__":
    data_set = 'cleaned_data.csv'
    df_all = pd.read_csv(data_set)
    df_all["LIST_NO"] = df_all["LIST_NO"].astype(str)

    model = CatBoostRegressor()
    model.load_model("rent_predictor_model.cbm")

    list_no_input = input("Enter LIST_NO to predict rent: ").strip()
    predict_rent_for_list_no(list_no_input, df_all, model)

    list_no_input = input("Enter LIST_NO to predict rent and analyze optimization: ").strip()
    rental_optimization_insight(list_no_input, df_all, model)

    list_no_input = input("Enter LIST_NO to evaluate: ").strip()
    evaluation(data_set, list_no_input)
