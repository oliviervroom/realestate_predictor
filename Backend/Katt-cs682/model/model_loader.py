from catboost import CatBoostRegressor

def load_model(model_path: str) -> CatBoostRegressor:
    """
    Loads a trained CatBoost model from file.
    """
    model = CatBoostRegressor()
    model.load_model(model_path)
    return model
