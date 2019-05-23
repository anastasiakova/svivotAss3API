var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
const queries = require('./queries');

router.use(function(req, res, next) {
    next();
});

router.get('/getAllPOI', function(req, res){
    query = queries.selectAllFromPOI(); 
    DButilsAzure.execQuery(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.send(err);
    });
});


router.post('/getPopularPOI', function(req, res){
    const threshold = req.body.threshold;
    if (threshold && threshold >= 0){
        const amountOfPOI = req.body.amountOfPOI;
        if(amountOfPOI <= 0 || (amountOfPOI && (typeof(amountOfPOI) !== 'number'))) {
            res.status(400).send("amount should be positive number");
        }
        else {
            DButilsAzure.execQuery(queries.getPopularPOI(amountOfPOI, threshold))
            .then(function(result){
                res.send(result);
            })
            .catch(function(err){
                res.send(err);
            });
        }
    }
    else {
        res.status(400).send("threshold is required");
    }
});

router.post('/getMostPopularByCategory', function(req, res){
    const category = req.body.category;
    if(category){
        DButilsAzure.execQuery(queries.getMostPopularByCategory(category))
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            res.status(400).send(err);
        })
    }
    else {
        res.status(400).send("category is required");
    }
});

module.exports = router;