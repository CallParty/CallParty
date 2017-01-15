var Users 	 = require('./schemas/usersSchema.js'),
	mongoose = require('mongoose')

exports.insertUser = function(req, res) {
	console.log('User Adding')
}

exports.lookupUser = function(req, res) {
	User.find({}, function(err, user) {
		if (err) return res.send(err)
		console.log(user)
	})
}

//--- Using methods in application: 
// var userfunc = require('')
// userfunc.lookupUser()