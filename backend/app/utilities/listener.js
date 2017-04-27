var startSignupConversation = require('./../conversations/signupConvo').startSignupConversation
var unsubscribeConvo = require('./../conversations/unsubscribeConvo').unsubscribeConvo
var runCallback = require('./../conversations/callbackRouter').runCallback
const { User } = require('../models/index')


function handleMessage(senderId, recipientId, message) {

  //   unsubscribe keywords
  if (message.text && ['stop', 'unsubscribe'].indexOf(message.text.toLowerCase()) > -1) {
    unsubscribeConvo(senderId)
  }

  // default message handler uses callbacks
  else {
    User.findOne({fbId: senderId}).exec().then(function(user) {
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

module.exports = {
  handleMessage,
}
