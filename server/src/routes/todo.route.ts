import express from 'express';
import {
  getAllToDos,
  createToDo,
  updateToDo,
  deleteToDo,
  startToDoLog,
  endToDoLog,
} from '../controllers/todo.controller';

const router = express.Router();

router.route('/user/:userId').get(getAllToDos);
router.route('/create').post(createToDo);
router.route('/:id').patch(updateToDo).delete(deleteToDo);
router.route('/:toDoId/start').post(startToDoLog);
router.route('/:toDoId/end').post(endToDoLog);

export default router;
