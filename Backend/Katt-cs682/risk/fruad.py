import pandas as pd
from datetime import datetime


 #--- Fraud Detection (FULL DATASET) ---
def detect_fraud(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['ADDR_ZIP_KEY'] = df['ADDRESS'].astype(str).str.strip().str.upper() + "::" + df['ZIP_CODE'].astype(str).str.strip()
    address_counts = df['ADDR_ZIP_KEY'].value_counts()
    df['fraud_flag'] = df['ADDR_ZIP_KEY'].map(lambda x: address_counts[x] > 1)
    df.drop(columns=['ADDR_ZIP_KEY'], inplace=True)
    return df

# --- Optional: Fraud Detection (SINGLE ROW version) ---
def detect_fraud_single(row: dict, df: pd.DataFrame) -> bool:
    target_key = str(row.get('ADDRESS', '')).strip().upper() + "::" + str(row.get('ZIP_CODE', '')).strip()
    df = df.copy()
    df['ADDR_ZIP_KEY'] = df['ADDRESS'].astype(str).str.strip().str.upper() + "::" + df['ZIP_CODE'].astype(str).str.strip()
    count = (df['ADDR_ZIP_KEY'] == target_key).sum()
    return count > 1
