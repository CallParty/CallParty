const botReply = require('../utilities/botkit').botReply
const { UserConversation } = require('../models')
const { logMessage } = require('../utilities/logHelper')


var startUpdateConversation = function(user, userConversation, campaignUpdate) {
  const fakeMessage = {
    channel: user.fbId,
    user: user.fbId
  }
  // save that message has been sent
  UserConversation.update({ _id: userConversation._id }, { active: true }).exec()
  const logPromise = logMessage(
    `++ sending campaignUpdate (${campaignUpdate._id}) to: ${user.firstName} ${user.lastName} (${user.fbId})`
  )
  return logPromise.then(() =>
    updateConvo1(user, fakeMessage, campaignUpdate.message)
  )

}

function updateConvo1(user, message, updateMessage) {
  botReply(message, updateMessage)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
