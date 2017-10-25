import express from "express";
import fs from "fs";
import readline from "readline";

import { parseHealing, parseDamage } from "../utils/parseLogs";

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    data: "success"
  });
});

router.post("/upload", (req, res) => {
  if (!req.files)
    return res
      .status(400)
      .json({ success: false, data: "No files were uploaded" });

  const sampleFile = req.files.sampleFile;

  sampleFile.mv(`./uploaded/logs/${sampleFile.name}`, err => {
    if (err) return res.status(500).json({ success: false, data: err });

    return res.status(200).json({
      success: true,
      data: {
        message: "Log uploaded",
        file: sampleFile.name
      }
    });
  });
});

router.post("/parse", (req, res) => {
  const healing = [];
  const damage = [];

  readline
    .createInterface({
      input: fs.createReadStream(
        "./uploaded/logs/cl-2017-10-23-124209-Gorshield.log",
        {
          encoding: "ucs2"
        }
      ),
      terminal: false
    })
    .on("line", line => {
      if (line.includes("heals")) {
        healing.push(parseHealing(line));
      } else if (line.includes("hits")) {
        damage.push(parseDamage(line));
      }
    })
    .on("close", () => {
      return res.status(200).json({
        success: true,
        data: { healing, damage }
      });

      process.exit(0);
    });
});

export default router;
