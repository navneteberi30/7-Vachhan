#!/usr/bin/env python3
"""
Guest List Sync — Google Sheet → Supabase
==========================================
Reads your guest list from a Google Sheet and keeps Supabase in sync.
Also auto-generates unique invite codes for any guest that doesn't have one.

Setup (one-time):
  uv sync                   # install dependencies (preferred)
  # or: pip install gspread supabase python-dotenv

Google Sheet columns (row 1 = header):
  Name | Phone | Email | Table | Meal | Notes | Invite Code  ← auto-filled

Usage:
  uv run sync_guests.py              # sync sheet → Supabase
  uv run sync_guests.py --export     # print current Supabase guest list
  uv run sync_guests.py --reset CODE # clear the claimed_at for a guest code
                                       (use when a guest switches phones)
"""

import os
import sys
import ssl

# ── SSL certificate fix (local developer script only) ─────────────────────────
# On this managed Mac, the corporate CA cert intercepting HTTPS traffic lacks
# the keyUsage extension that Python 3.13 + OpenSSL 3.3 now strictly require.
# ssl._create_unverified_context bypasses this check at the stdlib level,
# which propagates through ALL HTTP libraries (httpx, urllib3, google-auth).
# This is safe for a local admin script — it is never run in production.
ssl._create_default_https_context = ssl._create_unverified_context
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# ──────────────────────────────────────────────────────────────────────────────

_CA_BUNDLE = os.path.expanduser('~/Documents/Munson-(FDE)/complete_ca_bundle.pem')

import random
import string
import argparse
import requests as _requests
import httpx
import gspread
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession, Request as GoogleAuthRequest
from supabase import create_client, ClientOptions
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')    # service role key — has write access
SHEET_ID     = os.getenv('GOOGLE_SHEET_ID')         # from the sheet URL
SHEET_NAME   = os.getenv('GOOGLE_SHEET_NAME', 'Guests')

# Column indices (0-based) — adjust if your sheet differs
COL_NAME   = 0
COL_PHONE  = 1
COL_EMAIL  = 2
COL_TABLE  = 3
COL_MEAL   = 4
COL_NOTES  = 5
COL_CODE   = 6   # auto-filled by this script

CODE_PREFIX = 'NS'   # Nav-Sanju → codes look like NS-A7X2


def make_code(existing_codes: set) -> str:
    """Generate a unique 4-char alphanumeric code like NS-A7X2."""
    chars = string.ascii_uppercase + string.digits
    for _ in range(1000):
        suffix = ''.join(random.choices(chars, k=4))
        code = f'{CODE_PREFIX}-{suffix}'
        if code not in existing_codes:
            return code
    raise RuntimeError('Could not generate a unique code — is the guest list very large?')


def get_sheet():
    """Authenticate with Google Sheets using a service account JSON."""
    sa_file = os.path.join(os.path.dirname(__file__), 'google-service-account.json')
    if not os.path.exists(sa_file):
        print('\n❌  Missing google-service-account.json in backend/')
        print('   1. Go to console.cloud.google.com → IAM → Service Accounts')
        print('   2. Create a service account → Manage Keys → Add Key (JSON)')
        print('   3. Save the downloaded file as backend/google-service-account.json')
        print('   4. Share your Google Sheet with the service account email')
        sys.exit(1)

    SCOPES = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive',
    ]
    creds = service_account.Credentials.from_service_account_file(sa_file, scopes=SCOPES)

    # The OAuth token-refresh request uses a separate internal session inside
    # google-auth (AuthorizedSession.auth_request). We must inject our own
    # session with verify=False into BOTH the auth request and the main session
    # so neither hits the Python 3.13 keyUsage SSL strictness on this Mac.
    auth_inner_session = _requests.Session()
    auth_inner_session.verify = False
    auth_request = GoogleAuthRequest(session=auth_inner_session)

    session = AuthorizedSession(creds, auth_request=auth_request)
    session.verify = False

    gc = gspread.Client(auth=creds, session=session)
    return gc.open_by_key(SHEET_ID).worksheet(SHEET_NAME)


def make_ssl_context() -> ssl.SSLContext:
    """
    Build an SSL context that trusts the system + custom CA bundle but relaxes
    the VERIFY_X509_STRICT flag added in Python 3.13 / OpenSSL 3.3.
    That flag rejects older corporate CA certs that lack the keyUsage extension.
    All other certificate verification (chain, hostname, expiry) still applies.
    """
    ctx = ssl.create_default_context()
    if os.path.exists(_CA_BUNDLE):
        ctx.load_verify_locations(_CA_BUNDLE)
    # Remove the strict keyUsage check introduced in Python 3.13
    ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
    return ctx


