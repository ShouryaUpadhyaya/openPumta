import express from 'express';
import passport from '../config/passport.js';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from '../controllers/column.controller.js';

const router = express.Router({ mergeParams: true }); // mergeParams to get :spaceId
router.use(passport.authenticate('jwt', { session: false }));

router.route('/').get(getColumns).post(createColumn);
router.route('/reorder').patch(reorderColumns);
router.route('/:id').patch(updateColumn).delete(deleteColumn);

export default router;
