import pandas as pd

def predict_rent(listing: dict, model, features: list) -> float:
    """
    Predict rent for a given property listing using the trained model.

    Parameters:
    - listing: dict of feature values
    - model: trained CatBoost model
    - features: list of features expected by model

    Returns:
    - predicted rent value
    """
    df = pd.DataFrame([listing])
    return model.predict(df[features])[0]
