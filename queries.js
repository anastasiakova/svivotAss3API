function selectAllFromPOI(){
    return `SELECT * FROM dbo.POI`
} 

function selectExtraPOI(poiName){
    return `SELECT views, rank, details FROM dbo.POIExtraDetails
            WHERE CONVERT(VARCHAR, poiName) = '${poiName}'`;
}

function getPopularPOI(amountOfPOI, threshold){
    const takeTop = amountOfPOI ? `TOP ${amountOfPOI}` : '';
    return `SELECT ${takeTop} poiName FROM dbo.POIExtraDetails
            LEFT JOIN dbo.POI ON rank >= ${threshold} AND CONVERT(VARCHAR, poiName) = CONVERT(VARCHAR, name)
            ORDER BY rank DESC`
}
