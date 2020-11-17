var express = require('express');
const {oauth2Client, authUrl} = require("../services/authSetup")
const config = require("../config");
const authController = require('../controllers/authController')

var router = express.Router();

// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
	if (req.user) {
		res.redirect(config.FRONTEND_URL)
	}else{
		res.redirect(config.BASE_URL+"/auth/login/failed")
	}
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
	req.user = null;
	res.status(401).json({
		success: false,
		message: "user failed to authenticate."
	});
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
	req.user = null;
	req.session = null;
	oauth2Client.credentials = null
	res.redirect(config.FRONTEND_URL);
});

// auth with google
router.get("/google", (req, res)=>{
  	res.redirect(authUrl)
});

// redirect to home page after successfully login via google
router.get("/google/redirect",async (req, res)=>{
	// This will provide an object with the access_token and refresh_token.
	// Save these somewhere safe so they can be used at a later time.
	try{
		const {tokens} = await oauth2Client.getToken(req.query.code)
		//oauth2Client.setCredentials(tokens);
		let user = await authController.upsertAuthUser(tokens);
		req.session.user = user.id;
		if(user&&user.isAdmin){
		res.redirect(config.FRONTEND_URL+"/admin")
		}else{
		res.redirect(config.FRONTEND_URL+"/student")
		}
	}catch(err){
		console.log(err)
		res.redirect(config.BASE_URL+"/auth/login/failed")
	}
});

router.post('/signUp', async (req, res)=>{
	//validate
	try{
		let user = await authController.createAuthUser(req.body);
		req.session.user = user.id;
		res.sendStatus(200)
	}catch(e){
		res.status(400).json({message})
	}
})

router.post('/login', async (req, res)=>{
	try{
		let user = await authController.logInUser(req.body)
		req.session.user = user.id;
		res.json(user)
	}catch(e){
		req.session = null;
		res.status(400).json({message:"You have entered an invalid username or password"})
	}
})

module.exports = router;