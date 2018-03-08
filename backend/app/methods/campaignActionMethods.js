const mongoose = require('mongoose')
const { CampaignAction, CampaignCall, CampaignUpdate, UserConversation } = require('../models')
const campaignCallMethods = require('./campaignCallMethods')
const campaignUpdateMethods = require('./campaignUpdateMethods')

const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS
const CAMPAIGN_ACTION_STATUS = CampaignAction.CAMPAIGN_ACTION_STATUS
const ObjectId = mongoose.Types.ObjectId

async function getCampaignAction(req, res) {

  // get bot from currently logged in admin
  const bot = req.adminUser.bot

  // process request
  const {type} = await CampaignAction.findOne({_id: req.params.id, bot: bot}).select({type: 1, _id: 0}).exec()
  if (!type) {
    return res.status(404).json({error: 'CampaignAction not found.'})
  }

  if (type === 'CampaignCall') {
    return campaignCallMethods.getCampaignCallDetail(req, res)
  } else if (type === 'CampaignUpdate') {
    return campaignUpdateMethods.getCampaignUpdateDetail(req, res)
  }
  else {
    throw new Error('Invalid action type')
  }
}

async function editCampaignAction(req, res) {
  const bot = req.adminUser.bot

  const { type, status } = await CampaignAction.findOne({ _id: req.params.id, bot: bot }).select({ type: 1, status: 1, _id: 0 }).exec()
  if (!type) {
    return res.status(404).json({ error: 'CampaignAction not found.' })
  }
  if (status === CAMPAIGN_ACTION_STATUS.sent) {
    return res.status(422).json({ error: 'CampaignAction has already been sent.' })
  }
  if (!['CampaignCall', 'CampaignUpdate'].includes(type)) {
    return res.status(422).json({ error: 'CampaignAction type must be "CampaignCall" or "CampaignUpdate".' })
  }

  const data = req.body
  const actionData = {
    label: data.label,
    targetingType: data.targetingType,
    districts: data.districts,
    committees: data.committees,
    parties: data.parties,
    memberTypes: data.memberTypes,
    targetAction: data.targetAction
  }

  if (actionData.targetingType === 'borrowed' && !actionData.targetAction) {
    return res.status(422).json({ error: 'Cannot create CampaignActionction with targetingType "borrowed" without targetAction.' })
  }

  let campaignAction = null
  if (type === 'CampaignCall') {
    Object.assign(actionData, {
      subject: data.subject,
      message: data.message,
      issueLink: data.issueLink,
      shareLink: data.shareLink,
      task: data.task
    })
    campaignAction = await CampaignCall.findByIdAndUpdate(req.params.id, { $set: actionData }, { new: true }).exec()
  } else if (type === 'CampaignUpdate') {
    Object.assign(actionData, { message: data.message })
    campaignAction = await CampaignUpdate.findByIdAndUpdate(req.params.id, { $set: actionData }, { new: true }).exec()
  } else {
    throw new Error('Invalid action type')
  }

  const matchingUsersWithRepresentatives = await campaignAction.getMatchingUsersWithRepresentatives()

  // delete all pre-existing UserConversations for this campaign action,
  // because it's conceptually simpler to just delete and re-create them
  await UserConversation.deleteMany({ campaignAction: ObjectId(campaignAction._id) })

  // for each targeted user create a UserConversation
  // we will use these objects to keep track of which users have been messaged
  // uninitialized conversations are initialized by pinging /send/campaignAction
  for (let { user, representatives } of matchingUsersWithRepresentatives) {
    const repIds = representatives.map(r => r._id)
    await UserConversation.create({
      user: ObjectId(user._id),
      campaignAction: ObjectId(campaignAction._id),
      convoData: {
        representatives: repIds,
      },
      status: USER_CONVO_STATUS.pending
    })
  }

  // for cacheing, save the reps that were targeted
  const targetedReps = await campaignAction.getMatchingRepresentatives()
  campaignAction.targetedRepIds = targetedReps.map(r => r._id)
  await campaignAction.save()

  return res.json(campaignAction)
}

async function deleteCampaignAction(req, res) {

  // get bot from currently logged in admin
  const bot = req.adminUser.bot
  const campaignActionId = req.params.id

  // process request
  const campaignAction = await CampaignAction.findOne({_id: campaignActionId, bot: bot}).exec()
  campaignAction.deleted = true
  await campaignAction.save()

  // return response
  return res.json(campaignAction)
}

module.exports = {
  getCampaignAction,
  deleteCampaignAction,
  editCampaignAction
}
