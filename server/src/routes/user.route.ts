import express from 'express';
import passport from '../config/passport.js';
import {
  getAllUsers,
  deleteUser,
  addUser,
  updateUser,
  getLifetimeFocusTime,
  savePushToken,
  testPushNotification,
} from '../controllers/user.controller.js';
const router = express.Router();

router
  .get('/', getAllUsers)
  .post('/', addUser)
  .delete('/', passport.authenticate('jwt', { session: false }), deleteUser)
  .post('/push-token', passport.authenticate('jwt', { session: false }), savePushToken)
  .post('/push-test', passport.authenticate('jwt', { session: false }), testPushNotification)
  .get('/lifetime-focus', passport.authenticate('jwt', { session: false }), getLifetimeFocusTime)
  .patch('/:id', updateUser)
  .delete('/:id', deleteUser);

export default router;
