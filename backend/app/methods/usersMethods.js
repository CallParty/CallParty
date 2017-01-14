var UsersSchema = require('./schemas/usersSchema.js'),
	mongoose = require('mongoose')

UsersSchema.methods.insertUser = function () {
	console.log('User Adding')
}

var Users = mongoose.model('Users', usersSchema)
module.exports = Users
