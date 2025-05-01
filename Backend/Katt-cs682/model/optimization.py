import numpy as np
from scipy.stats import gaussian_kde

def suggest_price(predicted_rent, comps_df, column="LIST_PRICE"):
    """
    Suggest optimal price range based on KDE from comps.

    Returns:
    - dict with optimal price and full KDE range
    """
    if len(comps_df) < 5:
        return {
            "error": "Not enough comps to generate KDE.",
            "suggested_price": predicted_rent
        }

    rents = comps_df[column].values
    kde = gaussian_kde(rents)

    rent_range = np.linspace(predicted_rent * 0.8, predicted_rent * 1.2, 200)
    probabilities = kde(rent_range)
    probabilities = probabilities / probabilities.max()

    peak_index = np.argmax(probabilities)
    return {
        "suggested_price": round(rent_range[peak_index], 2),
        "rent_range": rent_range,
        "likelihood_curve": probabilities
    }
