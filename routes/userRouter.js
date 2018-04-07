
var express = require('express');
var app = express();
var router = express.Router();
var User = require('../User');
var cookieParser = require('cookie-parser');
var session = require('express-session');

router.use(cookieParser());
router.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 60000 }, resave: true,
    saveUninitialized: true}));

router.post('/create', function(req, res) {
    var user = new User.User(req.body.name, req.body.email, req.body.phone_no, req.body.pan_no, req.body.netWorth, req.body.balance, req.body.password);
    User.createUserInDB(user).then( function(status) {
            console.log(req.body.email + ": " + req.body.password + " created!");
            req.session.email = user.email;
            res.status(200);
            res.end();
    }, function(status) {
        res.send('Use unique informatiion!');
    });
});

router.delete('/delete', function(req, res) {
    User.deleteUserFromDB(req.body.email);
    res.end();
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    User.loginUser(email, password).then( function(status) {
        if(status == 1)
        {
            req.session.email = email;
            console.log(email + ' logged in!');
            res.status(200);
            res.send(email);
            res.end();
        }
    }, function(status) {
        if(status == -1)
        {
            console.log('Invalid email!');
            res.status(200);
            res.send('Invalid email!');
            res.end();
        }
        else
        {
            console.log('Invalid Password!');
            res.status(200);
            res.send('Invalid Password!');
            res.end();
        }
    });
});

router.post('/buy', function(req, res) {
    var email = req.body.email;
    var stockID = req.body.stockID;
    var quantity = req.body.quantity;
    var price = req.body.price;
    if(req.session.email === undefined)
    {
        res.status(200);
        res.send('Get Lost!');
        res.end();
    }
    else {
        User.buyStock(email, stockID, quantity, price).then(function (status) {
            console.log(email + ' bought ' + stockID);
            res.status(200);
            res.send('Success');
            res.end();
        }, function (status) {
            res.status(200);
            res.send('Insufficient Funds!');
            res.end();
        });
    }
});

router.post('/sell', function(req, res) {
    var email = req.body.email;
    var stockID = req.body.stockID;
    var quantity = req.body.quantity;
    var price = req.body.price;
    if(req.session.email === undefined)
    {
        res.status(200);
        res.send('Get Lost!');
        res.end();
    }
    else {
        User.sellStock(email, stockID, quantity, price).then( function(status) {
            console.log(email + ' sold ' + stockID);
            res.status(200);
            res.send('Success');
            res.end();
        }, function(status) {
            res.status(200);
            res.send('Too many stocks!');
            res.end();
        });
    }
});

router.put('/logout', function(req, res) {
    res.send(req.session.email + ' logged out!');
    req.session.destroy();
    res.status(200);
    res.end();
});




// For Testing only...
router.get('/checksession', function(req, res) {
    res.send(req.session.email);
    console.log(req.session.email);
    //res.status(200);
    res.end();
});

router.get('/logintest', function(req, res) {
    res.render('login');
});

module.exports = router;