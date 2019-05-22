// Import the mssql package
var sql = require("mssql");

// Create a configuration object for our Azure SQL connection parameters
var dbConfig = {
 server: "svivotassignment3webdev.database.windows.net", // Use your SQL server name
 database: "svivotAss3db", // Database to connect to
 user: "svivotAdmin", // Use your username
 password: "ass3svivot!", // Use your password
 port: 1433,
 // Since we're on Windows Azure, we need to set the following options
 options: {
       encrypt: true
   }
};

// This function connects to a SQL server, executes a SELECT statement,
// and displays the results in the console.
function getCustomers() {
 // Create connection instance
 var conn = new sql.Connection(dbConfig);

 conn.connect()
 // Successfull connection
 .then(function () {

   // Create request instance, passing in connection instance
   var req = new sql.Request(conn);

   // Call mssql's query method passing in params
   req.query("SELECT * FROM [SalesLT].[Customer]")
   .then(function (recordset) {
     console.log(recordset);
     conn.close();
   })
   // Handle sql statement execution errors
   .catch(function (err) {
     console.log(err);
     conn.close();
   })

 })
 // Handle connection errors
 .catch(function (err) {
   console.log(err);
   conn.close();
 });
}


getCustomers();