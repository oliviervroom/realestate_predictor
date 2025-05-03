## Overview
This is the public repo version of our project.


# Attributions
The initial structure and code for the front-end was generated using bolt.new. Then, changes were made to it accordingly using the cursor IDE and manual coding. 

# Rental Income Prediction Application
This application provides a user interface for real estate investors to find investment opportunities, and displays predicted rental and sale prices, which were calculated using AI models.

## Set up guide
# Start back-end first

1. Clone the repo:
`git clone https://github.com/oliviervroom/realestate_predictor.git`

2. Change directory: `cd realestate_predictor/Backend/inal-cs682`

3. Create a virtual environment (recommended, using conda):
`conda create --name your_env_name python=3.10.12`

4. Activate the virtual environment:
 `conda activate your_env_name`

5. Install the requirements:
`pip install -r requirements.txt`

6. Run the Flask app:
`python3 app.py`

# Start front-end
> The following steps require [NodeJS](https://nodejs.org/en/) to be installed on your system, so please
> install it beforehand if you haven't already.
Make sure you have gitignore and the env file. 

To get started with your project, you'll first need to install the dependencies with:

```
> Make a new terminal 
cd realestate_predictor/Frontend

npm install --legacy-peer-deps
```

then npm start

#How it works

- **Frontend (React):**
  - Users search for properties and view details in the browser.
  - When a price prediction is needed, the frontend sends the property data to the backend using an API call to `/api/predict`.
  - The frontend displays the predicted price, loading states, and any errors.

- **Backend (Flask):**
  - Receives property data from the frontend at the `/api/predict` endpoint.
  - Preprocesses the data to match the model's expected format.
  - Loads a trained TensorFlow model and uses it to predict the property price.
  - Returns the predicted price as a JSON response.

- **How it works together:**
  1. User interacts with the React app (e.g., views a property).
  2. The React app sends property data to the Flask backend for prediction.
  3. Flask preprocesses the data, runs the model, and returns the prediction.
  4. The React app displays the result to the user.

# Property Data and MLS Prediction Logic

- **Property details** are found using the Realty API, which provides general property information for search and display.
- **MLS Data Limitation:** The machine learning models were trained using MLS (Multiple Listing Service) data, which is proprietary and expensive to access. Only properties present in the local MLS dataset can be used for true sale price predictions.
- **Prediction Logic:**
  - If a property is found in the local MLS dataset, the backend can make a real sale price prediction using the trained model.
  - If the property is not in the MLS dataset, the app displays a placeholder prediction instead.
- This approach ensures that only properties with available MLS data receive accurate AI-driven sale price predictions, while all other properties show estimated or placeholder values.

## File Structure
Overview:
Frontend/index.js: First JS file that runs when application starts, calls App.js
App.js: controls routing (e.g. /MA/Boston/Ashmont-250) and imports components
   Home.JS: Lets users search for a property using State, City, ZIP code, or address
      SearchBar


Frontend/PropertyInfo.js: Shows detailed info about a specific property 

   

