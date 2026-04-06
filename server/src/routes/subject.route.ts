import express from 'express';
import passport from '../config/passport';
import {
  getAllSubject,
  createSubject,
  startSubjectLog,
  endSubjectLog,
  updateSubject,
  deleteSubject,
  getSubjectLogs,
  getAllSubjectsWithLogs,
  getDashboardData,
} from '../controllers/subject.controller';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router
  .get('/', getAllSubject)
  .post('/', createSubject)
  .patch('/:subjectId/startTimer', startSubjectLog)
  .patch('/:subjectId/endTimer', endSubjectLog)
  .patch('/updateSubjectName/:id', updateSubject)
  .delete('/:id', deleteSubject)
  .get('/:subjectId/logs', getSubjectLogs)
  .get('/stats', getAllSubjectsWithLogs)
  .get('/dashboard', getDashboardData);

export default router;
