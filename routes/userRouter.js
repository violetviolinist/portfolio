
var express = require('express');
var app = express();
var router = express.Router();
var User = require('../User');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connection = require('../DBconnection');


router.use(cookieParser());
router.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: Date.now() + (30 * 86400 * 1000) }, resave: true,
    saveUninitialized: true}));

router.post('/create', function(req, res) {
    var user = new User.User(req.body.name, req.body.email, req.body.phone_no, req.body.pan_no, req.body.netWorth, req.body.balance, req.body.password);
    User.createUserInDB(user).then( function(status) {
            console.log(req.body.email + ": " + req.body.password + " created!");
            req.session.email = user.email;
            res.status(200);
            res.json( email );
            res.end();
    }, function(status) {
        res.json( 'Use unique informatiion!' );
    });
});

router.delete('/delete', function(req, res) {
    User.deleteUserFromDB(req.body.email);
    req.session.destroy();
    res.end();
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log(email + ' ' + password);
    User.loginUser(email, password).then( function(status) {
        if(status == 1)
        {
            req.session.email = email;
            console.log(req.session.email);
            console.log(email + ' logged in!');
            res.status(200);
            res.json( email );
            res.end();
        }
    }, function(status) {
        if(status == -1)
        {
            console.log('Invalid email!');
            req.session.destroy();
            res.status(200);
            res.json( 'Invalid email!' );
            res.end();
        }
        else
        {
            console.log('Invalid Password!');
            req.session.destroy();
            res.status(200);
            res.json( 'Invalid Password!' );
            res.end();
        }
    });
});

router.post('/buy', function(req, res) {
    var email = req.body.email;
    var stockID = req.body.stockID;
    var quantity = req.body.quantity;
    var price = req.body.price;
    // if(req.session.email === undefined)
    // {
    //     res.status(200);
    //     res.json(  'Get Lost!' );
    //     res.end();
    // }
    // else {
        User.buyStock(email, stockID, quantity, price).then(function (status) {
            console.log(email + ' bought ' + stockID);
            res.status(200);
            res.json( 'Success' );
            res.end();
        }, function (status) {
            res.status(200);
            res.json( 'Insufficient Funds!' );
            res.end();
        });
    //}
});

router.post('/sell', function(req, res) {
    var email = req.body.email;
    var stockID = req.body.stockID;
    var quantity = req.body.quantity;
    var price = req.body.price;
    console.log(email+"  "+stockID+"  ");
    console.log(quantity+"  "+price);
    if(req.session.email === undefined)
    {
        res.status(200);
        res.json( 'Get Lost!' );
        res.end();
    }
    else {
        User.sellStock(email, stockID, quantity, price).then( function(status) {
            console.log(email + ' sold ' + stockID);
            res.status(200);
            res.json( 'Success' );
            res.end();
        }, function(status) {
            res.status(200);
            res.json( 'Too many stocks!' );
            res.end();
        });
    }
});

router.put('/logout', function(req, res) {
    res.json( { 'answer': req.session.email + ' logged out!' } );
    req.session.destroy();
    res.status(200);
    res.end();
});

router.get('/assets', function(req, res) {
    var email = req.query.email;
    // if(req.session.email === undefined)
    // {
    //     res.status(200);
    //     res.json( { 'answer': 'Get Lost!' } );
    //     res.end();
    // }
    //else
    {
        User.getAssets(email).then( function(result) {
            res.status(200);
            res.json( result );
            res.end();
        });
    }
});

router.get('/transactions', function(req, res) {
    // if(req.session.email === undefined)
    // {
    //     res.status(200);
    //     res.json( { 'answer': 'Get Lost!' } );
    //     res.end();
    // }
    // else
    var email = req.query.email;
    {
        User.getTransactions(email).then( function(result) {
            res.status(200);
            res.json( result );
            res.end();
        });
    }
});

router.get('/userdata', function(req, res) {
    var email = req.query.email;
    connection.query('SELECT * FROM user', function(err, result, field) {
        if(err) throw err;
        res.status(200);
        res.json( result );
        res.end();
    });
});

// For Testing only...
router.get('/checksession', function(req, res) {
    res.json('jay.parekh0@gmail.com');
    console.log(req.session.email);
    res.status(200);
    res.end();
});

router.get('/', function(req, res) {
    console.log('adf');
    //res.render('./public/ShareHouseRouting/ShareHouse/src/index.html');
});

router.get('/logintest', function(req, res) {
    res.render('login');
});

router.get('/testapi', function(req, res) {
    connection.query('SELECT * FROM asset', function(err, result, field) {
        if(err) throw err;
        res.json(result);
    });
});

module.exports = router;