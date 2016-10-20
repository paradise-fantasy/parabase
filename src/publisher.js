require('dotenv').config();
const fs = require('fs');
const MQTT = require('mqtt');

const mqttClient = MQTT.connect(process.env.MQTT_HOST, {
  cert: fs.readFileSync('ca.crt'),
  rejectUnauthorized: false
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT');
  // mqttClient.publish('paradise/notify/test', 'Kabb-eh! Stop slacking! Seriously, get to work!');
  mqttClient.publish('paradise/log/test', JSON.stringify({ hello: "world" }));
  mqttClient.end();
});
