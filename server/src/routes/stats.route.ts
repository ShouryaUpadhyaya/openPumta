import express from 'express';
import { getDailyTimeline, getDashboardStats } from '../controllers/stats.controller';

const router = express.Router();

router.get('/user/:userId/timeline', getDailyTimeline);
router.get('/user/:userId/dashboard', getDashboardStats);

export default router;
