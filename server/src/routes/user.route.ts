import express from 'express';
import { getAllUsers, deleteUser, addUser, updateUser } from '../controllers/user.controller';
const router = express.Router();

router
  .get('/', getAllUsers)
  .post('/', addUser)
  .patch('/:id', updateUser)
  .delete('/:id', deleteUser);

export default router;
