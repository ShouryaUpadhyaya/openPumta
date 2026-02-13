import express from "express";
const router = express.Router();

router.get("/", () => console.log("inside habit route"));

export default router;
