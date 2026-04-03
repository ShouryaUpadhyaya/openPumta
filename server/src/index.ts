import express from 'express';
import { prisma } from '../prisma/prismaClient';
import userRoute from './routes/user.route';
import habitRoute from './routes/habit.route';
import authRoute from './routes/auth.route';
import subjectRoute from './routes/subject.route';
import todoRoute from './routes/todo.route';
import statsRoute from './routes/stats.route';
import dailyRatingRoute from './routes/dailyRating.route';
import exportRoute from './routes/export.route';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { errorHandler } from './middlewares/error.middleware';

let app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(passport.initialize());

async function seed() {
  const user = await prisma.user.findUnique({ where: { id: 1 } });
  if (user) {
    await prisma.subject.create({
      data: {
        name: 'coding',
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
app.get('/', async (req, res) => res.send(await prisma.user.findMany()));
app.use('/api/users', userRoute);
app.use('/api/subject', subjectRoute);
app.use('/api/habits', habitRoute);
app.use('/api/todo', todoRoute);
app.use('/api/auth', authRoute);
app.use('/api/stats', statsRoute);
app.use('/api/daily-rating', dailyRatingRoute);
app.use('/api/export', exportRoute);

app.use(errorHandler);
