var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");
const queries = require('./queries');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const port = process.env.PORT || 3000; //environment variable
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get('/getAllPOI', function(req, res){
    query = queries.selectAllFromPOI(); 
    DButilsAzure.execQuery(query)
    .then(function(result){
        console.log(result)
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

app.post('/getPopularPOI', function(req, res){
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

app.use('/logged', function(req, res, next){
    autontication(req, next);
});

app.post('/getMostPopularByCategory', function(req, res){
    const category = req.body.category;
    if(category){
        DButilsAzure.execQuery(queries.getMostPopularByCategory(category))
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
            res.status(400).send(err);
        })
    }
    else {
        res.status(400).send("category is required");
    }
});

app.post('/logged/getFavoritePOI', function(req, res){
    const username = req.decoded.username;
    DButilsAzure.execQuery(queries.getFavoritePOI(username))
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

//check favorite params
app.post('/logged/updateFavoritePOI', function(req, res, next){
    const favorites = req.body.favorites;
    const isValid = true;
    if(favorites){
        for (const favorite in favorites) {
            if(!favorite.poiName || !favorite.date){
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
            res.status(200);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    }
});

//check favorite poi names 
app.post('/logged/updateFavoritePOI', function(req, res, next){
    const favoritesPOINames = req.body.favorites.map((favorite) => favorite.poiName);
    const isValid = true;
    DButilsAzure.execQuery(queries.getAllPOINames())
    .then(function(result){
        for (const name in favoritesPOINames) {
            if (!result.name.includs(name)) {
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
        console.log(err);
        res.send(err);
    });
});

//the update
app.post('/logged/updateFavoritePOI', function(req, res){
    const favorites = req.body.favorites;
    const username = req.decoded.username;
    DButilsAzure.execQuery(queries.deleteFavorites(username))
    .then(() => DButilsAzure.execQuery(queries.updateFavoritePOI(username, favorites)))
    .then(function(){
        res.status(200);
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

app.post('/LogIn', function(req, res){
    username = req.body.username;
    psw = req.body.psw;
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
            console.log(err);
            res.send(err);
        });
    }
    else {
        res.status(400).send("username and password are required");
    }
});

app.get('/logged/getUsersCategories', function(req, res){
    username = req.decoded.username;
    DButilsAzure.execQuery(queries.getUsersCategories(username))
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

//verify params
app.post('/signup', function(req, res, next){
    if(req.body.username && req.body.psw &&
        req.body.qa && req.body.qa.question && req.body.qa.answer &&
        req.body.city && req.body.country &&
        req.body.email && req.body.firstName && req.body.lastName &&
        req.body.categories && (typeof(req.body.categories) == Array && req.body.length > 0)){
        next()
    }
    else {
        res.status(400).send("one of the signup parameters is missing");
    }
});

app.post('/signup', function(req, res){
    DButilsAzure.execQuery(queries.signup(req.body))
    .then(function(){
        DButilsAzure.execQuery(queries.addCategories(req.body.categories, req.body.username))
    })
    .then(function(){
        res.status(200);
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

app.get('/getAllCategories', function(req, res){
    DButilsAzure.execQuery(queries.getAllCategories())
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    });
});

//check valid poi
app.post('/logged/addReview', function(req, res, next){
    isValidPOI(req, res, next);
});

//update rank
app.post('/logged/addReview', function(req, res){
    const poiName = req.body.poiName;
    const rank = req.body.rank;

    if(rank && typeof(rank) === 'number'){
        DButilsAzure.execQuery(queries.getRankAndViews(poiName))
        .then(function(rankAndViews){
            const newRank = calcNewRank(rankAndViews, rank);
            DButilsAzure.execQuery(queries.updateRank(poiName, newRank))
            .then(function(){
                next();
            })
            .catch(function(err){
                console.log(err)
                res.send(err)
            });
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        });
    }
    else {
        res.status(400).send("numeric rank is required");
    }
});

app.post('/logged/addReview', function(req, res){
    if(req.body.review){
        DButilsAzure.execQuery(queries.addReview(poiName, review))
        .then(()=> res.status(200))
        .catch(function(err){
            console.log(err)
            res.send(err)
        });
    } 
});

//check valid poi
app.post('/addView', function(req, res, next){
    isValidPOI(req, res, next);
});

app.post('/addView', function(req, res){
    const poiName = req.body.poiName;
    DButilsAzure.execQuery(queries.getViews(poiName))
    .then(function(views){
        DButilsAzure.execQuery(queries.addView(views + 1, poiName)).
        then(() => res.status(200))
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    })
    .catch(function(err){
        console.log(err);
        res.send(err);
    })
});

app.get('/getLastReviews', function(req, res){
    const poiName = req.body.poiName;
    if(poiName){
        DButilsAzure.execQuery(queries.getLastReviews(poiName))
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    }
    else {
        res.status(400).send("point of view name is required");
    }
});

app.get('/answersIdentificationQuestion', function(req, res){
    const username = req.body.username;
    const qa = req.body.qa;s
    if(username && qa && qa.question && qa.answer){
        DButilsAzure.execQuery(queries.answersIdentificationQuestion(username, qa))
        .then(function(psw){
            if(psw){
                res.send(psw);
            }
            else {
                res.status(400).send("password not found");
            }
           
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    }
    else {
        res.status(400).send("username, question and answer are required");
    }
});

function autontication(req, next){
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

function createToken(username){
    const secret = 'hophopthisissecretnu';
    payload = { username: username };
	options = { expiresIn: "1d" };
    return jwt.sign(payload, secret, options);
}

function calcNewRank(rankAndViews, rank){
    oldRank = rankAndViews.rank;
    views = rankAndViews.views;
    return ((oldRank * views) + rank) / views;
}

function isValidPOI(req, res, next){
    const poiName = req.body.poiName;
    if(poiName){
        DButilsAzure.execQuery(queries.isValidPOI(poiName))
        .then(function(result){
            if(result && result.length > 0){
                 next();
            }
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    }
    else {
        res.status(400).send("point of intrest name is required");
    }
}