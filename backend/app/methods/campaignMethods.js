const mongoose = require('mongoose')
const { Campaign, CampaignCall, CampaignUpdate, UserConversation } = require('../models')
const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS

const ObjectId = mongoose.Types.ObjectId

exports.newCampaign = function(req, res) {

  // get bot from currently logged in admin
  const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

  // process request
  const data = req.body
  const campaign = new Campaign({
    title: data.title,
    description: data.description,
    bot: bot,
  })
  campaign.save(function (err) {
    if (err) return res.status(400).send(err)
    res.json(campaign)
  })
}

exports.modifyCampaign = function(req, res) {

  // get bot from currently logged in admin
  const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

  // update campaign
  return Campaign.update({_id: req._id, bot: bot}, {
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

  // get bot from currently logged in admin
  const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

  // return campaign
  return Campaign
    .findOne({ _id: req.params.id, bot: bot })
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
  // get bot from currently logged in admin
  const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

  // return campaigns
  Campaign
    .find({bot: bot})
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

  // get bot from currently logged in admin
  const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

  // assert that campaign.bot is the same as currently logged in bot
  await campaign = Campaign.findOne({ _id: req.params.id, bot: bot })
  if (campaign.bot !== bot) {
    throw new Error('++ cannot create campaign action for campaign of other bot')
  }

  // process request
  const data = req.body
  const actionData = {
    campaign: ObjectId(req.params.id),
    bot:  bot,
    label: data.label,
    // targeting
    targetingType: data.targetingType,
    // rep targeting
    memberTypes: data.memberTypes,
    parties: data.parties,
    committees: data.committees,
    // user targeting
    districts: data.districts,
    // borrowed targeting
    targetAction: data.targetAction,
  }
  let campaignAction = null
  if (data.type === 'CampaignCall') {
    Object.assign(actionData, {
      subject: data.subject,
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

  // validation
  if (actionData.targetingType === 'borrowed' && !actionData.targetAction) {
    throw new Error('Cannot create action with type borrowed without targetAction')
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

  // for cacheing, save the reps that were targeted
  const targetedReps = await campaignAction.getMatchingRepresentatives()
  campaignAction.targetedRepIds = targetedReps.map(r => r._id)
  await campaignAction.save()

  // return json
  return res.json(campaignAction)
}

exports.createUserAction = function() {
  console.log('User Action Created')
}
exports.updateUserAction = function() {
  console.log('User Action Updated')
}
