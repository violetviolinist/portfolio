var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');

var stockRouter = require('./routes/stockRouter');
var userRouter = require('./routes/userRouter');
var user = require('./User');
var connection = require('./DBconnection');
var mysql = require('mysql');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', userRouter);
app.use('/stock', stockRouter);

app.use(session({ secret: 'this-is-a-secret-token', cookie: { maxAge: 60000 }, resave: true,
    saveUninitialized: true}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/*connection.connect( function(err){
  if(err) throw err;

  connection.query('SELECT * FROM classicmodels.customers WHERE customerNumber = 103', function(err, result, fields){
      if (err) throw err;

      Object.keys(result).forEach(function(key) {
          var row = result[key];
          console.log(row.customerName);
});
});
});*/
module.exports = app;
