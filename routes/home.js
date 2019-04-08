const express = require('express');
const router = express.Router();

//form page:
router.get('/', function(req, res) {
    res.sendFile( __dirname + "/" + "index.html");
})

module.exports = router;