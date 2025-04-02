# Rental Income Prediction Application

## Overview
This is the public repo version of our project.



This application provides a user interface for real estate investors to:
1. Input property characteristics and see predicted rental income
2. Adjust rental prices and compare with predictions
3. View explanations of which features most influenced the prediction

## Deployment Instructions

### Local Deployment
1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the Streamlit application:
   ```
   streamlit run app.py
   ```

3. Access the application in your web browser at http://localhost:8501

### Cloud Deployment

#### Streamlit Cloud
1. Create an account on Streamlit Cloud (https://streamlit.io/cloud)
2. Connect your GitHub repository containing this application
3. Deploy the application with a few clicks

#### Heroku
1. Install the Heroku CLI and log in
2. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
3. Add a Procfile with the following content:
   ```
   web: streamlit run app.py
   ```
4. Deploy the application:
   ```
   git push heroku main
   ```

#### AWS Elastic Beanstalk
1. Install the AWS CLI and EB CLI
2. Initialize an Elastic Beanstalk application:
   ```
   eb init -p python-3.10 rental-income-prediction
   ```
3. Create an environment and deploy:
   ```
   eb create rental-income-env
   ```

## File Structure
- `app.py`: Main Streamlit application
- `requirements.txt`: Required Python dependencies
- `models/rental_price_model.pkl`: Trained machine learning model
- `model_data/feature_engineered_data.csv`: Feature-engineered dataset

## Customization
You can customize the application by modifying the `app.py` file. The application is built with Streamlit, which makes it easy to add new features and visualizations.

## Troubleshooting
- If the model file is not found, the application will create a simple model for demonstration purposes
- Ensure all dependencies are installed correctly
- Check that the file paths in the application match your deployment environment
