var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');
const queries = require('./queries');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
var userRequests = require('./userRequests.js');
var poiRequests = require('./poiRequests.js');
var favoriteRequest = require('./favoriteRequest.js');
var categoriesRequest = require('./categoriesRequest.js');
var extraToPOIRequest = require('./extraToPOIRequest.js');

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//chrome exp handle
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With,Content-Type, Accept");
    next();
})

app.use('/logged', function(req, res, next){
    autontication(req, res ,next);
});

app.post('/signup', userRequests);
app.post('/LogIn', userRequests);
app.post('/answersIdentificationQuestion', userRequests);
app.get('/getAllPOI', poiRequests);
app.post('/getPopularPOI', poiRequests);
app.post('/getMostPopularByCategory', poiRequests);
app.post('/logged/getFavoritePOI', favoriteRequest);
app.post('/logged/updateFavoritePOI', favoriteRequest);
app.get('/logged/getUsersCategories', categoriesRequest);
app.get('/getAllCategories', categoriesRequest);
app.post('/logged/addReview', extraToPOIRequest);
app.post('/addView', extraToPOIRequest);
app.post('/getLastReviews', extraToPOIRequest);

const port = process.env.PORT || 3000; //environment variable
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function autontication(req, res ,next){
    if(!(req.headers && req.headers['x-auth-token'])){
        res.status(401).send("Access denied. No headers provided.");
    }
    else{
        const token = req.header("x-auth-token");
        // no token
        if (!token) res.status(401).send("Access denied. No token provided.");
        // verify token
        try {
            const secret = 'hophopthisissecretnu';
            const decoded = jwt.verify(token, secret);
            req.decoded = decoded;
            next();
        } catch (exception) {
            res.status(400).send("Invalid token.");
        }
    }
}
