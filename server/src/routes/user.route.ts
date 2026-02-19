import express from "express";
import {
  getAllUsers,
  deleteUser,
  addUser,
  updateUser,
} from "../controllers/user.controller";
const router = express.Router();

router.get("/", getAllUsers);
router.post("/", addUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
