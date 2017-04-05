const { bot } = require('../botkit_controller/botkitSetup')
const { captureException, logMessage } = require('./logHelper')
const { UserConversation } = require('../models')
const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS


async function botReply(user, text, numAttempts) {
  try {
    await botReplyHelper(user, text)
  } catch (err) {
    if (!numAttempts) {
     numAttempts = 1
    }
    let knownError = isKnownError(err)
    if (knownError && numAttempts < 5) {
      numAttempts += 1
      await logMessage(`re-trying message to ${user.fbId} after error "${err.message}". Attempt #${numAttempts}`, "#_error")
      await botReply(user, text, numAttempts)
    }
    // if there was an error, mark that this conversation had an error
    else {
      if (user && user.currentConvo) {
        await user.populate({ path: 'currentConvo'}).execPopulate()
        user.currentConvo.status = USER_CONVO_STATUS.error
        await user.currentConvo.save()
      }
    }
    // regardless of error, ultimately resolve promise so script execution can carry on
    return Promise.resolve()
  }
}

function botReplyHelper(user, text) {
  // this is the message object botkit expects
  const message = {
    channel: user.fbId,
    user: user.fbId,
  }
  // for early testing going to keep this log in here
  logMessage(`++ sending message to ${user.fbId}: ${typeof text !== 'string' ? JSON.stringify(text) : text}`, '#_msg')
  // return promisified bot message
  return new Promise(function(resolve, reject) {
    bot.reply(message, text, function(err, response) {
      // if there was an error, lets try to log info about it for debugging purposes
      if (typeof text === 'string' && text.includes('Hi Max')) {
        err = new Error('Test error')
      }
      if (err) {
        // try to convert the user to an object for extra debugging info
        // but wrap in a try/catch because if this fails we still want to log the error
        let userObject = {}
        try {
          userObject = user.toObject({ virtuals: false })
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

function isKnownError(err) {
  let knownError = false
  if (err.message) {
    knownError =
      err.message.includes('connect ETIMEDOUT') ||
      err.message.includes('connect ECONNREFUSED') ||
      err.message === "(#200) This person isn't available right now"
  }
  return knownError
}

module.exports = {
  botReply,
}
