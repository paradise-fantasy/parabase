const fs = require('fs');
const MQTT = require('mqtt');

const client = {};

/**
 * Returns a promise to connect to the MQTT host,
 * and resolves when the connection has been established.
 */
const connect = () => new Promise((resolve, reject) => {
  const mqtt = MQTT.connect(process.env.MQTT_HOST, {
    cert: fs.readFileSync('ca.crt'),
    rejectUnauthorized: false
  });

  mqtt.on('error', (err) => {
    console.error("err");
    reject(err);
  });

  mqtt.on('connect', () => {
    console.log('Connected to MQTT');
    client.mqtt = mqtt;
    resolve();
  });
});

module.exports = {
  connect,
  client
};
