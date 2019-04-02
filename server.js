const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db_creds');

//connect to mongo DB:
const MongoClient = require('mongodb').MongoClient;
const uri = db.dbCredentials.uri;

//public files folder:
app.use(express.static('public'));

const urlEncodedParser = bodyParser.urlencoded({
    extended: false
})

//retrieve a list of users. If an id is attached, retrieve a single user
app.get('/users', function (req, res) {

    console.log("GET request for /users");
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
})

//retrieve a single user by id
app.get('/users/:userId', function (req, res) {

    console.log("Got a GET request for /users");
    res.send('Hello GET for user id = ' + req.params.userId);
})

//create a user
app.post('/users', urlEncodedParser, function(req, res) {
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

//delete a user
app.delete('/users/:userId', urlEncodedParser, function(req, res) {
    console.log("Got a DELETE request for /users");
    res.send("Hello DELETE for user id = " + req.params.userId);
})

app.put('/users/:userId', urlEncodedParser, function(req, res) {
    //console.log("Got an UPDATE request for /users");
    res.send("Hello UPDATE for user id = " + req.params.userId);
})

//form page:
app.get('/index.html', function(req, res) {
    res.sendFile( __dirname + "/" + "index.html");
})


//start server:
const server = app.listen(8081, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('example app listening at http://%s:%s', host, port);
})