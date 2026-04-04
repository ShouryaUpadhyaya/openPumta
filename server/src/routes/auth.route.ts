import express from 'express';
import passport from '../config/passport';
import { googleCallback, getCurrentUser, logout } from '../controllers/auth.controller';

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

router.get('/user', passport.authenticate('jwt', { session: false }), getCurrentUser);

router.post('/logout', logout);

export default router;
