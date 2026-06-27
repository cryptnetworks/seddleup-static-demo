# SeddleUp Static Demo

This repository contains a dependency-free static demo of the SeddleUp application experience. It uses local browser state and demo data, so it can run without Next.js, Prisma, authentication, or a server database.

## Run

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Test

Run the syntax check and Node test suite:

```bash
npm run check
npm test
```

In VS Code, use the `test` task to run the suite or the `Debug tests` launch configuration to step through it.

## Demo Scope

- Dashboard summaries for trips, participants, expenses, and settlement status.
- Trip list and trip detail views.
- Participant management.
- Expense creation, editing, filtering, and status changes.
- Balance and settlement calculations using the same model as the main app.
- Local reset back to bundled demo data.

Browser changes are stored in `localStorage`.
