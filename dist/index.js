"use strict";

var _app = require("./app");

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var listener = _app2.default.listen(process.env.PORT || 5000, function () {
  console.log("Running on port " + listener.address().port + "...");
});

/**
 * Wait for connections to end, then shut down
 * */
function gracefulShutdown() {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(function () {
    console.log("Closed out remaining connections.");
    process.exit();
  });
  // if after
  setTimeout(function () {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit();
  }, 10 * 1000);
}
// listen for TERM signal .e.g. kill
process.once("SIGTERM", gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.once("SIGINT", gracefulShutdown);
//# sourceMappingURL=index.js.map