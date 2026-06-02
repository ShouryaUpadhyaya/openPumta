FROM node:22

WORKDIR /app

RUN npm install -g pnpm 

COPY package.json .
COPY . .

RUN pnpm i

ENTRYPOINT [ "pnpm", "run", "dev" ]
