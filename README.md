# openPumta

An open-source, desktop-first alternative to Yeolpumta.
Built for students who want data ownership, serious analytics, and intelligent feedback loops.

![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-development-green)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Express%20%7C%20Prisma-blue)

## Live Demo (Frontend)

[https://open-pumta.vercel.app/](https://open-pumta.vercel.app/)

## Why openPumta?

After using Yeolpumta for 2+ years, I realized:

- No desktop-first workflow
- No access to raw data
- No intelligent weekly analysis
- Limited habit modeling
- No modular extensibility

openPumta is built to fix that.

## Design Goals

### 1. Desktop-First Focus

Built for the deep-work environment where your primary tool is a computer.

- **Web-Based:** Accessible from any browser.
- **Multi-Tab Sync:** WebSocket-powered Pomodoro timers that stay in sync across all open tabs.
- **Subject Assignment:** Categorize your focus sessions by subject (e.g., DSA, Math, System Design).
- **Auto-Rotate:** Seamlessly transition between work and break blocks without manual intervention.

### 2. Data Ownership (No Black Boxes)

Your productivity data belongs to you, not a proprietary platform.

- **Full Export:** Export all your logs at any time.
- **Formats:** Available as structured **JSON** for custom scripts or **Human-readable Text** for personal review.

### 3. Weekly AI Reports

Leverage LLMs to transform raw logs into actionable coaching.

- **Focus Trend Analysis:** Deep dives into your concentration patterns.
- **Habit Consistency Breakdown:** Visualizing where you succeed and where you friction exists.
- **Risk Forecasts:** Identifying burnout patterns before they happen.
- **Actionable Weekly Plan:** A roadmap for the next 7 days based on last week's performance.

### 4. Huberman-Inspired Habits

Implementing science-backed habit formation protocols.

- **The 6-Habit Rule:** Maximize focus by limiting daily targets to 6 primary habits.
- **Perfect Day Metric:** 4 completions = a "Perfect Day."
- **Subject Snapping:** Habits can optionally link to subjects (e.g., "Deep Work" → DSA, "Revision" → Math).

### 5. Immediate Feedback

Small wins should be visible and celebrated to maintain momentum.

- **Visual Rewards:** Confetti bursts and custom emoji reactions on completion.
- **Streak Indicators:** Real-time feedback on your current focus momentum.

### 6. Serious Stats

Professional-grade analytics for personal growth.

- **Time-Series Charts:** Track your focus minutes over weeks and months.
- **Heatmaps:** Visualize your most productive hours and days.
- **Rolling Averages:** 7-day and 21-day performance trends.
- **Performance Deltas:** Automatic comparison vs. previous periods to measure real growth.

### 7. Modular Future

Moving towards a "Notion-like" block system where you model your own productivity engine.

- **Blocks:** Timers, Habits, Stats, Reviews, and Notes can be rearranged and composed.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 , TypeScript, Zustand, Tailwind CSS, Recharts
- **Backend:** Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT + OAuth2.0
- **Infrastructure:** Docker
- **AI:** Weekly insight engine + Goal coaching (OpenAI integration)

---

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourhandle/openPumta
   ```

2. **Setup Backend**

   ```bash
   cd server
   pnpm install
   # Configure .env with DATABASE_URL, JWT_SECRET, etc.
   npx prisma migrate dev
   pnpm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd next-app
   pnpm install
   pnpm run dev
   ```

## 🗺️ Roadmap

- [ ] WebSocket-based multi-device timer sync
- [ ] Modular drag-and-drop dashboard blocks
- [ ] AI forecasting engine (v1)
- [ ] Mobile app site-blocking during focus sessions

## 📄 License

MIT
