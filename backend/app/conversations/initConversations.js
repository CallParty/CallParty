const moment = require('moment')

const { logMessage, captureException } = require('../utilities/logHelper')
const { startCallConversation } = require('./callConvo')
const { startUpdateConversation } = require('./updateConvo')

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
      const userConversation = userConversations[i]
      const user = userConversation.user
      try {
        // to make this function idempotent, check if this conversation has already been initialized and if not then skip it
        if (userConversation.active === true) {
          await logMessage(`++ skipping user ${user.firstName} ${user.lastName} (${user._id})`)
        }
        else {
          await logMessage(
            `+ (${user.fbId}) initializing ${campaignAction.type} ${campaignAction.title} for: ${user.firstName} ${user.lastName}`
          )
          await sendUserConversation(campaignAction, userConversation)
          await logMessage(`+ (${user.fbId}) success: :small_blue_diamond:`)
        }
      } catch (e) {
        captureException(e)
        await logMessage(`+ (${user.fbId}) error: :x: @here`)
      }
  }
  // finally save that the campaignAction finished sending
  campaignAction.sentAt = moment.utc().toDate()
  await campaignAction.save()
  // and log this to slack
  await logMessage(`++++ finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
}

function sendUserConversation(campaignAction, userConversation) {
  /*
   Switch statement based on campaignAction.type and sends UserConversation to the correct user
   passing data as necessary
   */
  const user = userConversation.user
  const convoData = userConversation.convoData
  if (campaignAction.type === 'CampaignCall') {
    const representatives = convoData.representatives
    return startCallConversation(user, userConversation, representatives, campaignAction)
  }
  else if (campaignAction.type == 'CampaignUpdate') {
    return startUpdateConversation(user, userConversation, campaignAction)
  }
}

module.exports = {
  initConvos,
}
