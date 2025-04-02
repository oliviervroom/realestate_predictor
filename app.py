#!/usr/bin/env python3
"""
Rental Income Prediction Web Application with Success Probability

This application provides a user interface for real estate investors to:
1. Search for properties by address
2. View property details fetched from API (with fallback to synthetic data)
3. See predicted rental income based on property features
4. View rental success probability at different price points
5. View comparable properties and their features
6. View property location on an interactive map
"""
import os
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import streamlit as st
import requests
from scipy.stats import gaussian_kde
import folium
from streamlit_folium import folium_static
from geopy.geocoders import Nominatim
import json
import random

# Try to import CatBoost, with fallback to RandomForest
try:
    from catboost import CatBoostRegressor
    CATBOOST_AVAILABLE = True
except ImportError:
    from sklearn.ensemble import RandomForestRegressor
    CATBOOST_AVAILABLE = False
    st.warning("CatBoost not available. Using RandomForest as fallback. Consider installing CatBoost for better performance.")

# Define directories
MODEL_DIR = './models'
DATA_DIR = './model_data'
TEMP_DIR = './temp'

# Create temp directory if it doesn't exist
os.makedirs(TEMP_DIR, exist_ok=True)

# Function to load the rental and sold data
@st.cache_data
def load_data():
    """
    Load the rental and sold data
    """
    rental_data_path = os.path.join(DATA_DIR, 'rental 04_02_2024-07_01_2024.csv')
    sold_data_path = os.path.join(DATA_DIR, 'sold 01_01_2025-3_11_2025.csv')
    
    rental_df = pd.read_csv(rental_data_path) if os.path.exists(rental_data_path) else pd.DataFrame()
    sold_df = pd.read_csv(sold_data_path) if os.path.exists(sold_data_path) else pd.DataFrame()
    
    return rental_df, sold_df

# Function to load or create the model
@st.cache_resource
def load_or_create_model():
    """
    Load the trained rental price prediction model or create a new one
    """
    model_path = os.path.join(MODEL_DIR, 'rental_price_model.pkl')
    
    # Check if model exists
    if not os.path.exists(model_path):
        # If model doesn't exist, create a new one
        st.info("Model not found, creating a new model for demonstration")
        
        # Load the data
        rental_df, _ = load_data()
        
        if not rental_df.empty:
            # Prepare data for modeling
            if 'LIST_PRICE' in rental_df.columns:
                # Use actual data
                X = rental_df.drop(columns=['LIST_PRICE'])
                y = rental_df['LIST_PRICE']
                
                # Identify numeric and categorical columns
                numeric_cols = X.select_dtypes(include=['number']).columns.tolist()
                categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
                
                # Create and train the model
                if CATBOOST_AVAILABLE:
                    # Use CatBoost if available
                    model = CatBoostRegressor(
                        iterations=500,
                        learning_rate=0.05,
                        depth=6,
                        loss_function='RMSE',
                        random_seed=42,
                        verbose=False
                    )
                    # CatBoost handles categorical features automatically
                    cat_features = categorical_cols
                    model.fit(X, y, cat_features=cat_features)
                else:
                    # Fallback to RandomForest
                    from sklearn.compose import ColumnTransformer
                    from sklearn.pipeline import Pipeline
                    from sklearn.preprocessing import OneHotEncoder, RobustScaler
                    from sklearn.impute import SimpleImputer
                    
                    # Create preprocessing pipeline
                    numeric_transformer = Pipeline(steps=[
                        ('imputer', SimpleImputer(strategy='median')),
                        ('scaler', RobustScaler())
                    ])
                    
                    categorical_transformer = Pipeline(steps=[
                        ('imputer', SimpleImputer(strategy='most_frequent')),
                        ('onehot', OneHotEncoder(handle_unknown='ignore'))
                    ])
                    
                    preprocessor = ColumnTransformer(
                        transformers=[
                            ('num', numeric_transformer, numeric_cols),
                            ('cat', categorical_transformer, categorical_cols)
                        ]
                    )
                    
                    model = Pipeline(steps=[
                        ('preprocessor', preprocessor),
                        ('model', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42))
                    ])
                    
                    model.fit(X, y)
                
                # Save the model
                os.makedirs(MODEL_DIR, exist_ok=True)
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
                
                return model, X.columns.tolist(), numeric_cols, categorical_cols
            else:
                # Create synthetic model
                return create_synthetic_model()
        else:
            # Create synthetic model
            return create_synthetic_model()
    else:
        # Load the existing model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Load feature information
        rental_df, _ = load_data()
        if not rental_df.empty and 'LIST_PRICE' in rental_df.columns:
            X = rental_df.drop(columns=['LIST_PRICE'])
            feature_names = X.columns.tolist()
            numeric_cols = X.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
        else:
            feature_names = []
            numeric_cols = []
            categorical_cols = []
        
        return model, feature_names, numeric_cols, categorical_cols

