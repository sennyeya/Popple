var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const cookieSession = require('cookie-session')

// Database connection.
var mongoose = require('mongoose');
var config = require('./config');
var db = require('./db');

var passport = require('passport');
const passportSetup = require('./services/passportSetup')

var usersRouter = require('./routes/users');
var dataRouter = require('./routes/data');
var adminRouter = require('./routes/admin');
var authRouter = require('./routes/auth')

var app = express();
db.connect();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({credentials: true, origin: process.env.NODE_ENV=="development"?'http://localhost:3000':"https://popple-255000.appspot.com"}));
app.use(cookieSession({  name: 'session',  keys: ["asdf"],  maxAge: 24 * 60 * 60 * 1000}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/users', ensureAuthenticated, usersRouter);
app.use('/data', ensureAuthenticated, dataRouter);
app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Authenticate requests to admin hook.
app.use('/admin', ensureAuthenticated, adminRouter)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    message:err.message,
    error:err
  })
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(401).json({
    message: "UNAUTHORIZED"
  })
}

module.exports = app;
