var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
const queries = require('./queries');

router.use(function(req, res, next) {
    next();
});

router.post('/logged/getFavoritePOI', function(req, res){
    const username = req.decoded.username;
    DButilsAzure.execQuery(queries.getFavoritePOI(username))
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        res.status(404).send('data not found');
    });
});


//check favorite params
router.post('/logged/updateFavoritePOI', function(req, res, next){
    const favorites = req.body.favorites;
    var isValid = true;
    if(favorites){
        for (let index = 0; index < favorites.length; index++) {
            if(!favorites[index].poiName || !favorites[index].date){
                isValid = false;
                break; 
            }
        }
        if(isValid){
            next();
        }
        else {
            res.status(400).send("one of your favorite points of intrest is missing parameter");
        }
    }
    else {
        const username = req.decoded.username;
        DButilsAzure.execQuery(queries.deleteFavorites(username))
        .then(function(){
            res.status(200).send();
        })
        .catch(function(err){
            res.send(err);
        });
    }
});

//check favorite poi names 
router.post('/logged/updateFavoritePOI', function(req, res, next){
    const favoritesPOINames = req.body.favorites.map((favorite) => favorite.poiName);
    var isValid = true;
    DButilsAzure.execQuery(queries.getAllPOINames())
    .then(function(result){
        const resultNames = result.map((names) => names.name);
        for (const name in favoritesPOINames) {
            if (!resultNames.includes(favoritesPOINames[name])) {
                isValid = false;
                break; 
            }
        }
        if(isValid){
            next();
        }
        else {
            res.status(400).send("one of your favorite points of intrest name is invalid");
        }
    })
    .catch(function(err){
        res.send(err);
    });
});

//the update
router.post('/logged/updateFavoritePOI', function(req, res){
    const favorites = req.body.favorites;
    const username = req.decoded.username;
    var isValid = true; 
    const dates = favorites.map((favorite) => favorite.date);
    const userKeyRegExp = /^[1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]T[0-1][0-9][:][0-5][0-9][:][0-5][0-9]Z$/
    for (const date in dates) {
        if (!userKeyRegExp.test(dates[date])) {
            isValid = false;
            res.status(400).send('the date format is yyyy-mm-ddTHH:MM:SSZ');
            break;
        }
    }
    if(isValid){
        DButilsAzure.execQuery(queries.deleteFavorites(username))
        .then(() => DButilsAzure.execQuery(queries.updateFavoritePOI(username, favorites)))
        .then(function(){
            res.status(200).send();
        })
        .catch(function(err){
            res.send(err);
        });
    }
});

module.exports = router;