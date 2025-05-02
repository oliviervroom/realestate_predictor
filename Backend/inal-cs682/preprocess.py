import pandas as pd
import numpy as np

# Hardcoded list of feature columns used during training
TRAIN_COLUMNS = [
    'NO_BEDROOMS', 'NO_FULL_BATHS', 'NO_HALF_BATHS', 'TOTAL_BATHS',
    'SQUARE_FEET', 'AboveGradeFinishedArea', 'SQUARE_FEET_INCL_BASE',
    'LIST_PRICE_PER_SQFT', 'PRICE_PER_SQFT', 'YEAR_BUILT', 'TOTAL_PARKING_SF',
    'TAXES', 'BASEMENT', 'FIRE_PLACES', 'ASSESSMENTS',
    'PROP_TYPE_CC', 'PROP_TYPE_MF', 'PROP_TYPE_SF',
    'COUNTY_Berkshire', 'COUNTY_Bristol', 'COUNTY_Carroll', 'COUNTY_Cheshire',
    'COUNTY_Coos', 'COUNTY_Dukes', 'COUNTY_Essex', 'COUNTY_Franklin',
    'COUNTY_Hampden', 'COUNTY_Hampshire', 'COUNTY_Hartford', 'COUNTY_Hillsborough',
    'COUNTY_Kent', 'COUNTY_Lee', 'COUNTY_Merrimack', 'COUNTY_Middlesex',
    'COUNTY_Nantucket', 'COUNTY_Newport', 'COUNTY_Norfolk', 'COUNTY_Oxford',
    'COUNTY_Plymouth', 'COUNTY_Providence', 'COUNTY_Rockingham', 'COUNTY_Strafford',
    'COUNTY_Suffolk', 'COUNTY_Tolland', 'COUNTY_Volusia', 'COUNTY_Washington',
    'COUNTY_Windham', 'COUNTY_Worcester', 'COUNTY_York'
]

def preprocess_single_input(raw_input):
    """
    Preprocess a single raw input (Series or dict-like) into a model-ready input row.
    """
    # Convert to DataFrame with a single row
    if isinstance(raw_input, dict):
        raw_df = pd.DataFrame([raw_input])
    elif isinstance(raw_input, pd.Series):
        raw_df = raw_input.to_frame().T
    else:
        raise ValueError("Input must be a dict or pandas Series.")
    
    # Drop any unnecessary columns
    keep_columns = [
        "NO_BEDROOMS", "NO_FULL_BATHS", "NO_HALF_BATHS", 
        "TOTAL_BATHS", "SQUARE_FEET", "AboveGradeFinishedArea", 
        "SQUARE_FEET_INCL_BASE", "LIST_PRICE_PER_SQFT", "PRICE_PER_SQFT", 
        "PROP_TYPE", "YEAR_BUILT", "TOTAL_PARKING_SF", "COUNTY", 
        "TAXES", "BASEMENT", "FIRE_PLACES", "ASSESSMENTS"
    ]
    raw_df = raw_df.drop(columns=[col for col in raw_df.columns if col not in keep_columns], errors='ignore')

    # Binary encoding
    raw_df["SQUARE_FEET_INCL_BASE"] = raw_df["SQUARE_FEET_INCL_BASE"].map({"Yes": 1, "No": 0}).astype(int)
    raw_df["BASEMENT"] = raw_df["BASEMENT"].map({"Yes": 1, "No": 0}).astype(int)

    # One-hot encode categorical columns
    raw_df = pd.get_dummies(raw_df, columns=["PROP_TYPE", "COUNTY"], dtype=int)

    # Add missing columns from training
    for col in TRAIN_COLUMNS:
        if col not in raw_df.columns:
            raw_df[col] = 0

    # Ensure correct column order
    raw_df = raw_df[TRAIN_COLUMNS]

    return raw_df.astype(float)
