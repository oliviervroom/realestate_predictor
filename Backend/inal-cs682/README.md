Written entirely by Inal Mashukov for CS 682.
Use `model-1` (best performance).

See project requirements and tree in `requirements.txt`, `tree.txt`.


# Overview

1. Clone the repo:
`git clone https://github.com/oliviervroom/realestate_predictor.git`

2. Change directory: `cd realestate_predictor/Backend/inal-cs682`

3. Create a virtual environment (recommended, using conda):
`conda create --name your_env_name python=3.10.12`

4. Activate the virtual environment:
 `conda activate your_env_name`

5. Install the requirements:
`pip install -r requirements.txt`

6. To run the Flask app:
`python3 app.py`

7. Open the app in browser. Alternatively, run `evaluate.py` to use the model for interence, `train.py` to train the model.
Use `Backend/inal-cs682/miscellaneous/sample-API-response.csv` as sample input.


# General Documentation:
### Note: individual programs have documentation within the programs themselves.

- `inal-cs682` is the root directory of the project and the root directory to which all relative paths refer.

- `config/config.json` is the file containing the configuration parameters for the model (hyperparameters) and the training process.

- `data/` directory contains the X (`features.csv`) and the target Y (`targets.csv`) files, which come from Olivier's data cleaned using 
miscellaneous/data-cleaning.py 

- `evaluate.py` picks a feature vector of a property (see the script), and makes a prediction based on it, (while also comparing the prediction to the actual observed value corresponding to the feature vector if it comes from the dataset). 
BE MINDFUL OF HOW YOU USE THIS SCRIPT: it computes the mean absolute error (MAE) between the prediction and the observed value, but if your observed value specified in the script doesn't match the corresponding feature vector, the MAE computation will make no sense, as the prices are for different properties. 

  - NOTE: `evaluate.py` is meant for demonstration purposes, its functionality is integrated into `app.py`. Same goes for `data-cleaning.py`, which is meant to be used for reference if needed, and was only applied on the original training data.

- `experiments/` directory contains some of the saved training results, although the model saved as model-1 performs best, so the remaining ones can be (and have been) disposed of. The training logs can be found in the corresponding log files.

- `app.py` is the Flask-based app for web-based deployment of the model.

- `templates/index.html` is the webpage used to interface with the model via `app.py`.

- `src/models/model.py` contains the model itself, it is an MLP written in Tensorflow, please see source code for details and extensive documentation

- `src/utils/data_loader.py` loads the data into the model

- `train.py` is the training script

- `requirements.txt` has all of the required tools and package versions

- `preprocess.py` contains functions that transform raw API data and make it compatible with the model - property features are extracted, encoded, etc. Note that the functionality of `preprocess.py` is integrated into `app.py`, whereas the former was simply the original program containing that functionality.
