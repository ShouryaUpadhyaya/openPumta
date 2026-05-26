import express from 'express';
import passport from '../config/passport.js';
import {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  reorderSpaces,
} from '../controllers/space.controller.js';

const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.route('/').get(getSpaces).post(createSpace);
router.route('/reorder').patch(reorderSpaces);
router.route('/:id').patch(updateSpace).delete(deleteSpace);

export default router;
