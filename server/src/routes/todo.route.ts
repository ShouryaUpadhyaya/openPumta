import express from "express";
const router = express.Router();

router.get("/", () => console.log("inside todo route"));

export default router;
