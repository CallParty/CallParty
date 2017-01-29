const { User } = require('../models.js')
const { unsubscribeAndAnonymizeUser } = require('../utilities/unsubscribe')

var startUnsubscribeConversation = function(bot, message) {

  User.findOne({fbId: message.user}).exec().then(function(user) {
    // if user is not unsubscribed, set them to be unsubscribe and anonymize all fields except _id
    if (user.unsubscribed != true) {
      unsubscribeAndAnonymizeUser(user)
      bot.reply(message, 'You got it. Just message us again if you ever change your mind!')
    }
    else {
      bot.reply('Got it, you are unsubscribed')
      throw new Error('An unsubscribed user who was not successfully anonymized just tried to Unsubscribe, ' +
        'or there was some kind of other error')
    }
  })
}

module.exports = {
  startUnsubscribeConversation: startUnsubscribeConversation
}



