var Campaign = require('./schemas/campaignSchema.js'),
    mongoose = require('mongoose')

exports.createCampaign = function(req, res) {
  var addingcampaign = new Campaign({
    campaign_title: req.title,
    campaign_description: req.description
  })

  addingcampaign.save(function (err) {
    if (err) {
      return console.log(err)
    } else {
      console.log('success!')
    }
  })
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

exports.lookupAllCampaigns = function(req, res) {
  Campaign.find({}, function(err, campaign) {
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