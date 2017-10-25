import express from "express";
import path from "path";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

import logs from "./routes/logs";

dotenv.config();
const app = express();
app.use(fileUpload({ safeFileNames: true, preserveExtension: 3 }));
app.use(bodyParser.json());

app.use("/api/logs", logs);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, () => console.log("Running on localhost:8080"));
