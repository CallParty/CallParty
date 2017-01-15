var bot = require('../controllers/botkit').bot

var startUpdateConversation = function(fbId) {

  // part 1
  var updatePart1 = function(response, convo) {
    convo.say('update message')
  }

  // start conversation using above parts
  // use a fakeMessage to initiate the conversation with the correct user
  var fakeMessage = {
    'channel': fbId,
    'user': fbId
  }
  bot.startConversation(fakeMessage, updatePart1)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}