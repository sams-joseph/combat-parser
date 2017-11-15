import express from "express";
import mongoose from "mongoose";
import Promise from "bluebird";
import path from "path";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import cors from "cors";

import logs from "./routes/logs";

dotenv.config();
const app = express();
app.use(fileUpload({ safeFileNames: true, preserveExtension: 0 }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
mongoose.Promise = Promise;
mongoose.connect("mongodb://mongo/api", { useMongoClient: true });

app.use("/api/logs", logs);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

export default app;
