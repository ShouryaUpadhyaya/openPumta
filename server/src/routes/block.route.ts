import express from 'express';
import passport from '../config/passport.js';
import {
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  moveBlock,
} from '../controllers/block.controller.js';

const router = express.Router({ mergeParams: true }); // inherits :columnId
router.use(passport.authenticate('jwt', { session: false }));

router.route('/').get(getBlocks).post(createBlock);
router.route('/reorder').patch(reorderBlocks);
router.route('/:id').patch(updateBlock).delete(deleteBlock);

export default router;