# Function to create a synthetic model when no data is available
def create_synthetic_model():
    """
    Create a synthetic model for demonstration purposes
    """
    # Define synthetic feature names
    feature_names = [
        'ZIP_CODE', 'PROP_TYPE', 'SQUARE_FEET', 'NO_BEDROOMS', 'NO_BATHROOMS',
        'YEAR_BUILT', 'HAS_PARKING', 'HAS_POOL', 'DISTANCE_TO_CITY_CENTER'
    ]
    
    numeric_cols = ['SQUARE_FEET', 'NO_BEDROOMS', 'NO_BATHROOMS', 'YEAR_BUILT', 'DISTANCE_TO_CITY_CENTER']
    categorical_cols = ['ZIP_CODE', 'PROP_TYPE', 'HAS_PARKING', 'HAS_POOL']
    
    # Create a simple synthetic model
    class SyntheticModel:
        def predict(self, X):
            # Simple formula based on square footage and bedrooms
            if isinstance(X, pd.DataFrame):
                base_price = 1000  # Base price
                
                # Add square footage contribution
                if 'SQUARE_FEET' in X.columns:
                    price = base_price + X['SQUARE_FEET'] * 1.5
                else:
                    price = base_price + 1000  # Default square footage contribution
                
                # Add bedroom contribution
                if 'NO_BEDROOMS' in X.columns:
                    price += X['NO_BEDROOMS'] * 200
                
                # Add bathroom contribution
                if 'NO_BATHROOMS' in X.columns:
                    price += X['NO_BATHROOMS'] * 150
                
                # Add location premium
                if 'ZIP_CODE' in X.columns:
                    # Random location factor based on ZIP code
                    zip_factors = {
                        '02108': 1.5, '02109': 1.4, '02110': 1.3, '02111': 1.2,
                        '02113': 1.1, '02114': 1.0, '02115': 0.9, '02116': 1.3,
                        '02118': 1.1, '02119': 0.8, '02120': 0.7, '02121': 0.6,
                        '02122': 0.7, '02124': 0.6, '02125': 0.7, '02126': 0.6,
                        '02127': 0.9, '02128': 0.8, '02129': 1.0, '02130': 0.9,
                        '02131': 0.8, '02132': 0.7, '02134': 0.9, '02135': 0.8,
                        '02136': 0.7, '02210': 1.4, '02215': 1.0
                    }
                    
                    # Apply location factor if ZIP code is in our dictionary
                    location_factors = X['ZIP_CODE'].map(lambda x: zip_factors.get(str(x), 1.0))
                    price = price * location_factors
                
                # Add random variation (±10%)
                price = price * (0.9 + 0.2 * np.random.random(len(X)))
                
                return price
            else:
                # For single predictions
                return np.array([1500])  # Default prediction
    
    return SyntheticModel(), feature_names, numeric_cols, categorical_cols

