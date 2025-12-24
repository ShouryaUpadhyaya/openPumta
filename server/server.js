import express from "express";
import "dotenv/config";
let app = express();

app.listen(process.env.PORT, () =>
  console.log(`Running on http://localhost:${process.env.PORT}`)
);
