const {google} = require('googleapis');
const config = require("../config");
const {User} = require("../schema/authModel")

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URL
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'profile'
];

const url = oauth2Client.generateAuthUrl({
  // If you only need one scope you can pass it as a string
  scope: scopes
});

function session(){
    return async (req, res, next)=>{
        if (req.session && req.session.user) {
            let user = await User.findById(req.session.user).exec()
            if (user) {
                req.user = user._doc;
                req.session.user = user.id;  //refresh the session value
            }
            // finishing processing the middleware and run the route
            next();
        } else {
            req.user = null;
            next();
        }
    }
}

module.exports = {oauth2Client, authUrl:url, session}

// function refreshToken(user){
//     if(!user){
//         return null;
//     }
//     return new Promise((resolve, reject)=>{
//         oauth2Client.refreshToken(user.refresh_token || user.refreshToken)
//         .then((token)=>{
//             oauth2Client.verifyIdToken({
//                 idToken:token.tokens.id_token, 
//                 audience: config.GOOGLE_CLIENT_ID
//             }).then((ticket)=>{
//                 const attrs = ticket.getPayload();
//                 User.findOneAndUpdate({
//                         googleId: attrs.sub
//                     }, 
//                     {
//                         access_token: token.tokens.access_token, 
//                         id_token: token.tokens.id_token
//                     }).then((res)=>{
//                         oauth2Client.setCredentials({id_token: attrs.id_token, access_token: attrs.access_token, refresh_token: attrs.refresh_token})
//                         resolve(res);
//                     })
//                 })
//         }).catch((err)=>{
//             resolve(null);
//         })
//     })
    
// }