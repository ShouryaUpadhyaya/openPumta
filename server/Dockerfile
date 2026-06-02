FROM node:22

WORKDIR /app

RUN npm install -g pnpm 

COPY package.json .

RUN pnpm i

COPY . .

RUN pnpm prisma generate
#docker compose exec app npx prisma migrate dev    //add this to be ran after docker compose up in readme

ENTRYPOINT [ "pnpm", "run", "dev" ]
