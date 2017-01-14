var mongoose = require('mongoose')
var Schema = mongoose.Schema

var usersSchema = new Schema({
	_id: String,
	userid: String,
	fbtoken: String,
	state: String,
	congressional_district: Number,
	create_date: String,
	fb_data: {
		unknown: String
	},
	active: Boolean,
	subscribed: Boolean
})

module.exports = UserSchema