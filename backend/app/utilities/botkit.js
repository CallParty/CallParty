const { bot } = require('../botkit_controller/botkitSetup')
const { captureException } = require('./logHelper')


function botReply(user, text) {
  // this is the message object botkit expects
  const message = {
    channel: user.fbId,
    user: user.fbId,
  }
  return new Promise(function(resolve, reject) {
    bot.reply(message, text, function(err, response) {
      // if there was an error, lets try to log info about it for debugging purposes
      if (err) {
        // try to convert the user to an object for extra debugging info
        // but wrap in a try/catch because if this fails we still want to log the error
        let userObject = {}
        try {
          userObject = user.toObject()
        } catch (e) {
          captureException(new Error('Failed to convert user to object while logging exception'))
        }
        // log the exception with extra user data for debugging
        captureException(err, {extra: {user: userObject, text: text}})
        return reject(err)
      }
      // but regardless of error, resolve the promise and carry on
      resolve(response)
    })
  })
}

module.exports = {
  botReply,
}
