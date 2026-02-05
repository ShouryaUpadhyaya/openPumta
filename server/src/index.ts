import express from "express";
import { prisma } from "../prisma/prismaClient.ts";
import "dotenv/config";
let app = express();

async function seed() {
  await prisma.subject.create({
    data: {
      name: "coding",
      userId: 1,
      intervals: {},
    },
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Running on http://localhost:${process.env.PORT}`);
  seed();
});
// app.routere;
app.get("/", async (req, res) => res.send(await prisma.user.findMany()));
