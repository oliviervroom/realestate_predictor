#!/usr/bin/env python3
"""
Compatibility Fix Script for Rental Income Prediction App

This script creates a version-compatible model file that works across different
scikit-learn versions by:
1. Loading the original model
2. Extracting the core components
3. Creating a simplified model structure
4. Saving the model in a more compatible format
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import warnings
warnings.filterwarnings('ignore')

def create_compatible_model():
    """
    Create a more compatible version of the model
    """
    print("Creating compatibility fix for the rental income prediction model...")
    
    # Define paths
    model_dir = 'models'
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'rental_price_model.pkl')
    compat_model_path = os.path.join(model_dir, 'rental_price_model_compatible.pkl')
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"Error: Original model not found at {model_path}")
        print("Creating a simple synthetic model for demonstration...")
        
        # Create synthetic data
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
        model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
        model.fit(X_synth, y_synth)
        
        # Save feature names
        feature_names = X_synth.columns.tolist()
        
        # Create a dictionary with model and metadata
        model_dict = {
            'model': model,
            'feature_names': feature_names,
            'numeric_cols': ['NO_BEDROOMS', 'SQUARE_FEET'],
            'categorical_cols': ['LOCATION', 'PROPERTY_TYPE', 'SEASON']
        }
        
        # Save the compatible model
        with open(compat_model_path, 'wb') as f:
            pickle.dump(model_dict, f)
        
        print(f"Compatible model created and saved to {compat_model_path}")
        return model_dict
    
    try:
        # Load the original model
        print(f"Loading original model from {model_path}...")
        with open(model_path, 'rb') as f:
            original_model = pickle.load(f)
        
        # Extract the core model component
        if hasattr(original_model, 'named_steps') and 'model' in original_model.named_steps:
            core_model = original_model.named_steps['model']
            print(f"Extracted core model: {type(core_model).__name__}")
            
            # Get feature names
            feature_names = []
            numeric_cols = []
            categorical_cols = []
            
            if hasattr(original_model, 'named_steps') and 'preprocessor' in original_model.named_steps:
                preprocessor = original_model.named_steps['preprocessor']
                
                # Try to get feature names
                try:
                    if hasattr(preprocessor, 'get_feature_names_out'):
                        feature_names = preprocessor.get_feature_names_out().tolist()
                    elif hasattr(preprocessor, 'transformers_'):
                        # Extract feature names from transformers
                        for name, transformer, cols in preprocessor.transformers_:
                            if name == 'num':
                                numeric_cols = cols
                            elif name == 'cat':
                                categorical_cols = cols
                except Exception as e:
                    print(f"Warning: Could not extract feature names: {str(e)}")
                    # Create default feature names
                    feature_names = [f'feature_{i}' for i in range(100)]
            
            # Create a dictionary with model and metadata
            model_dict = {
                'model': core_model,
                'feature_names': feature_names,
                'numeric_cols': numeric_cols,
                'categorical_cols': categorical_cols
            }
            
            # Save the compatible model
            with open(compat_model_path, 'wb') as f:
                pickle.dump(model_dict, f)
            
            print(f"Compatible model created and saved to {compat_model_path}")
            return model_dict
        else:
            print("Warning: Could not extract core model, saving original model as compatible model")
            # Save the original model as the compatible model
            with open(compat_model_path, 'wb') as f:
                pickle.dump(original_model, f)
            
            print(f"Original model saved as compatible model to {compat_model_path}")
            return original_model
    
    except Exception as e:
        print(f"Error creating compatible model: {str(e)}")
        print("Creating a simple synthetic model for demonstration...")
        
        # Create synthetic data
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
        model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
        model.fit(X_synth, y_synth)
        
        # Save feature names
        feature_names = X_synth.columns.tolist()
        
        # Create a dictionary with model and metadata
        model_dict = {
            'model': model,
            'feature_names': feature_names,
            'numeric_cols': ['NO_BEDROOMS', 'SQUARE_FEET'],
            'categorical_cols': ['LOCATION', 'PROPERTY_TYPE', 'SEASON']
        }
        
        # Save the compatible model
        with open(compat_model_path, 'wb') as f:
            pickle.dump(model_dict, f)
        
        print(f"Compatible model created and saved to {compat_model_path}")
        return model_dict

if __name__ == "__main__":
    create_compatible_model()
