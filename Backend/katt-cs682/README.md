# 🏡 Real Estate Rent Predictor

## 🔧 Features

### 1. **Rent Prediction**
- Predicts rent using a trained `CatBoostRegressor` model.
- Input: `LIST_NO` and listing dataset.
- Module: `predict.py`

### 2. **Rental Optimization**
- Compares rent against similar listings.
- Provides adjustment suggestions based on market median.
- Module: `optimization.py`

### 3. **Fraud Detection**
- Flags duplicated addresses as potential frauds.
- Works on full dataset or single row.
- Module: `fruad.py`

### 4. **Renovation Candidate Detection**
- Detects phrases indicating repair needs in listing disclosures.
- Module: `renovation.py`

### 5. **Disclosure Risk Analysis**
- Evaluates risk from keywords in the `DISCLOSURES` field.
- Scores listings based on structural, financial, legal, or environmental concerns.
- Module: `disclosure.py`

### 6. **Scoring Pipeline**
- Combines all above methods to generate a total risk score.
- Module: `scoring.py`

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
pip install pandas flask catboost
```

### 2. Prepare your data

Place a cleaned CSV file named `cleaned_data.csv` in the root directory. It must include fields like `LIST_NO`, `ADDRESS`, `ZIP_CODE`, `DISCLOSURES`, etc.

### 3. Run in CLI mode

```bash
python __init__.py
```

You’ll be prompted to enter `LIST_NO` for:
- Rent prediction
- Rental optimization
- Risk evaluation

### 4. Run Web UI

```bash
python app.py
```

Then open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser to use the interactive interface.

---

## 🧠 Example Output

```text
# Predicted Rent
LIST_NO: 12345
Predicted Rent: $2800.00

# Optimization Insight
💡 Could increase (Priced lower than comps)
You could raise rent by $150...

# Risk Scoring
Total Risk Score: 0.75
Renovation Candidate: Yes
Fraud Flag: No
```

---

## 📁 File Overview

| File | Description |
|------|-------------|
| `app.py` | Flask app for web interface |
| `__init__.py` | CLI interface for rent prediction and scoring |
| `predict.py` | Preprocessing and rent prediction functions |
| `optimization.py` | Optimization logic using comps |
| `fruad.py` | Fraud detection logic |
| `disclosure.py` | Risk rules based on disclosure text |
| `renovation.py` | Renovation keyword scanner |
| `scoring.py` | Full scoring pipeline for risk/fraud/renovation |
| `rent_predictor_model.cbm` | Trained CatBoost model (binary file) |

---

## 🛠 Troubleshooting

**❌ Issue**: Getting file not found or model loading errors?

✅ **Fix**: The problem is likely due to incorrect file paths.

Make sure the following files are in the correct location:
- `rent_predictor_model.cbm`
- `cleaned_data.csv`

### 🔍 File Path Locations in Code

- In `__init__.py`:
  - **Line 7**: Loads CSV → `df_all = pd.read_csv(data_set)`
  - **Line 10**: Loads model → `model.load_model("rent_predictor_model.cbm")`

- In `app.py`:
  - **Line 10**: Loads CSV → `df_all = pd.read_csv("cleaned_data.csv")`
  - **Line 13**: Loads model → `model.load_model("rent_predictor_model.cbm")`

If you move the model or CSV, update the file paths in those lines accordingly.
