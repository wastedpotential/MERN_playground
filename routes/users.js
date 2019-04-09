const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express')
const router = express.Router();

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    isEnabled: {type: Boolean, default: true},
    date_created: {type: Date, default: Date.now},
    date_updated: Date
})
const User = mongoose.model('User', userSchema);

//retrieve a list of users. If an id is attached, retrieve a single user
router.get('/', async function (req, res) {
    //console.log("GET request for /users");
    
    try {
        const users = await User
            .find({isEnabled: true})
            .select('first_name last_name email')
        res.send(users);
    }
    catch(err) {
        res.status(404).send(err);
    }
})

//retrieve a single user by id
router.get('/:id', async function (req, res) {
    //console.log("GET request for user id = " + req.params.id);

    try {
        const user = await User
            .findOne({isEnabled: true, _id: req.params.id})
            .select('first_name last_name email')
        res.send(user);
    }
    catch(err) {
        res.status(404).send(err);
    }
})

//create a user
router.post('/', async function(req, res) {
    //console.log("POST request for /users);

    //validate input:
    const validationSchema = {
        first_name: Joi.string().min(1).required(),
        last_name: Joi.string().min(2).required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
    };
    const {error} = Joi.validate(req.body, validationSchema);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //if everything validated, insert it:
    const newUser = new User(req.body);    
    try {
        const result = await newUser.save()
        //TODO: remove hidden fields from result
        res.send(result);
    }
    catch(err) {
        res.status(400).send(err);
    }
    
    //TODO:
    //look for user with this email address
    //if success - return error (user already exists)
    //if fail, create new user, return user data - DO NOT DISPLAY enabled FLAG
})

//soft-delete a user
router.delete('/:id', async function(req, res) {
    //console.log("Got a DELETE request for /users");
    
    try {
        const user = await User
            .findOneAndUpdate({isEnabled: true, _id: req.params.id}, 
                { $set: {
                    isEnabled: false
                }})
            .select('first_name last_name email')
        res.send(user);
    }
    catch(err) {
        res.status(400).send(err);
    }
})

router.put('/:id', function(req, res) {
    //console.log("Got an UPDATE request for /users");
    res.send("UPDATE for user id = " + req.params.id);
    //find user with this id and enabled = true
    //if success, update, return user - DO NOT DISPLAY enabled FLAG
    //if fail, error
})

module.exports = router;
