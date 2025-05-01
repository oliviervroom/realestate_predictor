# Written by Inal Mashukov
# for CS 682
# University of Massachusetts Boston

import tensorflow as tf
import numpy as np
from sklearn.model_selection import train_test_split
import pandas as pd

def main():
    # Step 1: Load the model
    model_path = "./experiments/model-1"  # best so far: model-1 
    model = tf.keras.models.load_model(model_path)

    # Paths 
    features_path = "./data/features.csv"
    targets_path = "./data/targets.csv"

    # Load data
    X = pd.read_csv(features_path)
    y = pd.read_csv(targets_path)

    # Check if y has only one column and convert to a Series if so
    if len(y.columns) == 1:
        y = y.iloc[:, 0]  # Convert the DataFrame to Series by selecting the first (and only) column
        
    # (again) otherwise, the shape will end up being (n, 1), which is incorrect ! y.shape must be (n,).

    # Split the data into training, validation, and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

    # Print the shapes of the datasets
    print("********************* SHAPES ********************** \n")
    print(X_train.shape, X_val.shape, X_test.shape, y_train.shape, y_val.shape, y_test.shape)
    print("*************************************************** \n")

    # Take a sample from the test set
    sample_input = X_test.iloc[1].values.reshape(1, -1)  # Take a sample
    prediction = model.predict(sample_input)

    # Print actual value and predicted value for the 2nd sample
    print(f"Actual value for 2nd sample in y_test: {y_test.iloc[1]} \n")
    print("\n Prediction for the 2nd sample in X_test: \n")
    print(prediction)

    # Calculate and print MAE between the actual and predicted values
    print(f"\n ************* \n MAE between the two: {abs(prediction - y_test.iloc[1])} \n ************* \n ")

if __name__ == "__main__":
    main()
