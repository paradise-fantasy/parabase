require('dotenv').config();
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const MQTT = require('mqtt');
const app = require('./app.js');

MongoClient.connect(process.env.DB_HOST, (err, db) => {
  if (err) return console.error(err);
  db.admin().authenticate(process.env.DB_USER, process.env.DB_PASS);
  console.log('Connected to DB');

  const mqttClient = MQTT.connect(process.env.MQTT_HOST, {
    cert: fs.readFileSync('ca.crt'),
    rejectUnauthorized: false
  })

  mqttClient.on('error', (err) => console.error(err))

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT');

    // Start our application
    app({ db, mqtt: mqttClient });
  });
});
