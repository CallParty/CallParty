var Campaign = require('./schemas/campaignSchema.js'),
    mongoose = require('mongoose')

exports.createCampaign = function(req, res) {
  var campaignData = {title: "Lorem ipsum dolor sit amet", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
  //var campaignData = {title: req.title, description: req.description}
  var addingcampaign = new Campaign({
    campaign_title: campaignData.title,
    campaign_description: campaignData.description
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