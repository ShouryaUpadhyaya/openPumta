import express from 'express';
import passport from '../config/passport';
import { getDailyTimeline, getDashboardStats } from '../controllers/stats.controller';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/timeline', getDailyTimeline);
router.get('/dashboard', getDashboardStats);

export default router;
