var Campaign = require('./schemas/campaignSchema.js'),
    mongoose = require('mongoose')

exports.createCampaign = function(req, res) {
  console.log(req)
}

exports.modifyCampaign = function(req, res) {
  console.log('Campaign Adding')
}

exports.lookupOneCampaign = function(req, res) {
  Campaign.findOne({}, function(err, campaign) {
    if (err) return res.send(err)
    console.log(campaign)
  })
}

exports.lookupAllCampaign = function(req, res) {
  Campaign.findOne({}, function(err, campaign) {
    if (err) return res.send(err)
    console.log(campaign)
  })
}

exports.createCampaignAction = function(req, res) {
  
}

exports.createUserAction = function(req, res) {
  console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
  console.log('User Action Updated')
}