var express = require('express');
var app = express();
var router = express.Router();
var stock = require('../Stock.js');
var https = require('https');

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

router.get('/liveprices', function(req, res) {
    new Promise( function(resolve, reject) {
        var request = https.get('https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=MSFT,FB,AAPL,AMZN,NVDA,BABA,GOOG,GE,INTC,F&apikey=X7J3MJK9ZP9TZYPP', function (res) {
            var bodyChunks = [];
            var ans;
            res.on('data', function (chunk) {
                bodyChunks.push(chunk);
                //console.log(chunk.toString() + "jkkj");
            }).on('end', function () {
                var body = Buffer.concat(bodyChunks);
                ans = body.toString();
                console.log('BODY: ' + ans);
                resolve( JSON.parse(ans) );
            });
        });
    }).then( function(ans){
            res.json(ans);
        }, function(status) {
            res.status(200);
            res.send('IDK what!');
        });
    });

// router.post('/sector', function(req, res) {
//     stock.getStockBySector(req.body.email, req.body.sectors).then(function(result){
//         res.status(200);
//         res.json(result);
//         res.end();
//     }, function(status){
//         res.end();
//     });
// });
module.exports = router;