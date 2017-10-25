import express from "express";
import fs from "fs";
import readline from "readline";

import { parseHealing, parseDamage, calculateCrit, getAllCasters, calculateOverhealing, getPlayerName } from "../utils/parseLogs";

const router = express.Router();

router.post("/upload", (req, res) => {
  if (!req.files)
    return res
      .status(400)
      .json({ success: false, data: "No files were uploaded" });

  const sampleFile = req.files.sampleFile;

  sampleFile.mv(`./uploaded/logs/${sampleFile.name}`, err => {
    if (err) return res.status(500).json({ success: false, data: err });

    res.redirect(`/api/logs/parse/?valid=${sampleFile.name}`);
  });
});

router.get("/parse", (req, res) => {
  const fileName = req.query.valid;
  const healing = [];
  const damage = [];
  const critPercentage = {};

  const playerName = getPlayerName(fileName);

  readline
    .createInterface({
      input: fs.createReadStream(
        `./uploaded/logs/${fileName}`,
        {
          encoding: "ucs2"
        }
      ),
      terminal: false
    })
    .on("line", line => {
      if (line.includes("heals")) {
        healing.push(parseHealing(line, playerName));
      } else if (line.includes("hits")) {
        damage.push(parseDamage(line, playerName));
      }
    })
    .on("close", () => {
      const damageCasters = getAllCasters(damage);
      const healingCasters = getAllCasters(healing);
      const critInfoDamage = damageCasters.map((caster) => ({[caster]: calculateCrit(caster, damage)}));
      const critInfoHealing = healingCasters.map((caster) => ({[caster]: calculateCrit(caster, healing)}));
      const overHealing = healingCasters.map((caster) => ({[caster]: calculateOverhealing(caster, healing)}));

      critPercentage.damage = critInfoDamage;
      critPercentage.healing = critInfoHealing;

      return res.status(200).json({
        success: true,
        data: { healing, damage, critPercentage, overHealing }
      });
    });
});


export default router;