# Contributing to openPumta

Thank you for your interest in contributing! This project aims to provide a high-performance, desktop-first productivity engine. We welcome contributions of all kinds, from bug reports and feature suggestions to code changes and documentation improvements.

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and professional in all interactions.

## How to Contribute

### 1. Reporting Bugs

- Search existing issues to see if the bug has already been reported.
- If not, create a new issue with a clear title and description.
- Include steps to reproduce the bug and any relevant error logs or screenshots.

### 2. Feature Requests

- Check the [Roadmap](README.md#roadmap) and existing issues.
- Open a new issue to discuss the feature idea before starting implementation.

### 3. Pull Request Process

- Fork the repository and create your branch from `main`.
- Ensure your code follows the project's style and passes linting.
- Update documentation if necessary.
- Write or update tests as appropriate.
- Submit a PR with a clear description of the changes.

## Development Environment Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/)

### Setting Up the Project

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourhandle/openPumta.git
   cd openPumta
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Environment Variables:**
   - Copy the `.env.example` to `.env` in the root (or in each workspace if preferred).

   ```bash
   cp .env.example .env
   ```

   - Update the values in the `.env` file (Database URL, JWT secret, etc.).

4. **Database Setup:**
   - Ensure PostgreSQL is running and you've created a database.
   - Run the Prisma migrations:
     ```bash
     cd server
     npx prisma migrate dev
     ```

5. **Start Developing:**
   - **Frontend:**
     ```bash
     cd next-app
     pnpm run dev
     ```
   - **Backend:**
     ```bash
     cd server
     pnpm run dev
     ```

## Project Structure

- `/next-app`: Next.js frontend (UI, Zustand store, components).
- `/server`: Express.js backend (Prisma models, controllers, routes).

---

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
