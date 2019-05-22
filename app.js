var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");
const queries = require('./queries');

const port = process.env.PORT || 3000; //environment variable
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.use(require('body-parser').json());

app.get('/getAllPOI', function(req, res){
    DButilsAzure.execQuery(queries.selectAllFromPOI)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

app.get('/getExtraPOI', function(req, res){
    const poiName = req.body.poiName;
    if(poiName){
        DButilsAzure.execQuery(queries.selectExtraPOI(poiName))
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    }
    else {
        res.status(400).send("POI name is required");
    }
   
});

app.get('/getPopularPOI', function(req, res){
    const threshold = req.body.threshold;
    if (threshold && threshold >= 0){
        const amountOfPOI = req.body.amountOfPOI;
        if(amountOfPOI <= 0 || (amountOfPOI && (typeof(amountOfPOI) !== 'number'))) {
            res.status(400).send("amount should be positive number");
        }
        else {
            DButilsAzure.execQuery(queries.getPopularPOI(amountOfPOI, threshold))
            .then(function(result){
                res.send(result)
            })
            .catch(function(err){
                console.log(err);
                res.send(err);
            });
        }
    }
    else {
        res.status(400).send("threshold is required");
    }
});

app.post('/getFavoritePOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.post('/LogIn', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.post('/getUsername', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.get('/getPopularPOIInCategory', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.post('/getUsersIntrests', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.post('/signup', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.put('/addFavoritePOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.post('/addReview', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.get('/getAllCategories', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

function autontication(req){
    const token = req.header("x-auth-token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        if (req.decoded.admin)
            res.status(200).send({ result: "Hello admin." });
        else
            res.status(200).send({ result: "Hello user." });
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
}