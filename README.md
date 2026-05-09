# Wedding App

A guest RSVP and room assignment management app for weddings.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React (JavaScript) |
| Database / Auth / Realtime | Supabase |
| Backend Scripts | Python 3.11+ |
| UI Design | Google Stitch (via MCP) |

## Repository Structure

```
.
├── frontend/       Vite + React app (guest-facing RSVP + admin dashboard)
├── backend/        Python scripts for guest list management & notifications
├── supabase/       Database migrations, schema, and seed data
├── stitch/         UI design exports pulled from Google Stitch via MCP
└── .env.example    Environment variable template
```

## Getting Started

### 1. Clone and configure environment

```bash
cp .env.example .env
# Fill in your Supabase project URL and keys
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Python backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Supabase local development

```bash
supabase start
supabase db push
```

### 5. Pull designs from Google Stitch

Use the `user-stitch` MCP tools (`list_projects`, `list_screens`, `get_screen`) from within
Cursor to fetch the latest screen designs into `stitch/exports/`.

## Database Tables

| Table | Purpose |
|---|---|
| `guests` | Guest records with RSVP status |
| `rooms` | Hotel/venue room inventory |
| `room_assignments` | Guest ↔ Room mapping |
| `rsvp_responses` | Submitted RSVP form data |

## Key Scripts (backend/)

| Script | What it does |
|---|---|
| `scripts/import_guests.py` | Import guest list from CSV/Excel into Supabase |
| `scripts/export_guests.py` | Download current guest list as CSV/Excel |
| `scripts/assign_rooms.py` | Run room assignment logic and push results to Supabase |
| `notifications/push_notifications.py` | Send push notifications to guests |
