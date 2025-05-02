import re

RENOVATION_KEYWORDS = [
    "as is", "sold as-is", "needs work", "unfinished", "estate sale",
    "older systems", "end of life", "not working", "foundation",
    "leak", "seepage", "mold", "title 5", "basement water"
]

# --- Utility Functions ---
def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", str(text).lower().strip())

def keyword_in_text(text: str, keyword: str) -> bool:
    return re.search(rf"\b{re.escape(keyword)}\b", text) is not None
# --- Renovation Detection ---

def is_renovation_candidate(text: str) -> bool:
    text = clean_text(text)
    return any(keyword_in_text(text, kw) for kw in RENOVATION_KEYWORDS)
