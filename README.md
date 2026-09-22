# PlanetPulse

## Submission details

- **Track:** Track 2 — Real-World AI Products
- **Product brief:** PlanetPulse — Carbon Footprint Tracker
- **Live app:** https://planetpulse-q1n7.onrender.com
- **Standard API:** No. The brief does not define a fixed external API contract; PlanetPulse uses a custom Express REST API and is fully accessible through the browser interface.
- **Test credentials:** None required. Authentication is intentionally not implemented, so graders can access every feature immediately.

### Required feature checklist

- [x] Activity logging with automatic, fixed-factor CO₂ calculation.
- [x] Dashboard totals, weekly trend, category breakdown, and recent activity.
- [x] Weekly target setting and an actionable exceeded-target nudge.
- [x] Filterable, sortable activity history with deletion.
- [x] Invalid and absurd-input protection with review and override.

PlanetPulse is a full-stack carbon footprint tracker built for a hackathon. It helps people log everyday activities, understand their CO₂ impact, and stay within a personal weekly carbon budget.

## Highlights

- Log car, bus, flight, electricity, vegetarian meal, and non-vegetarian meal activities.
- Calculate emissions deterministically from the fixed hackathon emission factors.
- View total footprint, the Monday–Sunday weekly total, remaining budget, activity count, category breakdown, and a daily weekly trend.
- Set and persist a weekly CO₂ target.
- Receive a friendly, actionable nudge when the weekly target is exceeded.
- Detect unusually large entries and require an explicit confirmation before saving them.
- Browse activity history, filter by activity type, week, month, or a custom date range, and sort by date or emissions.
- Delete individual activities with confirmation, or load and clear demo data from Settings.
- Use a responsive sidebar layout on desktop and a mobile navigation layout on smaller screens.

## Fixed emission factors

| Activity | Factor | Unit |
| --- | ---: | --- |
| Car | 0.20 kg CO₂ | km |
| Bus | 0.08 kg CO₂ | km |
| Flight | 0.25 kg CO₂ | km |
| Electricity | 0.80 kg CO₂ | kWh |
| Vegetarian Meal | 0.50 kg CO₂ | meal |
| Non-Vegetarian Meal | 2.00 kg CO₂ | meal |

The calculation configuration lives in `shared/emissions.ts`. The emission factor used for each saved activity is also stored in the database, so historical totals remain accurate if the configuration changes later.

## Tech stack

- React 18, TypeScript, and Vite
- Express API
- Prisma ORM with SQLite
- Zod validation
- Lucide React icons

## Requirements

- Node.js 20+ (Node.js 22 is recommended)
- npm

## run setup

1. Install dependencies. Prisma Client is generated automatically after installation.

   ```bash
   npm install
   ```

2. Create a local environment file from the example.

   ```bash
   Copy-Item .env.example .env
   ```

   On macOS/Linux, use `cp .env.example .env`.

3. Create or synchronize the SQLite database.

   ```bash
   npm run db:push
   ```

4. Start the app.

   ```bash
   npm run dev
   ```

Open `http://localhost:5173`. Vite serves the frontend and proxies API requests to the Express server on port `3001`.

## Demo data

To populate the current week with realistic sample activities:

```bash
npm run db:seed
```

You can also select **Load demo data** from Settings & about. The seed command resets activities before adding its sample records; the in-app option appends records.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run Vite and the Express API for local development. |
| `npm run db:generate` | Generate Prisma Client manually. |
| `npm run db:push` | Create/synchronize the SQLite schema. |
| `npm run db:seed` | Reset activities and add demo records. |
| `npm run build` | Run TypeScript checks and create the production frontend bundle. |
| `npm run start` | Serve the built frontend and API with Express. |

## Production deployment

1. Set `DATABASE_URL` in your deployment environment. For the included SQLite setup, use a persistent disk and a path such as `file:./dev.db`.
2. Run `npm install` and `npm run db:push` during setup/deployment.
3. Build the frontend:

   ```bash
   npm run build
   ```

4. Start the server. Hosting providers usually set `PORT` automatically; PlanetPulse uses port `3001` when it is not provided.

   ```bash
   npm run start
   ```

The Express server serves both `/api/*` routes and the built single-page app from `dist/`.

## Project structure

```text
src/                 React application and styles
server/              Express API and server-side validation
shared/              Emission factors and reusable calculation engine
prisma/              Prisma schema, SQLite database, and seed script
```

## Weekly period and validation

- A week runs from Monday 00:00 through Sunday 23:59 in the user’s local time.
- Quantities must be finite positive numbers and are capped at 10,000,000.
- Entries above 10,000 require a clear confirmation and are saved with an `unusual` marker.
- The API independently validates every create and target-update request; frontend validation is not trusted by itself.

## License

Created for the PlanetPulse hackathon project.

## Hackathon ID

AZIS-E6VNXG
