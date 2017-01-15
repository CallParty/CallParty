/*
 * This is a file for quickly testing components of botkit conversations.
 */
var bot = require('../controllers/botkit').bot

var testPart1 = function(response, convo) {
  convo.say({
    attachment: {
      'type': 'video',
      'payload': {
        'url': 'http://i.imgur.com/d3L1XIm.gif'
      }
    }
  })
}

var startTestConversation1 = function(fbId) {
  // use a fakeMessage to initiate the conversation with the correct user
  var fakeMessage = {
    'channel': fbId,
    'user': fbId
  }
  bot.startConversation(fakeMessage, testPart1)
}

// exports
module.exports = {
  startTestConversation1: startTestConversation1
}
