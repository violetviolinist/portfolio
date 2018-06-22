var express = require('express');
var app = express();
var router = express.Router();
var stock = require('../Stock.js');

router.get('/getstockbyid', function(req, res) {
    var stockID = req.query.stockID;
    stock.getStockByID(stockID).then( function(result) {
        var ans = new stock.Stock(result[0].stockID, result[0].stockName, result[0].category);
        res.json(ans);
        res.status(200);
        res.end();
    }, function(status) {
        res.status(200);
        res.send('Invalid StockID!');
    });
});

module.exports = router;