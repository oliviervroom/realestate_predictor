import pandas as pd
from catboost import Pool

def preprocess_for_model(df_row: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    df = df_row.copy()
    df.replace("Unknown", pd.NA, inplace=True)

    if "LIST_DATE" in df.columns and "OFF_MKT_DATE" in df.columns:
        df["LIST_DATE"] = pd.to_datetime(df["LIST_DATE"], errors="coerce")
        df["OFF_MKT_DATE"] = pd.to_datetime(df["OFF_MKT_DATE"], errors="coerce")
        df["DAYS_ON_MARKET"] = (df["OFF_MKT_DATE"] - df["LIST_DATE"]).dt.days

    categorical_cols = [
        "CITY", "NEIGHBORHOOD", "SEASONAL_CONTEXT", "PROP_TYPE",
        "FURNISHED_RN", "PETS_ALLOWED_RN", "TERM_OF_RENTAL_RN",
        "RENT_FEE_INCLUDES_RN", "RENTAL_TERMS_RN",
        "MLS_COMP_BUILDING_ID", "COMP_STATUS"
    ]
    for col in categorical_cols:
        if col not in df.columns:
            df[col] = "Unknown"
        else:
            df[col] = df[col].fillna("Unknown")
        df[col] = df[col].astype(str)

    if "NEIGHBORHOOD" not in df.columns and "ADDRESS" in df.columns:
        df["NEIGHBORHOOD"] = df["ADDRESS"]

    numerical_cols = [
        "ZIP_CODE", "SQUARE_FEET", "LOT_SIZE", "NO_BEDROOMS", "TOTAL_BATHS",
        "TOTAL_PARKING_RN", "DAYS_ON_MARKET", "LIST_PRICE", "SEC_DEPOSIT_RN"
    ]
    for col in numerical_cols:
        if col not in df.columns:
            df[col] = pd.NA
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    features = df[categorical_cols + numerical_cols].drop(columns=["LIST_PRICE"])
    return features, categorical_cols


def predict_rent_for_address(address: str, df_all: pd.DataFrame, model) -> str:
    row = df_all[df_all["ADDRESS"] == address]
    if row.empty:
        return f"❌ ADDRESS {address} not found."

    features, cat_cols = preprocess_for_model(row)
    pool = Pool(features, cat_features=cat_cols)
    predicted_rent = model.predict(pool)[0]

    return f"{predicted_rent:.2f}"
