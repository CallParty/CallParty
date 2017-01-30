var startSignupConversation = require('../conversations/signup').startSignupConversation
var startUnsubscribeConversation = require('../conversations/unsubscribe').startUnsubscribeConversation
var callbackRoutes = require('../conversations/callback_routes').callbackRoutes
const { User } = require('../models')


module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    startSignupConversation(bot, message.user)
  })

  // user said hello
  controller.hears(['hello'], 'message_received', function (bot, message) {
    bot.reply(message, 'Hey there.')
  })

  // user says unsubscribe/stop
  controller.hears(['Unsubscribe', 'Stop'], 'message_received', function (bot, message) {
    startUnsubscribeConversation(bot, message)
  })

  // user says anything else
  controller.hears('(.*)', 'message_received', function (bot, message) {
    User.findOne({fbId: message.user}).exec().then(function(user) {
      // if the user does not already exist, then run sign up flow
      if (!user) {
        startSignupConversation(bot, message.user)
      }
      // if they do exist, then call the correct next callback
      else {
        var callbackPath = user.callbackPath
        // this is the default callback if none is set
        if (!callbackPath) {
            callbackPath = '/test1'
        }
        // call the callback convoFun
        const cb = callbackRoutes[callbackPath]
        if (cb) {
          cb(bot, user, message)
        }
        else {
          throw new Error('Invalid callback route supplied')
        }
      }
    })
  })

  // handle postbacks (commented out because these will be handled within conversations)
  // controller.on('facebook_postback', function (bot, message) {
  //   const payload = JSON.parse(message.payload);
  // if (payload.callback == 'testPart2') {
  //   startTestConversation2(message.channel);
  // }
  // })

}
