"""
Import a guest list from a CSV or Excel file into the Supabase `guests` table.

Usage:
    python scripts/import_guests.py --file guests.csv
    python scripts/import_guests.py --file guests.xlsx
"""
import argparse
import sys
from pathlib import Path

import pandas as pd

# Add parent dir to path so we can import supabase_client
sys.path.insert(0, str(Path(__file__).parent.parent))
from supabase_client import supabase

REQUIRED_COLUMNS = {"name", "email"}
OPTIONAL_COLUMNS = {"phone", "dietary_restrictions", "rsvp_status"}


def load_file(path: str) -> pd.DataFrame:
    p = Path(path)
    if p.suffix.lower() in (".xlsx", ".xls"):
        return pd.read_excel(p)
    return pd.read_csv(p)


def clean(df: pd.DataFrame) -> list[dict]:
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Keep only known columns
    keep = REQUIRED_COLUMNS | (OPTIONAL_COLUMNS & set(df.columns))
    df = df[list(keep)].copy()

    # Replace NaN with None so Supabase accepts null values
    return df.where(pd.notna(df), None).to_dict(orient="records")


def main(file_path: str) -> None:
    print(f"Loading {file_path}...")
    df = load_file(file_path)
    rows = clean(df)
    print(f"Found {len(rows)} guests. Upserting into Supabase...")

    result = supabase.table("guests").upsert(rows, on_conflict="email").execute()
    print(f"Done. {len(result.data)} rows upserted.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import guest list into Supabase")
    parser.add_argument("--file", required=True, help="Path to CSV or Excel file")
    args = parser.parse_args()
    main(args.file)
