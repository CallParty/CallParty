var Campaign = require('./schemas/campaignSchema.js'),
	mongoose = require('mongoose')

exports.insertCampaign = function(req, res) {
	console.log('Campaign Adding')
}

exports.lookupCampaign = function(req, res) {
	Campaign.findOne({}, function(err, campaign) {
		if (err) return res.send(err)
		console.log(campaign)
	})
}

exports.createUserAction = function(req, res) {
	console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
	console.log('User Action Updated')
}