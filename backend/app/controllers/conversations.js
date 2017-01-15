var startSignupConversation = require('../conversations/signup').startSignupConversation

/*
 *
 */
module.exports = function (controller) {
  // this is triggered when a user clicks the send-to-messenger plugin
  controller.on('facebook_optin', function (bot, message) {
    bot.reply(message, 'Welcome, friend')
    startSignupConversation(message.channel)
  })

  // user said hello
  controller.hears(['hello'], 'message_received', function (bot, message) {
    bot.reply(message, 'Hey there.')
  })

  // user says anything else
  controller.hears('(.*)', 'message_received', function (bot, message) {
    bot.reply(message, 'you said ' + message.match[1])
  })

  // handle postbacks (commented out because these will be handled within conversations)
  // controller.on('facebook_postback', function (bot, message) {
  //   const payload = JSON.parse(message.payload);
    // if (payload.callback == 'testPart2') {
    //   startTestConversation2(message.channel);
    // }
  // })

}
