# openPumta

An open-source, desktop-first productivity system inspired by Yeolpumta.
It combines Pomodoro focus tracking, subject-wise analytics, habit tracking, daily ratings, personal data export, and AI-assisted reflection.

![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-development-green)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Express%20%7C%20Prisma-blue)

## Live Demo

[https://openpumta.com/](https://openpumta.com/)

## Why openPumta?

After using Yeolpumta for 2+ years, I wanted a productivity system with:

- A desktop-first workflow
- User-owned, exportable data
- Serious analytics beyond simple streaks
- Habits, focus sessions, todos, and daily reviews in one place
- AI reports that explain patterns and suggest next actions

## Features

### Desktop-First Focus

- **Pomodoro timer:** Built for long study and deep-work sessions.
- **Subject assignment:** Categorize focus sessions by subject, such as DSA, Math, or System Design.
- **Stats dashboard:** Track focus time, trends, performance deltas, and daily patterns.

### Data Ownership

- **Full export:** Export your logs at any time.
- **Readable formats:** Use structured JSON for scripts or text summaries for review.

### Habits And Daily Review

- **Habit tracking:** Track habits with difficulty and optional subject links.
- **Daily ratings:** Record how each day went and compare effort, mood, and output.
- **Immediate feedback:** Small rewards and completion effects help maintain momentum.

### Todo Workspace

- **Spaces, columns, and blocks:** Organize work in a flexible workspace.
- **Block types:** Todos, headings, paragraphs, and dividers.
- **Scheduling fields:** Use due dates, reminders, and scheduled blocks.

### AI Reports

Use LLMs to turn raw logs into feedback loops:

- Focus trend analysis
- Habit consistency breakdowns
- Burnout risk signals
- Suggested weekly plans

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, TanStack Query, Recharts
- **Backend:** Express, TypeScript, Prisma, PostgreSQL, Passport, JWT, Google OAuth
- **Infrastructure:** Docker Compose
- **AI:** LLM-powered reports and coaching helpers

## Getting Started

The easiest way to run the full app is Docker Compose. It starts:

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000](http://localhost:4000)
- Postgres: `localhost:5450`
- Adminer: [http://localhost:8080](http://localhost:8080)

### 1. Clone The Repository

```bash
git clone https://github.com/yourhandle/openPumta.git
cd openPumta
```

### 2. Create Environment Files

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@db:5432/openpumta"
PORT=4000
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"
JWT_SECRET="change-me"
NODE_ENV="development"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GROQ_API_KEY="your_groq_key"
```

Create `next-app/.env`:

```env
NEXT_PUBLIC_BACKEND_URL="http://api:4000"
```

### 3. Start Docker Compose

```bash
docker compose up --build
```

Postgres uses the named Docker volume `postgres_data`, so your database persists across container restarts.

### 4. Apply Database Migrations

In another terminal:

```bash
docker compose exec api pnpm prisma migrate deploy
```

For local schema development, use:

```bash
docker compose exec api pnpm prisma migrate dev
```

### 5. Open The App

Visit [http://localhost:3000](http://localhost:3000).

## Common Docker Commands

```bash
# Start services in the background
docker compose up -d

# Rebuild images
docker compose build

# View logs
docker compose logs -f api web

# Stop containers without deleting the database volume
docker compose down

# Stop containers and delete the database volume
docker compose down -v
```

## Local Development Without Docker

Install dependencies from the workspace root:

```bash
pnpm install
```

Run both apps together:

```bash
pnpm dev
```

Or run them separately:

```bash
pnpm --filter server dev
pnpm --filter next-app dev
```

When running outside Docker, use the host-mapped Postgres port in `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5450/openpumta"
```

Then apply migrations:

```bash
pnpm --filter server prisma migrate dev
```

## Project Structure

```text
.
├── docker-compose.yml
├── next-app/         # Next.js frontend
├── server/           # Express API and Prisma schema
├── docs/             # API docs and OpenAPI spec
└── pnpm-workspace.yaml
```

## Roadmap

- [ ] WebSocket-based multi-device timer sync
- [ ] Modular drag-and-drop dashboard blocks
- [ ] AI forecasting engine
- [ ] Mobile app site-blocking during focus sessions

## Documentation

- [Backend API Documentation](./docs/BACKEND_API.md)
- [OpenAPI Spec](./docs/openapi.yaml)

## License

MIT
