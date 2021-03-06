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
            if(!favorites[index].name || !favorites[index].name){
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
            res.status(404).send('on delete data not found');
        });
    }
});

//check favorite poi names 
router.post('/logged/updateFavoritePOI', function(req, res, next){
    const favoritesPOINames = req.body.favorites.map((favorite) => favorite.name);
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
        res.status(404).send('on all poi data not found');
    });
});

//the update
router.post('/logged/updateFavoritePOI', function(req, res){
    const favorites = req.body.favorites;
    const username = req.decoded.username;
        DButilsAzure.execQuery(queries.deleteFavorites(username))
        .then(() => DButilsAzure.execQuery(queries.updateFavoritePOI(username, favorites)))
        .then(function(){
            res.status(200).send();
        })
        .catch(function(err){
            res.status(404).send('one delete or update no data found');
        });
    
});

module.exports = router;