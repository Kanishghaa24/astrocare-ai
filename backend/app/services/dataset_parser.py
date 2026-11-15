import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List

def process_uploaded_dataset(file_path: str, filename: str) -> Dict[str, Any]:
    """
    Parses and cleans imported NASA research datasets (CSV/Excel).
    Dynamically infers data types, detects missingness, duplicates, and builds descriptive stats.
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(file_path)
    elif ext in [".xls", ".xlsx"]:
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported format. Please upload CSV or Excel (.xlsx).")

    initial_rows = len(df)
    initial_cols = len(df.columns)

    # Duplicate check
    duplicate_count = int(df.duplicated().sum())

    # Detect missing values
    missing_counts = df.isnull().sum().to_dict()
    missing_pct = {col: round(float((count / initial_rows) * 100), 2) for col, count in missing_counts.items()}

    # Data types detection
    column_types = {}
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            column_types[col] = "Numeric"
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            column_types[col] = "DateTime"
        else:
            column_types[col] = "Categorical / Text"

    # Descriptive summary for numeric columns
    numeric_summary = {}
    numeric_cols = [c for c, t in column_types.items() if t == "Numeric"]
    for col in numeric_cols[:10]: # summarize top 10 numeric columns
        valid_vals = df[col].dropna()
        if len(valid_vals) > 0:
            numeric_summary[col] = {
                "mean": round(float(valid_vals.mean()), 2),
                "std": round(float(valid_vals.std()), 2) if len(valid_vals) > 1 else 0.0,
                "min": round(float(valid_vals.min()), 2),
                "max": round(float(valid_vals.max()), 2),
                "median": round(float(valid_vals.median()), 2)
            }

    # Generate preview rows (first 10 records, NaN replaced with null)
    clean_preview_df = df.head(10).replace({np.nan: None})
    preview_rows = clean_preview_df.to_dict(orient="records")

    return {
        "filename": filename,
        "rows_count": initial_rows,
        "columns_count": initial_cols,
        "columns": list(df.columns),
        "column_types": column_types,
        "duplicate_count": duplicate_count,
        "missing_counts": missing_counts,
        "missing_percentages": missing_pct,
        "numeric_summary": numeric_summary,
        "preview_rows": preview_rows
    }
