const mongoose = require('mongoose')
const { Campaign, CampaignCall, CampaignUpdate, UserConversation } = require('../models')
const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS
const { captureException } = require('../utilities/logHelper')

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

exports.newCampaignAction = async function(req, res) {
  const data = req.body
  const actionData = {
    campaign: ObjectId(req.params.id),
    // targeting
    targetingType: data.targetingType,
    // rep targeting
    memberTypes: data.memberTypes,
    parties: data.parties,
    committees: data.committees,
    // user targeting
    districts: data.districts
  }
  let campaignAction = null
  if (data.type === 'CampaignCall') {
    Object.assign(actionData, {
      title: data.title,
      message: data.message,
      issueLink: data.issueLink,
      shareLink: data.shareLink,
      task: data.task,
    })
    campaignAction = new CampaignCall(actionData)
  }
  else if (data.type === 'CampaignUpdate') {
    Object.assign(actionData, {
      message: data.message,
    })
    campaignAction = new CampaignUpdate(actionData)
  }
  else {
    throw new Error('Invalid action type')
  }

  await campaignAction.save()
  const matchingUsersWithRepresentatives = await campaignAction.getMatchingUsersWithRepresentatives()
  // for each targeted user create a UserConversation
  // we will use these objects to keep track of which users have been messaged
  // uninitialized conversations are initialized by pinging /send/campaignAction
  for (let i = 0; i < matchingUsersWithRepresentatives.length; i++) {
    const user = matchingUsersWithRepresentatives[i].user
    const repIds = matchingUsersWithRepresentatives[i].representatives.map(r => r._id)
    await UserConversation.create({
      user: ObjectId(user._id),
      campaignAction: ObjectId(campaignAction._id),
      convoData: {
        representatives: repIds,
      },
      status: USER_CONVO_STATUS.pending,
    })
  }
  // return json
  return res.json(campaignAction)
}

exports.createUserAction = function(req, res) {
  console.log('User Action Created')
}
exports.updateUserAction = function(req, res) {
  console.log('User Action Updated')
}
