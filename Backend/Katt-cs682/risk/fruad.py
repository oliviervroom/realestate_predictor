import pandas as pd
from datetime import datetime

def detect_fraud(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply fraud flag rules to a DataFrame of listings.
    Adds 'fraud_flag' column.
    """
    fraud_flags = []
    current_year = datetime.now().year
    important_cols = ['LIST_PRICE', 'SQUARE_FEET', 'NO_BEDROOMS', 'NO_FULL_BATHS']
    dup_groups = df.groupby(['ADDRESS', 'ZIP_CODE'])

    for _, row in df.iterrows():
        fraud = False
        key = (row.get('ADDRESS'), row.get('ZIP_CODE'))

        if key in dup_groups.groups:
            group = dup_groups.get_group(key)
            for col in ['LIST_PRICE', 'SQUARE_FEET', 'NO_BEDROOMS']:
                if len(group[col].dropna().unique()) > 1:
                    fraud = True
                    break

        if row.get('SEC_DEPOSIT_RN', 0) > row.get('LIST_PRICE', 1e6):
            fraud = True

        if row.get('YEAR_BUILT', current_year) > current_year:
            fraud = True

        missing = sum(pd.isna(row.get(col)) for col in important_cols)
        if missing / len(important_cols) > 0.5:
            fraud = True

        if 'LIST_NO' in row and pd.notna(row['LIST_NO']):
            similar = df[df['LIST_NO'] == row['LIST_NO']]
            if len(similar) > 1:
                if len(similar['LIST_PRICE'].dropna().unique()) > 1:
                    fraud = True

        fraud_flags.append(fraud)

    df['fraud_flag'] = fraud_flags
    return df
