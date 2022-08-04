const { MongoClient } = require("mongodb");
const Db =
  "mongodb+srv://myst-admin:myst1185491@mystaredia.1xxne.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var _db;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      // Verify we got a good "db" object
      if (db) {
        _db = db.db("Blog");
        console.log("Successfully connected to MongoDB.");
      }
      return callback(err, _db);
    });
  },
  getDb: function () {
    return _db;
  },
};
