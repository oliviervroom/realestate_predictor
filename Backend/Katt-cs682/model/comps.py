import pandas as pd

def get_comps(listing, full_df: pd.DataFrame, features_used: list, tolerance: float = 0.1):
    """
    Select comparable properties from the dataset based on similarity.

    Returns:
    - comps DataFrame with similar properties
    """
    if "ZIP_CODE" not in listing or "PROP_TYPE" not in listing or "SQUARE_FEET" not in listing:
        return pd.DataFrame()

    comps = full_df[
        (full_df["ZIP_CODE"] == listing["ZIP_CODE"]) &
        (full_df["PROP_TYPE"] == listing["PROP_TYPE"]) &
        (abs(full_df["SQUARE_FEET"] - listing["SQUARE_FEET"]) <= tolerance * listing["SQUARE_FEET"]) &
        (full_df["NO_BEDROOMS"] == listing["NO_BEDROOMS"]) &
        (full_df["LIST_PRICE"] > 0)
    ]

    return comps
