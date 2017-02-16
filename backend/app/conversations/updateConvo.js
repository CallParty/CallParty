const botReply = require('../utilities/botkit').botReply
const { UserConversation } = require('../models')


var startUpdateConversation = function(user, userConversation, campaignUpdate) {
  const fakeMessage = {
    channel: user.fbId,
    user: user.fbId
  }
  // save that message has been sent
  UserConversation.update({ _id: userConversation._id }, { active: true }).exec()
  updateConvo1(user, fakeMessage, campaignUpdate.message)
}

function updateConvo1(user, message, updateMessage) {
  botReply(message, updateMessage)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
