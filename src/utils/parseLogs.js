import abilities from "../json/abilities.json";

const player = "Player";

export function parseHealing(line) {
  const data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line);
  data.spell = getSpell(line.indexOf("'s") + 3, "heals", line);
  data.target = getTarget("heals", line);
  return data;
}

export function parseDamage(line) {
  const data = {};
  data.timestamp = getTimestamp(line);
  data.caster = getCaster(line);
  data.spell = getSpell(line.indexOf("'s") + 3, "hits", line);
  data.target = getTarget("hits", line);
  return data;
}

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

function getCaster(line) {
  let caster = {};
  if (line.indexOf("Your") < 0 || line.indexOf("You") < 0) {
    caster.name = line.slice(21, line.indexOf("'s"));
  } else caster.name = player;

  return caster;
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
    data.amount = line.slice(
      line.indexOf("for") + 4,
      line.indexOf("points") - 1
    );
  else if (event === "hits")
    data.amount = line.slice(
      line.indexOf("for") + 4,
      line.indexOf("damage") - 1
    );

  if (
    line.includes("overhealed") ||
    line.includes("mitigated") ||
    line.includes("overkill")
  ) {
    const arr = line.match(/\(([^)]+)\)/)[1].split(" ");
    data.extra = { amount: arr[0], label: arr[1] };
  }

  if (abilities[formatSpellName(data.spellName)]) {
    data.meta = abilities[formatSpellName(data.spellName)];
  }

  return data;
}

function getTarget(event, line) {
  const data = {};
  data.name = line.slice(
    line.indexOf(event) + event.length + 1,
    line.indexOf("for") - 1
  );

  if (data.name === "you") data.name = player;

  return data;
}

export function filterBySpell(object, filter) {
  const result = object.filter(function(obj) {
    return obj.spell.spellName == filter;
  });

  return result;
}

export function filterByCaster(object, filter) {
  const result = object.filter(function(obj) {
    return obj.caster.name == filter;
  });

  return result;
}

export function filterByTarget(object, filter) {
  const result = object.filter(function(obj) {
    return obj.target.name == filter;
  });

  return result;
}

export function formatSpellName(string) {
  const stringRemoveSpecials = string.replace(/[^a-zA-Z ]/g, "");
  const stringToUnderscore = stringRemoveSpecials.replace(/ /g, "_");
  return stringToUnderscore.toLowerCase();
}
