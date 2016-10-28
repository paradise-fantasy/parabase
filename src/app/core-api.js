const app = require('./index').app;
const db = require('../db').client.db;
const parseQuery = require('../msc/utils').parseQuery;

const findDocuments = (collection, limit, sort) =>
  db.collection(collection).find().limit(limit).sort(sort).toArray();

app.get('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const { limit, sort } = parseQuery(req.query);
  findDocuments(collection, limit, sort)
    .then(results => res.json(results))
    .catch(err => res.status(500).json(err));
});

app.get('/log', (req, res) => {
  const collection = 'log';
  const { limit, sort } = parseQuery(req.query);
  findDocuments(collection, limit, sort)
    .then(results => res.json(results))
    .catch(err => res.status(500).json(err));
});
