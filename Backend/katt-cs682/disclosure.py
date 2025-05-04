

# --- Keyword Rules ---
DISCLOSURE_KEYWORDS = {
    "structural_issues": {
        "keywords": ["foundation", "crack", "seepage", "leak", "sump pump", "flood", "roof", "mold"],
        "weight": 0.3
    },
    "financing_limitations": {
        "keywords": ["cash only", "not qualify", "rehab loan", "conventional financing"],
        "weight": 0.25
    },
    "property_condition": {
        "keywords": ["as is", "sold as is", "needs work", "unfinished", "no warranties", "estate sale"],
        "weight": 0.2
    },
    "legal_or_disclosure_gaps": {
        "keywords": ["no disclosure", "verify all info", "trustee", "not verified"],
        "weight": 0.1
    },
    "environmental": {
        "keywords": ["radon", "lead", "asbestos", "septic", "environmental testing"],
        "weight": 0.15
    }
}


# --- Risk Assessment ---
def assess_risk(listing: dict) -> float:
    risk = 0.0

    if listing.get("TOTAL_MARKET_TIME", 0) > 180:
        risk += 0.1

    if listing.get("SQUARE_FEET", 0) < 400 or listing.get("SQUARE_FEET", 0) > 5000:
        risk += 0.1

    if listing.get("FULL_BATH_COUNT", 1) == 0 and listing.get("SQUARE_FEET", 0) > 1000:
        risk += 0.1

    if listing.get("YEAR_BUILT", 2020) < 1950:
        risk += 0.2

    if listing.get("STATUS", "").lower() == "active" and listing.get("MARKET_TIME_PROPERTY", 0) > 365:
        risk += 0.1

    return round(risk, 2)
