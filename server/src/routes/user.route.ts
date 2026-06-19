import express from 'express';
import passport from '../config/passport.js';
import {
  getAllUsers,
  deleteUser,
  addUser,
  updateUser,
  getLifetimeFocusTime,
} from '../controllers/user.controller.js';
const router = express.Router();

router
  .get('/', getAllUsers)
  .post('/', addUser)
  .get('/lifetime-focus', passport.authenticate('jwt', { session: false }), getLifetimeFocusTime)
  .patch('/:id', updateUser)
  .delete('/:id', deleteUser);

export default router;
