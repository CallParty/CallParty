const { User } = require('../models')
const botReply = require('../utilities/botkit').botReply


var startUpdateConversation = function(fbId, updateMessage) {
  User.findOne({fbId: fbId}).exec().then(function (user) {
    const fakeMessage = {
      channel: fbId,
      user: fbId
    }
    updateConvo1(user, fakeMessage, updateMessage)
  })
}

function updateConvo1(user, message, updateMessage) {
  botReply(message, updateMessage)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
