import express from "express";
import { prisma } from "../prisma/prismaClient";
import userRoute from "./routes/user.route";
import habitRoute from "./routes/habit.route";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middlewares/error.middleware";
let app = express();

app.use(express.json());
app.use(cors());

async function seed() {
  const user = await prisma.user.findUnique({ where: { id: 1 } });
  if (user) {
    await prisma.subject.create({
      data: {
        name: "coding",
        userId: 1,
      },
    });
  }
}

app.listen(process.env.PORT || 4000, () => {
  console.log(`Running on http://localhost:${process.env.PORT}`);
  seed();
});
// app.route;
app.get("/", async (req, res) => res.send(await prisma.user.findMany()));
app.use("/api/users", userRoute);
app.use("/api/habits", habitRoute);

app.use(errorHandler);
