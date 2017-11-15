"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _readline = require("readline");

var _readline2 = _interopRequireDefault(_readline);

var _logs = require("../models/logs");

var _logs2 = _interopRequireDefault(_logs);

var _parseLogs = require("../utils/parseLogs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get("/", function (req, res) {
  _logs2.default.find({}).then(function (logs) {
    return res.status(200).json({ logs: logs });
  });
});

router.post("/", function (req, res) {
  if (!req.files) return res.status(400).json({ success: false, data: "No files were uploaded" });

  var combatLog = req.files.combatLog;

  combatLog.mv("./public/uploads/logs/" + combatLog.name + ".txt", function (err) {
    if (err) return res.status(500).json({ success: false, data: err });

    var fileName = combatLog.name;
    var raw = [];
    var healing = [];
    var damage = [];
    var damageTaken = [];
    var deaths = [];
    var playerName = (0, _parseLogs.getPlayerName)(fileName);

    _readline2.default.createInterface({
      input: _fs2.default.createReadStream("./public/uploads/logs/" + fileName + ".txt", {
        encoding: "ucs2"
      }),
      terminal: false
    }).on("line", function (line) {
      raw.push((0, _parseLogs.parseAll)(line, playerName));
      if (line.includes("heals")) {
        healing.push((0, _parseLogs.parseHealing)(line, playerName));
      } else if (line.includes("hits")) {
        damage.push((0, _parseLogs.parseDamage)(line, playerName));
        if ((0, _parseLogs.getTarget)("hits", line, playerName).name === playerName) damageTaken.push((0, _parseLogs.parseDamage)(line, playerName));
      } else if (line.includes("You are dead")) {
        deaths.push((0, _parseLogs.parseDeaths)(line, playerName));
      }
    }).on("close", function () {
      _fs2.default.unlink("./public/uploads/logs/" + fileName + ".txt", function (error) {
        if (error) {
          throw error;
        }
      });

      _logs2.default.create({
        name: fileName,
        raw: raw,
        healing: healing,
        damage: damage,
        damageTaken: damageTaken,
        deaths: deaths,
        damageCasters: (0, _parseLogs.getAllCasters)(damage),
        healingCasters: (0, _parseLogs.getAllCasters)(healing)
      }).then(function (log) {
        return res.status(200).json({ log: log });
      }).catch(function (error) {
        return res.status(400).json({ errors: error.errors });
      });
    });
  });
});

router.get("/:id", function (req, res) {
  _logs2.default.findOne({ _id: req.params.id }).then(function (log) {
    return res.status(200).json({ log: log });
  }).catch(function (err) {
    return res.status(400).json({ errors: err });
  });
});

router.get("/filter/:id", function (req, res) {
  if (!req.query.unit) return res.status(400).json({
    success: false,
    data: "This route requires a query string to be passed in the URL"
  });
  _logs2.default.findOne({ _id: req.params.id }).then(function (log) {
    var unit = req.query.unit;
    var logFile = log;
    logFile.healing = (0, _parseLogs.filterByCaster)(log.healing, unit);
    logFile.damage = (0, _parseLogs.filterByCaster)(log.damage, unit);
    logFile.damageTaken = (0, _parseLogs.filterByTarget)(log.damageTaken, unit);
    logFile.deaths = log.deaths;
    logFile.raw = log.raw;

    return res.status(200).json({ log: logFile });
  }).catch(function (err) {
    return res.status(400).json({ errors: err });
  });
});

exports.default = router;
//# sourceMappingURL=logs.js.map