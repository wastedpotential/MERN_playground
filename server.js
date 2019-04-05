const Joi = require('joi');
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.static('public')); //public files folder

//connect to mongo DB:
const db = require('./db_creds');
const uri = db.dbCredentials.uri;

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

    //return all users with enabled = true
    // DO NOT DISPLAY enabled FLAG
})

//retrieve a single user by id
app.get('/users/:id', function (req, res) {
    console.log("GET request for user id = " + req.params.id);
    res.send('Hello GET for user id = ' + req.params.id);

    //retrieve user from DB with id and enabled = true
    //if fail, return error
    //if success, return user data - DO NOT DISPLAY enabled FLAG
})

//create a user
app.post('/users', urlEncodedParser, function(req, res) {
    let postData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        enabled: true //used for soft delete. 
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

    //look for user with this email address
    //if success - return error (user already exists)
    //if fail, create new user, return user data - DO NOT DISPLAY enabled FLAG
})

//delete a user
app.delete('/users/:id', urlEncodedParser, function(req, res) {
    //console.log("Got a DELETE request for /users");
    res.send("DELETE for user id = " + req.params.id);
    //find user with this id and enabled = true
    //if success, set enabled to false, return user - DO NOT DISPLAY enabled FLAG
    //if fail, return error
})

app.put('/users/:id', urlEncodedParser, function(req, res) {
    //console.log("Got an UPDATE request for /users");
    res.send("UPDATE for user id = " + req.params.id);
    //find user with this id and enabled = true
    //if success, update, return user - DO NOT DISPLAY enabled FLAG
    //if fail, error
})

//form page:
app.get('/index.html', function(req, res) {
    res.sendFile( __dirname + "/" + "index.html");
})


//start server:
const port = process.env.PORT || 3000
const server = app.listen(port, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('example app listening at http://%s:%s', host, port);
})