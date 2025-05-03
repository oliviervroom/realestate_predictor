# Written by Inal Mashukov
# for CS 682
# University of Massachusetts Boston

import tensorflow as tf
import numpy as np
from sklearn.model_selection import train_test_split
import pandas as pd
import argparse

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Make prediction for i-th sample in test set.")
    parser.add_argument("--indexprop", type=int, required=True, help="Index of the test sample to evaluate")
    args = parser.parse_args()
    i = args.indexprop

    # Step 1: Load the model
    model_path = "./experiments/model-1"
    model = tf.keras.models.load_model(model_path)

    # Paths 
    features_path = "./data/features.csv"
    targets_path = "./data/targets.csv"

    # Load data
    X = pd.read_csv(features_path)
    y = pd.read_csv(targets_path)

    if len(y.columns) == 1:
        y = y.iloc[:, 0]

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

    print("********************* SHAPES ********************** \n")
    print(X_train.shape, X_val.shape, X_test.shape, y_train.shape, y_val.shape, y_test.shape)
    print("*************************************************** \n")

    # Ensure index is within bounds
    if i < 0 or i >= len(X_test):
        raise IndexError(f"Index i={i} is out of bounds for X_test of length {len(X_test)}.")

    sample_input = X_test.iloc[i].values.reshape(1, -1)
    prediction = model.predict(sample_input)

    print(f"Actual value for sample {i} in y_test: {y_test.iloc[i]} \n")
    print("\nPrediction for the sample in X_test: \n")
    print(prediction)

    print(f"\n ************* \n Absolute error between the two: {abs(prediction - y_test.iloc[i])} \n ************* \n ")

if __name__ == "__main__":
    main()
