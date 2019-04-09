const mongoose = require('mongoose');
const express = require('express');
const users = require('./routes/users');
const home = require('./routes/home');
const app = express();
app.use(express.json()); //handles json requests
app.use(express.urlencoded({ extended: true })); //handles urlencoded requests
app.use(express.static('public')); //public files folder

//routes:
app.use('/users', users);
app.use('/', home);

//connect to MongoDB:
const db = require('./db_creds');
const dbUri = db.dbCredentials.uri;
//const dbUri = 'mongodb://localhost/golf_db';
mongoose.connect(dbUri, {useNewUrlParser: true})
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log('Error: could not connect to mongodb'));

//start server:
const port = process.env.PORT || 3000
const server = app.listen(port, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('example app listening at http://%s:%s', host, port);
})