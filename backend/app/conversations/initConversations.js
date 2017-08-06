const moment = require('moment')

const { logMessage, captureException } = require('../utilities/logHelper')
const { getPopulatedCampaignActionObject } = require('../utilities/campaignActions')
const { startCallConversation } = require('./callConvo')
const { startUpdateConversation } = require('./updateConvo')
const { UserConversation, CampaignAction } = require('../models')
const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS
const CAMPAIGN_ACTION_STATUS = CampaignAction.CAMPAIGN_ACTION_STATUS

async function initConvos(campaignAction, io) {
  /*
   * An idempotent function for sending a campaignAction to all the users it should go to.
   *
   * Sends a conversation to all users with a userConversation associated with this campaignAction
   * where the userConversation has status = 'pending' (meaning it hasn't been sent yet)
   */

  // fetch needed relationships for this campaignAction
  await campaignAction.populate('campaign').populate({ path: 'userConversations', populate: { path: 'user' } }).execPopulate()
  const userConversations = campaignAction.userConversations

  // make an initial log statement to indicate we are about to start conversations for this campaignAction
  await logMessage(
    `++++ [${campaignAction.bot}] initialize conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`
  )

  // save that the campaignAction is sending
  campaignAction.status = CAMPAIGN_ACTION_STATUS.sending
  await campaignAction.save()
  emitCampaignAction(campaignAction, io)

  // now loop through the users and send any conversations which have not already been sent
  for (let i = 0; i < userConversations.length; i++) {
    // to make this function idempotent, only send to userConversation with status = 'pending' (not yet initialized)
    const userConversation = userConversations[i]
    const user = userConversation.user
    if (userConversation.status !== USER_CONVO_STATUS.pending) {
      await logMessage(`++ skipping user ${user.firstName} ${user.lastName} (${user._id})`)
    }
    else {
      try {
        await sendUserConversation(userConversation)
      } catch (err) {
        // if there was an error, mark conversation as error and try sending to the other users
        captureException(err)
        userConversation.status = USER_CONVO_STATUS.error
        userConversation.save()
      }
    }

    // this block of code emits a websocket event that the admin frontend can use to update itself in realtime
    emitCampaignAction(campaignAction, io)
  }

  // finally save that the campaignAction finished sending
  campaignAction.status = CAMPAIGN_ACTION_STATUS.sent
  campaignAction.sentAt = moment.utc().toDate()
  await campaignAction.save()
  emitCampaignAction(campaignAction, io)

  // log metrics about success/errors to slack
  const finalUserConvos = await UserConversation.find({campaignAction: campaignAction._id}).exec()
  const statusCounts = {}
  for (let i = 0; i < finalUserConvos.length; i++) {
    const userConversation = finalUserConvos[i]
    if (!statusCounts[userConversation.status]) {
      statusCounts[userConversation.status] = 0
    }
    statusCounts[userConversation.status] += 1
  }
  const statusEmoji = {}
  statusEmoji[USER_CONVO_STATUS.sent] = ':printer:'
  statusEmoji[USER_CONVO_STATUS.pending] = ':snowflake: @here'
  statusEmoji[USER_CONVO_STATUS.error] = ':x: @here'
  for (var status in statusCounts) {
    const emoji = statusEmoji[status] || ''
    await logMessage(`+ ${emoji} total ${status}: ${statusCounts[status]}`)
  }

  // log completion to slack
  await logMessage(`++++ [${campaignAction.bot}] finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
}

async function emitCampaignAction(campaignAction, io) {
  /*
   * emits a websocket event that the admin frontend can use to update itself in realtime
   */
  try {
    const actionObject = await getPopulatedCampaignActionObject(campaignAction._id, campaignAction.type)
    io.sockets.emit(`campaign_action/${campaignAction._id}`, JSON.stringify({ campaign_action: actionObject }))
  } catch (err) {
    captureException(err)
  }
}

async function sendUserConversation(userConversation) {
  /*
   * sends UserConversation to the correct user
   * using userConversation.campaignAction.type to choose the correct send function
   *
   * Also
   * - sets the user's currentConvo to userConversation
   * - marks whether this userConversation was a success or an error
   * - logs success/failure to slack
   */

  // fetch needed relationships for this userConversation
  await userConversation.populate('campaignAction').populate('user').execPopulate()
  const campaignAction = userConversation.campaignAction

  // set this userConversation as the currentConvo for this user
  const user = userConversation.user
  user.currentConvo = userConversation
  await user.save()
  const convoData = userConversation.convoData

  // log that we are attempting to send
  await logMessage(
    `+ (${user.fbId}) init ${campaignAction.type} ${campaignAction.title} for: ${user.firstName} ${user.lastName}`
  )

  // send the campaign
  try {
    if (campaignAction.type === 'CampaignCall') {
      const representatives = convoData.representatives
      await startCallConversation(user, userConversation, representatives, campaignAction)
    }
    else if (campaignAction.type === 'CampaignUpdate') {
      await startUpdateConversation(user, userConversation, campaignAction)
    }
    else {
      throw new Error('Invalid campaignAction type')
    }
  }
  // if we catch an error, then captureException and mark that this conversation had an error
  catch (e) {
    captureException(e)
    userConversation.status = USER_CONVO_STATUS.error
    await userConversation.save()
  }

  // refetch userConversation from database as it might have been changed while sending
  const userConvo = await UserConversation.findOne({_id: userConversation._id}).exec()
  // if we made it here, and there was no error, log that it was a success
  if (userConvo.status !== USER_CONVO_STATUS.error) {
    userConvo.status = USER_CONVO_STATUS.sent
    userConvo.datePrompted = moment.utc().toDate()
    await userConvo.save()
    await logMessage(`+ (${user.fbId}) success: :small_blue_diamond:`)
  }
  // otherwise log that there was an error
  else {
    await logMessage(`+ (${user.fbId}) error: :small_red_triangle:`)
  }
}


module.exports = {
  initConvos,
}
