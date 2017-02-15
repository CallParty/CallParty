/* Async functions for initializing conversations
 */
const logMessage = require('../utilities/logHelper').logMessage
const Raven = require('raven')
const { startCallConversation } = require('./callConvo')

function initCallConvos(matchingUsersWithRepresentatives, campaignCall) {
  const logPromise = logMessage(
    `+++++++ initialize conversations for campaignCall: ${campaignCall.title} (${campaignCall._id})`
  )
  logPromise.then(() => {
    let promiseChain = Promise.resolve()
    for (let i = 0; i < matchingUsersWithRepresentatives.length; i++) {
      promiseChain = promiseChain.then(function() {
        try {
          const item = matchingUsersWithRepresentatives[i]
          return startCallConversation(item.user, item.representatives, campaignCall)
        } catch (e) {
          Raven.captureException(e)
        }
      })
    }
    return promiseChain
  })
  .then(() => {
    logMessage(`+++++++ finished conversations for campaignCall: ${campaignCall.title} (${campaignCall._id})`)
  })
}

module.exports = {
  initCallConvos,
}