const {google} = require('googleapis');
const config = require("../config");
const User = require("../schema/authModel")
const {Student} = require("../schema/student")

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URL
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'profile',
  'https://www.googleapis.com/auth/calendar'
];

const url = oauth2Client.generateAuthUrl({
  // If you only need one scope you can pass it as a string
  scope: scopes
});

oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
        // store the refresh_token in my database!
        oauth2Client.verifyIdToken({
            idToken:tokens.id_token, 
            audience: config.GOOGLE_CLIENT_ID
        }).then((token)=>{
            var attrs = token.getPayload();
            // May not return display name and image on every single response?
            User.findOneAndUpdate({ googleId: attrs.sub }, 
                {
                    googleId: attrs.sub, 
                    displayName: attrs.name, 
                    image: attrs.picture, 
                    refresh_token: tokens.refresh_token, 
                    access_token: tokens.access_token,
                    id_token: tokens.id_token,
                    isAdmin:true
                }, 
            {upsert:true},
            function (err, user) {
                return null;
            });
            Student.findOne({ googleId: attrs.sub }, (err, res)=>{
                if(err){
                    console.log("Error finding student: "+err)
                    return;
                }
                if(!res){
                    Student.create(
                        {
                            googleId: attrs.sub, 
                            name: attrs.name,
                            plans:[],
                            completedClasses:[],
                            options:[],
                            semesterPlan:[],
                            desiredCredits:15,
                        }
                    )
                }
            })
        })
        
    }else{
        // store the refresh_token in my database!
        oauth2Client.verifyIdToken({
            idToken:tokens.id_token, 
            audience: config.GOOGLE_CLIENT_ID
        }).then((token)=>{
            var attrs = token.getPayload();
            User.findOneAndUpdate({ googleId: attrs.sub }, 
                {
                    googleId: attrs.sub, 
                    displayName: attrs.name, 
                    image: attrs.picture, 
                    access_token: tokens.access_token,
                    id_token: tokens.id_token
                },
            {upsert:true},
            function (err, user) {
                return null;
            });
            Student.findOne({ googleId: attrs.sub }, (err, res)=>{
                if(err){
                    console.log("Error finding student: "+err)
                    return;
                }
                if(!res){
                    Student.create(
                        {
                            googleId: attrs.sub, 
                            name: attrs.name,
                            plans:[],
                            completedClasses:[],
                            options:[],
                            semesterPlan:[],
                            desiredCredits:15,

                        }
                    )
                }
            })
        })
    }
});

function initialize(){
    return (req, res, next)=>{
        if(!req.session.user && !oauth2Client.credentials){
            req.user = null;
            next();
        }else{
            try{
                oauth2Client.verifyIdToken({
                    idToken:(req.session.user?req.session.user.id_token:null) || oauth2Client.credentials.id_token, 
                    audience: config.GOOGLE_CLIENT_ID
                }).then((token)=>{
                    if(!token){
                        req.user = null;
                        if(req.session){
                            req.session.user = null;
                        }
                        return next();
                    }
                    var attrs = token.getPayload();
                    User.findOne({ googleId: attrs.sub },
                        function (err, user) {
                            if(!user){
                                req.user = null;  
                                if(req.session){
                                    req.session.user = null;
                                }
                                return next();
                            }
                            req.session.user = user;
                            // Replace this with call to attempt to refresh token, then on failure throw or set equal to object received.
                            req.user = oauth2Client.isTokenExpiring(user.access_token)?null:user;
                            oauth2Client.setCredentials({id_token: user.id_token, access_token: user.access_token, refresh_token: user.refresh_token})
                            return next();
                        });
                }).catch((err)=>{
                    try{
                        refreshToken(req.session.user).then((user)=>{
                            req.user = user;
                            req.session.user = user;
                            return next();
                        });
                    }catch(err){
                        req.user = null;
                        if(req.session){
                            req.session.user = null;
                        }
                        return next();
                    }
                })
            }catch(err){
                req.user = null;
                if(req.session){
                    req.session.user = null;
                }
                next();
            }
        }
    }
}

function session(){
    return (req, res, next)=>{
        if (req.session && req.session.user) {
            User.findOne({ googleId: req.session.user }, function(err, user) {
              if (user) {
                console.log(`Retrieved user, ${user.displayName}`)
                req.user = user;
                req.session.user = user;  //refresh the session value
                res.locals.user = user;
              }
              // finishing processing the middleware and run the route
              return next();
            });
        } else {
            next();
        }
    }
}

function setClient(res, req, next){
    next();
}

// set auth as a global default
google.options({
    auth: oauth2Client
});

module.exports = {oauth2Client, authUrl:url, initialize, session, setClient}

function refreshToken(user){
    if(!user){
        return null;
    }
    return new Promise((resolve, reject)=>{
        oauth2Client.refreshToken(user.refresh_token || user.refreshToken)
        .then((token)=>{
            oauth2Client.verifyIdToken({
                idToken:token.tokens.id_token, 
                audience: config.GOOGLE_CLIENT_ID
            }).then((ticket)=>{
                const attrs = ticket.getPayload();
                User.findOneAndUpdate({
                        googleId: attrs.sub
                    }, 
                    {
                        access_token: token.tokens.access_token, 
                        id_token: token.tokens.id_token
                    }).then((res)=>{
                        oauth2Client.setCredentials({id_token: attrs.id_token, access_token: attrs.access_token, refresh_token: attrs.refresh_token})
                        resolve(res);
                    })
                })
        }).catch((err)=>{
            resolve(null);
        })
    })
    
}