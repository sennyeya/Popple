var express = require('express');

var router = express.Router();

/* GET the current logged in user. */
router.get('/current', async function(req, res) {
	res.send({
		name:req.user.displayName,
		isAdmin:req.user.isAdmin,
		photo: req.user.image
	});
});

module.exports = router;
