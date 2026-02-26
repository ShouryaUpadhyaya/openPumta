import express from "express";
import {
  getAllSubject,
  createSubject,
  startSubjectLog,
  endSubjectLog,
  updateSubject,
} from "../controllers/subject.controller";
const router = express.Router();

router
  .get("/:id", getAllSubject)
  .post("/", createSubject)
  .patch("/:subjectId/startTimer", startSubjectLog)
  .patch("/:subjectId/endTimer", endSubjectLog)
  .patch("/updateSubjectName/:id", updateSubject);
export default router;
