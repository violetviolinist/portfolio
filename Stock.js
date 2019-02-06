var app = require('./app');
var connection = require('./DBconnection');
var mysql = require('mysql');

module.exports ={
  Stock: function(stockID, stockName, category){
      this.stockID = stockID;
      this.stockName = stockName;
      this.category = category;
  },

  /*createStockInDB: function(stock){
    return new Prommise(function (resolve, reject) {
       var stock_arr = [stock.stockID, stock.category, stock,stockName];
       connection.query('INSERT INTO stock VALUES ?', [stock_arr], function(err, result, field) {
           if(err) {
               if(err.code == 'ERR_DUP_ENTRY')
                   reject(1);
               else
                   throw err;
           }
           resolve(-1);
       });
    });
  },
*/
  getStockByID: function(stockID){
        return new Promise( function( resolve, reject) {
            connection.query('SELECT * FROM stock WHERE stockID = ?', stockID,function (err, result, field) {
                if(err)
                    throw err;
                if(result.length == 0)
                    reject(-1);
                else
                    resolve(result);
            });
        });
    },

//     getStockBySector: function(email, sector){
//       return new Promise( function(resolve, reject) {
//           sector = sector.split(',');
//           console.log(sector);
//           connection.query('SELECT * FROM stock INNER JOIN asset ON stock.stockID = asset.stockID WHERE asset.email = ? AND stock.category IN (?)', [email, sector], function (err, result, field) {
//               if(err)
//                   throw err;
//           resolve(result);
//       });
//     });
// },
};