import express from 'express';
import passport from '../config/passport.js';
import { seedDemoData, cleanupDemoData } from '../controllers/demo.controller.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post('/seed', seedDemoData);
router.post('/cleanup', cleanupDemoData);

export default router;
