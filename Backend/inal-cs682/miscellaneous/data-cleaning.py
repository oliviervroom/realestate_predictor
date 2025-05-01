import pandas as pd
'''
This is coming from the original notebook script that was used to clean the data.
This is meant to serve as reference for future needs.
'''
# 1. Load and Combine Data
data = pd.concat([
    pd.read_csv('house-prices1.csv'),
    pd.read_csv('house-prices2.csv'),
    pd.read_csv('house-prices3.csv'),
    pd.read_csv('house-prices4.csv'),
    pd.read_csv('house-prices5.csv'),
    pd.read_csv('house-prices6.csv')
])

# 2. Select and Filter Columns 
columns_to_keep = [
    "LIST_PRICE", "NO_BEDROOMS", "NO_FULL_BATHS", "NO_HALF_BATHS", 
    "TOTAL_BATHS", "SQUARE_FEET", "AboveGradeFinishedArea", 
    "SQUARE_FEET_INCL_BASE", "LIST_PRICE_PER_SQFT", "PRICE_PER_SQFT", 
    "PROP_TYPE", "YEAR_BUILT", "TOTAL_PARKING_SF", "COUNTY", 
    "TAXES", "BASEMENT", "FIRE_PLACES", "ASSESSMENTS" 
]
df = data[columns_to_keep].dropna()

# 3. Data Transformation and Encoding
df["SQUARE_FEET_INCL_BASE"] = df["SQUARE_FEET_INCL_BASE"].map({"Yes": 1, "No": 0}).astype(int)
df["BASEMENT"] = df["BASEMENT"].map({"Yes": 1, "No": 0}).astype(int)

# One-hot encoding for categorical variables
categorical_cols = ["PROP_TYPE", "COUNTY"] 
df = pd.get_dummies(df, columns=categorical_cols, dtype=int) 

# Convert boolean columns to integers (True -> 1, False -> 0)

# Convert boolean columns to integers, if any
for col in df.select_dtypes(include=['bool']).columns:
    df[col] = df[col].astype(int)


# 4. Outlier Handling (using IQR)
continuous_columns = [
    'NO_BEDROOMS', 'NO_FULL_BATHS', 'NO_HALF_BATHS', 'TOTAL_BATHS',
    'SQUARE_FEET', 'AboveGradeFinishedArea', 'SQUARE_FEET_INCL_BASE',
    'LIST_PRICE_PER_SQFT', 'PRICE_PER_SQFT', 'YEAR_BUILT', 'TOTAL_PARKING_SF',
    'TAXES', 'BASEMENT', 'FIRE_PLACES', 'ASSESSMENTS'
]
for col in continuous_columns:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    df = df[(df[col] >= Q1 - 1.5 * IQR) & (df[col] <= Q3 + 1.5 * IQR)]

# 5. Prepare for Machine Learning (Convert to float)
X = df.drop(columns=['LIST_PRICE'])  # Features (all columns except 'LIST_PRICE')
y = df['LIST_PRICE']  # Target variable ('LIST_PRICE')

X = X.astype(float) 
y = y.astype(float)

# 6. Save Cleaned Data 
# X.to_csv('features.csv', index=False)
# y.to_csv('targets.csv', index=False)

df.to_csv('final-cleaned_data.csv', index=False) #Saving complete data
