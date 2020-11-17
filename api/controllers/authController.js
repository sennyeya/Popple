const { hash, compare } = require("bcrypt");
const config = require("../config");
const {User} = require("../schema/authModel");
const {oauth2Client} = require('../services/authSetup')

module.exports = {
    /**
     * Inserts the google OAuth flow based user, using the passed in JSON webtoken.
     */
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
    },

    /**
     * Creates a user based on the local, username/password, flow.
     */
    createAuthUser: async ({firstName, lastName, username, password}) =>{
        let user = await User.findOne({username}).exec();
        if(!user){
            let hashed = await hash(password, 10)
            user = new User({
                username,
                displayName: firstName+" "+lastName,
                password: hashed
            })
            return (await user.save());
        }else{
            throw new Error('User with that username already exists.')
        }
    },

    /**
     * Assert that a user based on the local, username/password, flow exists for the passed in username.
     */
    logInUser: async ({username, password}) =>{
        let user = await User.findOne({username}).exec();
        if(!user){
            throw new Error("No user found.")
        }
        if(!await compare(password, user.password)){
            throw new Error("Password doesn't match.")
        }
        return user;
    }
}