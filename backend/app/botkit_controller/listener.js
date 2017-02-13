var startSignupConversation = require('./../conversations/signupConvo').startSignupConversation
var unsubscribeConvo = require('./../conversations/unsubscribeConvo').unsubscribeConvo
var runCallback = require('./../conversations/callbackRouter').runCallback
const { User } = require('../models')


function handleMessage(message) {
  User.findOne({fbId: message.user}).exec().then(function(user) {
    // if the user does not already exist, then run sign up flow
    if (!user) {
      startSignupConversation(message.user)
    }
    // if they do exist, then call the correct next callback
    else {
      // get callbackPath from user, or the default if none is set and run the callbackFun
      var callbackPath = user.callbackPath || '/default'
      runCallback(callbackPath, user, message)
    }
  })
}

module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    startSignupConversation(message.user)
  })

  // user says unsubscribe/stop
  controller.hears(['Unsubscribe', 'Stop'], 'message_received', function (bot, message) {
    unsubscribeConvo(message)
  })

  // user says anything else (including like button)
  controller.on('message_received', function (bot, message) {
    handleMessage(message)
  })

}
