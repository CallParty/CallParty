const moment = require('moment')

const { logMessage, captureException } = require('../utilities/logHelper')
const { startCallConversation } = require('./callConvo')
const { startUpdateConversation } = require('./updateConvo')

function initConvos(campaignAction, userConversations) {
  /*
   An idempotent function for sending a campaignAction to all the users it should go to.

   campaignAction: the campaignAction being sent
   userConversations: a list of UserConversation for each user the campaign should be sent to
   - note that each userConversation should have a convoData field which has any data necessary for sending the conversation
   */
  // make an initial log statement to indicate we are about to start conversations for this campaignAction
  const logPromise = logMessage(
    `+++++++ initialize conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`
  )
  return logPromise.then(() => {
    let convoPromises = []
    // now loop through the users and send any conversations which have not already been sent
    for (let i = 0; i < userConversations.length; i++) {
      try {
        const userConversation = userConversations[i]
        // to make this function idempotent, check if this conversation has already been initialized and if not then skip it
        if (userConversation.active === true) {
          const user = userConversation.user
          convoPromises.push(logMessage(`++ skipping user ${user.firstName} ${user.lastName} (${user._id})`))
        }
        else {
          // create a sendPromise which sends the user conversation, and then logs success or failure to slack
          const sendPromise = sendUserConversation(campaignAction, userConversation).then(() => {
            return logMessage(
              `success (${user.fbId})`
            )
          }).catch((e) => {
            captureException(e)
            return logMessage(
              `error (${user.fbId})`
            )
          })
          // add sendPromise to the list of convoPromises
          convoPromises.push(sendPromise)
        }
      } catch (e) {
        captureException(e)
      }
    }
    // finally return a log statement saying that all conversations have been initialized
    return Promise.all(convoPromises).then(() => {
      campaignAction.sentAt = moment.utc().toDate()
      return campaignAction.save()
    })
      .then(() => {
        return logMessage(`+++++++ finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
      }).catch(function(err) {
        captureException(err)
        return logMessage(`+++++++ (with some errors) finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
      })
  })
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
