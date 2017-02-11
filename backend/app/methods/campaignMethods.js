const mongoose = require('mongoose')
const { Campaign, CampaignAction, CampaignUpdate } = require('../models')
const createQueue = require('../utilities/createQueue')

const ObjectId = mongoose.Types.ObjectId
const queue = createQueue()

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
  Campaign
    .findOne({ _id: req.params.id })
    .populate('campaignUpdates')
    .populate({
      path: 'campaignActions',
      populate: {
        path: 'userActions'
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
    .populate('campaignUpdates')
    .populate({
      path: 'campaignActions',
      populate: {
        path: 'userActions'
      }
    })
    .exec(function(err, campaigns) {
      if (err) return res.send(err)
      res.json(campaigns)
    })
}

exports.newCampaignAction = function(req, res) {
  const data = req.body
  const campaignAction = new CampaignAction({
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

  campaignAction.save()
    .then(savedCampaignAction => Promise.all([savedCampaignAction, savedCampaignAction.getMatchingUsersWithRepresentatives()]))
    .then(([savedCampaignAction, matchingUsersWithRepresentatives]) => {
      // send the users a call to action
      for (let { user, representatives } of matchingUsersWithRepresentatives) {
        const job = queue.create('callToAction', {
          userId: user._id.toString(),
          representativeIds: representatives.map(r => r._id.toString()),
          campaignActionId: savedCampaignAction._id.toString()
        })
        job.save(function(err) {
          if (err) { throw err }
        })
      }

      return Campaign
        .findOne({ _id: req.params.id })
        .populate('campaignUpdates')
        .populate({
          path: 'campaignActions',
          populate: {
            path: 'userActions'
          }
        }).exec()
    })
    .then(campaign => {
      res.json(campaign)
    })
    .catch(err => res.send(err))
}

exports.newCampaignUpdate = function(req, res) {
  const data = req.body
  const campaignActionId = data.campaignAction.value

  CampaignAction
    .findById(ObjectId(campaignActionId))
    .populate({ path: 'userActions', populate: { path: 'user' } })
    .exec().then(function(campaignAction) {
      const campaignUpdate = new CampaignUpdate({
        message: data.message,
        campaignAction: ObjectId(campaignActionId),
        campaign: ObjectId(req.params.id),
        type:  'update',
        title: `Update: ${campaignAction.title}`
      })
      return Promise.all([campaignUpdate.save(), campaignAction])
    }).then(function([savedCampaignUpdate, campaignAction]) {
      return Promise.all([
        savedCampaignUpdate,
        campaignAction.userActions.filter(ua => ua.active).map(ua => ua.user)
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
        .populate('campaignUpdates')
        .populate({
          path: 'campaignActions',
          populate: {
            path: 'userActions'
          }
        }).exec()
    })
    .then(campaign => {
      res.json(campaign)
    })
    .catch(err => res.send(err))
}

exports.createUserAction = function(req, res) {
  console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
  console.log('User Action Updated')
}
