function selectAllFromPOI(){
    return `SELECT * FROM dbo.POI`
} 

function getPopularPOI(amountOfPOI, threshold){
    const takeTop = amountOfPOI ? `TOP ${amountOfPOI}` : '';
    return `SELECT ${takeTop} poiName FROM dbo.POI
            WHERE rank >= ${threshold}
            ORDER BY rank DESC`
}

function getMostPopularByCategory(category){
    return `SELECT * FROM dbo.POI
            WHERE rank = (SELECT MAX(rank) 
                          FROM dbo.POI
                          WHERE category = '${category}')`;
}

function getFavoritePOI(username){
    return `SELECT name, category, img, reviews, rank, details, date FROM dbo.POI
            LEFT JOIN dbo.UesrsFavoritePOI ON username = '${username}' AND name = poiName
            ORDER BY date DESC`;
}

function getAllPOINames(){
    return `SELECT name FROM dbo.POI`
}

function deleteFavorites(username){
    return `DELETE FROM dbo.UsersFavoritePOI
            WHERE username = '${username}`;
}

function updateFavoritePOI(username, favorites){
    var rows = '';
    for (const favorite in favorites) {
        row += `(${username}, ${favorite.poiName}, ${favorite.date}), `
    }
    //remove last ', '
    rows = rows.slice(0, -2);
    return `INSERT dbo.UsersFavoritePOI
            VALUES ${rows}`;
}

function tryLogin(username, psw){
    return `SELECT firstName, lastName FROM dbo.Users
            WHERE username = '${username}' AND psw = '${psw}'`;
}

function getUsersCategories(username){
    return `SELECT category FROM dbo.UsersCategories
            WHERE username = '${username}'`;
}

function signup(body){
    return ` INSERT dbo.Users
    VALUES (${body.username},${body.psw},${body.qa},
            ${body.city},${body.country},${body.email},
            ${body.firstName},${body.lastName},${body.username})`
}

function addCategories(categories, username){
    var rows = '';
    for (const categorie in categories) {
        row += `(${username}, ${categorie}), `
    }
    //remove last ', '
    rows = rows.slice(0, -2);
    return `INSERT dbo.UsersCategories
            VALUES ${rows}`;
}

function getAllCategories(){
    return 'SELECT categoryName FROM dbo.Categories';
}

function addReview(poiName, review){
    const date = createDate();
    return `INSERT dbo.Reviews
            VALUES (${poiName}, ${review}, ${date})`;
}

function getRankAndViews(poiName){
    return `SELECT rank, views FROM dbo.POI
            WHERE name = '${poiName}'`;
}

function updateRank(poiName, newRank){
    return `UPDATE dbo.POI
            SET rank = '${newRank}'
            WHERE name = '${poiName}'`;
}

function isValidPOI(poiName){
    return `SELECT name FROM dbo.POI
            WHERE name = '${poiName}'`;
}

function getViews(poiName){
    return `SELECT views FROM dbo.POI
            WHERE name = '${poiName}'`;
}

function addView(views, poiName){
    return `UPDATE dbo.POI
            SET views = '${views}'
            WHERE name = '${poiName}'`;
}

function getLastReviews(poiName){
    return `SELECT TOP 2 review FROM dbo.Reviews
            WHERE name = '${poiName}'
            ORDER BY date DESC`;
}

function answersIdentificationQuestion(username, qa){
    return `SELECT qa FROM dbo.Users
            WHERE username = '${username}' AND qa = '${qa}'`;
}

//'20120618 10:34:09 AM'
function createDate(){
    const today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    const yyyy = today.getFullYear();
    var HH = today.getHours();
    var MM = today.getMinutes();
    var SS = today.getSeconds();
    var ampm = 'AM';

    if(dd < 10) {
        dd ='0'+ dd;
    } 
    if(mm < 10) {
        mm='0'+ mm;
    }  
    if(HH > 12) {
        HH = HH - 12;
        ampm = 'PM';
    }
    if(HH < 10) {
        HH ='0'+ dd;
    } 
    if(MM < 10) {
        MM ='0'+ MM;
    } 
    if(SS < 10) {
        SS ='0'+ SS;
    } 

    return`${yyyy}${mm}${dd} ${HH}:${MM}:${SS} ${ampm}`;
}