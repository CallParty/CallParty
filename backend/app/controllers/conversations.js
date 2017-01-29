var startSignupConversation = require('../conversations/signup').startSignupConversation
var startUnsubscribeConversation = require('../conversations/unsubscribe').startUnsubscribeConversation
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
      // otherwise, send them a message telling them bot is confused
      else {
        bot.reply(message, 'Oh gosh, you said ' + message.match[1] + '. Send an email to hi@callparty.org to talk to a person')
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
