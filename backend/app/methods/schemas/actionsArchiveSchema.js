var mongoose = require('mongoose')
var Schema = mongoose.Schema

var actionsArchiveSchema = new Schema({
	_id: String,
	active: Boolean,
	user_id: String,
	target_name: Boolean,
	action_type: String,
	date_prompted: String,
	date_completed: String,
	actionStatus: String
})

module.exports = actionsArchiveSchema