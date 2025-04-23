# Written by Inal Mashukov
# for CS 682
# University of Massachusetts Boston

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def load_data(features_path: str, targets_path: str,
              test_size: float = 0.2, val_size: float = 0.2):
    
    '''
    load_data() method loads data from a features dataset X and a target dataset y,
    stored as .csv files.

    Args:

        - features_path : path to the features .csv file
        - targets_path : path to the targets .csv file 
        - test_size : size of the testing set, default: 20%
        - val_size : size of the validation set, default: 20% 

    returns X_train, X_val, X_test, y_train, y_val, y_test
    '''
    

    X = pd.read_csv(features_path)
    y = pd.read_csv(targets_path)
    

    if len(y.columns) == 1:
        y = y.iloc[:, 0]  # Convert the DataFrame to Series by selecting the first (and only) column
    # otherwise, the shape will end up being (n, 1), which is incorrect ! y.shape must be (n,).
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, 
                                                        test_size=test_size, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, 
                                                      test_size=val_size, random_state=42)

    print("********************* SHAPES ********************** \n")
    print(X_train.shape, X_val.shape, X_test.shape, y_train.shape, y_val.shape, y_test.shape)
    print("*************************************************** \n")
    
    return X_train, X_val, X_test, y_train, y_val, y_test




# VERSION WITH NORMALIZATION APPLIED:
# import pandas as pd
# import numpy as np
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import MinMaxScaler

# def load_data(features_path: str, targets_path: str,
#               test_size: float = 0.2, val_size: float = 0.2):
    
#     X = pd.read_csv(features_path)
#     y = pd.read_csv(targets_path) 

#     X_train, X_test, y_train, y_test = train_test_split(X, y, 
#                                                         test_size=test_size, random_state=42)

#     X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, 
#                                                       test_size=val_size, random_state=42)


#     binary_columns = [col for col in X_train.columns if X_train[col].isin([0, 1]).all()]

#     non_binary_columns = [col for col in X_train.columns if col not in binary_columns]
    
#     scaler_X = MinMaxScaler()
#     X_train_non_binary = X_train[non_binary_columns]
#     X_val_non_binary = X_val[non_binary_columns]
#     X_test_non_binary = X_test[non_binary_columns]
    
#     X_train[non_binary_columns] = scaler_X.fit_transform(X_train_non_binary)
#     X_val[non_binary_columns] = scaler_X.transform(X_val_non_binary)
#     X_test[non_binary_columns] = scaler_X.transform(X_test_non_binary)

#     # Normalize the target variable y
#     scaler_y = MinMaxScaler()
#     y_train = scaler_y.fit_transform(y_train)
#     y_val = scaler_y.transform(y_val)
#     y_test = scaler_y.transform(y_test)

#     return X_train, X_val, X_test, y_train, y_val, y_test

