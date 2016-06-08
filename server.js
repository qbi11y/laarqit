var express        = require('express');
var path           = require('path');
var formidable     = require('formidable');
var fs             = require('fs');
var request        = require('request');
var bodyParser     = require('body-parser');
var mongo          = require('mongodb').MongoClient;
var expressMongoDB = require('express-mongo-db');
var oauth          = require('oauth-signature');
var n              = require('nonce')();
var db             = require('./database');
var _              = require('lodash');
var qs             = require('querystring');

var server         = express();
var keys         = [];

server.use( bodyParser.json() );
server.use( bodyParser.urlencoded( {
    extended: true
}));
server.use( express.static('app') );

// Connect to Mongo on start
db.connect('mongodb://localhost:27017/laarqit', function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    console.log('connected to DB');
    db.get().collection('keys').find().toArray(function(err, docs) {
        if (!err) keys = docs;
    })
  }
});

server.post('/login', function(req, res) {
    res.send('login', req.body);
    db.login(req.body);
});

server.post('/create', function(req, res) {
    res.send('test');
    res.send(db.createAccount(req.body));

});

server.post('/locations/search', function(req, res) {
    var httpMethod = 'GET';

    /* The url we are using for the request */
    var url = 'http://api.yelp.com/v2/search';

    /* We can setup default parameters here */
    console.log('search params', req.body);
    var default_parameters = req.body;

    var required_parameters = {
        oauth_consumer_key : 'jiTTZBrjtWV5k8Gf5BbCyw',
        oauth_token : 'k7735cYgdez_jrcWYAnL3TCqx3zulJtv',
        oauth_nonce : n(),
        oauth_timestamp : n().toString().substr(0,10),
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0'
    };

    /* We combine all the parameters in order of importance */ 
    var parameters = _.assign(default_parameters, required_parameters);
    /* We set our secrets here */
    var consumerSecret = 'HffZa1plE6Xer1vg8VCuRp0OH58';
    var tokenSecret = 'x6-SdRIuV7-T3CsZc-xGWd--_X8';

     /* Then we call Yelp's Oauth 1.0a server, and it returns a signature */
    /* Note: This signature is only good for 300 seconds after the oauth_timestamp */
    var signature = oauth.generate(httpMethod, url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});

    /* We add the signature to the list of paramters */
    parameters.oauth_signature = signature;

    /* Then we turn the paramters object, to a query string */
    var paramURL = qs.stringify(parameters);

    /* Add the query string to the url */
    var apiURL = url+'?'+paramURL;

    /* Then we use request to send make the API Request */
    request(apiURL, function(error, response, body){
        var parseBody = JSON.parse(body);
        for (var n=0; n < parseBody.businesses.length; n++) {
            db.insertIntoDatabase(parseBody.businesses[n], 'test-locations')
        }
        console.log('business', JSON.parse(body));
        //;
        res.send(body)
    });
});

server.post('/locations/remove', function(req, res) {
    console.log('data to remove', req.body);
    db.removeFromDatabase(req.body, 'test-locations', res);
});

server.post('/locations/add', function(req, res) {
    //res.send('added location');
    console.log('added location', req.body);
    request({
        url: 'http://localhost:3000/geocode',
        method: 'POST',
        json: req.body
    }, function(err, response, body) {
        if (err) {
            console.log('Server Error');
        } else {
            req.body.latlng = body.results[0].geometry.location;
            console.log('add body updated', req.body);
            db.insertIntoDatabase(req.body, 'test-locations');
        }        
    });
});

server.post( '/geoCode' ,function(req, res) {
    var address = '';

    for (i in req.body) {
        address += ' '+req.body[i];
    }
    request('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'key='+keys[0].google, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            res.send(body); 
        }        
    })
});

server.get( '/manage/photos', function(req, res) {
    fs.readdir('./app/images', function(err, files) {
        if (!err) {
            res.send(files);
        } else {
            res.send(err);
        }
    })
});

server.post( '/upload', function(req, res) {
    console.log('upload shit');
    // create an incoming form object
    var form = new formidable.IncomingForm();
    var photos = [];

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/app/images');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name));
        console.log('file name to add', form.uploadDir + '/' + file.name);
        db.insertIntoDatabase({dir: form.uploadDir, name: file.name}, 'test-photos');
        photos.push(file.name);
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.send(photos);
        res.end('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);
});

server.listen(3000, function() {
    console.log('Server Running on port 3000!!!');
})
