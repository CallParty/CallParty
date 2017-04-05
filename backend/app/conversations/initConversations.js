const moment = require('moment')

const { logMessage, captureException } = require('../utilities/logHelper')
const { startCallConversation } = require('./callConvo')
const { startUpdateConversation } = require('./updateConvo')
const { UserConversation } = require('../models')
const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS

async function initConvos(campaignAction, userConversations) {
  /*
   An idempotent function for sending a campaignAction to all the users it should go to.

   campaignAction: the campaignAction being sent
   userConversations: a list of UserConversation for each user the campaign should be sent to
   - note that each userConversation should have a convoData field which has any data necessary for sending the conversation
   */
  // make an initial log statement to indicate we are about to start conversations for this campaignAction
  await logMessage(
    `++++ initialize conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`
  )
  // now loop through the users and send any conversations which have not already been sent
  for (let i = 0; i < userConversations.length; i++) {
    // to make this function idempotent, check if this conversation has already been initialized and if not then skip it
    const userConversation = userConversations[i]
    const user = userConversation.user
    if (userConversation.status !== USER_CONVO_STATUS.pending) {
      await logMessage(`++ skipping user ${user.firstName} ${user.lastName} (${user._id})`)
    }
    else {
      try {
        await sendUserConversation(campaignAction, userConversation)
      } catch (err) {
        // regardless of whether this function fails, also try sending to the other users
      }
    }
  }
  // finally save that the campaignAction finished sending
  campaignAction.sent = true
  campaignAction.sentAt = moment.utc().toDate()
  await campaignAction.save()
  // and log this to slack
  await logMessage(`++++ finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
  // log metrics to slack
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
  statusEmoji[USER_CONVO_STATUS.sent] = ':white_check_mark:'
  statusEmoji[USER_CONVO_STATUS.pending] = ':snowflake: @here'
  statusEmoji[USER_CONVO_STATUS.error] = ':x: @here'
  for (var status in statusCounts) {
    const emoji = statusEmoji[status] || ''
    await logMessage(`++ ${emoji} total ${status}: ${statusCounts[status]}`)
  }
}

async function sendUserConversation(campaignAction, userConversation) {
  /*
   Switch statement based on campaignAction.type and sends UserConversation to the correct user
   passing data as necessary

   Also logs success/failure to slack
   */
  const user = userConversation.user
  user.currentConvo = userConversation._id
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
    else if (campaignAction.type == 'CampaignUpdate') {
      await startUpdateConversation(user, userConversation, campaignAction)
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
  // if we catch an error, then captureException and log that it was an error
  catch (e) {
    captureException(e)
    await logMessage(`+ (${user.fbId}) error: :small_red_triangle:`)
    userConversation.status = USER_CONVO_STATUS.error
    await userConversation.save()
  }
}

module.exports = {
  initConvos,
}
