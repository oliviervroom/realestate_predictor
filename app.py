#!/usr/bin/env python3
"""
Rental Income Prediction Web Application

This application provides a user interface for real estate investors to:
1. Input property characteristics and see predicted rental income
2. Adjust rental prices and compare with predictions
3. View explanations of which features most influenced the prediction
"""

import os
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import shap
import streamlit as st
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder, RobustScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Define directories
MODEL_DIR = './models'
DATA_DIR = './model_data'
TEMP_DIR = './temp'

# Create temp directory if it doesn't exist
os.makedirs(TEMP_DIR, exist_ok=True)

# Function to load the trained model
@st.cache_resource
def load_model():
    """
    Load the trained rental price prediction model
    """
    model_path = os.path.join(MODEL_DIR, 'rental_price_model.pkl')
    
    # Check if model exists
    if not os.path.exists(model_path):
        # If model doesn't exist, create a simple model for demonstration
        print("Model not found, creating a simple model for demonstration")
        
        # Load the feature-engineered data
        data_path = os.path.join(DATA_DIR, 'feature_engineered_data.csv')
        if os.path.exists(data_path):
            df = pd.read_csv(data_path)
            
            # Prepare data for modeling
            X = df.drop(columns=['LIST_PRICE'])
            y = df['LIST_PRICE']
            
            # Identify numeric and categorical columns
            numeric_cols = X.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
            
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
                ])
            
            # Create and train a simple model
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
            st.error("Error: Model and training data not found. Please train the model first.")
            return None, None, None, None
    else:
        # Load the existing model
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Load feature information
        data_path = os.path.join(DATA_DIR, 'feature_engineered_data.csv')
        if os.path.exists(data_path):
            df = pd.read_csv(data_path)
            X = df.drop(columns=['LIST_PRICE'])
            feature_names = X.columns.tolist()
            numeric_cols = X.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
        else:
            feature_names = []
            numeric_cols = []
            categorical_cols = []
        
        return model, feature_names, numeric_cols, categorical_cols

# Function to get feature importance and explanations
def get_feature_importance(model, feature_names):
    """
    Get feature importance from the model
    """
    # Check if model is a pipeline with a tree-based model
    if hasattr(model, 'named_steps') and 'model' in model.named_steps:
        model_step = model.named_steps['model']
        
        # Check if the model has feature_importances_ attribute
        if hasattr(model_step, 'feature_importances_'):
            # Get feature names after preprocessing
            if hasattr(model, 'named_steps') and 'preprocessor' in model.named_steps:
                preprocessor = model.named_steps['preprocessor']
                if hasattr(preprocessor, 'get_feature_names_out'):
                    try:
                        feature_names_out = preprocessor.get_feature_names_out()
                        importances = model_step.feature_importances_
                        
                        # Ensure lengths match
                        if len(importances) == len(feature_names_out):
                            # Create a DataFrame with feature names and importances
                            feature_importance = pd.DataFrame({
                                'Feature': feature_names_out,
                                'Importance': importances
                            })
                            feature_importance = feature_importance.sort_values('Importance', ascending=False)
                            return feature_importance
                    except:
                        pass
            
            # Fallback: use original feature names
            importances = model_step.feature_importances_
            
            # Create a DataFrame with feature names and importances
            feature_importance = pd.DataFrame({
                'Feature': feature_names,
                'Importance': importances[:len(feature_names)] if len(importances) > len(feature_names) else importances
            })
            feature_importance = feature_importance.sort_values('Importance', ascending=False)
            return feature_importance
    
    # Fallback: return empty DataFrame
    return pd.DataFrame(columns=['Feature', 'Importance'])

# Function to generate SHAP explanations
def generate_shap_explanations(model, X_sample):
    """
    Generate SHAP explanations for a prediction
    """
    try:
        # Check if model is a pipeline with a tree-based model
        if hasattr(model, 'named_steps') and 'model' in model.named_steps:
            model_step = model.named_steps['model']
            
            # Preprocess the data
            if hasattr(model, 'named_steps') and 'preprocessor' in model.named_steps:
                preprocessor = model.named_steps['preprocessor']
                X_processed = preprocessor.transform(X_sample)
                
                # Create explainer
                explainer = shap.TreeExplainer(model_step)
                
                # Calculate SHAP values
                shap_values = explainer.shap_values(X_processed)
                
                # Get feature names after preprocessing
                if hasattr(preprocessor, 'get_feature_names_out'):
                    try:
                        feature_names_out = preprocessor.get_feature_names_out()
                        
                        # Create a DataFrame with feature names and SHAP values
                        shap_df = pd.DataFrame({
                            'Feature': feature_names_out,
                            'SHAP Value': shap_values[0]
                        })
                        shap_df = shap_df.sort_values('SHAP Value', key=abs, ascending=False)
                        return shap_df
                    except:
                        pass
        
        # Fallback: return empty DataFrame
        return pd.DataFrame(columns=['Feature', 'SHAP Value'])
    except:
        # Fallback: return empty DataFrame
        return pd.DataFrame(columns=['Feature', 'SHAP Value'])

