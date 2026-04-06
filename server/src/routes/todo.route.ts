import express from 'express';
import passport from '../config/passport';
import {
  getAllToDos,
  createToDo,
  updateToDo,
  deleteToDo,
  startToDoLog,
  endToDoLog,
} from '../controllers/todo.controller';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.route('/').get(getAllToDos);
router.route('/create').post(createToDo);
router.route('/:id').patch(updateToDo).delete(deleteToDo);
router.route('/:toDoId/start').post(startToDoLog);
router.route('/:toDoId/end').post(endToDoLog);

export default router;
