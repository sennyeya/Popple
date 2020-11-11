var express = require('express');
const PlanController = require("../controllers/planController")

const {User} = require('../schema/authModel')

var router = express.Router();

/* GET users listing. */
router.get('/current', async function(req, res) {
	res.send({
		name:req.user.displayName,
		isAdmin:req.user.isAdmin,
		photo: req.user.image
	});
});

module.exports = router;
