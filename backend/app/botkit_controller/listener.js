var startSignupConversation = require('./../conversations/signup').startSignupConversation
var unsubscribeConvo = require('./../conversations/unsubscribe').unsubscribeConvo
var runCallback = require('./../conversations/callbackRouter').runCallback
const { User } = require('../models')


function handleMessage(bot, message) {
  User.findOne({fbId: message.user}).exec().then(function(user) {
    // if the user does not already exist, then run sign up flow
    if (!user) {
      startSignupConversation(bot, message.user)
    }
    // if they do exist, then call the correct next callback
    else {
      // get callbackPath from user, or the default if none is set and run the callbackFun
      var callbackPath = user.callbackPath || '/default'
      runCallback(callbackPath, bot, user, message)
    }
  })
}

module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    startSignupConversation(bot, message.user)
  })

  // user says unsubscribe/stop
  controller.hears(['Unsubscribe', 'Stop'], 'message_received', function (bot, message) {
    unsubscribeConvo(bot, message)
  })

  // user says anything else
  controller.hears('(.*)', 'message_received', function (bot, message) {
    handleMessage(bot, message)
  })

}
