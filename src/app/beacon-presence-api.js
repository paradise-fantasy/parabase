const _ = require('lodash');
const app = require('./index').app;
const db = require('../db').client.db;
const mqtt = require('../mqtt').client.mqtt;
const io = require('./index').io;

const TIMEOUT_CHECK_RATE = 60 * 1000; // Each minute
const TIMEOUT_THRESHOLD = 50 * 60 * 1000; // 5 minutes threshold
const AWAY = 'Away';

let presence = [];

const notifyUpdate = () => {
  io.emit('beacon-presence', presence);
  db.collection('beacon-presence').insert({
    _updatedAt: new Date(),
    _service: 'beacon-presence',
    status: presence
  }).catch(err => console.error(err));
};

const logChangeEvent = (name, room) => mqtt.publish(
  'paradise/log/beacon-presence',
  JSON.stringify({ type: 'POSITION_CHANGED', name, room })
);

const personExists = (name) => _.findIndex(presence, { name }) > -1;
const getPerson = (name) => _.find(presence, { name });
const personIsAtPosition = (name, room) => _.find(presence, { name }).position === room;

const addPerson = (name, room) => {
  presence.push({
    name,
    position: room,
    lastSeen: new Date()
  });
};

const updatePosition = (name, room) => {
  const user = getPerson(name);
  user.position = room;
  user.lastSeen = new Date();
}

const updateLastSeen = (name) => getPerson(name).lastSeen = new Date();

app.get('/beacon-presence', (req, res) => res.json(presence));

/**
 * Body: { name, room }
 */
app.post('/beacon-presence/ping', (req, res) => {
  const { name, room } = req.body;
  if (!name) return res.status(400).json({ error: 'No name specified in body' });
  if (!room) return res.status(400).json({ error: 'No room specified in body' });

  if (!personExists(name)) {
    addPerson(name, room);
    logChangeEvent(name, room);
  } else if (personIsAtPosition(name, room)) {
    updateLastSeen(name);
  } else {
    updatePosition(name, room);
    logChangeEvent(name, room);
  }

  notifyUpdate();
  res.sendStatus(200);
});

const checkForTimeouts = () => {
  console.log('\n Checking for timeouts');
  let isChanged = false;

  presence.forEach(person => {
    if (person.position !== AWAY && Date.now() - person.lastSeen > TIMEOUT_THRESHOLD) {
      isChanged = true;
      person.position = AWAY;
      logChangeEvent(person.name, AWAY);
    }
  });

  if (isChanged) {
    console.log('Timeouts did occur');
    notifyUpdate();
  }
  console.log('Check complete \n');
}


db.collection('beacon-presence').find().limit(1).sort({ _updatedAt: -1 }).toArray()
.then(result => {
  if (result.length === 0) return console.log('No previous beacon-presence entries');
  presence = result[0].status;
})
.catch(err => console.error(err));

setInterval(checkForTimeouts, TIMEOUT_CHECK_RATE);
