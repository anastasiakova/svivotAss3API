var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
const queries = require('./queries');

router.use(function(req, res, next) {
    next();
});

//check valid poi
router.post('/logged/addReview', function(req, res, next){
    isValidPOI(req, res, next);
});

//update rank
router.post('/logged/addReview', function(req, res, next){
    const poiName = req.body.poiName;
    const rank = req.body.rank;

    if(rank && typeof(rank) === 'number'){
        DButilsAzure.execQuery(queries.getRankAndViews(poiName))
        .then(function(rankAndViews){
            const newRank = calcNewRank(rankAndViews[0], rank);
            DButilsAzure.execQuery(queries.updateRank(poiName, newRank))
            .then(function(){
                next();
            }).catch(function(err){
                res.send(err);
            });
        })
        .catch(function(err){
            res.send(err);
        });
    }
    else {
        res.status(400).send("numeric rank is required");
    }
});

router.post('/logged/addReview', function(req, res){
    if(req.body.review){
        const poiName = req.body.poiName;
        DButilsAzure.execQuery(queries.addReview(poiName, req.body.review))
        .then(()=> res.status(200).send())
        .catch(function(err){
            res.send(err);
        });
    } 
});


//check valid poi
router.post('/addView', function(req, res, next){
    isValidPOI(req, res, next);
});

router.post('/addView', function(req, res){
    const poiName = req.body.poiName;
    DButilsAzure.execQuery(queries.getViews(poiName))
    .then(function(views){
        DButilsAzure.execQuery(queries.addView(views[0].views + 1, poiName)).
        then(() => res.status(200).send())
        .catch(function(err){
            res.send(err);
        });
    })
    .catch(function(err){
        res.send(err);
    })
});

router.post('/getLastReviews', function(req, res){
    const poiName = req.body.poiName;
    if(poiName){
        DButilsAzure.execQuery(queries.getLastReviews(poiName))
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            res.send(err);
        });
    }
    else {
        res.status(400).send("point of view name is required");
    }
});

function calcNewRank(rankAndViews, rank){
    oldRank = rankAndViews.rank;
    views = rankAndViews.views;
    return (((oldRank * views) + rank) / views);
}

function isValidPOI(req, res, next){
    const poiName = req.body.poiName;
    if(poiName){
        DButilsAzure.execQuery(queries.isValidPOI(poiName))
        .then(function(result){
            if(result && result.length > 0){
                 next();
            }
            else{
                res.status(400).send("point of intrest name is invalid");
            }
        })
        .catch(function(err){
            res.send(err);
        });
    }
    else {
        res.status(400).send("point of intrest name is required");
    }
}

module.exports = router;