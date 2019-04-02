const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db_creds');

//connect to mongo DB:
const MongoClient = require('mongodb').MongoClient;
const uri = db.dbCredentials.uri;
//"mongodb+srv://adminUser:Adm1npa55!!!@wpcluster0-lxein.mongodb.net/test?retryWrites=true";
//const mongo = new MongoClient(uri, { useNewUrlParser: true });
// mongo.connect(err => {
//   const collection = mongo.db("golf_db").collection("users");
//   // perform actions on the collection object
//   mongo.close();
// });


app.use(express.static('public'));

const urlEncodedParser = bodyParser.urlencoded({
    extended: false
})

app.get('/', function (req, res) {
    console.log("Got a GET request for the homepage");
    res.send('Hello GET');
})

app.post('/', function(req, res) {
    console.log("Got a POST request for the homepage");
    res.send("Hello POST");
})

app.delete('/del_user', function(req, res) {
    console.log("Got a DELETE request for /del_user");
    res.send("Hello DELETE");
})

app.get('/list_users', function(req, res) {
    console.log("Got a GET request for /list_users");
    MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
        if(err) {
             res.send('Error occurred while connecting to MongoDB Atlas...\n',err);
        }
        console.log('Connected...');
        const collection = client.db("golf_db").collection("users");
        //note: there are no unique indexes on this data yet!
        collection.find({}).toArray(function(err, result) {
            if (err) {
                res.send("ERROR: problem retrieving users")
            }
            res.send(result);
        })
        client.close();
     });
     //res.send('User listing - check console for data');
})

app.get('/ab*cd', function(req, res) {
    console.log("Got a GET request for /ab*cd");
    res.send('Page pattern match');
})

app.get('/index.html', function(req, res) {
    res.sendFile( __dirname + "/" + "index.html");
})

app.post('/process_post', urlEncodedParser, function(req, res) {
    let postData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name
    }
    console.log(postData);
    MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
        if(err) {
             console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
        }
        console.log('Connected...');
        const collection = client.db("golf_db").collection("users");
        //note: there are no unique indexes on this data yet!
        collection.insertOne(postData, function(err, res) {
            if (err) {
                console.log("ERROR: post failed!");
            }
        })
        client.close();
     });
    res.end(JSON.stringify(postData)); //display the data on the page
})


//start server:
const server = app.listen(8081, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('example app listening at http://%s:%s', host, port);
})