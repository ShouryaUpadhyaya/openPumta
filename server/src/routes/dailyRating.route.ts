import express from 'express';
import passport from '../config/passport.js';
import {
  createOrUpdateDailyRating,
  getDailyRatingStats,
  getDailyRatingByDate,
  updateReviewTemplate,
} from '../controllers/dailyRating.controller.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post('/', createOrUpdateDailyRating);
router.get('/stats', getDailyRatingStats);
router.get('/date', getDailyRatingByDate);
router.patch('/template', updateReviewTemplate);

export default router;
