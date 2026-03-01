import express from 'express';
import {
  getAllHabits,
  createHabit,
  updateHabit,
  startHabitLog,
  endHabitLog,
  getHabitLogs,
  getAllHabitsWithLogs,
  getHabitDashboardData,
} from '../controllers/habit.controller';

const router = express.Router();

router.get('/user/:userId', getAllHabits);
router.post('/', createHabit);
router.patch('/:id', updateHabit);
router.post('/:habitId/start', startHabitLog);
router.post('/:habitId/end', endHabitLog);
router.get('/:habitId/logs', getHabitLogs);
router.get('/user/:userId/logs', getAllHabitsWithLogs);
router.get('/user/:userId/dashboard', getHabitDashboardData);

export default router;
