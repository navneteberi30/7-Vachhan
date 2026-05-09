# Stitch — UI Design Exports

This folder stores UI screen designs fetched from [Google Stitch](https://stitch.withgoogle.com) via the `user-stitch` MCP server already connected in Cursor.

## How to Pull Screens from Stitch

Use the Stitch MCP tools directly from Cursor's agent chat:

### 1. List your Stitch projects

Ask the agent:
> "List my Stitch projects"

This calls `list_projects` and returns project IDs and names.

### 2. Browse screens in a project

Ask the agent:
> "List screens in project [project-id]"

This calls `list_screens` with your project ID.

### 3. Fetch a specific screen

Ask the agent:
> "Get the Guest List screen from Stitch and save it to stitch/exports/"

This calls `get_screen` and the agent will write the design output into `stitch/exports/`.

## Folder Structure

```
stitch/
└── exports/
    ├── dashboard.json        # Fetched screen designs (auto-generated)
    ├── guest-list.json
    ├── rsvp.json
    ├── room-assignment.json
    └── notifications.json
```

## Using Designs in the Frontend

Once a screen is exported, ask the agent to convert it into a React component:
> "Convert stitch/exports/guest-list.json into a React component at frontend/src/pages/GuestList.jsx"

The agent uses the `get_screen` output to generate accurate, design-matched components.
