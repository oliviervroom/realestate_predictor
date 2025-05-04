from flask import Flask, render_template, request
import tensorflow as tf
import pandas as pd

app = Flask(__name__)

# Load model
MODEL_PATH = "./experiments/model-1"
model = tf.keras.models.load_model(MODEL_PATH)

# Feature columns in training order
feature_columns = [
    'NO_BEDROOMS', 'NO_FULL_BATHS', 'NO_HALF_BATHS', 'TOTAL_BATHS',
    'SQUARE_FEET', 'AboveGradeFinishedArea', 'SQUARE_FEET_INCL_BASE',
    'LIST_PRICE_PER_SQFT', 'PRICE_PER_SQFT', 'YEAR_BUILT', 'TOTAL_PARKING_SF',
    'TAXES', 'BASEMENT', 'FIRE_PLACES', 'ASSESSMENTS',
    'PROP_TYPE_CC', 'PROP_TYPE_MF', 'PROP_TYPE_SF',
    'COUNTY_Berkshire', 'COUNTY_Bristol', 'COUNTY_Carroll', 'COUNTY_Cheshire',
    'COUNTY_Coos', 'COUNTY_Dukes', 'COUNTY_Essex', 'COUNTY_Franklin',
    'COUNTY_Hampden', 'COUNTY_Hampshire', 'COUNTY_Hartford', 'COUNTY_Hillsborough',
    'COUNTY_Kent', 'COUNTY_Lee', 'COUNTY_Merrimack', 'COUNTY_Middlesex',
    'COUNTY_Nantucket', 'COUNTY_Newport', 'COUNTY_Norfolk', 'COUNTY_Oxford',
    'COUNTY_Plymouth', 'COUNTY_Providence', 'COUNTY_Rockingham', 'COUNTY_Strafford',
    'COUNTY_Suffolk', 'COUNTY_Tolland', 'COUNTY_Volusia', 'COUNTY_Washington',
    'COUNTY_Windham', 'COUNTY_Worcester', 'COUNTY_York'
]


def preprocess_single_input(raw_df):
    """
    Preprocess a raw 1-row DataFrame into a model-ready input row.
    """
    # Convert Yes/No to 1/0
    raw_df["SQUARE_FEET_INCL_BASE"] = raw_df["SQUARE_FEET_INCL_BASE"].map({"Yes": 1, "No": 0}).astype(int)
    raw_df["BASEMENT"] = raw_df["BASEMENT"].map({"Yes": 1, "No": 0}).astype(int)

    # One-hot encode categorical variables
    raw_df = pd.get_dummies(raw_df, columns=["PROP_TYPE", "COUNTY"], dtype=int)

    # Add missing columns and ensure order
    for col in feature_columns:
        if col not in raw_df.columns:
            raw_df[col] = 0
    raw_df = raw_df[feature_columns]

    return raw_df.astype(float)


@app.route("/", methods=["GET", "POST"])
def index():
    predicted_price = None

    if request.method == "POST":
        if 'inputvector' not in request.files:
            predicted_price = "No file part."
        else:
            file = request.files['inputvector']
            if file.filename == '':
                predicted_price = "No selected file."
            else:
                try:
                    raw_df = pd.read_csv(file)
                    if raw_df.shape[0] != 1:
                        predicted_price = "Please upload a CSV with exactly 1 row."
                    else:
                        X_input = preprocess_single_input(raw_df)
                        prediction = model.predict(X_input)[0][0]
                        predicted_price = f"${prediction:,.2f}"
                except Exception as e:
                    predicted_price = f"An error occurred: {str(e)}"

    return render_template("index.html", predicted_price=predicted_price)


if __name__ == "__main__":
    app.run(port=3000, debug=True)
