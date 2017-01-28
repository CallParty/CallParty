const Campaign = require('./schemas/campaignSchema.js')
const mongoose = require('mongoose')

exports.newCampaign = function(req, res) {
  const data = req.body
  const campaign = new Campaign({
    title: data.title,
    description: data.description
  })
  campaign.save(function (err) {
    if (err) return res.send(err)
    res.json(campaign)
  })
}

exports.modifyCampaign = function(req, res) {
  Campaign.update({
    _id: req._id,
    title: req.campaign_title,
    description: req.campaign_description,
    active: req.active,
    link: req.campaign_link,
  }, function(err, campaign) {
    if (err) return res.send(err)
    console.log(campaign)
  })
}

exports.getCampaign = function(req, res) {
  Campaign.findOne({ _id: req.params.id }, function(err, campaign) {
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
  const data = req.body
  Campaign.findOne({_id: req.params.id}, function(err, campaign) {
    if (err) return res.send(err)

    campaign.campaignActions.push({
      title: data.subject,
      message: data.message,
      cta: data.cta,
      active: false,
      type: data.type
    })
    campaign.save(function (err) {
      if (err) return res.send(err)

      // TODO: send new campaign

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
