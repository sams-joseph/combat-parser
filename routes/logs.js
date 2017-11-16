const express = require('express');
const fs = require('fs');
const readline = require('readline');
const Log = require('../models/logs');

const {
  parseHealing,
  parseDamage,
  parseAll,
  getTarget,
  getPlayerName,
  parseDeaths,
  filterByTarget,
  filterByCaster,
  getAllCasters,
} = require('../utils/parseLogs');

const router = express.Router();

router.get('/', (req, res) => {
  Log.find({}).then(logs => res.status(200).json({ logs }));
});

router.post('/', (req, res) => {
  if (!req.files) return res.status(400).json({ success: false, data: 'No files were uploaded' });

  const { combatLog } = req.files;

  combatLog.mv(`./public/uploads/logs/${combatLog.name}.txt`, (err) => {
    if (err) return res.status(500).json({ success: false, data: err });

    const fileName = combatLog.name;
    const raw = [];
    const healing = [];
    const damage = [];
    const damageTaken = [];
    const deaths = [];
    const playerName = getPlayerName(fileName);

    readline
      .createInterface({
        input: fs.createReadStream(`./public/uploads/logs/${fileName}.txt`, {
          encoding: 'ucs2',
        }),
        terminal: false,
      })
      .on('line', (line) => {
        raw.push(parseAll(line, playerName));
        if (line.includes('heals')) {
          healing.push(parseHealing(line, playerName));
        } else if (line.includes('hits')) {
          damage.push(parseDamage(line, playerName));
          if (getTarget('hits', line, playerName).name === playerName) {
            damageTaken.push(parseDamage(line, playerName));
          }
        } else if (line.includes('You are dead')) {
          deaths.push(parseDeaths(line, playerName));
        }
      })
      .on('close', () => {
        fs.unlink(`./public/uploads/logs/${fileName}.txt`, (error) => {
          if (error) {
            throw error;
          }
        });

        Log.create({
          name: fileName,
          raw,
          healing,
          damage,
          damageTaken,
          deaths,
          damageCasters: getAllCasters(damage),
          healingCasters: getAllCasters(healing),
        })
          .then(log => res.status(200).json({ log }))
          .catch(error => res.status(400).json({ errors: error.errors }));
      });

    return undefined;
  });

  return undefined;
});

router.get('/:id', (req, res) => {
  Log.findOne({ _id: req.params.id })
    .then(log => res.status(200).json({ log }))
    .catch(err => res.status(400).json({ errors: err }));
});

router.get('/filter/:id', (req, res) => {
  if (!req.query.unit) {
    return res.status(400).json({
      success: false,
      data: 'This route requires a query string to be passed in the URL',
    });
  }
  Log.findOne({ _id: req.params.id })
    .then((log) => {
      const { unit } = req.query;
      const logFile = log;
      logFile.healing = filterByCaster(log.healing, unit);
      logFile.damage = filterByCaster(log.damage, unit);
      logFile.damageTaken = filterByTarget(log.damageTaken, unit);
      logFile.deaths = log.deaths;
      logFile.raw = log.raw;

      return res.status(200).json({ log: logFile });
    })
    .catch(err => res.status(400).json({ errors: err }));

  return undefined;
});

module.exports = router;
