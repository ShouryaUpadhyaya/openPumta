FROM node:22-slim

WORKDIR /app

RUN corepack enable
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/package.json

RUN pnpm install --frozen-lockfile

COPY server ./server

WORKDIR /app/server

RUN pnpm prisma generate
RUN pnpm build

EXPOSE 4000

CMD ["pnpm", "start"]
