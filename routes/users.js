const MongoClient = require('mongodb').MongoClient;
const Joi = require('joi');
const express = require('express')
const router = express.Router();

//connect to mongo DB:
const db = require('../db_creds');
const uri = db.dbCredentials.uri;

//retrieve a list of users. If an id is attached, retrieve a single user
router.get('/', function (req, res) {

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
router.get('/:id', function (req, res) {
    console.log("GET request for user id = " + req.params.id);
    res.send('Hello GET for user id = ' + req.params.id);

    //retrieve user from DB with id and enabled = true
    //if fail, return error
    //if success, return user data - DO NOT DISPLAY enabled FLAG
})

//create a user
router.post('/', function(req, res) {
    
    //validate input:
    const schema = {
        first_name: Joi.string().min(1).required(),
        last_name: Joi.string().min(2).required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
    };
    const {error} = Joi.validate(req.body, schema);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    //add the enabled property (needed for soft delete):
    req.body.enabled = true;

    let insertResult = {};
    MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
        if(err) {
            return res.status(400).send('ERROR: unable to connect to MongoDB Atlas...\n' + err);
        }
        console.log('Connected...');
        const collection = client.db("golf_db").collection("users");
        //note: there are no unique indexes on this data yet!
        collection.insertOne(req.body, function(err, response) {
            if (err) {
                return res.status(400).send("ERROR: DB insert failed");
            }
            else {
                insertResult = response.ops[0];
                delete insertResult.enabled; //remove the enabled flag from the response
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
router.delete('/:id', function(req, res) {
    //console.log("Got a DELETE request for /users");
    res.send("DELETE for user id = " + req.params.id);
    //find user with this id and enabled = true
    //if success, set enabled to false, return user - DO NOT DISPLAY enabled FLAG
    //if fail, return error
})

router.put('/:id', function(req, res) {
    //console.log("Got an UPDATE request for /users");
    res.send("UPDATE for user id = " + req.params.id);
    //find user with this id and enabled = true
    //if success, update, return user - DO NOT DISPLAY enabled FLAG
    //if fail, error
})

module.exports = router;
