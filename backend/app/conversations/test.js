const botReply = require('../utilities/botkit').botReply
const { User } = require('../models')
const { setUserCallback } = require('../methods/userMethods')

function startTestConversation(bot, fbId) {
  return User.findOne({fbId: fbId}).exec().then(function (user) {
    // start the conversation
    const fakeMessage = {
      channel: fbId,
      user: fbId
    }
    testConvo(bot, user, fakeMessage)
  })
}

function testConvo(bot, user, message) {
  return botReply(bot, message, 'Start Test Conversation').then(function() {
    return botReply(bot, message, {
      attachment: {
        type: 'image',
        payload: {
          // url: 'https://storage.googleapis.com/callparty/green.png'
          // url: 'https://storage.googleapis.com/callparty/success.gif'
          url: 'https://storage.googleapis.com/callparty/bummer.gif'
          // url: 'https://storage.googleapis.com/callparty/blue.png'
        }
      }
    })
  }).then(function() {
    return botReply(bot, message, 'End Test Conversation')
  }).then(function() {
    setUserCallback(user, null)
  })
}

module.exports = {
  startTestConversation,
}