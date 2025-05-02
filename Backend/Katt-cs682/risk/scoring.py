import pandas as pd
import re
from fruad import *
from disclosure import *
from renovation import *

# --- Utility Functions ---
def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", str(text).lower().strip())

def keyword_in_text(text: str, keyword: str) -> bool:
    return re.search(rf"\b{re.escape(keyword)}\b", text) is not None
# --- Renovation Detection ---

# --- Disclosure Risk with Fallback ---
def calculate_disclosure_risk(text: str, row: dict) -> float:
    text = clean_text(text)
    score = 0.0

    for category, rule in DISCLOSURE_KEYWORDS.items():
        if any(keyword_in_text(text, kw) for kw in rule["keywords"]):
            score += rule["weight"]

    if not text.strip() or score == 0.0:
        hoa_fee = row.get("TOTAL_HOA_FEE", 0)
        if pd.notna(hoa_fee):
            if hoa_fee < 100:
                score += 0.0
            elif 100 <= hoa_fee <= 500:
                score += 0.2
            else:
                score += 0.4

        market_time = row.get("TOTAL_MARKET_TIME", 0)
        if market_time < 60:
            score += 0.0
        elif 60 <= market_time <= 90:
            score += 0.2
        else:
            score += 0.3

        year_built = row.get("YEAR_BUILT", 2020)
        if year_built < 1980:
            score += 0.3
        elif 1980 <= year_built <= 2010:
            score += 0.2

    return round(min(score, 1.0), 2)


#
# --- Full Pipeline ---
def run_risk_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df['risk_score'] = df.apply(assess_risk, axis=1)
    df['disclosure_risk'] = df.apply(lambda row: calculate_disclosure_risk(row.get('DISCLOSURES', ''), row), axis=1)
    df['renovation_candidate'] = df['DISCLOSURES'].apply(lambda x: is_renovation_candidate(str(x)))
    df = detect_fraud(df)
    df['total_risk_score'] = df['risk_score'] + df['disclosure_risk'] + df['fraud_flag'].astype(float)
    return df
