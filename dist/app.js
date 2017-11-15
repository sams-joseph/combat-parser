"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressFileupload = require("express-fileupload");

var _expressFileupload2 = _interopRequireDefault(_expressFileupload);

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

var _cors = require("cors");

var _cors2 = _interopRequireDefault(_cors);

var _logs = require("./routes/logs");

var _logs2 = _interopRequireDefault(_logs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();
var app = (0, _express2.default)();
app.use((0, _expressFileupload2.default)({ safeFileNames: true, preserveExtension: 0 }));
app.use(_bodyParser2.default.json());
app.use((0, _cors2.default)({
  origin: true,
  credentials: true
}));
_mongoose2.default.Promise = _bluebird2.default;
_mongoose2.default.connect("mongodb://mongo/api", { useMongoClient: true });

app.use("/api/logs", _logs2.default);

app.get("/*", function (req, res) {
  res.sendFile(_path2.default.join(__dirname, "index.html"));
});

exports.default = app;
//# sourceMappingURL=app.js.map