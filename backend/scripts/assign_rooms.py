"""
Assign confirmed guests to rooms and push the assignments to Supabase.

Strategy (default): sequential round-robin fill – assign guests alphabetically,
filling each room to capacity before moving to the next.

Usage:
    python scripts/assign_rooms.py
    python scripts/assign_rooms.py --dry-run
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from supabase_client import supabase


def fetch_confirmed_guests() -> list[dict]:
    result = supabase.table("guests").select("id, name").eq("rsvp_status", "confirmed").order("name").execute()
    return result.data


def fetch_rooms() -> list[dict]:
    result = supabase.table("rooms").select("id, room_number, capacity").order("room_number").execute()
    return result.data


def build_assignments(guests: list[dict], rooms: list[dict]) -> list[dict]:
    assignments = []
    guest_iter = iter(guests)

    try:
        for room in rooms:
            for _ in range(room["capacity"]):
                guest = next(guest_iter)
                assignments.append({"guest_id": guest["id"], "room_id": room["id"]})
    except StopIteration:
        pass  # all guests assigned before rooms are full

    return assignments


def push_assignments(assignments: list[dict]) -> None:
    # Clear existing assignments first, then insert fresh ones
    supabase.table("room_assignments").delete().neq("guest_id", "00000000-0000-0000-0000-000000000000").execute()
    if assignments:
        supabase.table("room_assignments").insert(assignments).execute()


def main(dry_run: bool = False) -> None:
    guests = fetch_confirmed_guests()
    rooms = fetch_rooms()
    print(f"Confirmed guests: {len(guests)}  |  Available rooms: {len(rooms)}")

    assignments = build_assignments(guests, rooms)
    print(f"\nAssignment plan ({len(assignments)} guests assigned):")
    for a in assignments:
        guest = next(g for g in guests if g["id"] == a["guest_id"])
        room = next(r for r in rooms if r["id"] == a["room_id"])
        print(f"  {guest['name']} → Room {room['room_number']}")

    if dry_run:
        print("\n[Dry run] No changes pushed to Supabase.")
    else:
        push_assignments(assignments)
        print("\nAssignments pushed to Supabase.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Assign guests to rooms")
    parser.add_argument("--dry-run", action="store_true", help="Print assignments without writing to Supabase")
    args = parser.parse_args()
    main(dry_run=args.dry_run)
