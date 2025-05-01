from pathlib import Path
import pandas as pd
import pickle

from predict import predict_rent
from comps import get_comps
from optimization import suggest_price

from analysis import analyze_rent_prediction

# --- CONFIG ---
DATA_PATH = Path("..") / "data" / "Final_Cleaned_Renovation_Candidates.csv"
MODEL_PATH = Path("..") / "model" / "rent_predictor_model.pkl"

FEATURE_COLUMNS = ['ZIP_CODE', 'PROP_TYPE', 'SQUARE_FEET', 'NO_BEDROOMS','TOTAL_BATHS','LIST_PRICE']

# --- Load data and model ---
df = pd.read_csv(DATA_PATH)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# --- Interaction ---
while True:
    zip_input = input("Enter ZIP code (or 'q' to quit): ").strip()
    if zip_input.lower() == 'q':
        break

    match = df[df['ZIP_CODE'].astype(str) == zip_input]
    if match.empty:
        print("No match found.\n")
        continue

    listing = match.iloc[0].to_dict()
    print("\nFound listing:")
    for col in FEATURE_COLUMNS:
        print(f"  {col}: {listing.get(col)}")

    while True:
        action = input(
            "\nWhat do you want to do? (rent_prediction / rental_optimization / risk / renovation / back): ").strip().lower()

        if action == 'rent_prediction':
            if 'Predicted_Rent' in listing:
                print(f"\n Predicted Rent (from dataset): ${listing['Predicted_Rent']:.2f}")
            else:
                pred = predict_rent(listing, model, FEATURE_COLUMNS)
                print(f"\n Predicted Rent (computed): ${pred:.2f}")




        elif action == 'rental_optimization':

            try:

                predicted_rent, comps = analyze_rent_prediction(listing, df, model, FEATURE_COLUMNS)

                if comps.empty:
                    print("⚠️ No comps found — skipping price suggestion.")

                    continue

                #result = suggest_price(predicted_rent, comps, return_comps=True)
                result = 'comps found'

                if "error" in result:

                    print(f"\n⚠KDE Pricing Suggestion Error")

                else:

                    print(f"\n🎯 Suggested Listing Price (KDE peak): ")

                print("\n✅ Comparable Listings: As Plot On UI")

                #print(result["comps"][["ADDRESS", "LIST_PRICE", "SQUARE_FEET", "NO_BEDROOMS"]])


            except ValueError as e:

                print(f"\n Error during rental optimization: {e}")

        elif action == 'risk':

            print("\n📉 RISK ANALYSIS:")

            print(f"  RISK_SCORE: {listing.get('RISK_SCORE')}")

            print(f"  structural_issues: {listing.get('structural_issues')}")

            print(f"  financing_limitations: {listing.get('financing_limitations')}")

            print(f"  property_condition: {listing.get('property_condition')}")

            print(f"  legal_or_disclosure_gaps: {listing.get('legal_or_disclosure_gaps')}")

            print(f"  environmental: {listing.get('environmental')}")

            print(f"  Disclosure: {listing.get('Disclosure')}")


        elif action == 'renovation':

            print("\n🛠️ RENOVATION POTENTIAL:")

            print(f"  RENOVATION_FRIENDLY: {listing.get('RENOVATION_FRIENDLY')}")

            print(f"  SQUARE_FEET: {listing.get('SQUARE_FEET')}")

            print(f"  LOT_SIZE: {listing.get('LOT_SIZE')}")

            print(f"  NO_BEDROOMS: {listing.get('NO_BEDROOMS')}")

            print(f"  TOTAL_BATHS: {listing.get('TOTAL_BATHS')}")

        elif action == 'back':
            break

        else:
            print("Invalid command. Try again.")
