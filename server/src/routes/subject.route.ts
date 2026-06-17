import express from 'express';
import passport from '../config/passport.js';
import {
  getAllSubject,
  createSubject,
  startSubjectLog,
  endSubjectLog,
  updateSubject,
  deleteSubject,
  getSubjectLogs,
  updateSubjectLog,
  deleteSubjectLog,
  getAllSubjectsWithLogs,
  getDashboardData,
} from '../controllers/subject.controller.js';

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
  .patch('/:subjectId/logs/:logId', updateSubjectLog)
  .delete('/:subjectId/logs/:logId', deleteSubjectLog)
  .get('/stats', getAllSubjectsWithLogs)
  .get('/dashboard', getDashboardData);

export default router;
