var createError = require('http-errors');
var express = require('express');
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
var studentRouter = require('./routes/student')
var testRouter = require('./routes/test')

var app = express();
db.connect();

let cookieSettings = {}
if(process.env.NODE_ENV!=="development"){
  app.enable('trust proxy');
  cookieSettings = {sameSite:'none', secure:true}
}

app.use(cookieSession({
  name: 'session',  
  keys: ["asdf"],  
  maxAge: 24 * 60 * 60 * 1000,
  ...cookieSettings
}));

app.use(middleware.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({credentials: true, origin: Object.values(config.FRONTEND_URLS)}));

/** Redirect to https. */
app.use (function (req, res, next) {
	if (req.secure || process.env.NODE_ENV==='development') {
		// request was via https, so do no special handling
		next();
	} else {
		// request was via http, so redirect to https
		res.redirect('https://' + req.headers.host + req.url);
	}
});

if(process.env.NODE_ENV==="development"){
  app.use('/test', testRouter)
}

// Routes
app.use('/auth', authRouter)

// User authenticated routes.
app.use('/users', ensureAuthenticated, usersRouter);
app.use('/data', ensureAuthenticated, dataRouter);
app.use('/student', ensureAuthenticated, studentRouter)

// Admin authenticated route.
app.use('/admin', ensureAdmin, adminRouter)

app.use(function(req, res, next){
  next(createError(404))
})

// error handler
app.use(function(err, req, res) {
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
function ensureAuthenticated(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.send(401, "Unauthorized");
  }
}

// Simple route middleware to ensure user is an admin.
function ensureAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
      next();
  } else {
      res.send(401, "Unauthorized");
  }
}

module.exports = app;
