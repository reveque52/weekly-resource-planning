# Weekly Resource Planning

Local weekly resource planning app for viewing, editing, and reporting AM/PM project assignments.

## Run locally

```powershell
npm.cmd start
```

Then open:

```text
http://localhost:8080/
```

## Default login

- User name: `admin`
- Email: `selcuk.dere@fit-global.com`
- Password: `admin123`

Users and permissions are stored in the local SQLite database. Use the Resources screen to maintain users, passwords, and read, change, delete, and admin permissions.

## Workflow notes

- Use the Organization tab to view reporting lines.
- Admin users can assign a manager to each user.
- Plan changes generate local mail drafts for the person and their manager.
- Approving a draft week generates personal HTML weekly plan mail drafts.
- This local demo previews mail content; real sending requires a backend/SMTP or SAP mail integration.

## Tech

- HTML
- CSS
- Vanilla JavaScript
- Node.js server
- SQLite via Node.js `node:sqlite`

## Data

The app reads initial planning data from `webapp/model/planning.json`.

Runtime changes are stored in SQLite:

```text
data/app.db
```

The database file is ignored by Git. The schema is documented in:

```text
db/schema.sql
```

The browser keeps only the active session id in `localStorage`; planning data, users, projects, roles, mail drafts, deleted weeks, and search variants are persisted through `/api/state`.
