from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from catboost import CatBoostRegressor

app = Flask(__name__)
CORS(app)

# Load CatBoost model
try:
    model = CatBoostRegressor()
    # model.load_model("./models/rent_predictor_model.cbm")  # Update if needed
    print("CatBoost model loaded successfully!")
except Exception as e:
    print(" Model not loaded.", e)
    model = None

# --------- NEW helper function ---------
def create_full_feature_array(input_data):
    """
    This function will create 42 features needed by the model
    from the 15 inputs you are sending.
    The rest will be filled with default dummy values.
    """
    try:
        features = [
            # These are your actual inputs (correct order)
            str(input_data.get('NEIGHBORHOOD', 'Unknown')),
            str(input_data.get('ZIP_CODE', '00000')),
            str(input_data.get('PROP_TYPE', 'other')),
            float(input_data.get('SQUARE_FEET', 0)),
            float(input_data.get('LOT_SIZE', 0)),
            float(input_data.get('NO_BEDROOMS', 0)),
            float(input_data.get('TOTAL_BATHS', 0)),
            str(input_data.get('TOTAL_PARKING_RN', "0")),
            str(input_data.get('FURNISHED_RN', "No")),
            str(input_data.get('PETS_ALLOWED_RN', "No")),
            str(input_data.get('SEC_DEPOSIT_RN', "No")),
            str(input_data.get('TERM_OF_RENTAL_RN', "12 months")),
            str(input_data.get('RENT_FEE_INCLUDES_RN', "None")),
            str(input_data.get('RENTAL_TERMS_RN', "Annual")),
            float(input_data.get('LIST_PRICE', 0))
        ]

        # These below are DUMMY values because your model expects total 42 fields
        dummy_fillers = [
            'City', 'Downtown', 'Seasonal',   # 3 dummy categorical
            100,  # Days on Market
            'MLS123', # MLS_COMP_BUILDING_ID
            'Active',  # COMP_STATUS
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,  # More numeric placeholders
            'N/A', 'N/A', 'N/A', 'N/A', 'N/A',  # Random placeholders
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0,       # Random numbers
            'N/A', 'N/A', 'N/A', 'N/A', 'N/A',  # More placeholders
            0.0, 0.0, 0.0                       # Final dummy numeric
        ]

        full_features = features + dummy_fillers
        if len(full_features) != 42:
            raise ValueError(f"Feature array created has {len(full_features)} features, but 42 needed.")
        
        return np.array(full_features).reshape(1, -1)

    except Exception as e:
        raise Exception(f"Error creating full feature array: {str(e)}")

# ----------------------------------------

@app.route('/predict-rent', methods=['POST'])
def predict_rent():
    data = request.get_json()
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        full_feature_array = create_full_feature_array(data)
        prediction = model.predict(full_feature_array)
        return jsonify({'predicted_rent': round(float(prediction[0]), 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)