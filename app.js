const express = require('express');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const cors = require('cors');

const config = require('./config');
const logs = require('./routes/logs');

dotenv.config();
const app = express();
app.use(fileUpload({ safeFileNames: true, preserveExtension: 0 }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
mongoose.Promise = Promise;
mongoose.connect(config.MONGO_URL, { useMongoClient: true });

app.use('/api/logs', logs);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(config.PORT || config.BACKEND_PORT, () => {
  console.log(`Running on port ${server.address().port}...`);
});

/**
 * Wait for connections to end, then shut down
 * */
function gracefulShutdown() {
  console.log('Received kill signal, shutting down gracefully.');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit();
  });
  // if after
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit();
  }, 10 * 1000);
}
// listen for TERM signal .e.g. kill
process.once('SIGTERM', gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.once('SIGINT', gracefulShutdown);

module.exports = app;
