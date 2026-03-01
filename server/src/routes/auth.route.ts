import express from 'express';
import passport from '../config/passport';
import asyncHandler from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${frontendUrl}/login`,
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(`${frontendUrl}/`);
  },
);

router.get(
  '/user',
  asyncHandler(async (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      throw new ApiError(401, 'Not authenticated');
    }
  }),
);

router.post(
  '/logout',
  asyncHandler(async (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Logged out' });
    });
  }),
);

export default router;
