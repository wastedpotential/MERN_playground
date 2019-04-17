const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express')
const router = express.Router();

//mongoose validation before inserting in mongoDB
const userSchema = new mongoose.Schema({
    first_name: { 
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: {
            isAsync: true,
            validator: async function(v, callback) {
                const result = await User.countDocuments({ email: v});
                if (result === 0) {
                    callback(true)
                } else {
                    callback(false);
                }                
            },
            message: 'DB insert failed: A user with this email already exists'
        }
    },
    isEnabled: {
        type: Boolean, 
        default: true
    },
    date_created: {
        type: Date, 
        default: Date.now()
    },
    date_updated: {
        type: Date, 
        default: Date.now()
    }
})
const User = mongoose.model('User', userSchema);

//retrieve a list of users. If an id is attached, retrieve a single user
router.get('/', async function (req, res) {
    //console.log("GET request for /users");
    
    try {
        const users = await User
            .find({isEnabled: true})
            .select('first_name last_name email')
        return res.send(users);
    }
    catch(err) {
        return res.status(404).send(err.message);
    }
})

//retrieve a single user by id
router.get('/:id', async function (req, res) {
    //console.log("GET request for user id = " + req.params.id);

    try {
        const user = await User
            .findOne({isEnabled: true, _id: req.params.id})
            .select('first_name last_name email')
        return res.send(user);
    }
    catch(err) {
        return res.status(404).send(err.message);
    }
})

//create a user
router.post('/', async function(req, res) {
    //console.log("POST request for /users);

    //validate input:
    result = validateUserData(req.body);
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    //look for existing user with this email:
    try {
        const userCount = await User
            .countDocuments({ email: req.body.email});
        if (userCount > 0) {
            return res.status(400).send("this email address already exists");
        }        
    }
    catch(err) {
        return res.send(err.message);
    }

    //if everything validated, insert it:
    const newUser = new User(req.body);    
    try {
        const result = await newUser.save()
        //TODO: remove hidden fields from result
        return res.send(result);
    }
    catch(err) {
        return res.status(400).send(err.message);
    }
    
})

//soft-delete a user
router.delete('/:id', async function(req, res) {
    
    try {
        const user = await User
            .findOneAndUpdate({isEnabled: true, _id: req.params.id}, 
                { $set: {
                    isEnabled: false,
                    date_updated: Date.now
                }})
            .select('first_name last_name email');
        return res.send(user);
    }
    catch(err) {
        return res.status(400).send(err.message);
    }
})

router.put('/:id', async function(req, res) {
    
    //validate input:
    result = validateUserData(req.body);
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }

    try {
        let user = await User
            .findOneAndUpdate({isEnabled: true, _id: req.params.id},
            { $set: {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                date_updated: Date.now()
            }}, { new: true });
            //.select('first_name last_name email');
        return res.send(user);
    }
    catch(err) {
        return res.status(400).send(err.message);
    }
})

function validateUserData(user) {
    //validate input from REST service:
    const validationSchema = {
        first_name: Joi.string().min(1).required(),
        last_name: Joi.string().min(2).required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
    };
    return Joi.validate(user, validationSchema);
}

module.exports = router;
