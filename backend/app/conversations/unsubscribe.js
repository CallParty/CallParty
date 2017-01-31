const { User } = require('../models')
const { unsubscribeAndAnonymizeUser } = require('../utilities/unsubscribe')


function unsubscribeConvo(bot, message) {
  User.findOne({fbId: message.user}).exec().then(function(user) {
    // if the user does not already exist, then maybe they are already unsubscribed
    if (!user) {
      bot.reply(message, "Hey either you haven't signup yet or have already unsubscribed. " +
        "Just send us a message saying 'Hi' if you'd like to sign up again.")
    }
    else {
      if (user.unsubscribed != true) {
        unsubscribeAndAnonymizeUser(user)
        bot.reply(message, 'You got it. Just message us again if you ever change your mind!')
      }
      else {
        bot.reply(message, 'Got it, you are unsubscribed')
        throw new Error('An unsubscribed user who was not successfully anonymized just tried to Unsubscribe, ' +
          'or there was some kind of other error')
      }
    }
  })
}


module.exports = {
  unsubscribeConvo,
}



