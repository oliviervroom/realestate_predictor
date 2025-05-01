import re

DISCLOSURE_KEYWORDS = {
    "structural_issues": {
        "keywords": ["foundation", "crack", "seepage", "leak", "sump pump", "flood", "roof", "mold"],
        "weight": 0.3
    },
    "financing_limitations": {
        "keywords": ["cash only", "not qualify", "rehab loan", "conventional financing"],
        "weight": 0.25
    },
    "property_condition": {
        "keywords": ["as is", "sold as is", "needs work", "unfinished", "no warranties", "estate sale"],
        "weight": 0.2
    },
    "legal_or_disclosure_gaps": {
        "keywords": ["no disclosure", "verify all info", "trustee", "not verified"],
        "weight": 0.1
    },
    "environmental": {
        "keywords": ["radon", "lead", "asbestos", "septic", "environmental testing"],
        "weight": 0.15
    }
}

def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", str(text).lower().strip())

def calculate_disclosure_risk(text: str) -> float:
    text = clean_text(text)
    score = 0.0
    for category, rule in DISCLOSURE_KEYWORDS.items():
        if any(keyword in text for keyword in rule["keywords"]):
            score += rule["weight"]
    return round(min(score, 1.0), 2)
