from flask import Flask, render_template, request
import tensorflow as tf
import pandas as pd
import torch
import sys
import logging

# Disable TensorFlow and DeepSpeed logs
sys.modules['tensorflow'] = tf  # We need TF here for the price model
logging.getLogger("deepspeed").setLevel(logging.ERROR)

# Initialize Flask app
app = Flask(__name__)

# Load TF model for price prediction
MODEL_PATH = "./experiments/model-1"
model = tf.keras.models.load_model(MODEL_PATH)

# Define required feature order
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

# Preprocessing function
def preprocess_single_input(raw_df):
    raw_df["SQUARE_FEET_INCL_BASE"] = raw_df["SQUARE_FEET_INCL_BASE"].map({"Yes": 1, "No": 0}).astype(int)
    raw_df["BASEMENT"] = raw_df["BASEMENT"].map({"Yes": 1, "No": 0}).astype(int)
    raw_df = pd.get_dummies(raw_df, columns=["PROP_TYPE", "COUNTY"], dtype=int)

    for col in feature_columns:
        if col not in raw_df.columns:
            raw_df[col] = 0
    return raw_df[feature_columns].astype(float)



def generate_description(raw_input_df):
    '''
    Creates a brief natural-language summary of the property.
    '''
    beds = int(raw_input_df['NO_BEDROOMS'].iloc[0])
    baths = float(raw_input_df['TOTAL_BATHS'].iloc[0])
    sqft = int(raw_input_df['SQUARE_FEET'].iloc[0])
    year_built = int(raw_input_df['YEAR_BUILT'].iloc[0])
    basement = raw_input_df['BASEMENT'].iloc[0]
    fireplace = int(raw_input_df['FIRE_PLACES'].iloc[0])
    county = raw_input_df.get('COUNTY', pd.Series(["Unknown"])).iloc[0]

    desc = [
        f"The property is a {beds}-bedroom, {baths}-bath home with {sqft} sq ft of living space.",
        f"It was built in {year_built} and {'has' if basement == 'Yes' else 'does not have'} a basement."
    ]
    if fireplace > 0:
        desc.append(f"It features {fireplace} fireplace{'s' if fireplace > 1 else ''}.")
    desc.append(f"Located in {county} County.")

    return " ".join(desc)

# Flask route
@app.route("/", methods=["GET", "POST"])
def index():
    predicted_price = None
    description = None
    verdict = None

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
                        description = generate_description(raw_df)
                except Exception as e:
                    predicted_price = f"An error occurred: {str(e)}"

    return render_template("index.html", predicted_price=predicted_price,
                        description=description)

if __name__ == "__main__":
    app.run(port=3000, debug=True)
