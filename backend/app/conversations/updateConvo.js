const botReply = require('../utilities/botkit').botReply


var startUpdateConversation = function(user, userConversation, campaignUpdate) {
  return botReply(user, campaignUpdate.message)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
