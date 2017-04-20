const { User } = require('../models')
const { unsubscribeAndAnonymizeUser } = require('../utilities/unsubscribe')
const botReply = require('../utilities/botReply').botReply


function unsubscribeConvo(userId) {
  User.findOne({fbId: userId}).exec().then(function(user) {
    // if the user does not already exist, then maybe they are already unsubscribed
    if (!user) {
      botReply({fbId: userId}, "Hey! Either you haven't signed up yet, or you've already unsubscribed. " +
        "Just send us a message saying 'Hi' if you'd like to sign up again.")
    }
    else {
      if (user.unsubscribed !== true) {
        botReply(user, 'You got it. Just message us again if you ever change your mind!')
        .then(() => unsubscribeAndAnonymizeUser(user))
      } else {
        botReply(user, 'Got it, you are unsubscribed')
        throw new Error('An unsubscribed user who was not successfully anonymized just tried to Unsubscribe, ' +
          'or there was some kind of other error')
      }
    }
  })
}


module.exports = {
  unsubscribeConvo,
}



