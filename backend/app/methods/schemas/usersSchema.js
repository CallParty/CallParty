var mongoose = require('mongoose'),
	Schema = mongoose.Schema

var usersSchema = new Schema({
	_id: String,
	userid: String,
	fbtoken: String,
	state: String,
	congressional_district: Number,
	create_date: String,
	first_name: String,
	last_name: String,
	fb_data: {
		unknown: String
	},
	userActions: [{
		userActionRef: String,
		userActionStatus: String
	}],
	active: Boolean,
	subscribed: Boolean,
	firstCTA: Boolean
})

var Users = mongoose.model('Users', usersSchema)
module.exports = Users