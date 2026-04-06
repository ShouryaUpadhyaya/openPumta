import express from 'express';
import passport from '../config/passport';
import { exportUserData } from '../controllers/export.controller';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', exportUserData);

export default router;
