import express from 'express';
import passport from '../config/passport.js';
import {
  getAllHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  startHabitLog,
  endHabitLog,
  getHabitLogs,
  getAllHabitsWithLogs,
  getHabitDashboardData,
  toggleHabitCompletion,
  getDeletedHabits,
  restoreHabit,
} from '../controllers/habit.controller.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', getAllHabits);
router.post('/', createHabit);
router.get('/logs', getAllHabitsWithLogs);
router.get('/dashboard', getHabitDashboardData);
router.get('/archived', getDeletedHabits);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/restore', restoreHabit);
router.post('/:habitId/start', startHabitLog);
router.post('/:habitId/end', endHabitLog);
router.get('/:habitId/logs', getHabitLogs);
router.patch('/:habitId/toggle', toggleHabitCompletion);

export default router;
