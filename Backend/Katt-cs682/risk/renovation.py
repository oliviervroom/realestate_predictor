import re

RENOVATION_KEYWORDS = [
    "as is", "sold as-is", "needs work", "unfinished", "estate sale",
    "older systems", "end of life", "not working", "foundation",
    "leak", "seepage", "mold", "title 5", "basement water"
]

def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", str(text).lower().strip())

def is_renovation_candidate(text: str) -> bool:
    text = clean_text(text)
    return any(keyword in text for keyword in RENOVATION_KEYWORDS)