# Function to get property features from API or generate synthetic data
def get_property_features(address):
    """
    Get property features from API or generate synthetic data
    """
    # Try to get API key from secrets
    api_key = st.secrets.get("RAPIDAPI_KEY", "")
    
    if api_key:
        # Make API request to get property details
        url = "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch"
        querystring = {"location": address}
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com"
        }
        
        try:
            response = requests.get(url, headers=headers, params=querystring)
            
            if response.status_code == 200:
                data = response.json()
                if data and "props" in data and len(data["props"]) > 0:
                    property_data = data["props"][0]
                    
                    # Extract relevant features
                    features = {
                        'ZIP_CODE': property_data.get("zipcode", "02108"),
                        'PROP_TYPE': property_data.get("propertyType", "Apartment"),
                        'SQUARE_FEET': property_data.get("livingArea", 1000),
                        'NO_BEDROOMS': property_data.get("bedrooms", 2),
                        'NO_BATHROOMS': property_data.get("bathrooms", 1),
                        'YEAR_BUILT': property_data.get("yearBuilt", 1980),
                        'HAS_PARKING': "Yes" if property_data.get("hasGarage", False) else "No",
                        'HAS_POOL': "Yes" if property_data.get("hasPool", False) else "No",
                        'DISTANCE_TO_CITY_CENTER': 5.0  # Default value
                    }
                    
                    return features, property_data
                
        except Exception as e:
            st.warning(f"Error fetching property data: {str(e)}. Using synthetic data for demonstration.")
    
    # If API request failed or no API key, generate synthetic data
    st.info("Using synthetic property data for demonstration purposes.")
    
    # Generate random ZIP code from Boston area
    boston_zip_codes = [
        '02108', '02109', '02110', '02111', '02113', '02114', '02115', '02116',
        '02118', '02119', '02120', '02121', '02122', '02124', '02125', '02126',
        '02127', '02128', '02129', '02130', '02131', '02132', '02134', '02135',
        '02136', '02210', '02215'
    ]
    
    # Extract street number and name from address if possible
    address_parts = address.split(' ', 1)
    street_number = address_parts[0] if len(address_parts) > 0 and address_parts[0].isdigit() else "123"
    street_name = address_parts[1] if len(address_parts) > 1 else "Main St"
    
    # Generate synthetic property data
    synthetic_data = {
        "address": {
            "streetAddress": f"{street_number} {street_name}",
            "city": "Boston",
            "state": "MA",
            "zipcode": random.choice(boston_zip_codes)
        },
        "bedrooms": random.randint(1, 4),
        "bathrooms": random.randint(1, 3),
        "livingArea": random.randint(700, 2000),
        "yearBuilt": random.randint(1900, 2020),
        "hasGarage": random.choice([True, False]),
        "hasPool": random.choice([True, False]),
        "price": random.randint(300000, 900000),
        "propertyType": random.choice(["Apartment", "House", "Condo", "Townhouse"])
    }
    
    # Extract features for model
    features = {
        'ZIP_CODE': synthetic_data["address"]["zipcode"],
        'PROP_TYPE': synthetic_data["propertyType"],
        'SQUARE_FEET': synthetic_data["livingArea"],
        'NO_BEDROOMS': synthetic_data["bedrooms"],
        'NO_BATHROOMS': synthetic_data["bathrooms"],
        'YEAR_BUILT': synthetic_data["yearBuilt"],
        'HAS_PARKING': "Yes" if synthetic_data["hasGarage"] else "No",
        'HAS_POOL': "Yes" if synthetic_data["hasPool"] else "No",
        'DISTANCE_TO_CITY_CENTER': random.uniform(1.0, 10.0)
    }
    
    return features, synthetic_data

# Function to get coordinates for an address
def get_coordinates(address):
    """
    Get latitude and longitude for an address using Google Geocoding API or fallback
    """
    try:
        # Get API key from secrets
        api_key = st.secrets.get("GOOGLE_MAPS_API_KEY", "")
        
        if api_key:
            # Make request to Google Geocoding API
            url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if data["status"] == "OK" and data["results"]:
                    location = data["results"][0]["geometry"]["location"]
                    return location["lat"], location["lng"]
        
        # If we get here, either no API key or geocoding failed
        # Try using Nominatim as a fallback
        geolocator = Nominatim(user_agent="rental_predictor")
        location = geolocator.geocode(address)
        
        if location:
            return location.latitude, location.longitude
        
        # If all geocoding attempts fail, use a simple approximation for demonstration
        st.info("Using approximate location for demonstration purposes.")
        return 42.3601 + random.uniform(-0.05, 0.05), -71.0589 + random.uniform(-0.05, 0.05)
    except Exception as e:
        st.warning(f"Error getting coordinates: {str(e)}. Using approximate location for demonstration.")
        return 42.3601 + random.uniform(-0.05, 0.05), -71.0589 + random.uniform(-0.05, 0.05)

