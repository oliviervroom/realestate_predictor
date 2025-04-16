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


Frontend/PropertyDetails.js: React component that displays detailed info about a specific property. 
Frontend/PropertyListings.js

Frontend/PropertyInfo.js: Currently unused Component that Bhav made. 

Detailed:
Frontend/PropertyDetails.js: React component that displays detailed info about a specific property. 
   Here's what it does:
   Data Fetching:
   Uses useParams to get the property ID from the URL
   Calls getPropertyDetails from realtyApi.js to fetch property data
   Shows a loading spinner while data is being fetched
   Navigation:
   Has a back button to return to the previous page
   Uses React Router's useNavigate for navigation
   UI Components:
   Displays a large property image
   Shows key property details:
   Price (formatted with commas)
   Number of bedrooms
   Number of bathrooms
   Square footage
   Full address

