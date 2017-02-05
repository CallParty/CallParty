const { User } = require('../models')


var startUpdateConversation = function(bot, fbId, updateMessage) {
  User.findOne({fbId: fbId}).exec().then(function (user) {
    const fakeMessage = {
      channel: fbId,
      user: fbId
    }
    updateConvo1(bot, user, fakeMessage, updateMessage)
  })
}

function updateConvo1(bot, user, message, updateMessage) {
  bot.reply(message, updateMessage)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