# Function to create a map with the property location
def create_property_map(lat, lon, property_data):
    """
    Create a map with the property location and nearby properties
    """
    # Create a map centered at the property location
    m = folium.Map(location=[lat, lon], zoom_start=14)
    
    # Add a marker for the property
    folium.Marker(
        [lat, lon],
        popup=f"<b>{property_data.get('address', {}).get('streetAddress', 'Property')}</b><br>"
              f"Price: ${property_data.get('price', 'N/A')}<br>"
              f"Beds: {property_data.get('bedrooms', 'N/A')}<br>"
              f"Baths: {property_data.get('bathrooms', 'N/A')}<br>"
              f"Sqft: {property_data.get('livingArea', 'N/A')}",
        icon=folium.Icon(color="red", icon="home")
    ).add_to(m)
    
    # Add nearby properties (simulated)
    for i in range(5):
        # Generate random coordinates near the property
        nearby_lat = lat + random.uniform(-0.01, 0.01)
        nearby_lon = lon + random.uniform(-0.01, 0.01)
        
        # Generate random property details
        beds = random.randint(1, 4)
        baths = random.randint(1, 3)
        sqft = random.randint(700, 2000)
        price = random.randint(300000, 900000)
        
        # Add marker for nearby property
        folium.Marker(
            [nearby_lat, nearby_lon],
            popup=f"<b>Nearby Property {i+1}</b><br>"
                  f"Price: ${price:,}<br>"
                  f"Beds: {beds}<br>"
                  f"Baths: {baths}<br>"
                  f"Sqft: {sqft}",
            icon=folium.Icon(color="blue", icon="info-sign")
        ).add_to(m)
    
    # Display the map
    st.subheader("Property Location")
    folium_static(m)
    
    # Add caption explaining the markers
    st.caption("Red marker: Main property | Blue markers: Nearby properties (simulated)")
    
    return True

# Function to analyze rent prediction and find comparable properties
def analyze_rent_prediction(listing, full_df, model, features_used):
    """
    Analyze rent prediction and find comparable properties
    """
    # Convert single listing to DataFrame
    listing_df = pd.DataFrame([listing])
    
    # Predict rent
    predicted_rent = model.predict(listing_df)[0]
    
    # Prepare DataFrame with target for comp filtering
    if not full_df.empty and 'LIST_PRICE' in full_df.columns:
        df_with_target = full_df[features_used + ['LIST_PRICE']].copy()
        
        # Find comps: Similar listings
        comps = df_with_target[
            (df_with_target['ZIP_CODE'] == listing['ZIP_CODE']) &
            (df_with_target['PROP_TYPE'] == listing['PROP_TYPE']) &
            (abs(df_with_target['SQUARE_FEET'] - listing['SQUARE_FEET']) <= 0.1 * listing['SQUARE_FEET']) &
            (df_with_target['NO_BEDROOMS'] == listing['NO_BEDROOMS']) &
            (df_with_target['LIST_PRICE'] > 0)
        ]
        
        if len(comps) >= 5:
            # Calculate statistics
            median_rent = comps['LIST_PRICE'].median()
            mean_rent = comps['LIST_PRICE'].mean()
            min_rent = comps['LIST_PRICE'].min()
            max_rent = comps['LIST_PRICE'].max()
            
            # Calculate percentiles
            p25 = comps['LIST_PRICE'].quantile(0.25)
            p75 = comps['LIST_PRICE'].quantile(0.75)
            
            # Calculate difference from median
            diff_from_median = predicted_rent - median_rent
            diff_percent = (diff_from_median / median_rent) * 100 if median_rent > 0 else 0
            
            # Determine if prediction is within IQR
            within_iqr = p25 <= predicted_rent <= p75
            
            # Create analysis results
            analysis = {
                'predicted_rent': predicted_rent,
                'median_rent': median_rent,
                'mean_rent': mean_rent,
                'min_rent': min_rent,
                'max_rent': max_rent,
                'p25': p25,
                'p75': p75,
                'diff_from_median': diff_from_median,
                'diff_percent': diff_percent,
                'within_iqr': within_iqr,
                'comps': comps
            }
            
            return analysis
    
    # If no comps found or empty dataframe, return basic analysis
    return {
        'predicted_rent': predicted_rent,
        'median_rent': predicted_rent,
        'mean_rent': predicted_rent,
        'min_rent': predicted_rent * 0.8,
        'max_rent': predicted_rent * 1.2,
        'p25': predicted_rent * 0.9,
        'p75': predicted_rent * 1.1,
        'diff_from_median': 0,
        'diff_percent': 0,
        'within_iqr': True,
        'comps': pd.DataFrame()
    }

