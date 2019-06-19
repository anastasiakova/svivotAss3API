var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
const queries = require('./queries');

router.use(function(req, res, next) {
    next();
});

router.get('/logged/getUsersCategories', function(req, res){
    const username = req.decoded.username;
    DButilsAzure.execQuery(queries.getUsersCategories(username))
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.status(404).send('no data to show');
    })
});

router.get('/getAllCategories', function(req, res){
    DButilsAzure.execQuery(queries.getAllCategories())
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.send(err);
    });
});

module.exports = router;