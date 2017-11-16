const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  raw: { type: Array },
  healing: { type: Array },
  damage: { type: Array },
  damageTaken: { type: Array },
  deaths: { type: Array },
  damageCasters: { type: Array },
  healingCasters: { type: Array },
});

const Log = mongoose.model('Log', schema);
// export default mongoose.model("Log", schema);
module.exports = Log;
