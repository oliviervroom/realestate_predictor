import tensorflow as tf
import pandas as pd
from preprocess import preprocess_single_input

# Load model
MODEL_PATH = "./experiments/model-1"
model = tf.keras.models.load_model(MODEL_PATH)

def predict_price(property_data):
    """
    Make a price prediction for a single property.
    
    Args:
        property_data (dict): Dictionary containing property features
        
    Returns:
        float: Predicted price
    """
    try:
        # Preprocess the input data
        preprocessed_data = preprocess_single_input(property_data)
        
        # Make prediction
        prediction = model.predict(preprocessed_data)[0][0]
        
        return float(prediction)
    except Exception as e:
        print(f"Error making prediction: {str(e)}")
        return None 