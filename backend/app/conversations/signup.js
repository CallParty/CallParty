var bot = require('../controllers/botkit').bot

var startSignupConversation = function(fbId) {

  // part 1
  var signupPart1 = function(response, convo) {
    convo.say('signup message')
  }

  // start conversation using above parts
  // use a fakeMessage to initiate the conversation with the correct user
  var fakeMessage = {
    'channel': fbId,
    'user': fbId
  }
  bot.startConversation(fakeMessage, signupPart1)
}

module.exports = {
  startSignupConversation: startSignupConversation
}