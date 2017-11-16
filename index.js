const pm2 = require('pm2');
const { apps } = require('./manifest.json');

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start(
    apps[0].script, {
      instances: apps[0].instances,
    }, (err) => {
      if (err) console.error(err);
      pm2.disconnect();
    });
});

setInterval(() => pm2.flush(), 86400 * 1000);
