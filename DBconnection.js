var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jaydahisar',
    database: 'portfolio_system'     //database name to connect to
});

module.exports = connection;