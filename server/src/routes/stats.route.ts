import express from "express";
const router = express.Router();

router.get("/", () => console.log("inside stats route"));

export default router;
