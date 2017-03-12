const mongoose = require('mongoose')
const { Campaign, CampaignCall, CampaignUpdate, UserConversation } = require('../models')

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
    issueLink: data.issueLink,
    shareLink: data.shareLink,
    task: data.task,
    active: false,
    type: data.type,
    memberTypes: data.memberTypes,
    parties: data.parties,
    committees: data.committees,
    districts: data.districts.map((c) => String(c)),
    campaign: ObjectId(req.params.id)
  })
  campaignCall.save()
    .then(savedCampaignCall => Promise.all([savedCampaignCall, savedCampaignCall.getMatchingUsersWithRepresentatives()]))
    .then(([savedCampaignCall, matchingUsersWithRepresentatives]) => {
      // for each targeted user create a UserConversation
      // we will use these objects to keep track of which users have been messaged
      // uninitialized conversations are initialized by pinging /send/campaignCall
      const userConvoPromises = []
      for (let i = 0; i < matchingUsersWithRepresentatives.length; i++) {
        const user = matchingUsersWithRepresentatives[i].user
        const repIds = matchingUsersWithRepresentatives[i].representatives.map(r => r._id)
        const userConvoPromise = UserConversation.create({
          user: ObjectId(user._id),
          campaignAction: ObjectId(savedCampaignCall._id),
          convoData: {
            representatives: repIds,
          }
        })
        userConvoPromises.push(userConvoPromise)
      }
      return Promise.all(userConvoPromises).then(() => {
        return savedCampaignCall
      })
    })
    .then(campaignCall => {
      res.json(campaignCall)
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
        campaignCall.userConversations.map(ua => ua.user)
      ])
    })
    .then(([savedCampaignUpdate, users]) => {
      const userConvoPromises = []
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const userConvoPromise = UserConversation.create({
          user: ObjectId(user._id),
          campaignAction: ObjectId(savedCampaignUpdate._id)
        })
        userConvoPromises.push(userConvoPromise)
      }
      return Promise.all(userConvoPromises).then(() => {
        return savedCampaignUpdate
      })
    })
    .then(campaignUpdate => {
      res.json(campaignUpdate)
    })
    .catch(err => res.status(400).send(err))
}

exports.createUserAction = function(req, res) {
  console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
  console.log('User Action Updated')
}
