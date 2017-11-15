import app from "./app";

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log(`Running on port ${listener.address().port}...`);
});

/**
 * Wait for connections to end, then shut down
 * */
function gracefulShutdown() {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit();
  });
  // if after
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit();
  }, 10 * 1000);
}
// listen for TERM signal .e.g. kill
process.once("SIGTERM", gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.once("SIGINT", gracefulShutdown);
