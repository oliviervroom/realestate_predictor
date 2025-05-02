import pandas as pd
import os
import numpy as np
from catboost import CatBoostRegressor, Pool, CatBoostError
from predict import *
from optimization import *

# === Main Run ===
if __name__ == "__main__":
    # Load data
    data_set = 'cleaned_data.csv'
    df_all = pd.read_csv(data_set)
    df_all["LIST_NO"] = df_all["LIST_NO"].astype(str)

    # Load model
    model = CatBoostRegressor()
    model.load_model("rent_predictor_model.cbm")

    # Prompt for LIST_NO and predict
    list_no_input = input("Enter LIST_NO to predict rent: ").strip()
    predict_rent_for_list_no(list_no_input, df_all, model)

    # Prompt user input
    list_no_input = input("Enter LIST_NO to predict rent and analyze optimization: ").strip()
    rental_optimization_insight(list_no_input, df_all, model)