# Function to create a sample input for prediction
def create_sample_input(feature_names, numeric_cols, categorical_cols):
    """
    Create a sample input for prediction based on user inputs
    """
    # Create a dictionary to store user inputs
    input_data = {}
    
    # Add key features with user inputs
    if 'NO_BEDROOMS' in feature_names:
        input_data['NO_BEDROOMS'] = st.sidebar.slider('Number of Bedrooms', 0, 5, 2)
    
    if 'SQUARE_FEET' in feature_names:
        input_data['SQUARE_FEET'] = st.sidebar.slider('Square Footage', 300, 3000, 1000)
    
    # Add location features
    location_features = [col for col in feature_names if any(term in col.lower() for term in ['town', 'neighborhood', 'zip'])]
    if location_features:
        location_feature = location_features[0]
        location_options = ['Boston', 'Cambridge', 'Somerville', 'Brookline', 'Newton', 'Waltham', 'Quincy']
        selected_location = st.sidebar.selectbox('Location', location_options)
        input_data[location_feature] = selected_location
    
    # Add property type features
    property_type_features = [col for col in feature_names if 'property_size_category' in col.lower()]
    if property_type_features:
        property_type_feature = property_type_features[0]
        property_type_options = ['small', 'medium', 'large', 'very_large']
        selected_property_type = st.sidebar.selectbox('Property Size Category', property_type_options)
        input_data[property_type_feature] = selected_property_type
    
    # Add seasonal features
    seasonal_features = [col for col in feature_names if 'season' in col.lower()]
    if seasonal_features:
        season_feature = seasonal_features[0]
        season_options = ['winter', 'spring', 'summer', 'fall']
        selected_season = st.sidebar.selectbox('Season', season_options)
        input_data[season_feature] = selected_season
    
    # Add month features
    month_features = [col for col in feature_names if 'list_month' in col.lower()]
    if month_features:
        month_feature = month_features[0]
        month_options = list(range(1, 13))
        selected_month = st.sidebar.selectbox('Month', month_options)
        input_data[month_feature] = selected_month
    
    # Add bedroom category features
    bedroom_category_features = [col for col in feature_names if 'bedroom_category' in col.lower()]
    if bedroom_category_features:
        bedroom_category_feature = bedroom_category_features[0]
        bedroom_category_options = ['studio', 'one_bedroom', 'two_bedroom', 'three_bedroom', 'four_plus_bedroom']
        selected_bedroom_category = st.sidebar.selectbox('Bedroom Category', bedroom_category_options)
        input_data[bedroom_category_feature] = selected_bedroom_category
    
    # Add additional features
    st.sidebar.markdown("### Additional Features")
    show_advanced = st.sidebar.checkbox("Show Advanced Features")
    
    if show_advanced:
        # Add more numeric features
        for col in numeric_cols[:5]:  # Limit to first 5 numeric features
            if col not in input_data and col != 'LIST_PRICE':
                # Determine reasonable min/max values
                min_val = 0
                max_val = 100
                default_val = 50
                
                if 'price' in col.lower():
                    min_val = 500
                    max_val = 5000
                    default_val = 2000
                elif 'sqft' in col.lower() or 'square' in col.lower():
                    min_val = 300
                    max_val = 3000
                    default_val = 1000
                elif 'bed' in col.lower() or 'room' in col.lower():
                    min_val = 0
                    max_val = 5
                    default_val = 2
                elif 'bath' in col.lower():
                    min_val = 1
                    max_val = 4
                    default_val = 1
                elif 'density' in col.lower() or 'ratio' in col.lower():
                    min_val = 0.0
                    max_val = 1.0
                    default_val = 0.5
                    
                input_data[col] = st.sidebar.slider(col, min_val, max_val, default_val)
        
        # Add more categorical features
        for col in categorical_cols[:3]:  # Limit to first 3 categorical features
            if col not in input_data:
                # Provide some default options
                options = ['Option 1', 'Option 2', 'Option 3']
                
                if 'town' in col.lower() or 'city' in col.lower() or 'location' in col.lower():
                    options = ['Boston', 'Cambridge', 'Somerville', 'Brookline', 'Newton']
                elif 'type' in col.lower() or 'category' in col.lower():
                    options = ['Type A', 'Type B', 'Type C']
                elif 'season' in col.lower():
                    options = ['winter', 'spring', 'summer', 'fall']
                
                input_data[col] = st.sidebar.selectbox(col, options)
    
    # Fill in any missing features with default values
    for feature in feature_names:
        if feature not in input_data:
            if feature in numeric_cols:
                input_data[feature] = 0
            else:
                input_data[feature] = 'unknown'
    
    # Create a DataFrame with the input data
    input_df = pd.DataFrame([input_data])
    
    return input_df

