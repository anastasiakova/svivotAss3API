const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
var express = require('express');
var router = express.Router();
var DButilsAzure = require('./DButils');
const queries = require('./queries');
const jwt = require("jsonwebtoken");

router.use(function(req, res, next) {
    next();
});

//verify params
router.post('/signup', function(req, res, next){
    if(req.body.username && req.body.psw &&
        req.body.qa && req.body.qa.length === 2 &&
        req.body.qa[0].question && req.body.qa[0].answer &&
        req.body.qa[1].question && req.body.qa[1].answer &&
        req.body.city && req.body.country &&
        req.body.email && req.body.firstName && req.body.lastName &&
        req.body.categories && req.body.categories.length > 0){
        next();
    }
    else {
        res.status(400).send("one of the signup parameters is missing");
    }
});

//Validate given country is a valid country from the XML file
router.post('/signup', function(req, res, next){
    const xmlfile = './Countries.xml';
    fs.readFile(xmlfile, 'utf8' ,function (error, text) {
        if (error) {
            res.status(500).send(`uston we a problem: ${error}`);
        }
        else {
            try{
                parser.parseString(text, function (err, result) {
                    const countries = result['Countries']['Country'];
                    const countriesNames = countries.map((country)=> country.Name[0]);
                    if(countriesNames.includes(req.body.country)){
                        next();
                    }
                    else{
                        res.status(400).send("Could not match given country to server's list of countries.");
                    }
                });
            }
            catch(err){
                res.status(500).send(`uston we a problem: ${err}`);
            }
        }
   });
});

//verify unique username
router.post('/signup', function(req, res, next){
    DButilsAzure.execQuery(queries.isUniqueUsername(req.body.username))
    .then(function(result){
        if(result.length === 0){
            next();
        }
        else{
            res.status(400).send("username is not unique!");
        }
    })
});

//signup
router.post('/signup', function(req, res){
    DButilsAzure.execQuery(queries.signup(req.body))
    .then(function(){
        DButilsAzure.execQuery(queries.addCategories(req.body.categories, req.body.username))
    })
    .then(function(){
        res.status(200).send();
    })
    .catch(function(err){
        res.send(err);
    });
});


router.post('/LogIn', function(req, res){
    const username = req.body.username;
    const psw = req.body.psw;
    if(username && psw){
        DButilsAzure.execQuery(queries.tryLogin(username, psw))
        .then(function(result){
            if(result && result[0].firstName && result[0].lastName){
                const token = createToken(username);
	            res.send({"token": token , "name":`${result[0].firstName} ${result[0].lastName}`});
            }
            else{
                res.status(404).send("username with this password are not found");
            }
        })
        .catch(function(err){
            res.send(err);
        });
    }
    else {
        res.status(400).send("username and password are required");
    }
});

app.router('/answersIdentificationQuestion', function(req, res){
    const username = req.body.username;
    const qa = req.body.qa;
    if(username && qa && qa.length === 2 &&
       qa[0].question && qa[0].answer &&
       qa[1].question && qa[1].answer){
        DButilsAzure.execQuery(queries.answersIdentificationQuestion(username, qa))
        .then(function(psw){
            if(psw.length > 0){
                res.send(psw);
            }
            else {
                res.status(400).send("password not found, try checking your username or answers");
            }
           
        })
        .catch(function(err){
            res.send(err);
        });
    }
    else {
        res.status(400).send("username, question and answer are required");
    }
});

function createToken(username){
    const secret = 'hophopthisissecretnu';
    payload = { username: username };
	options = { expiresIn: "1d" };
    return jwt.sign(payload, secret, options);
}

module.exports = router;
