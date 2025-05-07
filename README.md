## Overview
This is the public repo version of our project, for CS682. See bottom of ReadME for set-up guide.


# Attributions
The initial structure and code for the front-end was generated using bolt.new. Then, changes were made to it accordingly using the cursor IDE and manual coding. 

**Authors 
<br/>Kattayun Ensafitakaldani**, **Olivier Vroom**, **Inal Mashukov**, **Bhavana Manneni**
**May 7<sup>th</sup>, 2025**

**🧠 Overview: A Modular AI-Powered Platform for Real Estate Evaluation**

We designed and implemented a modular, AI-driven platform to help real estate investors **assess, price, and evaluate property listings** with greater intelligence and automation. For a brief (2 minute) demo/explanation of how to use it, you can watch: [tinyurl.com/IREIA-demo](https://tinyurl.com/IREIA-demo).


The system is built around four core components:

1. **$ Price Prediction**
2. **📈 Rent Prediction & Optimization**
3. **🚩 Risk & Fraud Assessment**
4. **🛠 Renovation Opportunity Detection**

Together, these modules enable users to make **data-informed investment decisions** by analyzing both structured property data and unstructured listing text.


1. **$ Price Prediction**
   Predicts the price of a property using the property features. For detailed explanation, see the readMe in /Backend/inal-cs682.

**📈 2. Rent Prediction & Optimization**

**🧮 Rent Prediction**

We use **CatBoost**, a high-performance gradient boosting algorithm optimized for datasets with mixed numerical and categorical features. It’s particularly effective for real estate data because:

- It handles missing values and categorical encoding internally.
- It delivers accurate rent estimates using:
  - **Location features** (ZIP code, neighborhood)
  - **Structural features** (sqft, bedrooms, bathrooms)
  - **Property type and age**

The model is trained on historical rental data and generalizes well to unseen listings.

**🎯 3. Rent Optimization**

After predicting rent, we refine it by comparing the property with **similar nearby listings** using a similarity filter based on:

- Property type (e.g., condo, single-family)
- Size range (±10%)
- Bedroom/bath count
- Nearby ZIP code or neighborhood

We then apply **Kernel Density Estimation (KDE)** on the comparable rents to model the full price probability distribution. This helps us identify:

- **Fast-Rent Price** – high probability of rental success
- **Balanced Market Price** – aligns with market median
- **Max-Return Price** – potential for highest profit with slightly longer wait

**Key Principle:** Similar properties in the same area should yield similar rent. KDE enables investors to choose price points strategically based on market probability.

**🚩 4. Risk & Fraud Assessment**

Our risk analysis module is designed to flag both **visible and hidden risk indicators** across financial, legal, structural, and data integrity domains.

**🟡 1. Basic Risk Scoring**

We define five major risk categories:

- Price deviation
- Property completeness
- Physical condition
- Lease terms
- Data consistency

Each sub-feature within these categories is assigned a **score between 0 and 1**, and the cumulative sum gives the overall **risk score**. This allows for transparent, explainable scoring per listing.

**📃 2. Disclosure Risk via NLP**

Text-based risk signals are extracted from fields like DISCLOSURES, REMARKS, and COMMENTS. Using **natural language processing**, we analyze:

- Sentiment (e.g., negative vs. neutral language)
- Red flags like “as-is”, “not responsible”, “lien”, “dispute”

These indicators are often not structured in tabular data but can suggest legal or repair-related concerns.

**🕵️ 3. Fraudulent Entry Detection**

Some listings are not just risky—they may be **suspicious or manipulated**. Our fraud detection flags such entries by checking for:

- Conflicting entries with same address but different features
- Unrealistic attribute values (e.g., 12 bathrooms, 1 sqft)
- Missing or illogical values (e.g., year built in the future)
- Duplicate LIST_NO entries with different prices

Each fraud-prone listing is tagged with a boolean is_fraud flag for easy filtering and follow-up.

**🛠 Renovation Opportunity Detection**

Renovation potential is rarely structured, so we use **lightweight NLP models** and **keyword pattern matching** to uncover hidden fixer-upper opportunities.

**🧠 How Fraudelent Entry Detection Works**

We scan property descriptions (REMARKS, DISCLOSURES, etc.) for renovation-related phrases like:

- “TLC needed”
- “Contractor special”
- “Sold as-is”
- “Fixer-upper”
- “Needs work”

If such phrases are found **and** the listing price is significantly below market average, the property is flagged as a **renovation candidate**.

**🧭 Why It Matters**

Many investors **actively seek** undervalued homes that need cosmetic or structural improvements. Renovations often yield:

- Higher resale value
- Better rental income
- Long-term asset appreciation

By surfacing these opportunities proactively, our platform helps investors spot hidden gems often buried in text.

**✅ Final Outcome**

This modular pipeline brings together machine learning, rules-based logic, and natural language processing to:

- Improve pricing accuracy
- Flag high-risk or suspicious listings
- Surface profitable renovation opportunities

It is designed for transparency, explainability, and flexibility—allowing property investors to filter, evaluate, and decide with confidence.

# How Front-end and Back-end (price prediction) work

- **Frontend (React):**
  - Users search for properties and view details in the browser.
  - When a price prediction is needed, the frontend sends the property data to the backend using an API call to `/api/predict`.
  - When a rent prediction is needed, the frontend sends the address to the backend using an API call to `api/rent-insights/${address}`;
  - The frontend displays property info and the corresponding predicted price, predicted rent, loading states, and any errors.

- **Backend for the price prediction (Flask):**
  - Receives property data from the frontend at the `/api/predict` endpoints.
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
- **MLS Data Limitation:** The machine learning models were trained using MLS (Multiple Listing Service) data, which is proprietary and expensive to access. Therefore, only properties present in the local MLS dataset can be used for true sale price predictions. 
- **Prediction Logic:**
  - If a property is found in the local MLS dataset, the backend can make a real sale price prediction using the trained model.
  - If the property is not in the MLS dataset, the app displays a placeholder prediction instead.
- This approach ensures that only properties with available MLS data receive accurate AI-driven sale price predictions, while all other properties show estimated or placeholder values.

## File Structure
## Frontend File Structure

### Core Files
- `src/index.js`: Entry point of the React application, renders the root App component
- `src/App.js`: Main application component that handles routing and layout structure
  - Routes include: Home (/), Properties (/zip/:postal_code, /:state, /:state/:city), PropertyInfo (/:state/:city/:address, /property/:id), PropertyListings, Changelog, and MLSSearch

### Screens
- `screens/Home/`: Landing page component with property search functionality
- `screens/Properties/`: Displays property listings based on location (state, city, or zip code)
- `screens/PropertyInfo/`: Detailed view of a specific property
- `screens/propertyListings/`: Shows a list of all available properties
- `screens/MLSSearch.js`: MLS (Multiple Listing Service) search interface
- `screens/Frame/`: Layout wrapper component for consistent page structure

### Components
- `components/Changelog/`: Displays application version history and updates
- `components/DevToggle/`: Development mode toggle with context provider
  - Includes DevContext for managing development features

### Supporting Files
- `theme.js`: Material-UI theme configuration
- `version.js`: Version tracking and management
- `services/`: API and backend service integrations
- `styles/`: Global styling and CSS modules
- `constants/`: Application-wide constants and configuration
- `data/`: Static data and mock data for development

### Public Assets
- `public/`: Static assets, images, and public files

### Configuration
- `package.json`: Project dependencies and scripts
- `start-dev.sh`: Development server startup script


## Set up guide
For a brief (4 minute) video explanation, you can watch: [tinyurl.com/IREIA-setup](https://tinyurl.com/IREIA-setup)

1. Clone the repo:
`git clone https://github.com/oliviervroom/realestate_predictor.git`

# Start back-end first
## Rental prediction back-end
### 1. Install dependencies

```bash
cd realestate_predictor/Backend/katt-cs682`
conda create --name envname   
conda activate envname
pip3 install pandas flask catboost scikit-learn
pip3 install flask_cors
python3 app.py
```

## Sale prediction model
1. Change directory: `cd realestate_predictor/Backend/inal-cs682`

2. Create a virtual environment (recommended, using conda):
`conda create --name your_env_name python=3.10.12`

3. Activate the virtual environment:
 `conda activate your_env_name`

4. Install the requirements:
`pip install -r requirements.txt`

5. Run the Flask app:
`python3 app.py`

# Start front-end
> The following steps require [NodeJS](https://nodejs.org/en/) to be installed on your system, so please
> install it beforehand if you haven't already.
Make sure you have gitignore and the env file. 

To get started with your project, you'll first need to install the dependencies with:

```
> Make a new terminal!
cd realestate_predictor/Frontend

npm install --legacy-peer-deps
npm start
```
Enjoy!

   

