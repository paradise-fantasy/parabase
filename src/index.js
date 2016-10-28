require('dotenv').config();

const mqtt = require('./mqtt');
const db = require('./db');
const app = require('./app');

Promise.all([
  mqtt.connect(),
  db.connect(),
  app.setup()
])
.then(() => {
  app.start();
})
.catch(err => console.error(err));
