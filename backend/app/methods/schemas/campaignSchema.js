var mongoose = require('mongoose')
var Schema = mongoose.Schema

var campaignSchema = new Schema({
	_id: String,
	campaign_title: String,
	active: Boolean,
	action_type: String,
	campaign_text: String,
	actions: [{
		actionRef: String
	}]
})

module.exports = campaignSchema