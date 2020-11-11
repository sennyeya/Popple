const config = require("../config");
const {User} = require("../schema/authModel");
const {oauth2Client} = require('../services/authSetup')

module.exports = {
    upsertAuthUser:async (tokens)=>{
        let ticket = await oauth2Client.verifyIdToken({
            idToken:tokens.id_token, 
            audience: config.GOOGLE_CLIENT_ID
        })
        let payload = ticket.getPayload();
        let user = await User.findOne({googleId:payload.sub}).exec();
        if(!user){
            user = new User({
                googleId: payload.sub, 
                displayName: payload.name, 
                image: payload.picture,
                isAdmin:true
            })
        }
        return (await user.save())
        
    }
}