# Function to plot rent success probability
def plot_rent_success_probability(listing, full_df, model, features_used):
    """
    Plot rent success probability using KDE
    """
    # Predict rent
    listing_df = pd.DataFrame([listing])
    predicted_rent = model.predict(listing_df)[0]
    
    # Get comps
    if not full_df.empty and 'LIST_PRICE' in full_df.columns:
        df_with_target = full_df[features_used + ['LIST_PRICE']].copy()
        comps = df_with_target[
            (df_with_target['ZIP_CODE'] == listing['ZIP_CODE']) &
            (df_with_target['PROP_TYPE'] == listing['PROP_TYPE']) &
            (abs(df_with_target['SQUARE_FEET'] - listing['SQUARE_FEET']) <= 0.1 * listing['SQUARE_FEET']) &
            (df_with_target['NO_BEDROOMS'] == listing['NO_BEDROOMS']) &
            (df_with_target['LIST_PRICE'] > 0)
        ]
        
        if len(comps) < 5:
            st.warning("⚠️ Not enough comparable properties to generate a meaningful probability curve. Using synthetic data for demonstration.")
            # Generate synthetic rent prices
            rent_prices = np.random.normal(predicted_rent, predicted_rent * 0.1, 100)
        else:
            rent_prices = comps['LIST_PRICE'].values
    else:
        st.info("Using synthetic data for demonstration purposes.")
        # Generate synthetic rent prices
        rent_prices = np.random.normal(predicted_rent, predicted_rent * 0.1, 100)
    
    # Use KDE to estimate probability density
    try:
        kde = gaussian_kde(rent_prices)
        
        # Generate rent range for plotting
        min_rent = max(0, min(rent_prices) * 0.8)
        max_rent = max(rent_prices) * 1.2
        rent_range = np.linspace(min_rent, max_rent, 100)
        
        # Evaluate KDE at each point in rent range
        probabilities = kde(rent_range)
        
        # Normalize probabilities to 0-100% for easier interpretation
        probabilities = probabilities / max(probabilities) * 100
        
        # Find probability at predicted rent
        probability_at_prediction = kde(predicted_rent)[0] / max(kde(rent_range)) * 100
        
        # Find the rent with maximum probability
        optimal_rent_index = np.argmax(probabilities)
        optimal_rent = rent_range[optimal_rent_index]
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Plot the probability curve
        ax.plot(rent_range, probabilities, 'b-', linewidth=2)
        
        # Fill under the curve
        ax.fill_between(rent_range, probabilities, alpha=0.3, color='blue')
        
        # Mark the predicted rent
        ax.axvline(x=predicted_rent, color='red', linestyle='--', linewidth=2)
        ax.text(predicted_rent, max(probabilities) * 0.8, f'Predicted: ${predicted_rent:.2f}', 
                rotation=90, verticalalignment='top')
        
        # Mark the optimal rent
        ax.axvline(x=optimal_rent, color='green', linestyle='--', linewidth=2)
        ax.text(optimal_rent, max(probabilities) * 0.9, f'Optimal: ${optimal_rent:.2f}', 
                rotation=90, verticalalignment='top')
        
        # Add labels and title
        ax.set_xlabel('Rental Price ($)')
        ax.set_ylabel('Success Probability (%)')
        ax.set_title('Rental Success Probability by Price')
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        # Add legend
        from matplotlib.lines import Line2D
        legend_elements = [
            Line2D([0], [0], color='red', linestyle='--', linewidth=2, label=f'Predicted: ${predicted_rent:.2f}'),
            Line2D([0], [0], color='green', linestyle='--', linewidth=2, label=f'Optimal: ${optimal_rent:.2f}')
        ]
        ax.legend(handles=legend_elements, loc='upper right')
        
        # Show the plot
        st.pyplot(fig)
        
        # Return the results
        return {
            'predicted_rent': predicted_rent,
            'optimal_rent': optimal_rent,
            'probability_at_prediction': probability_at_prediction,
            'rent_range': rent_range,
            'probabilities': probabilities,
            'comps': comps if 'comps' in locals() else pd.DataFrame()
        }
    
    except Exception as e:
        st.error(f"Error generating probability curve: {str(e)}")
        return None

