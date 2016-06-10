var MongoClient = require('mongodb').MongoClient;
var password    = require('password-hash-and-salt');

var state = {
  db: null,
}

exports.connect = function(url, done) {
  if (state.db) return done()

  MongoClient.connect(url, function(err, db) {
    if (err) return done(err)
    state.db = db
    done()
  })
}

exports.get = function() {
  return state.db
}

exports.getDatabaseData = function(col) {
  var collection = state.db.collection(col);
  collection.find().toArray(function(err, locations) {
    if (err) {
      return 'Error getting database data';
    } else  {
      console.log('locations from database', locations);
      return locations
    }
  });
}

exports.login = function(data) {
  //console.log('data to verify', data);
  var collection = state.db.collection('test-accounts');
  collection.find({username: data.username}).toArray(function(err, account) {
    if (err) {
      console.log('err', err);
    } else {
      console.log('account with hash', account);
      password(data.password).verifyAgainst(account[0].hash, function(err, verified) {
        console.log('hash to check', account[0].hash);
        if (err) throw new Error('Something went wrong');
        if (!verified) {
          console.log('Please try again');
        } else {
          console.log('Verified', verified);
        }
      })
    }
    
  })
}

exports.createAccount = function(data, response) {
  var collection = state.db.collection('test-accounts');
  password(data.password).hash(function(err, hash) {
    if (err) throw new Error('Something Went Wrong');
    data.hash = hash;
    delete data.password;
    exports.insertIntoDatabase(data, 'test-accounts');
  })
}

exports.insertIntoDatabase = function(data, col) {
  var collection = state.db.collection(col);
  collection.insert(data);
  /*collection.find(data).toArray(function(err, docs) {
      if (docs.length == 0) {
          collection.insert(data);
          console.log('inserted record')
          return true
      } else {
          console.log('record already exists');
          return false
      }
  });*/
}

exports.removeFromDatabase = function(data, col, response) {
  var collection = state.db.collection(col);
  console.log('data for database deletion', data);
  collection.deleteOne(data, function(err, results) {
    console.log('result of delete', results.result);
    if (results.result.ok == results.result.n) {
      console.log('return data to client');
      response.send(data);
    } 
  });

}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}