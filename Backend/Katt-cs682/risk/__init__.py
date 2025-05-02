import pandas as pd

from fruad import *
from disclosure import *
from renovation import *
from scoring import *


def main(filepath: str, target_list_no: str):
    df = pd.read_csv(filepath)

    # Normalize columns
    df.columns = df.columns.str.strip().str.upper().str.replace(" ", "_")
    df['LIST_NO'] = df['LIST_NO'].astype(str)

    # Locate the specific listing
    match = df[df['LIST_NO'] == str(target_list_no)]
    if match.empty:
        print(f"[ERROR] LIST_NO {target_list_no} not found in dataset.")
        return

    row = match.iloc[0]

    # --- Compute Metrics ---
    print("Risk is running...")
    risk_score = assess_risk(row)
    print(f"✅ Risk Score: {risk_score}")

    print("Disclosure risk is running...")
    disclosure_risk = calculate_disclosure_risk(row.get('DISCLOSURES', ''), row)
    print(f"✅ Disclosure Risk: {disclosure_risk}")

    print("Renovation detection is running...")
    renovation_candidate = is_renovation_candidate(str(row.get('DISCLOSURES', '')))
    print(f"✅ Renovation Candidate: {'Yes' if renovation_candidate else 'No'}")

    print("Fraud check is running...")
    fraud_flag = detect_fraud_single(row, df)
    print(f"✅ Fraud Flag: {'Yes' if fraud_flag else 'No'}")

    # --- Total Score ---
    total_risk_score = round(risk_score + disclosure_risk + float(fraud_flag), 2)
    print(f"✅ Total Risk Score: {total_risk_score}")

    # --- Summary ---
    print(f"\n📌 Final Results for LIST_NO: {target_list_no}")
    print(f"Risk Score:           {risk_score}")
    print(f"Disclosure Risk:      {disclosure_risk}")
    print(f"Renovation Candidate: {'Yes' if renovation_candidate else 'No'}")
    print(f"Fraud Flag:           {'Yes' if fraud_flag else 'No'}")
    print(f"Total Risk Score:     {total_risk_score}")


if __name__ == "__main__":
    path = "cleaned_data.csv"
    list_no_input = input("Enter LIST_NO to evaluate: ").strip()
    main(path, list_no_input)
