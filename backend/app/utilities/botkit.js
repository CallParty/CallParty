const { bot } = require('../botkit_controller/botkitSetup')
const { captureException, logMessage } = require('./logHelper')


function botReply(user, text, numAttempts) {
  // this is the message object botkit expects
  const message = {
    channel: user.fbId,
    user: user.fbId,
  }
  // for early testing going to keep this log in here
  logMessage(`++ sending message to ${user.fbId}: ${typeof text !== 'string' ? JSON.stringify(text) : text}`, '#_msg')
  // return promisified bot message
  return new Promise(function(resolve, reject) {
    bot.reply(message, text, async function(err, response) {
      // if there was an error, lets try to log info about it for debugging purposes
      if (err) {
        // check if its a known intermittent error, and re-try sending if it is
        if (!numAttempts) {
          numAttempts = 1
        }
        let knownError = false
        if (err.message) {
          knownError = err.message.includes('connect ETIMEDOUT') || err.message === "(#200) This person isn't available right now"
        }
        if (knownError) {
          if (numAttempts < 5) {
            numAttempts += 1
            await logMessage(`++ re-trying message to ${user.fbId$} after error "${err.message}". Attempt #${numAttempts}`, "#_error")
            return setTimeout(() => { return botReply(user, text, numAttempts)}, 200)
          }
        }
        // try to convert the user to an object for extra debugging info
        // but wrap in a try/catch because if this fails we still want to log the error
        let userObject = {}
        try {
          userObject = user.toObject()
          // log the exception with extra user data for debugging
          captureException(err, {extra: {user: userObject, text: text}})
        } catch (e) {
          // if there was an error converting the user object, still log the error
          captureException(err, {extra: {text: text}})
        }
      }
      // but regardless of error, resolve the promise and carry on
      resolve(response)
    })
  })
}

module.exports = {
  botReply,
}