# Main function to run the Streamlit app
def main():
    """
    Main function to run the Streamlit app
    """
    # Set page title and description
    st.set_page_config(
        page_title="Rental Income Prediction",
        page_icon="💰",
        layout="wide"
    )
    
    st.title("Rental Income Prediction Tool")
    st.markdown("""
    This tool helps real estate investors predict rental income based on property characteristics.
    Use the sidebar to input property details and see the predicted rental income.
    """)
    
    # Load the model and feature information
    model, feature_names, numeric_cols, categorical_cols = load_model()
    
    if model is None:
        st.error("Error: Failed to load or create model. Please check the logs.")
        return
    
    # Create two columns for the main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("Prediction Results")
        
        # Create sample input based on user inputs
        input_df = create_sample_input(feature_names, numeric_cols, categorical_cols)
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        # Display prediction
        st.subheader("Predicted Rental Income")
        st.markdown(f"<h1 style='color: #1E88E5;'>${prediction:.2f} per month</h1>", unsafe_allow_html=True)
        
        # Allow user to adjust the prediction
        st.subheader("Adjust Rental Income")
        adjusted_price = st.slider("Your Rental Price", 
                                  float(max(0, prediction * 0.5)), 
                                  float(prediction * 1.5), 
                                  float(prediction))
        
        # Calculate and display difference
        difference = adjusted_price - prediction
        difference_percent = (difference / prediction) * 100
        
        if difference > 0:
            st.markdown(f"<p style='color: green;'>Your price is <b>${difference:.2f}</b> higher than the prediction ({difference_percent:.1f}% above market rate)</p>", unsafe_allow_html=True)
        elif difference < 0:
            st.markdown(f"<p style='color: red;'>Your price is <b>${abs(difference):.2f}</b> lower than the prediction ({abs(difference_percent):.1f}% below market rate)</p>", unsafe_allow_html=True)
        else:
            st.markdown("<p>Your price matches the prediction (at market rate)</p>", unsafe_allow_html=True)
        
        # Display market positioning
        st.subheader("Market Positioning")
        
        # Create a gauge chart to show market positioning
        fig, ax = plt.subplots(figsize=(10, 2))
        
        # Define the range (50% below to 50% above prediction)
        min_val = prediction * 0.5
        max_val = prediction * 1.5
        
        # Create a horizontal bar for the range
        ax.barh(0, max_val - min_val, left=min_val, height=0.5, color='lightgray')
        
        # Add markers for min, prediction, and max
        ax.scatter([min_val, prediction, max_val], [0, 0, 0], color=['red', 'blue', 'green'], s=100, zorder=5)
        
        # Add a marker for the adjusted price
        ax.scatter([adjusted_price], [0], color='orange', s=150, marker='*', zorder=10)
        
        # Add labels
        ax.text(min_val, 0.7, 'Below Market', ha='center', va='bottom', color='red')
        ax.text(prediction, 0.7, 'Market Rate', ha='center', va='bottom', color='blue')
        ax.text(max_val, 0.7, 'Above Market', ha='center', va='bottom', color='green')
        ax.text(adjusted_price, -0.7, 'Your Price', ha='center', va='top', color='orange')
        
        # Remove y-axis and set x-axis limits
        ax.set_ylim(-1, 1)
        ax.set_xlim(min_val * 0.9, max_val * 1.1)
        ax.set_yticks([])
        ax.spines['left'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['top'].set_visible(False)
        
        # Format x-axis labels as currency
        ax.xaxis.set_major_formatter('${x:,.0f}')
        
        plt.tight_layout()
        st.pyplot(fig)
    
    with col2:
        st.header("Feature Importance")
        
        # Get feature importance
        feature_importance = get_feature_importance(model, feature_names)
        
        if not feature_importance.empty:
            # Display top 10 features
            st.subheader("Top 10 Influential Features")
            
            # Create a bar chart of feature importance
            fig, ax = plt.subplots(figsize=(10, 8))
            sns.barplot(x='Importance', y='Feature', data=feature_importance.head(10), ax=ax)
            ax.set_title('Top 10 Features by Importance')
            ax.set_xlabel('Importance')
            ax.set_ylabel('Feature')
            plt.tight_layout()
            st.pyplot(fig)
            
            # Generate SHAP explanations for this specific prediction
            st.subheader("Prediction Explanation")
            shap_values = generate_shap_explanations(model, input_df)
            
            if not shap_values.empty:
                # Display top 5 features that influenced this prediction
                st.markdown("### Factors Influencing This Prediction")
                
                # Create a horizontal bar chart of SHAP values
                fig, ax = plt.subplots(figsize=(10, 6))
                colors = ['red' if x < 0 else 'green' for x in shap_values.head(5)['SHAP Value']]
                sns.barplot(x='SHAP Value', y='Feature', data=shap_values.head(5), palette=colors, ax=ax)
                ax.set_title('Top 5 Factors Influencing This Prediction')
                ax.set_xlabel('Impact on Prediction')
                ax.set_ylabel('Feature')
                plt.tight_layout()
                st.pyplot(fig)
                
                # Provide text explanations
                st.markdown("### Explanation")
                
                for _, row in shap_values.head(5).iterrows():
                    feature = row['Feature']
                    shap_value = row['SHAP Value']
                    
                    # Clean up feature name for display
                    display_feature = feature.replace('preprocessor__num__', '').replace('preprocessor__cat__', '')
                    
                    if shap_value > 0:
                        st.markdown(f"- **{display_feature}**: Increased the predicted rent by **${shap_value:.2f}**")
                    else:
                        st.markdown(f"- **{display_feature}**: Decreased the predicted rent by **${abs(shap_value):.2f}**")
            else:
                st.info("SHAP explanations are not available for this model or prediction.")
        else:
            st.info("Feature importance information is not available for this model.")
    
    # Display property details
    st.header("Property Details")
    
    # Create three columns for property details
    detail_col1, detail_col2, detail_col3 = st.columns(3)
    
    with detail_col1:
        st.subheader("Basic Information")
        if 'NO_BEDROOMS' in input_df.columns:
            st.markdown(f"**Bedrooms:** {input_df['NO_BEDROOMS'].values[0]}")
        if 'SQUARE_FEET' in input_df.columns:
            st.markdown(f"**Square Footage:** {input_df['SQUARE_FEET'].values[0]}")
        
        # Display location information
        location_cols = [col for col in input_df.columns if any(term in col.lower() for term in ['town', 'neighborhood', 'zip'])]
        if location_cols:
            st.markdown(f"**Location:** {input_df[location_cols[0]].values[0]}")
    
    with detail_col2:
        st.subheader("Seasonal Information")
        # Display seasonal information
        season_cols = [col for col in input_df.columns if 'season' in col.lower()]
        if season_cols:
            st.markdown(f"**Season:** {input_df[season_cols[0]].values[0]}")
        
        # Display month information
        month_cols = [col for col in input_df.columns if 'month' in col.lower()]
        if month_cols:
            month_map = {
                1: 'January', 2: 'February', 3: 'March', 4: 'April',
                5: 'May', 6: 'June', 7: 'July', 8: 'August',
                9: 'September', 10: 'October', 11: 'November', 12: 'December'
            }
            month_value = input_df[month_cols[0]].values[0]
            month_name = month_map.get(month_value, month_value)
            st.markdown(f"**Month:** {month_name}")
    
    with detail_col3:
        st.subheader("Property Characteristics")
        # Display property type information
        property_type_cols = [col for col in input_df.columns if 'property_size_category' in col.lower()]
        if property_type_cols:
            st.markdown(f"**Property Size Category:** {input_df[property_type_cols[0]].values[0]}")
        
        # Display bedroom category information
        bedroom_category_cols = [col for col in input_df.columns if 'bedroom_category' in col.lower()]
        if bedroom_category_cols:
            st.markdown(f"**Bedroom Category:** {input_df[bedroom_category_cols[0]].values[0]}")
    
    # Add information about the model
    st.header("About the Model")
    st.markdown("""
    This rental income prediction model was trained on a comprehensive dataset of rental properties.
    The model takes into account various factors including property characteristics, location, and
    seasonal trends to predict the optimal rental income.
    
    The model's predictions are based on historical rental data and market trends, providing
    real estate investors with data-driven insights for optimizing rental income.
    """)
    
    # Add footer
    st.markdown("---")
    st.markdown("© 2025 AI-Powered Real Estate Investment Platform")

if __name__ == "__main__":
    main()