def make_supabase():
    """Create a Supabase client with a corporate-friendly SSL context."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print('❌  VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env')
        sys.exit(1)
    http_client = httpx.Client(verify=make_ssl_context())
    return create_client(SUPABASE_URL, SUPABASE_KEY, options=ClientOptions(httpx_client=http_client))


def sync(dry_run=False):
    sb = make_supabase()
    ws = get_sheet()

    rows = ws.get_all_values()
    if len(rows) < 2:
        print('Sheet appears empty (no data rows). Nothing to sync.')
        return

    header, data_rows = rows[0], rows[1:]

    # Load existing codes from Supabase to detect collisions
    existing = sb.table('guests').select('invite_code, id, claimed_at').execute().data
    existing_codes = {r['invite_code'] for r in existing if r['invite_code']}

    upserted, skipped, code_assigned = 0, 0, 0
    sheet_updates = []  # (row_index, col_index, value) for writing codes back

    for row_idx, row in enumerate(data_rows, start=2):   # row 2 in sheet (1-indexed)
        # Pad short rows
        while len(row) <= COL_CODE:
            row.append('')

        name  = row[COL_NAME].strip()
        phone = row[COL_PHONE].strip()
        email = row[COL_EMAIL].strip().lower()
        table = row[COL_TABLE].strip()
        meal  = row[COL_MEAL].strip()
        notes = row[COL_NOTES].strip()
        code  = row[COL_CODE].strip().upper()

        if not name:
            skipped += 1
            continue

        # Generate code if missing
        if not code:
            code = make_code(existing_codes)
            existing_codes.add(code)
            sheet_updates.append((row_idx, COL_CODE + 1, code))   # gspread is 1-indexed
            code_assigned += 1

        guest_record = {
            'name':        name,
            'phone':       phone  or None,
            'email':       email  or None,
            'table_number': int(table) if table.isdigit() else None,
            'meal_preference': meal  or None,
            'notes':       notes  or None,
            'invite_code': code,
        }

        if dry_run:
            print(f'  [DRY] Would upsert: {name} → {code}')
        else:
            sb.table('guests').upsert(
                guest_record,
                on_conflict='invite_code'
            ).execute()

        upserted += 1

    # Write generated codes back to the sheet
    if sheet_updates and not dry_run:
        for row_i, col_i, val in sheet_updates:
            ws.update_cell(row_i, col_i, val)
        print(f'✅  Wrote {len(sheet_updates)} new invite code(s) back to sheet')

    print(f'\n✅  Sync complete')
    print(f'   Upserted:       {upserted} guests')
    print(f'   Codes assigned: {code_assigned}')
    print(f'   Skipped:        {skipped} empty rows')


def export_guests():
    sb = make_supabase()
    guests = sb.table('guests').select('*').order('name').execute().data
    print(f'\n{"Name":<25} {"Code":<12} {"Claimed":<8} {"Table":<6} Phone')
    print('-' * 70)
    for g in guests:
        claimed = '✓' if g.get('claimed_at') else '–'
        print(f'{g["name"]:<25} {g["invite_code"]:<12} {claimed:<8} {str(g.get("table_number") or ""):<6} {g.get("phone") or ""}')
    print(f'\nTotal: {len(guests)} guests')


def reset_guest(code):
    sb = make_supabase()
    code = code.strip().upper()
    result = sb.table('guests').update({
        'claimed_at': None,
        'session_token': None,
    }).eq('invite_code', code).execute()

    if result.data:
        name = result.data[0].get('name', code)
        print(f'✅  Reset claim for {name} ({code}) — they can now log in on a new device')
    else:
        print(f'❌  No guest found with code {code}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Sync guest list from Google Sheet to Supabase')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without writing')
    parser.add_argument('--export', action='store_true', help='Print current guest list from Supabase')
    parser.add_argument('--reset', metavar='CODE', help='Reset a guest\'s device claim so they can log in again')
    args = parser.parse_args()

    if args.export:
        export_guests()
    elif args.reset:
        reset_guest(args.reset)
    else:
        sync(dry_run=args.dry_run)
