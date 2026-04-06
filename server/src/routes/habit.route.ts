import express from 'express';
import passport from '../config/passport';
import {
  getAllHabits,
  createHabit,
  updateHabit,
  startHabitLog,
  endHabitLog,
  getHabitLogs,
  getAllHabitsWithLogs,
  getHabitDashboardData,
  toggleHabitCompletion,
} from '../controllers/habit.controller';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', getAllHabits);
router.post('/', createHabit);
router.patch('/:id', updateHabit);
router.post('/:habitId/start', startHabitLog);
router.post('/:habitId/end', endHabitLog);
router.get('/:habitId/logs', getHabitLogs);
router.get('/logs', getAllHabitsWithLogs);
router.get('/dashboard', getHabitDashboardData);
router.patch('/:habitId/toggle', toggleHabitCompletion);

export default router;
