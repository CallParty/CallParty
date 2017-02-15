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
    matchingUsersWithRepresentatives.reduce(function (promise, item) {
      return promise.then(function () {
        try {
          return startCallConversation(item.user, item.representatives, campaignCall)
        } catch (e) {
          Raven.captureException(e)
        }
      })
    }, Promise.resolve()).then(() => {
      logMessage(`+++++++ finished conversations for campaignCall: ${campaignCall.title} (${campaignCall._id})`)
    })
  })
}

module.exports = {
  initCallConvos,
}