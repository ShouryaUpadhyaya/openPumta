import express from 'express';
import passport from '../config/passport.js';
import {
  googleCallback,
  getCurrentUser,
  logout,
  guestLogin,
} from '../controllers/auth.controller.js';

const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${frontendUrl}/login`,
    session: false,
  }),
  googleCallback,
);

router.post('/guest-login', guestLogin);

router.get('/user', passport.authenticate('jwt', { session: false }), getCurrentUser);

router.post('/logout', logout);

export default router;
