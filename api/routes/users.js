var express = require('express');
const PlanController = require("../controllers/planController")

const {Student} = require('../schema/student')

var router = express.Router();

/* GET users listing. */
router.get('/current', async function(req, res) {
	let doc = await Student.findOne({googleId: req.user.googleId})
	if(!doc){
		return res.json(null)
	}
	res.send({
		name:doc.name,
		id:doc.id,
		isAdmin:req.user.isAdmin
	});
});

module.exports = router;
