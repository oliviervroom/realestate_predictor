# Attributions
The initial structure and code was generated using bolt.new. Then, changes were made to it accordingly. 

# Rental Income Prediction Application

## Overview
This is the public repo version of our project.



This application provides a user interface for real estate investors to:
1. Input property characteristics and see predicted rental income
2. Adjust rental prices and compare with predictions
3. View explanations of which features most influenced the prediction


## File Structure
Overview:
Frontend/index.js: First JS file that runs when application starts, calls App.js
App.js: controls routing (e.g. /MA/Boston/Ashmont-250) and imports components
   Home.JS: Lets users search for a property using State, City, ZIP code, or address
      SearchBar


Frontend/PropertyInfo.js: Shows detailed info about a specific property 

To run sale prediction front-end, do python app.py