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
- Email: `admin@company.local`
- Password: `admin123`

Users and permissions are stored in the browser for this local demo. Use the Resources screen to maintain users, passwords, and read, change, delete, and admin permissions.

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
- Node.js static server

## Data

The app reads planning data from `webapp/model/planning.json` and stores browser-side draft changes in `localStorage`.
