# How to Import a Simulation JSON File

This guide explains how to import the `project-management-simulation.json` file (or any simulation JSON file) into your database.

## Prerequisites

1. Make sure your `.env.local` file contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE`

2. The JSON file should be in the root directory (or provide the path)

## Method 1: Using the Node.js Script (Recommended)

This is the easiest method:

```bash
node import-simulation.js project-management-simulation.json
```

The script will:
- Read the JSON file
- Generate a slug from the title or `slug_suggestion`
- Check if a simulation with that slug already exists
- Insert the simulation into the database
- Display success message with the simulation slug

## Method 2: Using the Admin API Endpoint

If you're authenticated as an admin, you can use the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/attempt/admin/simulations \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-session-cookie" \
  -d @project-management-simulation.json
```

Note: You'll need to be authenticated as an admin. Check your admin authentication setup.

## Method 3: Direct Database Insert (SQL)

For advanced users, you can create a SQL migration file similar to the existing ones in `database/migrations/`.

## JSON File Format

The JSON file should have this structure:

```json
{
  "title": "Simulation Title",
  "slug_suggestion": "optional-slug",
  "rubric": ["Criterion 1", "Criterion 2", ...],
  "steps": [
    {
      "index": 0,
      "kind": "task",
      "role": "Role Name",
      "title": "Task Title",
      "summary_md": "Markdown summary",
      "hint_md": "Hint text",
      "expected_input": {
        "type": "multiple_choice" | "drag_drop" | "text",
        ...
      },
      "stage": 1 | 2 | 3
    },
    ...
  ]
}
```

## Troubleshooting

### Error: Environment variables not set
- Make sure `.env.local` exists and contains the required variables
- Or export them in your shell: `export NEXT_PUBLIC_SUPABASE_URL=...`

### Error: Simulation already exists
- The script will detect if a simulation with the same slug exists
- To update it, use the PUT endpoint: `PUT /api/attempt/admin/simulations/[slug]`

### Error: File not found
- Make sure you're running the script from the project root directory
- Or provide the full path to the JSON file

## Verification

After importing, you can verify the simulation was created by:
1. Visiting `/s/[slug]` in your browser (e.g., `/s/project-management-simulation`)
2. Checking the admin panel at `/admin`
3. Querying the database directly

