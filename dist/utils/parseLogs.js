"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatSpellName = formatSpellName;
exports.getTarget = getTarget;
exports.getAllCasters = getAllCasters;
exports.filterBySpell = filterBySpell;
exports.filterByCaster = filterByCaster;
exports.filterByTarget = filterByTarget;
exports.calculateCrit = calculateCrit;
exports.calculateOverhealing = calculateOverhealing;
exports.parseAll = parseAll;
exports.parseHealing = parseHealing;
exports.parseDamage = parseDamage;
exports.getPlayerName = getPlayerName;
exports.parseDeaths = parseDeaths;
exports.getCareer = getCareer;

var _abilities = require("../json/abilities.json");

var _abilities2 = _interopRequireDefault(_abilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var player = "Player";

function getTimestamp(line) {
  var parts = line.slice(0, 10).replace(/[\[\]']+/g, "").split("/");
  var times = line.slice(10, 20).replace(/[\[\]']+/g, "").split(":");
  var dateString = new Date("20" + parts[0], "" + (parts[1] - 1), "" + parts[2], "" + times[0], "" + times[1], "" + times[2], 0);

  var timestamp = {};
  timestamp.dateTime = dateString;
  timestamp.dateTimeParsed = dateString.toString();
  timestamp.time = line.slice(10, 20).replace(/[\[\]']+/g, "");

  return timestamp;
}

function getCaster(line, playerName) {
  var caster = {};
  if (line.indexOf("Your") < 0 || line.indexOf("You") < 0) {
    caster.name = line.slice(21, line.indexOf("'s"));
  } else caster.name = playerName;

  return caster;
}

function formatSpellName(string) {
  var stringRemoveSpecials = string.replace(/[^a-zA-Z ]/g, "");
  var stringToUnderscore = stringRemoveSpecials.replace(/ /g, "_");
  return stringToUnderscore.toLowerCase();
}

function getSpell(index, event, line) {
  var data = {};
  data.critical = line.includes("critically");
  if (line.indexOf("Your") < 0 || line.indexOf("You") < 0) {
    if (data.critical) data.spellName = line.slice(index, line.indexOf("critically") - 1);else data.spellName = line.slice(index, line.indexOf(event) - 1);
  } else {
    if (data.critical) data.spellName = line.slice(line.indexOf("Your") + 5, line.indexOf("critically") - 1);else data.spellName = line.slice(line.indexOf("Your") + 5, line.indexOf(event) - 1);
  }

  if (event === "heals") data.amount = Number(line.slice(line.indexOf("for") + 4, line.indexOf("points") - 1));else if (event === "hits") data.amount = Number(line.slice(line.indexOf("for") + 4, line.indexOf("damage") - 1));

  if (line.includes("overhealed") || line.includes("mitigated") || line.includes("overkill")) {
    var arr = line.match(/\(([^)]+)\)/)[1].split(" ");
    data.extra = { amount: Number(arr[0]), label: arr[1] };
  }

  if (_abilities2.default[formatSpellName(data.spellName)]) {
    data.meta = _abilities2.default[formatSpellName(data.spellName)];
  }

  return data;
}

function getTarget(event, line, playerName) {
  var data = {};
  data.name = line.slice(line.indexOf(event) + event.length + 1, line.indexOf("for") - 1);

  if (data.name === "you") data.name = playerName;

  return data;
}

function getAllCasters(object) {
  var casters = [];
  object.forEach(function (obj) {
    if (casters.indexOf(obj.caster.name) < 0) {
      casters.push(obj.caster.name);
    }
  });

  return casters;
}

function filterBySpell(object, filter) {
  var result = object.filter(function (obj) {
    return obj.spell.spellName == filter;
  });

  return result;
}

function filterByCaster(object, filter) {
  var result = object.filter(function (obj) {
    return obj.caster.name === filter;
  });

  return result;
}

function filterByTarget(object, filter) {
  var result = object.filter(function (obj) {
    return obj.target.name === filter;
  });

  return result;
}

function calculateCrit(caster, object) {
  var castersActions = filterByCaster(object, caster);
  var crits = castersActions.filter(function (obj) {
    return obj.spell.critical;
  });
  var critPercentage = crits.length / castersActions.length;

  return critPercentage;
}

function calculateOverhealing(caster, object) {
  var totalOverhealed = 0;
  var castersActions = filterByCaster(object, caster);
  var overhealing = castersActions.filter(function (obj) {
    return obj.spell.extra;
  });
  overhealing.forEach(function (overheal) {
    totalOverhealed += Number(overheal.spell.extra.amount);
  });

  return totalOverhealed;
}

function parseAll(line, playerName) {
  var data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line, playerName);
  if (line.includes("heals")) data.spell = getSpell(line.indexOf("'s") + 3, "heals", line);else if (line.includes("hits")) data.spell = getSpell(line.indexOf("'s") + 3, "hits", line);
  data.target = getTarget("heals", line, playerName);
  return data;
}

function parseHealing(line, playerName) {
  var data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line, playerName);
  data.spell = getSpell(line.indexOf("'s") + 3, "heals", line);
  data.target = getTarget("heals", line, playerName);
  return data;
}

function parseDamage(line, playerName) {
  var data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line, playerName);
  data.spell = getSpell(line.indexOf("'s") + 3, "hits", line);
  data.target = getTarget("hits", line, playerName);
  return data;
}

function getPlayerName(fileName) {
  var fileNameParts = fileName.split("-");
  var playerName = fileNameParts[fileNameParts.length - 1];
  return playerName;
}

function parseDeaths(line, playerName) {
  var data = {};
  data.timestamp = getTimestamp(line);
  data.player = playerName;

  return data;
}

function getCareer(object, playerName) {
  var playerActions = filterByCaster(object, playerName);
  var career = "No career found";
  playerActions.forEach(function (obj) {
    if (obj.spell.meta) {
      career = obj.spell.meta.career;
    }
  });

  return career;
}
//# sourceMappingURL=parseLogs.js.map