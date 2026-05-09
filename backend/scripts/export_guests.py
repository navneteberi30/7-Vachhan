"""
Export the current guest list from Supabase to a CSV or Excel file.

Usage:
    python scripts/export_guests.py --output guests_export.csv
    python scripts/export_guests.py --output guests_export.xlsx
"""
import argparse
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))
from supabase_client import supabase


def fetch_guests() -> list[dict]:
    result = (
        supabase
        .table("guests")
        .select("*, room_assignments(rooms(room_number)), rsvp_responses(attending, meal_choice)")
        .order("name")
        .execute()
    )
    return result.data


def flatten(guests: list[dict]) -> list[dict]:
    rows = []
    for g in guests:
        room = None
        if g.get("room_assignments"):
            room = g["room_assignments"][0].get("rooms", {}).get("room_number")
        rsvp = g.get("rsvp_responses", [{}])
        attending = rsvp[0].get("attending") if rsvp else None
        meal = rsvp[0].get("meal_choice") if rsvp else None

        rows.append({
            "name": g.get("name"),
            "email": g.get("email"),
            "phone": g.get("phone"),
            "rsvp_status": g.get("rsvp_status"),
            "dietary_restrictions": g.get("dietary_restrictions"),
            "attending": attending,
            "meal_choice": meal,
            "room_number": room,
        })
    return rows


def main(output_path: str) -> None:
    print("Fetching guests from Supabase...")
    guests = fetch_guests()
    rows = flatten(guests)
    df = pd.DataFrame(rows)

    p = Path(output_path)
    if p.suffix.lower() in (".xlsx", ".xls"):
        df.to_excel(p, index=False)
    else:
        df.to_csv(p, index=False)

    print(f"Exported {len(df)} guests to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export guest list from Supabase")
    parser.add_argument("--output", default="guests_export.csv", help="Output file path (.csv or .xlsx)")
    args = parser.parse_args()
    main(args.output)
