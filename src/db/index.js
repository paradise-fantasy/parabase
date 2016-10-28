const MongoClient = require('mongodb').MongoClient;

// The client that will be exposed to the rest of the app
const client = {};

/**
 * Returns a promise to connect to the MongoDB host,
 * and resolves when the connection has been established.
 */
const connect = () => new Promise((resolve, reject) => {
  MongoClient.connect(process.env.DB_HOST, (err, db) => {
    if (err) return reject(err);
    db.admin().authenticate(process.env.DB_USER, process.env.DB_PASS);
    client.db = db;
    console.log('Connected to DB');
    resolve();
  });
});

module.exports = {
  connect,
  client
};
