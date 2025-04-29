from flask import Flask, render_template, request
import tensorflow as tf
import pandas as pd
import numpy as np
import os

app = Flask(__name__)

# Load model once when the app starts
MODEL_PATH = "./experiments/model-1"
model = tf.keras.models.load_model(MODEL_PATH)

# Feature list (to ensure consistent column ordering)
FEATURES_PATH = "./data/features.csv"
feature_df = pd.read_csv(FEATURES_PATH)
feature_columns = feature_df.columns.tolist()

@app.route("/", methods=['GET'])
def home():
    return render_template('index.html')

@app.route("/", methods=['POST'])
def predict():
    if 'inputvector' not in request.files:
        return "No file part"

    file = request.files['inputvector']
    if file.filename == '':
        return "No selected file"

    try:
        # Read uploaded file into DataFrame
        input_df = pd.read_csv(file, header = None)

        # Ensure same order of columns
        # input_df = input_df[feature_columns]

        # Reshape if only 1 sample
        if input_df.shape[0] != 1:
            return "Expected a single input vector (1 row of features)."

        prediction = model.predict(input_df)

        return f"<h2 class='text-center mt-5'>Predicted Rent: ${prediction:,.2f}</h2>"

    except Exception as e:
        return f"An error occurred: {str(e)}"

if __name__ == '__main__':
    app.run(port=3000, debug=True)


# from flask import Flask, render_template, request


# app = Flask(__name__)

# # // create routes
# # goes to localhost:3000, accepts GET request
# @app.route("/", methods = ['GET']) 
# def hello():
#     return render_template('index.html')

# # still at homepage : '/'
# @app.route('/', methods = ['POST'])
# def predict():
#     # get data, preprocess, and predict
#     inputvector = request.files['inputvector']
#     data_path = './data/'

# if __name__ == '__main__':
#     app.run(port=3000, debug = True)
