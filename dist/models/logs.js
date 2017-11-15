"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schema = new _mongoose2.default.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  raw: { type: Array },
  healing: { type: Array },
  damage: { type: Array },
  damageTaken: { type: Array },
  deaths: { type: Array },
  damageCasters: { type: Array },
  healingCasters: { type: Array }
});

exports.default = _mongoose2.default.model("Log", schema);
//# sourceMappingURL=logs.js.map