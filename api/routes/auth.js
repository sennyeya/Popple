var express = require('express');
const {oauth2Client, authUrl} = require("../services/authSetup")
const config = require("../config")

var router = express.Router();

// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.redirect(config.FRONTEND_URL)
  }else{
    res.redirect(config.BASE_URL+"/auth/login/failed")
  }
});

router.get("/login/status", (req, res)=>{
  if(req.user){
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
  }else{
    res.status(401).json({
      success:false,
      message: "UNAUTHORIZED"
    })
  }
})

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
  req.logout();
  res.redirect(CLIENT_HOME_PAGE_URL);
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
    oauth2Client.setCredentials(tokens);
    res.redirect(config.FRONTEND_URL)
  }catch(err){
    res.redirect(config.BASE_URL+"/auth/login/failed")
  }
});

module.exports = router;