var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var poolConfig = {
    min: 2,
    max: 5,
    log: true
};

// TODO: edit this
var connectionConfig = {
    userName: 'svivotAdmin',
    password: 'ass3svivot!',
    server: "svivotassignment3webdev.database.windows.net",
    connectionTimeout: 300000,
    requestTimeout: 300000,
    options: { encrypt: true, database: 'svivotAss3db' }
};

//create the pool
var pool = new ConnectionPool(poolConfig, connectionConfig)

pool.on('error', function (err) {
    if (err) {
        console.log(err); 
    }
});

//----------------------------------------------------------------------------------------------------------------------
exports.execQuery = function (query) {
    return new Promise(function (resolve, reject) {

        try {

            var ans = [];
            var properties = [];

            //acquire a connection
            pool.acquire(function (err, connection) {
                if (err) {
                    reject(err);
                }
                console.log('connection on');

                var dbReq = new Request(query, function (err, rowCount) {
                    if (err) {
                        reject(err);
                    }
                });

                dbReq.on('columnMetadata', function (columns) {
                    columns.forEach(function (column) {
                        if (column.colName != null)
                            properties.push(column.colName);
                    });
                });
                dbReq.on('row', function (row) {
                    var item = {};
                    for (i = 0; i < row.length; i++) {
                        item[properties[i]] = row[i].value;
                    }
                    ans.push(item);
                });

                dbReq.on('requestCompleted', function () {
                    connection.release();
                    resolve(ans);
                });
                connection.execSql(dbReq);
            });
        }
        catch (err) {
            reject(err)
        }
    });

};
