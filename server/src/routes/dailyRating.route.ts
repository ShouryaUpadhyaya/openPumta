import express from 'express';
import {
  createOrUpdateDailyRating,
  getDailyRatingStats,
} from '../controllers/dailyRating.controller';
const router = express.Router();

router.post('/', createOrUpdateDailyRating).get('/:userId/stats', getDailyRatingStats);

export default router;
