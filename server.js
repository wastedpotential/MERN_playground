const Joi = require('joi');
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
//app.use(express.json()); //would be used if all data was submitted in json format
//app.use(express.urlencoded({extended: false}))
app.use(express.static('public')); //public files folder
//this is needed to decode the formdata submissions:
const urlEncodedParser = bodyParser.urlencoded({
    extended: false
})

//connect to mongo DB:
const db = require('./db_creds');
const uri = db.dbCredentials.uri;

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
        collection.find({ enabled: true }, { enabled: 0 }).toArray(function(err, result) {
            if (err) {
                res.status(404).send("ERROR: problem retrieving users")
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
    //turn urlencoded form data into json:
    const postData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        enabled: true //used for soft delete. 
    }

    //validate input:
    const schema = {
        first_name: Joi.string().min(1).required(),
        last_name: Joi.string().min(2).required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
        enabled: Joi.boolean()
    };
    const {error} = Joi.validate(postData, schema);
    if (error) {
        return res.status().send(error.details[0].message);
    }
    
    let insertError = ""
    let insertResult = {};
    MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
        if(err) {
            return res.send('ERROR: unable to connect to MongoDB Atlas...\n' + err);
        }
        console.log('Connected...');
        const collection = client.db("golf_db").collection("users");
        //note: there are no unique indexes on this data yet!
        collection.insertOne(postData, function(err, response) {
            if (err) {
                return res.send("ERROR: DB insert failed");
            }
            else {
                insertResult = response.ops[0];
                delete insertResult.enabled;
                return res.send(JSON.stringify(insertResult));
            }
        })
        client.close();
    });
    
    //TODO:
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