#!/usr/bin/env python3
"""
Rental Income Prediction Application

This application helps real estate investors predict rental income based on property characteristics.
It provides an interactive interface for inputting property details and viewing predictions.
"""

import os
import pickle
import pandas as pd
import numpy as np
import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Set page configuration
st.set_page_config(
    page_title="Rental Income Prediction Tool",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Define paths relative to the current directory
MODEL_DIR = "models"
DATA_DIR = "model_data"
EXPLAINABILITY_DIR = "explainability"

# Create directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(EXPLAINABILITY_DIR, exist_ok=True)

# Function to load the model
def load_model():
    """
    Load the trained model and feature information
    """
    # First try to load the compatible model
    model_path = os.path.join(MODEL_DIR, 'rental_price_model_compatible.pkl')
    
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            model_dict = pickle.load(f)
        
        # Check if it's a dictionary with model and feature names
        if isinstance(model_dict, dict) and 'model' in model_dict and 'feature_names' in model_dict:
            model = model_dict['model']
            feature_names = model_dict['feature_names']
            numeric_cols = model_dict.get('numeric_cols', [])
            categorical_cols = model_dict.get('categorical_cols', [])
            return model, feature_names, numeric_cols, categorical_cols
    
    # If compatible model not found, try the original model
    model_path = os.path.join(MODEL_DIR, 'rental_price_model.pkl')
    
    if not os.path.exists(model_path):
        st.error(f"Model file not found at {model_path}. Please run the compatibility_fix.py script first.")
        
        # Create synthetic data and a simple model for demonstration
        np.random.seed(42)
        n_samples = 1000
        
        # Create synthetic features
        X_synth = pd.DataFrame({
            'NO_BEDROOMS': np.random.randint(1, 5, n_samples),
            'SQUARE_FEET': np.random.randint(500, 3000, n_samples),
            'LOCATION_Boston': np.random.choice([0, 1], n_samples),
            'LOCATION_Cambridge': np.random.choice([0, 1], n_samples),
            'LOCATION_Somerville': np.random.choice([0, 1], n_samples),
            'PROPERTY_TYPE_Apartment': np.random.choice([0, 1], n_samples),
            'PROPERTY_TYPE_Condo': np.random.choice([0, 1], n_samples),
            'PROPERTY_TYPE_House': np.random.choice([0, 1], n_samples),
            'SEASON_Spring': np.random.choice([0, 1], n_samples),
            'SEASON_Summer': np.random.choice([0, 1], n_samples),
            'SEASON_Winter': np.random.choice([0, 1], n_samples)
        })
        
        # Create synthetic target
        y_synth = 1000 + 500 * X_synth['NO_BEDROOMS'] + 0.5 * X_synth['SQUARE_FEET'] + np.random.normal(0, 500, n_samples)
        
        # Create and train a simple model
        from sklearn.ensemble import RandomForestRegressor
        model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
        model.fit(X_synth, y_synth)
        
        # Save feature names
        feature_names = X_synth.columns.tolist()
        numeric_cols = ['NO_BEDROOMS', 'SQUARE_FEET']
        categorical_cols = ['LOCATION', 'PROPERTY_TYPE', 'SEASON']
        
        return model, feature_names, numeric_cols, categorical_cols
    
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Check if model is a pipeline with a preprocessor
        if hasattr(model, 'named_steps') and 'preprocessor' in model.named_steps:
            preprocessor = model.named_steps['preprocessor']
            
            # Try to get feature names
            try:
                if hasattr(preprocessor, 'get_feature_names_out'):
                    feature_names = preprocessor.get_feature_names_out()
                else:
                    feature_names = []
            except:
                feature_names = []
            
            # Try to get column names
            numeric_cols = []
            categorical_cols = []
            
            if hasattr(preprocessor, 'transformers_'):
                for name, transformer, cols in preprocessor.transformers_:
                    if name == 'num':
                        numeric_cols = cols
                    elif name == 'cat':
                        categorical_cols = cols
        else:
            # If model is not a pipeline, use default values
            feature_names = []
            numeric_cols = ['NO_BEDROOMS', 'SQUARE_FEET']
            categorical_cols = ['LOCATION', 'PROPERTY_TYPE', 'SEASON']
        
        return model, feature_names, numeric_cols, categorical_cols
    except Exception as e:
        st.error(f"Error loading model: {str(e)}")
        
        # Create synthetic data and a simple model for demonstration
        np.random.seed(42)
        n_samples = 1000
        
        # Create synthetic features
        X_synth = pd.DataFrame({
            'NO_BEDROOMS': np.random.randint(1, 5, n_samples),
            'SQUARE_FEET': np.random.randint(500, 3000, n_samples),
            'LOCATION_Boston': np.random.choice([0, 1], n_samples),
            'LOCATION_Cambridge': np.random.choice([0, 1], n_samples),
            'LOCATION_Somerville': np.random.choice([0, 1], n_samples),
            'PROPERTY_TYPE_Apartment': np.random.choice([0, 1], n_samples),
            'PROPERTY_TYPE_Condo': np.random.choice([0, 1], n_samples),
            'PROPERTY_TYPE_House': np.random.choice([0, 1], n_samples),
            'SEASON_Spring': np.random.choice([0, 1], n_samples),
            'SEASON_Summer': np.random.choice([0, 1], n_samples),
            'SEASON_Winter': np.random.choice([0, 1], n_samples)
        })
        
        # Create synthetic target
        y_synth = 1000 + 500 * X_synth['NO_BEDROOMS'] + 0.5 * X_synth['SQUARE_FEET'] + np.random.normal(0, 500, n_samples)
        
        # Create and train a simple model
        from sklearn.ensemble import RandomForestRegressor
        model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
        model.fit(X_synth, y_synth)
        
        # Save feature names
        feature_names = X_synth.columns.tolist()
        numeric_cols = ['NO_BEDROOMS', 'SQUARE_FEET']
        categorical_cols = ['LOCATION', 'PROPERTY_TYPE', 'SEASON']
        
        return model, feature_names, numeric_cols, categorical_cols

# Function to preprocess input data
def preprocess_input(input_data, numeric_cols, categorical_cols):
    """
    Preprocess input data to match the format expected by the model
    """
    # Create a DataFrame from input data
    input_df = pd.DataFrame([input_data])
    
    # If the model expects encoded categorical features, encode them
    if any('_' in col for col in feature_names):
        # One-hot encode categorical features
        encoded_df = pd.DataFrame()
        
        # Add numeric columns directly
        for col in numeric_cols:
            if col in input_df.columns:
                encoded_df[col] = input_df[col]
        
        # One-hot encode categorical columns
        for col in categorical_cols:
            if col in input_df.columns:
                value = input_df[col].iloc[0]
                for unique_value in ['Boston', 'Cambridge', 'Somerville', 'Brookline', 'Apartment', 'Condo', 'House', 'Townhouse', 'Winter', 'Spring', 'Summer', 'Fall']:
                    col_name = f"{col}_{unique_value}"
                    encoded_df[col_name] = 1 if value == unique_value else 0
        
        # Ensure all expected feature names are present
        for feat in feature_names:
            if feat not in encoded_df.columns:
                encoded_df[feat] = 0
        
        # Reorder columns to match feature_names
        if feature_names:
            try:
                encoded_df = encoded_df[feature_names]
            except:
                pass
        
        return encoded_df
    
    # If the model expects raw features, return the input DataFrame
    return input_df

# Function to predict rental income
def predict_rental_income(input_data):
    """
    Predict rental income based on input property characteristics
    """
    # Preprocess input data
    processed_data = preprocess_input(input_data, numeric_cols, categorical_cols)
    
    # Make prediction
    try:
        prediction = model.predict(processed_data)[0]
        return prediction
    except Exception as e:
        st.error(f"Error making prediction: {str(e)}")
        return 0

# Function to explain prediction
def explain_prediction(input_data, prediction):
    """
    Generate an explanation for the prediction
    """
    explanation = f"## Prediction Explanation\n\n"
    explanation += f"The predicted rental income of **${prediction:.2f}** per month is based on the following factors:\n\n"
    
    # Explain based on property characteristics
    bedrooms = input_data.get('NO_BEDROOMS', 0)
    sqft = input_data.get('SQUARE_FEET', 0)
    location = input_data.get('LOCATION', 'unknown')
    property_type = input_data.get('PROPERTY_TYPE', 'unknown')
    season = input_data.get('SEASON', 'unknown')
    
    # Basic explanation based on bedrooms and square footage
    explanation += f"1. **Property Size**: {bedrooms} bedrooms, {sqft} square feet\n"
    explanation += f"   - Each additional bedroom typically adds $400-600 to monthly rental income\n"
    explanation += f"   - Each additional 100 square feet typically adds $50-100 to monthly rental income\n\n"
    
    # Location-based explanation
    explanation += f"2. **Location**: {location}\n"
    if location == 'Boston':
        explanation += f"   - Boston properties typically command premium rents due to urban amenities and job proximity\n"
    elif location == 'Cambridge':
        explanation += f"   - Cambridge properties benefit from proximity to universities and tech companies\n"
    elif location == 'Somerville':
        explanation += f"   - Somerville offers good value with improving neighborhood amenities\n"
    elif location == 'Brookline':
        explanation += f"   - Brookline properties benefit from excellent schools and proximity to Boston\n"
    explanation += "\n"
    
    # Property type explanation
    explanation += f"3. **Property Type**: {property_type}\n"
    if property_type == 'Apartment':
        explanation += f"   - Apartments typically have lower rents but may include amenities like gyms or pools\n"
    elif property_type == 'Condo':
        explanation += f"   - Condos often command higher rents due to better finishes and amenities\n"
    elif property_type == 'House':
        explanation += f"   - Houses typically command premium rents due to privacy and outdoor space\n"
    elif property_type == 'Townhouse':
        explanation += f"   - Townhouses offer a balance of space and affordability\n"
    explanation += "\n"
    
    # Seasonal explanation
    explanation += f"4. **Seasonal Factors**: {season}\n"
    if season == 'Summer':
        explanation += f"   - Summer is peak rental season with higher demand and prices\n"
    elif season == 'Winter':
        explanation += f"   - Winter typically sees lower demand and potentially lower rents\n"
    elif season == 'Fall':
        explanation += f"   - Fall has moderate demand, often driven by academic calendars\n"
    elif season == 'Spring':
        explanation += f"   - Spring sees increasing demand as weather improves\n"
    explanation += "\n"
    
    # Recommendations
    explanation += f"## Recommendations to Optimize Rental Income\n\n"
    explanation += f"1. **Timing**: Consider listing in {get_optimal_season(location)} for maximum rental income\n"
    explanation += f"2. **Highlighting Features**: Emphasize {get_key_features(property_type, bedrooms, sqft)} in listings\n"
    explanation += f"3. **Pricing Strategy**: The predicted rent of ${prediction:.2f} is {get_market_position(prediction, location)} for similar properties in {location}\n"
    
    return explanation

# Helper function to get optimal listing season
def get_optimal_season(location):
    """
    Get the optimal season for listing a property in a given location
    """
    if location in ['Boston', 'Cambridge']:
        return "Summer or early Fall (for academic calendar)"
    else:
        return "Summer (May-August)"

# Helper function to get key features to highlight
def get_key_features(property_type, bedrooms, sqft):
    """
    Get key features to highlight based on property characteristics
    """
    features = []
    
    if property_type == 'Apartment':
        features.append("building amenities")
    elif property_type == 'Condo':
        features.append("modern finishes")
    elif property_type == 'House':
        features.append("private outdoor space")
    elif property_type == 'Townhouse':
        features.append("multi-level living")
    
    if bedrooms >= 3:
        features.append("family-friendly layout")
    
    if sqft > 1500:
        features.append("spacious floor plan")
    
    return ", ".join(features)

# Helper function to get market position
def get_market_position(prediction, location):
    """
    Get the market position of a predicted rent
    """
    # These would ideally be based on actual market data
    market_averages = {
        'Boston': 2800,
        'Cambridge': 3000,
        'Somerville': 2500,
        'Brookline': 2700,
        'unknown': 2600
    }
    
    avg = market_averages.get(location, 2600)
    
    if prediction > avg * 1.1:
        return "above average"
    elif prediction < avg * 0.9:
        return "below average"
    else:
        return "in line with the average"

# Function to visualize market position
def visualize_market_position(prediction, location):
    """
    Create a visualization of the predicted rent compared to market averages
    """
    # These would ideally be based on actual market data
    market_data = {
        'Boston': {'min': 1800, 'avg': 2800, 'max': 4000},
        'Cambridge': {'min': 2000, 'avg': 3000, 'max': 4200},
        'Somerville': {'min': 1600, 'avg': 2500, 'max': 3500},
        'Brookline': {'min': 1800, 'avg': 2700, 'max': 3800},
        'unknown': {'min': 1700, 'avg': 2600, 'max': 3700}
    }
    
    data = market_data.get(location, market_data['unknown'])
    
    fig, ax = plt.subplots(figsize=(10, 3))
    
    # Create a horizontal bar for the range
    ax.barh(['Market Range'], [data['max'] - data['min']], left=[data['min']], height=0.4, color='lightgray')
    
    # Add markers for min, avg, max
    ax.scatter([data['min'], data['avg'], data['max']], [1, 1, 1], color='gray', s=100, zorder=3)
    
    # Add marker for prediction
    ax.scatter([prediction], [1], color='red', s=150, zorder=3, marker='D')
    
    # Add labels
    ax.text(data['min'], 1.1, f"Min: ${data['min']}", ha='center', va='bottom')
    ax.text(data['avg'], 1.1, f"Avg: ${data['avg']}", ha='center', va='bottom')
    ax.text(data['max'], 1.1, f"Max: ${data['max']}", ha='center', va='bottom')
    ax.text(prediction, 0.9, f"Prediction: ${prediction:.0f}", ha='center', va='top', color='red', fontweight='bold')
    
    # Set limits and remove y-axis
    ax.set_xlim(data['min'] - 500, data['max'] + 500)
    ax.set_ylim(0.5, 1.5)
    ax.set_yticks([])
    
    # Set title and x-axis label
    ax.set_title(f'Predicted Rent vs. Market Range in {location}')
    ax.set_xlabel('Monthly Rent ($)')
    
    # Remove top and right spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    return fig

# Main function
def main():
    """
    Main function to run the Streamlit application
    """
    st.title("Rental Income Prediction Tool")
    st.write("This tool helps real estate investors predict rental income based on property characteristics. Use the sidebar to input property details and see the predicted rental income.")
    
    # Sidebar for input parameters
    st.sidebar.header("Property Characteristics")
    
    # Input fields
    bedrooms = st.sidebar.slider("Number of Bedrooms", 0, 6, 2)
    bathrooms = st.sidebar.slider("Number of Bathrooms", 1, 4, 2)
    square_feet = st.sidebar.slider("Square Footage", 500, 3000, 1200)
    location = st.sidebar.selectbox("Location", ["Boston", "Cambridge", "Somerville", "Brookline"])
    property_type = st.sidebar.selectbox("Property Type", ["Apartment", "Condo", "House", "Townhouse"])
    season = st.sidebar.selectbox("Listing Season", ["Winter", "Spring", "Summer", "Fall"])
    
    # Additional features
    st.sidebar.header("Additional Features")
    has_parking = st.sidebar.checkbox("Parking Available")
    has_laundry = st.sidebar.checkbox("In-unit Laundry")
    has_balcony = st.sidebar.checkbox("Balcony/Patio")
    has_gym = st.sidebar.checkbox("Gym Access")
    
    # Create input data dictionary
    input_data = {
        'NO_BEDROOMS': bedrooms,
        'NO_BATHROOMS': bathrooms,
        'SQUARE_FEET': square_feet,
        'LOCATION': location,
        'PROPERTY_TYPE': property_type,
        'SEASON': season,
        'HAS_PARKING': 1 if has_parking else 0,
        'HAS_LAUNDRY': 1 if has_laundry else 0,
        'HAS_BALCONY': 1 if has_balcony else 0,
        'HAS_GYM': 1 if has_gym else 0
    }
    
    # Predict rental income
    prediction = predict_rental_income(input_data)
    
    # Display prediction
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("Predicted Rental Income")
        st.subheader(f"${prediction:.2f} per month")
        
        # Visualization of market position
        st.subheader("Market Position")
        fig = visualize_market_position(prediction, location)
        st.pyplot(fig)
        
        # Explanation
        st.header("Explanation")
        explanation = explain_prediction(input_data, prediction)
        st.markdown(explanation)
    
    with col2:
        st.header("Adjust Rental Price")
        adjusted_price = st.slider("Your Rental Price", 
                                  float(max(500, prediction * 0.7)), 
                                  float(prediction * 1.3), 
                                  float(prediction),
                                  step=50.0)
        
        price_difference = adjusted_price - prediction
        percentage_difference = (price_difference / prediction) * 100
        
        if abs(percentage_difference) < 5:
            st.success(f"Your price is within 5% of the predicted market rate.")
        elif percentage_difference > 0:
            st.warning(f"Your price is {percentage_difference:.1f}% above the predicted market rate.")
        else:
            st.info(f"Your price is {abs(percentage_difference):.1f}% below the predicted market rate.")
        
        st.subheader("Property Summary")
        st.write(f"**{bedrooms}** bed, **{bathrooms}** bath")
        st.write(f"**{square_feet}** sq ft **{property_type}**")
        st.write(f"Located in **{location}**")
        
        # Display additional features
        features = []
        if has_parking:
            features.append("Parking")
        if has_laundry:
            features.append("In-unit Laundry")
        if has_balcony:
            features.append("Balcony/Patio")
        if has_gym:
            features.append("Gym Access")
        
        if features:
            st.write("**Features:**")
            for feature in features:
                st.write(f"- {feature}")

# Load model and feature information
model, feature_names, numeric_cols, categorical_cols = load_model()

# Run the application
if __name__ == "__main__":
    main()
