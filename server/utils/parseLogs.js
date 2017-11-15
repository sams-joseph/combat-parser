import abilities from "../json/abilities.json";

const player = "Player";

function getTimestamp(line) {
  const parts = line
    .slice(0, 10)
    .replace(/[\[\]']+/g, "")
    .split("/");
  const times = line
    .slice(10, 20)
    .replace(/[\[\]']+/g, "")
    .split(":");
  const dateString = new Date(
    `20${parts[0]}`,
    `${parts[1] - 1}`,
    `${parts[2]}`,
    `${times[0]}`,
    `${times[1]}`,
    `${times[2]}`,
    0
  );

  const timestamp = {};
  timestamp.dateTime = dateString;
  timestamp.dateTimeParsed = dateString.toString();
  timestamp.time = line.slice(10, 20).replace(/[\[\]']+/g, "");

  return timestamp;
}

function getCaster(line, playerName) {
  const caster = {};
  if (line.indexOf("Your") < 0 || line.indexOf("You") < 0) {
    caster.name = line.slice(21, line.indexOf("'s"));
  } else caster.name = playerName;

  return caster;
}

export function formatSpellName(string) {
  const stringRemoveSpecials = string.replace(/[^a-zA-Z ]/g, "");
  const stringToUnderscore = stringRemoveSpecials.replace(/ /g, "_");
  return stringToUnderscore.toLowerCase();
}

function getSpell(index, event, line) {
  const data = {};
  data.critical = line.includes("critically");
  if (line.indexOf("Your") < 0 || line.indexOf("You") < 0) {
    if (data.critical)
      data.spellName = line.slice(index, line.indexOf("critically") - 1);
    else data.spellName = line.slice(index, line.indexOf(event) - 1);
  } else {
    if (data.critical)
      data.spellName = line.slice(
        line.indexOf("Your") + 5,
        line.indexOf("critically") - 1
      );
    else
      data.spellName = line.slice(
        line.indexOf("Your") + 5,
        line.indexOf(event) - 1
      );
  }

  if (event === "heals")
    data.amount = Number(
      line.slice(line.indexOf("for") + 4, line.indexOf("points") - 1)
    );
  else if (event === "hits")
    data.amount = Number(
      line.slice(line.indexOf("for") + 4, line.indexOf("damage") - 1)
    );

  if (
    line.includes("overhealed") ||
    line.includes("mitigated") ||
    line.includes("overkill")
  ) {
    const arr = line.match(/\(([^)]+)\)/)[1].split(" ");
    data.extra = { amount: Number(arr[0]), label: arr[1] };
  }

  if (abilities[formatSpellName(data.spellName)]) {
    data.meta = abilities[formatSpellName(data.spellName)];
  }

  return data;
}

export function getTarget(event, line, playerName) {
  const data = {};
  data.name = line.slice(
    line.indexOf(event) + event.length + 1,
    line.indexOf("for") - 1
  );

  if (data.name === "you") data.name = playerName;

  return data;
}

export function getAllCasters(object) {
  const casters = [];
  object.forEach(obj => {
    if (casters.indexOf(obj.caster.name) < 0) {
      casters.push(obj.caster.name);
    }
  });

  return casters;
}

export function filterBySpell(object, filter) {
  const result = object.filter(obj => obj.spell.spellName == filter);

  return result;
}

export function filterByCaster(object, filter) {
  const result = object.filter(obj => obj.caster.name === filter);

  return result;
}

export function filterByTarget(object, filter) {
  const result = object.filter(obj => obj.target.name === filter);

  return result;
}

export function calculateCrit(caster, object) {
  const castersActions = filterByCaster(object, caster);
  const crits = castersActions.filter(obj => obj.spell.critical);
  const critPercentage = crits.length / castersActions.length;

  return critPercentage;
}

export function calculateOverhealing(caster, object) {
  let totalOverhealed = 0;
  const castersActions = filterByCaster(object, caster);
  const overhealing = castersActions.filter(obj => obj.spell.extra);
  overhealing.forEach(overheal => {
    totalOverhealed += Number(overheal.spell.extra.amount);
  });

  return totalOverhealed;
}

export function parseAll(line, playerName) {
  const data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line, playerName);
  if (line.includes("heals"))
    data.spell = getSpell(line.indexOf("'s") + 3, "heals", line);
  else if (line.includes("hits"))
    data.spell = getSpell(line.indexOf("'s") + 3, "hits", line);
  data.target = getTarget("heals", line, playerName);
  return data;
}

export function parseHealing(line, playerName) {
  const data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line, playerName);
  data.spell = getSpell(line.indexOf("'s") + 3, "heals", line);
  data.target = getTarget("heals", line, playerName);
  return data;
}

export function parseDamage(line, playerName) {
  const data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line, playerName);
  data.spell = getSpell(line.indexOf("'s") + 3, "hits", line);
  data.target = getTarget("hits", line, playerName);
  return data;
}

export function getPlayerName(fileName) {
  const fileNameParts = fileName.split("-");
  const playerName = fileNameParts[fileNameParts.length - 1];
  return playerName;
}

export function parseDeaths(line, playerName) {
  const data = {};
  data.timestamp = getTimestamp(line);
  data.player = playerName;

  return data;
}

export function getCareer(object, playerName) {
  const playerActions = filterByCaster(object, playerName);
  let career = "No career found";
  playerActions.forEach(obj => {
    if (obj.spell.meta) {
      career = obj.spell.meta.career;
    }
  });

  return career;
}
