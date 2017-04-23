const botReply = require('../utilities/botkit').botReply
const { User } = require('../models')
const { setUserCallback } = require('../methods/userMethods')

function startTestConversation(fbId) {
  return User.findOne({fbId: fbId}).exec().then(function (user) {
    // start the conversation
    const fakeMessage = {
      channel: fbId,
      user: fbId
    }
    testConvo(user, fakeMessage)
  })
}

function testConvo(user) {
  return botReply(user, 'Start Test Conversation').then(function() {
    return botReply(user, {
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
    return botReply(user, 'End Test Conversation')
  }).then(function() {
    setUserCallback(user, null)
  })
}

module.exports = {
  startTestConversation,
}
