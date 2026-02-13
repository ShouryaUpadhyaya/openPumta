import express from "express";
const router = express.Router();

router.get("/", () => console.log("inside subject route"));

export default router;
 