# Main function
def main():
    """
    Main function to run the Streamlit application
    """
    # Set page title and description
    st.title("Rental Income Prediction Tool")
    st.write("This tool helps real estate investors predict rental income based on property characteristics. Use the sidebar to input property details and see the predicted rental income.")
    
    # Load or create the model
    model, feature_names, numeric_cols, categorical_cols = load_or_create_model()
    
    # Load data for comps analysis
    rental_df, sold_df = load_data()
    
    # Create sidebar for property search
    st.sidebar.title("Property Search")
    address = st.sidebar.text_input("Enter property address")
    
    # Search button
    search_button = st.sidebar.button("Search Property")
    
    # Main content area
    if search_button and address:
        # Get property features from API or generate synthetic data
        property_features, property_data = get_property_features(address)
        
        # Create DataFrame for prediction
        input_df = pd.DataFrame([property_features])
        
        # Make prediction
        predicted_rent = model.predict(input_df)[0]
        
        # Display property details and prediction
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Property Details")
            st.write(f"**Address:** {property_data.get('address', {}).get('streetAddress', 'N/A')}, "
                    f"{property_data.get('address', {}).get('city', 'Boston')}, "
                    f"{property_data.get('address', {}).get('state', 'MA')} "
                    f"{property_data.get('address', {}).get('zipcode', 'N/A')}")
            st.write(f"**Price:** ${property_data.get('price', 'N/A'):,}")
            st.write(f"**Bedrooms:** {property_data.get('bedrooms', 'N/A')}")
            st.write(f"**Bathrooms:** {property_data.get('bathrooms', 'N/A')}")
            st.write(f"**Square Feet:** {property_data.get('livingArea', 'N/A')}")
            st.write(f"**Year Built:** {property_data.get('yearBuilt', 'N/A')}")
            st.write(f"**Property Type:** {property_data.get('propertyType', 'N/A')}")
        
        with col2:
            # Get coordinates and create map
            lat, lon = get_coordinates(address)
            
            if lat and lon:
                create_property_map(lat, lon, property_data)
            else:
                st.warning("Could not determine property location for map display.")
        
        # Display prediction results
        st.header("Prediction Results")
        
        # Analyze rent prediction
        analysis = analyze_rent_prediction(property_features, rental_df, model, feature_names)
        
        # Display predicted rental income
        st.subheader("Predicted Rental Income")
        st.markdown(f"<h1 style='color: #1E88E5;'>${predicted_rent:.2f} per month</h1>", unsafe_allow_html=True)
        
        # Display rent adjustment slider
        st.subheader("Adjust Rental Income")
        st.write("Your Rental Price")
        
        # Set min and max values for slider
        min_price = max(100, analysis['min_rent'] * 0.8)
        max_price = analysis['max_rent'] * 1.2
        
        # Create slider for adjusting rent
        adjusted_rent = st.slider(
            "Adjust rent",
            min_value=float(min_price),
            max_value=float(max_price),
            value=float(predicted_rent),
            step=25.0,
            format="$%.2f"
        )
        
        # Compare adjusted rent with prediction
        if abs(adjusted_rent - predicted_rent) < 0.01:
            st.write("Your price matches the prediction (at market rate)")
        elif adjusted_rent > predicted_rent:
            st.write(f"Your price is ${adjusted_rent - predicted_rent:.2f} above the prediction ({((adjusted_rent / predicted_rent) - 1) * 100:.1f}% higher)")
        else:
            st.write(f"Your price is ${predicted_rent - adjusted_rent:.2f} below the prediction ({((predicted_rent / adjusted_rent) - 1) * 100:.1f}% lower)")
        
        # Display rental success probability
        st.header("Rental Success Probability")
        st.write("This graph shows the probability of successfully renting the property at different price points.")
        
        # Plot rent success probability
        probability_results = plot_rent_success_probability(property_features, rental_df, model, feature_names)
        
        if probability_results:
            # Display optimal rent recommendation
            st.subheader("Rent Optimization")
            
            optimal_rent = probability_results['optimal_rent']
            predicted_rent = probability_results['predicted_rent']
            
            if abs(optimal_rent - predicted_rent) < predicted_rent * 0.01:
                st.success("✅ The predicted rent is very close to the optimal rent based on market data.")
            elif optimal_rent > predicted_rent:
                st.info(f"💡 Consider increasing the rent to ${optimal_rent:.2f} (${optimal_rent - predicted_rent:.2f} more) for optimal market positioning.")
            else:
                st.info(f"💡 Consider decreasing the rent to ${optimal_rent:.2f} (${predicted_rent - optimal_rent:.2f} less) for optimal market positioning.")
        
        # Display comparable properties
        st.header("Comparable Properties")
        
        if 'comps' in analysis and not analysis['comps'].empty and len(analysis['comps']) >= 5:
            st.write(f"Found {len(analysis['comps'])} comparable properties in the same area with similar features.")
            
            # Display comps in a table
            comps_display = analysis['comps'].copy()
            comps_display = comps_display.sort_values('LIST_PRICE')
            
            # Format the display columns
            display_cols = ['ZIP_CODE', 'PROP_TYPE', 'SQUARE_FEET', 'NO_BEDROOMS', 'NO_BATHROOMS', 'LIST_PRICE']
            display_cols = [col for col in display_cols if col in comps_display.columns]
            
            # Rename columns for display
            rename_dict = {
                'ZIP_CODE': 'ZIP Code',
                'PROP_TYPE': 'Property Type',
                'SQUARE_FEET': 'Square Feet',
                'NO_BEDROOMS': 'Bedrooms',
                'NO_BATHROOMS': 'Bathrooms',
                'LIST_PRICE': 'Rent Price'
            }
            
            comps_display = comps_display[display_cols].rename(columns=rename_dict)
            
            # Format the price column
            if 'Rent Price' in comps_display.columns:
                comps_display['Rent Price'] = comps_display['Rent Price'].apply(lambda x: f"${x:.2f}")
            
            st.dataframe(comps_display)
        else:
            st.info("No comparable properties found in the dataset. Using model prediction only.")
        
        # Display model information
        st.header("About the Model")
        
        if CATBOOST_AVAILABLE:
            st.write("""
            This rental income prediction model uses CatBoost, a gradient boosting algorithm that excels at handling categorical features.
            
            **Key advantages of CatBoost:**
            - Handles categorical features natively without one-hot encoding
            - Reduces overfitting with a specialized algorithm
            - Provides robust predictions even with limited data
            
            The model takes into account various factors including property size, number of bedrooms and bathrooms,
            location, and other features to predict the optimal rental income.
            
            The rental success probability is calculated using Kernel Density Estimation (KDE), which analyzes the
            distribution of rental prices for similar properties in the area.
            """)
            
            st.subheader("Potential Model Improvements")
            st.write("""
            The current model could be improved in several ways:
            
            1. **More training data**: Collecting more rental data, especially for diverse property types and locations
            2. **Feature engineering**: Creating additional features like proximity to amenities, school ratings, etc.
            3. **Hyperparameter tuning**: Fine-tuning the CatBoost parameters for better performance
            4. **Seasonal adjustments**: Incorporating time-based features to account for rental market seasonality
            5. **External data integration**: Adding economic indicators, neighborhood statistics, etc.
            """)
        else:
            st.write("""
            This rental income prediction model uses a Random Forest algorithm to estimate rental prices based on
            property characteristics.
            
            The model takes into account various factors including property size, number of bedrooms and bathrooms,
            location, and other features to predict the optimal rental income.
            
            The rental success probability is calculated using Kernel Density Estimation (KDE), which analyzes the
            distribution of rental prices for similar properties in the area.
            
            **Note**: For better performance, consider installing CatBoost, which handles categorical features better
            and often provides more accurate predictions.
            """)
    else:
        st.info("Please enter an address to search for a property.")
    
    # Add footer
    st.markdown("---")
    st.markdown("© 2025 AI-Powered Real Estate Investment Platform")

if __name__ == "__main__":
    main()
