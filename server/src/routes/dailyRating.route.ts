import express from 'express';
import passport from '../config/passport';
import {
  createOrUpdateDailyRating,
  getDailyRatingStats,
} from '../controllers/dailyRating.controller';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post('/', createOrUpdateDailyRating);
router.get('/stats', getDailyRatingStats);

export default router;
