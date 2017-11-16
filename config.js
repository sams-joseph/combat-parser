const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env')) {
  dotenv.load();
}

const defaults = {
  MONGO_URL: 'mongodb://mongo/api',
  BACKEND_PORT: '5000',
};

Object.keys(defaults).forEach((key) => {
  process.env[key] = key in process.env ? process.env[key] : defaults[key];
});

module.exports = process.env;
