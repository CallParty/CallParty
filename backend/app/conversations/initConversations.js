const { logMessage, captureException } = require('../utilities/logHelper')
const { startCallConversation } = require('./callConvo')
const { startUpdateConversation } = require('./updateConvo')

function initConvos(campaignAction, toUsers, userConversationByUser) {
  /*
  An idempotent function for sending a campaignAction to all the users it should go to.

  campaignAction: the campaignAction being sent
  toUsers: a list of User which the campaignAction should be sent to
  userConversationByUser: a map from userId to UserConversation (an object which stores if a conversation has been initialized)
  - note that each userConversation should have a convoData field which has any data necessary for sending the conversation
  */
  // make an initial log statement to indicate we are about to start conversations for this campaignAction
  const logPromise = logMessage(
    `+++++++ initialize conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`
  )
  return logPromise.then(() => {
    let convoPromises = []
    // now loop through the users and send any conversations which have not already been sent
    for (let i = 0; i < toUsers.length; i++) {
      try {
        const user = toUsers[i]
        const userConversation = userConversationByUser[user._id]
        const convoData = userConversation.convoData
        // to make this function idempotent, check if this conversation has already been initialized and if not then skip it
        if (userConversation.active === true) {
          convoPromises.push(logMessage(`++ skipping user ${user.firstName} ${user.lastName} (${user._id})`))
        }
        else {
          if (campaignAction.type === 'CampaignCall') {
            const representatives = convoData.representatives
            convoPromises.push(startCallConversation(user, userConversation, representatives, campaignAction))
          }
          else if (campaignAction.type == 'CampaignUpdate') {
            convoPromises.push(startUpdateConversation(user, userConversation, campaignAction))
          }
        }
      } catch (e) {
        captureException(e)
      }
    }
    // finally return a log statement saying that all conversations have been initialized
    return Promise.all(convoPromises).then(() => {
      return logMessage(`+++++++ finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
    }).catch(function(err) {
      captureException(err)
      return logMessage(`+++++++ (with some errors) finished initializing conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`)
    })
  })
}

module.exports = {
  initConvos,
}