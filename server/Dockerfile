FROM node:22

WORKDIR /app

RUN npm install -g pnpm 

COPY package.json .

RUN pnpm i

COPY . .

ENTRYPOINT [ "pnpm", "run", "dev" ]
