import express from 'express';
import { exportUserData } from '../controllers/export.controller';

const router = express.Router();

router.get('/user/:userId', exportUserData);

export default router;
