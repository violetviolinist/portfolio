var app = require('./app');
var connection = require('./DBconnection');
var mysql = require('mysql');
var dateformat = require('dateformat');

module.exports = {

    User: function( name, email, phone_no, pan_no, netWorth, balance, password)
    {
        this.name = name;
        this.pan_no = pan_no;
        this.email = email;
        this.phone_no = phone_no;
        this.netWorth = netWorth;
        this.balance = balance;
        this.password = password;
    },

    createUserInDB: function (user)
    {
        var user_values = [[user.name, user.email, user.phone_no, user.pan_no, user.netWorth, user.balance, user.password]];
        return new Promise(function (resolve, reject) {
                connection.query('INSERT INTO user VALUES ?', [user_values], function (err, result, field) {
                    if (err) {
                        if (err.code == 'ER_DUP_ENTRY') {
                            reject(1);
                        }
                        else
                            throw err;
                    }
                    resolve(-1);
                });
            });
    },

    deleteUserFromDB: function(email)
    {
        connection.query('DELETE FROM user WHERE email = ?', email, function(err, result, field){
            if(err) throw err;
        });
    },

    loginUser: function(email, password)
    {
        return new Promise( function(resolve, reject) {
            connection.query('SELECT password FROM user WHERE email = ?', [email], function(err, result, field) {
                if(err) throw err;
                if(result.length == 0)
                    reject(-1);
                else
                if(result[0].password == password)
                    resolve(1);
                else
                    reject(0);
            });
        });
    },

    buyStock: function(email, stockID, quantity, price) {
        return new Promise( function(resolve, reject) {

            new Promise(function (resolve1, reject1) {
                //console.log(email);
                connection.query('SELECT balance FROM user WHERE email = ?', [email], function (err, result, field) {
                    if (err) throw err;
                    resolve1(result[0].balance);
                    });
                }).then(function (balance) {
                if (balance >= quantity * price) {
                    var date = new Date();
                    var __date = dateformat(date, 'yyyy-mm-dd') + ' ' + dateformat(date, 'isoTime');
                    var values = [['buy', stockID, quantity, price, __date, email]];

                    connection.query('INSERT INTO transaction(type, stockID, quantity, price, time, email) VALUES ?', [values], function (err, result, field) {
                        if (err) throw err;

                        var new_balance = balance - quantity * price;

                        connection.query('UPDATE user SET balance = ? WHERE email = ?', [new_balance, email], function (err, result, field) {
                            if (err) throw err;
                        });
                        connection.query('SELECT * FROM asset WHERE stockID = ? AND email = ?', [stockID, email], function (err, result, field) {
                            if (err) throw err;
                            if (result.length == 0) {
                                console.log('Asset does not exist already!');
                                connection.query('INSERT INTO asset VALUES ?', [[[stockID, price, quantity, email]]], function(err, result, field) {
                                    if(err) throw err;
                                });
                            }
                            else
                            {
                                var buyPrice = Number(result[0].buyPrice);
                                var old_quantity = Number(result[0].quantity);
                                var new_quantity = (Number(old_quantity) + Number(quantity));
                                var new_buyPrice = (buyPrice * old_quantity + price * quantity) / (Number(old_quantity) + Number(quantity));
                                connection.query('UPDATE asset SET buyPrice = ? WHERE stockID = ? AND email = ?', [new_buyPrice, stockID, email], function(err, result, field){
                                    if(err) throw err;
                                });

                                connection.query('UPDATE asset SET quantity = ? WHERE stockID = ? AND email = ?', [new_quantity, stockID, email], function(err, result, field){
                                    if(err) throw err;
                                });
                            }
                        });

                    });
                    resolve(1);
                }
                else
                    reject(-1);
            });
            }, function () {});
    },

    sellStock: function(email, stockID, quantity, price){
        return new Promise( function(resolve, reject) {

            new Promise( function(resolve1, reject1) {
                connection.query('SELECT * FROM asset WHERE email = ? AND stockID = ?', [email, stockID], function(err, result, field){
                    if(err) throw err;
                    if(result[0].quantity >= quantity)
                        resolve1(result);
                    else
                        reject1(-1);
                });
            }).then( function(result){

                var date = new Date();
                var __date = dateformat(date, 'yyyy-mm-dd') + ' ' + dateformat(date, 'isoTime');
                var values = [['sell', stockID, quantity, price, __date, email]];

                connection.query('INSERT INTO transaction(type, stockID, quantity, price, time, email) VALUES ?', [values], function (err, result, field) {
                    if (err) throw err;
                });

                connection.query( 'SELECT balance FROM user WHERE email = ?', email, function(err, result, field) {
                    if(err) throw err;
                    var new_balance = Number(result[0].balance) + (quantity * price);
                    connection.query( 'UPDATE user SET balance = ? WHERE email = ?', [new_balance, email], function(err, result, field){
                        if(err) throw err;
                    });
                });
                var old_buyPrice = Number(result[0].buyPrice);
                var old_quantity = Number(result[0].quantity);
                var new_quantity = Number(old_quantity) - Number(quantity);
                var new_buyPrice = ( (old_buyPrice * old_quantity) - (quantity * price) ) / new_quantity;
                if(new_quantity == 0)
                {
                    connection.query('DELETE FROM asset WHERE email = ? AND stockID = ?', [email, stockID], function(err, result, field){
                        if(err) throw err;
                    });
                }
                else {
                connection.query('UPDATE asset SET quantity = ? WHERE email = ? AND stockID = ?', [new_quantity, email, stockID], function (err, result, field) {
                    if (err) throw err;
                });
                }

                resolve(1);
            }, function(status) {
                reject(-1);
            });

        });
    },

    getAssets: function(email) {
        return new Promise( function(resolve, reject) {
            connection.query('SELECT * FROM asset WHERE email = ?', [email], function(err, result, field) {
                if(err) throw err;
                resolve(result);
            });
        });
    },

    getTransactions: function(email) {
        return new Promise( function(resolve, reject) {
            connection.query('SELECT * FROM transaction WHERE email = ?', [email], function(err, result, field) {
                if(err) throw err;
                resolve(result);
            });
        });
    },
};
