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


# --- Full Pipeline ---
def run_risk_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df['risk_score'] = df.apply(assess_risk, axis=1)
    df['disclosure_risk'] = df.apply(lambda row: calculate_disclosure_risk(row.get('DISCLOSURES', ''), row), axis=1)
    df['renovation_candidate'] = df['DISCLOSURES'].apply(lambda x: is_renovation_candidate(str(x)))
    df = detect_fraud(df)
    df['total_risk_score'] = df['risk_score'] + df['disclosure_risk'] + df['fraud_flag'].astype(float)
    return df

def evaluation(filepath: str, target_list_no: str) -> str:
    df = pd.read_csv(filepath)
    df.columns = df.columns.str.strip().str.upper().str.replace(" ", "_")
    df['LIST_NO'] = df['LIST_NO'].astype(str)

    match = df[df['LIST_NO'] == str(target_list_no)]
    if match.empty:
        return f"[ERROR] LIST_NO {target_list_no} not found in dataset."

    row = match.iloc[0]

    risk_score = assess_risk(row)
    disclosure_risk = calculate_disclosure_risk(row.get('DISCLOSURES', ''), row)
    renovation_candidate = is_renovation_candidate(str(row.get('DISCLOSURES', '')))
    fraud_flag = detect_fraud_single(row, df)
    total_risk_score = round(risk_score + disclosure_risk + float(fraud_flag), 2)

    return (
        f"📌 Final Results for LIST_NO: {target_list_no}\n"
        f"Risk Score:           {risk_score}\n"
        f"Disclosure Risk:      {disclosure_risk}\n"
        f"Renovation Candidate: {'Yes' if renovation_candidate else 'No'}\n"
        f"Fraud Flag:           {'Yes' if fraud_flag else 'No'}\n"
        f"Total Risk Score:     {total_risk_score}\n"
    )
