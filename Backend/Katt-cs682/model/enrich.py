import pandas as pd

def enrich_listing(query: dict, full_df: pd.DataFrame, address_col: str = "ADDRESS"):
    """
    Try to find a matching address in the full dataset.
    If found, fill missing fields from the dataset row.

    Parameters:
    - query: UI-provided input (must include 'line')
    - full_df: dataset with known properties
    - address_col: name of the column storing addresses

    Returns:
    - enriched listing (dict)
    - source: "existing_data" or "query_input"
    """
    address = query.get("line", "").strip().lower()
    match = full_df[full_df[address_col].str.lower().str.strip() == address]

    if not match.empty:
        enriched = match.iloc[0].to_dict()
        enriched.update({k: v for k, v in query.items() if v})  # override with query
        return enriched, "existing_data"
    else:
        return query.copy(), "query_input"
