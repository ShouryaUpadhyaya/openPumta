import express from 'express';
import {
  getAllSubject,
  createSubject,
  startSubjectLog,
  endSubjectLog,
  updateSubject,
  getSubjectLogs,
  getAllSubjectsWithLogs,
  getDashboardData,
} from '../controllers/subject.controller';
const router = express.Router();

router
  .get('/:id', getAllSubject)
  .post('/', createSubject)
  .patch('/:subjectId/startTimer', startSubjectLog)
  .patch('/:subjectId/endTimer', endSubjectLog)
  .patch('/updateSubjectName/:id', updateSubject)
  .get('/:subjectId/logs', getSubjectLogs)
  .get('/:userId/stats', getAllSubjectsWithLogs)
  .get('/:userId/dashboard', getDashboardData);

export default router;
