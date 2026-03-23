import "dotenv/config";
import express from "express";
import cors from "cors";
import { scanRouter } from "./routes/scan.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    exposedHeaders: ["X-Scan-ID"],
  }),
);

app.use(express.json());
app.use("/scan", scanRouter);

app.listen(port, () => {
  console.log(`api running on :${port}`);
});
