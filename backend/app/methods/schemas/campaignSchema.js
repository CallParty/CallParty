var mongoose = require('mongoose')
var Schema = mongoose.Schema

var campaignActionsSchema = new Schema({
	_id: String,
	campaignaction_title: String,
	campaignaction_message: String,
	campaignaction_cta: String,
	campaignaction_users: Array,
	active: Boolean,
	campaignaction_type: String
})

var campaignSchema = new Schema({
	_id: String,
	campaign_title: String,
	campaign_description: String,
	active: Boolean,
	campaign_link: String,
	userActions: [{
		userActionRef: String
	}],
	campaignActions: [campaignActionsSchema]
})

module.exports = campaignSchema