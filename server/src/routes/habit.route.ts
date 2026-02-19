import express from "express";
import {
  addHabit,
  deleteHabit,
  getAllHabits,
  updateHabit,
} from "../controllers/habit.controller";
const router = express.Router();

router.get("/", getAllHabits);
router.post("/", addHabit);
router.patch("/", updateHabit);
router.delete("/", deleteHabit);

export default router;
