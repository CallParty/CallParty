var Campaign = require('./schemas/campaignSchema.js'),
    mongoose = require('mongoose')

exports.newCampaign = function(req, res) {
  var data = req.body
  var campaign = new Campaign({
    campaign_title: data.title,
    campaign_description: data.description
  })

  campaign.save(function (err) {
    if (err) return res.send(err)
    res.json(campaign)
  })
}

exports.modifyCampaign = function(req, res) {
  console.log('Campaign Adding')
}

exports.getCampaign = function(req, res) {
  Campaign.findOne({_id: req.params.id}, function(err, campaign) {
    if (err) return res.send(err)
    res.json(campaign)
  })
}

exports.getCampaigns = function(req, res) {
  Campaign.find({}, function(err, campaigns) {
    if (err) return res.send(err)
    res.json(campaigns)
  })
}

exports.newCampaignAction = function(req, res) {
  var data = req.body;
  Campaign.findOne({_id: req.params.id}, function(err, campaign) {
    if (err) return res.send(err)
    campaign.campaignActions.push({
      campaignaction_title: data.subject,
      campaignaction_message: data.message,
      campaignaction_cta: data.cta,
      campaignaction_users: [],
      active: false,
      campaignaction_type: data.type
    })
    campaign.save(function (err) {
      if (err) return res.send(err)
      res.json(campaign)
    })
  })
}

exports.createUserAction = function(req, res) {
  console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
  console.log('User Action Updated')
}