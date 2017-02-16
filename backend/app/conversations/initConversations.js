const { logMessage, captureException } = require('../utilities/logHelper')
const { startCallConversation } = require('./callConvo')
const { startUpdateConversation } = require('./updateConvo')

function initConvos(campaignAction, userConversations) {
  // make an initial log statement to indicate we are about to start conversations for this campaignCall
  const logPromise = logMessage(
    `+++++++ initialize conversations for ${campaignAction.type}: ${campaignAction.title} (${campaignAction._id})`
  )
  return logPromise.then(() => {
    let convoPromises = []
    // now loop through the UserConversations and initialize any uninitialized conversations
    for (let i = 0; i < userConversations.length; i++) {
      try {
        const userConversation = userConversations[i]
        const user = userConversation.user
        // to make this function idempotent, check if this conversation has already been initialized and if not then skip it
        if (userConversation.active === true) {
          convoPromises.push(logMessage(`++ skipping user ${user.firstName} ${user.lastName} (${user._id})`))
        }
        else {
          if (campaignAction.type === 'CampaignCall') {
            const representatives = userConversation.convoData.representatives
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
      return logMessage(`+++++++ finished initializing conversations for campaignCall: ${campaignAction.title} (${campaignAction._id})`)
    }).catch(function(err) {
      captureException(err)
      return logMessage(`+++++++ (with some errors) finished initializing conversations for campaignCall: ${campaignAction.title} (${campaignAction._id})`)
    })
  })
}

module.exports = {
  initConvos,
}