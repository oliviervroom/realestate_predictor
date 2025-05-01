def assess_risk(listing: dict) -> float:
    """
    Calculate a basic numeric risk score from property metadata.
    Rules are based on time on market, bath counts, etc.
    """
    risk = 0.0

    if listing.get("DAYS_ON_MARKET", 0) > 180:
        risk += 0.1

    if listing.get("SQUARE_FEET", 0) < 400 or listing.get("SQUARE_FEET", 0) > 5000:
        risk += 0.1

    if listing.get("NO_ROOMS", 3) < 2 or listing.get("NO_ROOMS", 3) > 15:
        risk += 0.1

    if listing.get("NO_FULL_BATHS", 1) == 0 and listing.get("SQUARE_FEET", 0) > 1000:
        risk += 0.1

    if listing.get("YEAR_BUILT", 2020) < 1950:
        risk += 0.2

    if listing.get("BASEMENT") is None:
        risk += 0.1

    if listing.get("HEATING_RN") is None:
        risk += 0.1

    if listing.get("AIR_CONDITION_RN") is None:
        risk += 0.1

    if listing.get("STATUS", "").lower() == "active" and listing.get("MARKET_TIME_PROPERTY", 0) > 365:
        risk += 0.1

    return round(risk, 2)
