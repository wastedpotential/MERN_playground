const express = require('express');
const users = require('./routes/users');

const app = express();
app.use(express.json()); //handles json requests
app.use(express.urlencoded({ extended: true })); //handles urlencoded requests
app.use(express.static('public')); //public files folder

//routes:
app.use('/users', users);

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