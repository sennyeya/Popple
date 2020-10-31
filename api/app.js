var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const cookieSession = require('cookie-session');

// Database connection.
var config = require('./config');
var db = require('./db');
const middleware = require('./services/authSetup');

var usersRouter = require('./routes/users');
var dataRouter = require('./routes/data');
var adminRouter = require('./routes/admin');
var authRouter = require('./routes/auth');
var calendarRouter = require("./routes/calendar")

var app = express();
db.connect();

app.use(cookieSession({  name: 'session',  keys: ["asdf"],  maxAge: 24 * 60 * 60 * 1000}));

app.use(middleware.session());
app.use(middleware.initialize());
app.use(middleware.setClient);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({credentials: true, origin: [config.FRONTEND_URL, ""]}));

// Routes
app.use('/users', ensureAuthenticated, usersRouter);
app.use('/data', ensureAuthenticated, dataRouter);
app.use('/auth', authRouter)
app.use('/calendar', ensureAuthenticated, calendarRouter)

// Authenticate requests to admin hook.
app.use('/admin', ensureAdmin, adminRouter)

app.use(function(req, res, next){
  next(createError(404))
})

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
  if (req.user) {
      // user is authenticated
      next();
  } else {
      // return unauthorized
      res.send(401, "Unauthorized");
  }
}

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
      // user is authenticated
      next();
  } else {
      // return unauthorized
      res.send(401, "Unauthorized");
  }
}

module.exports = app;
