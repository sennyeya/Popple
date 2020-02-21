var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require("../schema/authModel");
const config = require("../config")

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // deserialize the cookieUserId to user in the database
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(e => {
        done(new Error("Failed to deserialize an user"));
      });
  });

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV=="development"?"http://localhost:5000/auth/google/redirect":"https://api-dot-popple-255000.appspot.com/auth/google/redirect"
  },
  function(token, tokenSecret, profile, done) {
      User.findOneAndUpdate({ googleId: profile.id }, 
        {googleId: profile.id, displayName: profile.displayName, image: profile.photos.length?profile.photos[0].value : ""}, 
        {upsert:true}, function (err, user) {
            return done(err, user);
        });
  }
));