const mongoose = require('mongoose')
const { Campaign, CampaignCall, CampaignUpdate } = require('../models')
const { initCallConvos } = require('../conversations/initConversations')

const ObjectId = mongoose.Types.ObjectId

exports.newCampaign = function(req, res) {
  const data = req.body
  const campaign = new Campaign({
    title: data.title,
    description: data.description
  })
  campaign.save(function (err) {
    if (err) return res.status(400).send(err)
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
  Campaign
    .findOne({ _id: req.params.id })
    .populate({
      path: 'campaignActions',
      populate: {
        path: 'userConversations'
      }
    })
    .exec(function(err, campaign) {
      if (err) return res.send(err)
      res.json(campaign)
    })
}

exports.getCampaigns = function(req, res) {
  Campaign
    .find({})
    .populate({
      path: 'campaignActions',
      populate: {
        path: 'userConversations'
      }
    })
    .exec(function(err, campaigns) {
      if (err) return res.send(err)
      res.json(campaigns)
    })
}

exports.newCampaignCall = function(req, res) {
  const data = req.body
  const campaignCall = new CampaignCall({
    title: data.subject,
    message: data.message,
    link: data.link,
    task: data.task,
    active: false,
    type: data.type,
    memberTypes: data.memberTypes,
    parties: data.parties,
    committees: data.committees,
    campaign: ObjectId(req.params.id)
  })

  campaignCall.save()
    .then(savedCampaignCall => Promise.all([savedCampaignCall, savedCampaignCall.getMatchingUsersWithRepresentatives()]))
    .then(([savedCampaignCall, matchingUsersWithRepresentatives]) => {
      // start async function to loop through all users and start a callConvo with them
      initCallConvos(matchingUsersWithRepresentatives, savedCampaignCall)
      // then immediately return Campaign to frontend
      return Campaign
        .findOne({ _id: req.params.id })
        .populate({
          path: 'campaignActions',
          populate: {
            path: 'userConversations'
          }
        }).exec()
    })
    .then(campaign => {
      res.json(campaign)
    })
    .catch(err => res.status(400).send(err))
}

exports.newCampaignUpdate = function(req, res) {
  const data = req.body
  const campaignCallId = data.campaignCall.value

  CampaignCall
    .findById(ObjectId(campaignCallId))
    .populate({ path: 'userConversations', populate: { path: 'user' } })
    .exec().then(function(campaignCall) {
      const campaignUpdate = new CampaignUpdate({
        message: data.message,
        campaignCall: ObjectId(campaignCallId),
        campaign: ObjectId(req.params.id),
        title: `Update: ${campaignCall.title}`
      })
      return Promise.all([campaignUpdate.save(), campaignCall])
    }).then(function([savedCampaignUpdate, campaignCall]) {
      return Promise.all([
        savedCampaignUpdate,
        campaignCall.userConversations.filter(ua => ua.active).map(ua => ua.user)
      ])
    })
    .then(([savedCampaignUpdate, users]) => {
      for (let user of users) {
        const job = queue.create('update', {
          userId: user._id,
          campaignUpdateId: savedCampaignUpdate._id
        })
        job.save(function(err) {
          if (err) { throw err }
        })
      }

      return Campaign
        .findOne({ _id: req.params.id })
        .populate({
          path: 'campaignActions',
          populate: {
            path: 'userConversations'
          }
        }).exec()
    })
    .then(campaign => {
      res.json(campaign)
    })
    .catch(err => res.status(400).send(err))
}

exports.createUserAction = function(req, res) {
  console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
  console.log('User Action Updated')
}
