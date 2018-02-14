const { captureException, logMessage } = require('./logHelper')
const { UserConversation, Message } = require('../models')
const request = require('request')
const USER_CONVO_STATUS = UserConversation.USER_CONVO_STATUS


async function botReply(user, text, numAttempts) {
  // to avoid production errors, confirm that we only send to prod users when on prod
  await user.populate('bot').execPopulate()
  if (user.bot.bot === 'callparty' && process.env.ENVIRONMENT !== 'PROD') {
    throw new Error('cannot send messages to callparty bot when not on prod')
  }
  // try to send the message
  try {
    await botReplyHelper(user, text)
  } catch (err) {
    if (!numAttempts) {
      numAttempts = 1
    }
    let knownError = isKnownError(err)
    if (knownError && numAttempts < 5) {
      numAttempts += 1
      await logMessage(`re-trying message to ${user.fbId} after error "${err.message}". Attempt #${numAttempts}`, '#_error')
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
  // for early testing going to keep this log in here
  logMessage(`++ sending message to ${user.fbId}: ${typeof text !== 'string' ? JSON.stringify(text) : text}`, '#_msg')
  // return promisified bot message
  return new Promise(async function (resolve, reject) {
    await user.populate('bot').execPopulate()
    sendFbMessage(user.fbId, user.bot.fbToken, text, function (err, response) {
      // if there was an error, lets try to log info about it for debugging purposes
      if (err) {
        // try to convert the user to an object for extra debugging info
        // but wrap in a try/catch because if this fails we still want to log the error
        let userObject = {}
        try {
          userObject = user.toObject({virtuals: false})
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


function sendFbMessage(recipientId, token, message, callback) {
  let messageData

  // if its a string, then put message data in format facebook expects
  if (typeof message === 'string' || message instanceof String) {
    messageData = {text: message}
  }
  // otherwise just pass it as raw data
  else {
    messageData = message
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:recipientId},
      message: messageData,
    }
  }, function(err, resp) {
    // save that this message was sent
    const message = new Message({
      mid: resp.body.message_id
    })
    message.save(function (err) {
      if (err) {
        console.log('++ error saving message')
      }
    })
    return callback(err, resp)
  })
}

function isKnownError(err) {
  let knownError = false
  if (err.message) {
    knownError =
      err.message.includes('connect ETIMEDOUT') ||
      err.message.includes('connect ECONNREFUSED') ||
      err.message.includes("This person isn't available right now") ||
      err.message.includes('Unexpected internal error') ||
      err.message.includes('An unknown error occurred')
  }
  return knownError
}

module.exports = {
  botReply,
  sendFbMessage,
}

