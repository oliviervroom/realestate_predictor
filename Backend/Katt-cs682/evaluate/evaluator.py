import pandas as pd
import matplotlib.pyplot as plt
import io
import base64

from model.model_loader import load_model
from model.predict import predict_rent
from model.enrich import enrich_listing
from model.comps import get_comps
from model.optimization import suggest_price

from risk.fraud import detect_fraud
from risk.renovation import is_renovation_candidate
from risk.scoring import assess_risk
from risk.disclosure import calculate_disclosure_risk

def generate_kde_plot(rent_range, probabilities, predicted_rent, suggested_rent):
    """
    Create a matplotlib plot of rent KDE curve and return as base64-encoded image string.
    """
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(rent_range, probabilities, label='Success Likelihood')
    ax.axvline(predicted_rent, color='blue', linestyle='--', label=f'Predicted: ${predicted_rent:.0f}')
    ax.axvline(suggested_rent, color='green', linestyle='--', label=f'Suggested: ${suggested_rent:.0f}')
    ax.set_title("Rent Success Likelihood Curve")
    ax.set_xlabel("Rent Price ($)")
    ax.set_ylabel("Relative Likelihood")
    ax.legend()
    ax.grid(True)

    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def evaluate_listing(
    query: dict,
    full_df: pd.DataFrame,
    model,
    features_used: list,
    address_col: str = "ADDRESS"
) -> dict:
    """
    Takes a UI-style query and returns full evaluation:
    - rent prediction
    - KDE-based optimization
    - comps used
    - fraud/risk/renovation flags
    - plot as base64 string
    """
    enriched, source = enrich_listing(query, full_df, address_col=address_col)
    listing_input = {k: enriched.get(k, 0) for k in features_used}

    # Predict rent
    predicted_rent = predict_rent(listing_input, model, features_used)

    # Get comps
    comps = get_comps(enriched, full_df, features_used)
    comps_used = comps[["ADDRESS", "ZIP_CODE", "LIST_PRICE"]].to_dict(orient="records") if not comps.empty else []

    # Suggest price
    optimization_result = suggest_price(predicted_rent, comps)
    suggested_rent = optimization_result.get("suggested_price", predicted_rent)
    rent_range = optimization_result.get("rent_range", [])
    probabilities = optimization_result.get("likelihood_curve", [])

    # Plot (optional KDE)
    kde_plot_base64 = None
    if rent_range != [] and probabilities != []:
        kde_plot_base64 = generate_kde_plot(rent_range, probabilities, predicted_rent, suggested_rent)

    # Risk & fraud
    disclosure = enriched.get("DISCLOSURES", "")
    disclosure_risk_score = calculate_disclosure_risk(disclosure)
    renovation_flag = is_renovation_candidate(disclosure)
    basic_risk_score = assess_risk(enriched)
    fraud_result = detect_fraud(pd.DataFrame([enriched]))
    fraud_flag = bool(fraud_result.iloc[0]["fraud_flag"])

    return {
        "predicted_rent": round(predicted_rent, 2),
        "suggested_rent": round(suggested_rent, 2),
        "data_source": source,
        "comps_used": comps_used,
        "kde_plot_base64": kde_plot_base64,
        "risk_score": basic_risk_score,
        "disclosure_risk_score": disclosure_risk_score,
        "is_renovation_candidate": renovation_flag,
        "fraud_flag": fraud_flag
    }
