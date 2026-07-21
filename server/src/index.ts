import 'dotenv/config';
import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import userRoute from './routes/user.route.js';
import habitRoute from './routes/habit.route.js';
import authRoute from './routes/auth.route.js';
import subjectRoute from './routes/subject.route.js';
import todoRoute from './routes/todo.route.js';
import statsRoute from './routes/stats.route.js';
import dailyRatingRoute from './routes/dailyRating.route.js';
import exportRoute from './routes/export.route.js';
import aiRoute from './routes/ai.route.js';
import spaceRoute from './routes/space.route.js';
import textboxRoute from './routes/textbox.route.js';
import demoRoute from './routes/demo.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { connectRedis } from './config/redis.js';

let app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(passport.initialize());
await connectRedis();

app.listen(process.env.PORT || 4000, () => {
  console.log(`Running on http://localhost:${process.env.PORT || 4000}`);
});

app.get('/', async (req: express.Request, res: express.Response) =>
  res.send(await prisma.user.findMany()),
);
app.get('/health', async (req: express.Request, res: express.Response) =>
  res.json(new ApiResponse(200, { health: 'very nice!!' }, 'success')),
);
app.use('/api/users', userRoute);
app.use('/api/subject', subjectRoute);
app.use('/api/habits', habitRoute);
app.use('/api/todo', todoRoute);
app.use('/api/auth', authRoute);
app.use('/api/stats', statsRoute);
app.use('/api/daily-rating', dailyRatingRoute);
app.use('/api/export', exportRoute);
app.use('/api/ai', aiRoute);
app.use('/api/demo', demoRoute);
// Workspace routes
app.use('/api/spaces', spaceRoute);
app.use('/api/spaces/:spaceId/textboxes', textboxRoute);

app.use(errorHandler);
