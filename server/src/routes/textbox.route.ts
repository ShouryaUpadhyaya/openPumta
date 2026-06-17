import { Router } from 'express';
import passport from 'passport';
import {
  getTextBoxes,
  createTextBox,
  updateTextBoxLayout,
  updateTextBoxContent,
  deleteTextBox,
  moveTextBox,
} from '../controllers/textbox.controller.js';

// Base route: /api/spaces/:spaceId/textboxes
const router = Router({ mergeParams: true });

// Protect all routes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.use((passport as any).authenticate('jwt', { session: false }));

router.route('/').get(getTextBoxes).post(createTextBox);
router.route('/:id').delete(deleteTextBox);
router.route('/:id/layout').patch(updateTextBoxLayout);
router.route('/:id/content').patch(updateTextBoxContent);
router.route('/:id/move').patch(moveTextBox);

export default router;
