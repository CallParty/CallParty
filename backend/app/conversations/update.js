const { User } = require('../models')


var startUpdateConversation = function(bot, fbId) {
  User.findOne({fbId: fbId}).exec().then(function (user) {
    const fakeMessage = {
      channel: fbId,
      user: fbId
    }
    updateConvo1(bot, user, fakeMessage)
  })
}

function updateConvo1(bot, user, message) {
  bot.reply(message, 'Update convo')
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
