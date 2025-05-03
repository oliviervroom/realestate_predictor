from predict import *

def get_similar_properties(target_row, df_all, sqft_tolerance=0.2):
    conditions = (
        (df_all["ZIP_CODE"] == target_row["ZIP_CODE"].values[0]) &
        (df_all["NO_BEDROOMS"] == target_row["NO_BEDROOMS"].values[0]) &
        (df_all["TOTAL_BATHS"] == target_row["TOTAL_BATHS"].values[0]) &
        (df_all["PROP_TYPE"] == target_row["PROP_TYPE"].values[0])
    )

    # SQUARE_FEET similarity: +/- 20%
    sqft = target_row["SQUARE_FEET"].values[0]
    sqft_min = sqft * (1 - sqft_tolerance)
    sqft_max = sqft * (1 + sqft_tolerance)
    conditions &= df_all["SQUARE_FEET"].between(sqft_min, sqft_max)

    return df_all[conditions]


def rental_optimization_insight(list_no: str, df_all: pd.DataFrame, model) -> str:
    target = df_all[df_all["LIST_NO"] == list_no]
    if target.empty:
        return f"❌ LIST_NO {list_no} not found."

    target_features, cat_cols = preprocess_for_model(target)
    pool = Pool(target_features, cat_features=cat_cols)
    predicted_rent = model.predict(pool)[0]

    comps = get_similar_properties(target, df_all).copy()
    if comps.empty:
        return "⚠️ No similar properties found for comparison."

    comps_features, _ = preprocess_for_model(comps)
    comps_pool = Pool(comps_features, cat_features=cat_cols)
    comps["PREDICTED_RENT"] = model.predict(comps_pool)

    median_rent = comps["PREDICTED_RENT"].median()
    std_rent = comps["PREDICTED_RENT"].std()
    price_gap = predicted_rent - median_rent

    if abs(price_gap) <= std_rent * 0.5:
        likelihood = "✅ High (Well-aligned with market)"
        suggestion = "No major adjustment needed."
    elif price_gap > std_rent:
        likelihood = "⚠️ Lower (Priced too high)"
        suggestion = f"Consider reducing rent by ${abs(price_gap):.0f} to be closer to market."
    else:
        likelihood = "💡 Could increase (Priced lower than comps)"
        suggestion = f"You could raise rent by ${abs(price_gap):.0f}, but ensure demand still exists."

    return (
        f"\n📍 RENTAL INCOME INSIGHT\n"
        f"----------------------------\n"
        f"🔮 Predicted Rent: ${predicted_rent:.2f}\n"
        f"📊 Median Rent in Area: ${median_rent:.2f} ± {std_rent:.2f}\n"
        f"📉 Difference from Median: ${price_gap:.2f}\n"
        f"📈 Likelihood of Renting: {likelihood}\n"
        f"📌 Based on {len(comps)} local comps.\n"
        f"🛠️ Suggestion: {suggestion}\n"
    )
