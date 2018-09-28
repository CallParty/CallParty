var startSignupConversation = require('./../conversations/signupConvo').startSignupConversation
const { logMessage } = require('../utilities/logHelper')
var unsubscribeConvo = require('./../conversations/unsubscribeConvo').unsubscribeConvo
const { setUserCallback } = require('../methods/userMethods')
var runCallback = require('./../conversations/callbackRouter').runCallback
const { User, Message } = require('../models/index')


function handleMessage(senderId, recipientId, message) {

  //   unsubscribe keywords
  if (message.text && ['stop', 'unsubscribe'].indexOf(message.text.toLowerCase()) > -1) {
    unsubscribeConvo(senderId)
  }

  // default message handler uses callbacks
  else {
    User.findOne({fbId: senderId}).populate('bot').exec().then(function(user) {
      // if the user does not already exist, then run sign up flow
      if (!user) {
        startSignupConversation(senderId, recipientId)
      }
      // if they do exist, then call the correct next callback
      else {
        // get callbackPath from user, or the default if none is set and run the callbackFun
        var callbackPath = user.callbackPath || '/default'
        runCallback(callbackPath, user, message)
      }
    })
  }
}

async function handleEcho(senderId, recipientId, message) {
  /* handles the echo of a message that the admin page sent */

  // if this was a message sent by CallParty bot, then do nothing
  const sentMid = await Message.findOne({mid: message.mid})
  if (sentMid) {
    // this is an echo that should be ignored
  }

  // otherwise, switch this user to override mode
  else {
    const user = await User.findOne({fbId: recipientId})
    // if the user does not already exist, then something weird has happened
    if (!user) {
      throw new Error('Should not be overriding to send message to unregistered user')
    }
    // if they do exist, then change the callback of the user to override
    else {
      logMessage(`++ setting user to override mode ${recipientId}`, '#_override')
      setUserCallback(user, '/override')
    }
  }
}

module.exports = {
  handleMessage,
  handleEcho
}
