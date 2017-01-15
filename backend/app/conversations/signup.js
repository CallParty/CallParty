var bot = require('../controllers/botkit').bot
var geocoding = require('../utilities/geocoding')

var startSignupConversation = function(fbId) {

  // part 1
  var beginSignupFlow = function(response, convo) {
    var organization = 'CallParty'
    convo.say(`Hi there! Nice to meet you. I’m a bot made to send you calls to action from the people at ${organization}, because taking civic action is way more effective in large groups. You can unsubscribe any time by just saying ‘stop’ or ‘unsubscribe’.`)
    convo.ask('First thing’s first: What’s the address of your voting registration? I’ll use this to identify who your reps are – don’t worry, I won’t be holding onto it.', function(response, convo) {
      handleAddressResponse(response, convo)
      convo.next()
    })
  }

  var handleAddressResponse = function(response, convo) {
    geocoding.getStateAndCongressionalDistrictFromAddress(response.text)
      .then(function(result) {
        convo.say('Great!')
        // do some stuff with the result
        finishSignup(response, convo)
        convo.next()
      })
      .catch(function() {
        convo.ask('Hm, something isn’t right. Make sure to include your street address, city, state, and zip code like this: 123 Party Street, Brooklyn, NY 11206', handleAddressResponse)
        convo.next()
      })
  }

  var finishSignup = function(response, convo) {
    convo.ask('Now that that’s sorted, we’ll reach out when there’s an issue that you can take an action about, including the rep for you to call and how to talk to them. We’ll also send updates and outcomes on the issues we send. Sound fun?', function(response, convo) {
      convo.say('Excellent. Have a nice day, and talk soon!')
      convo.next()
    })
  }

  // start conversation using above parts
  // use a fakeMessage to initiate the conversation with the correct user
  var fakeMessage = {
    'channel': fbId,
    'user': fbId
  }
  bot.startConversation(fakeMessage, beginSignupFlow)
}

module.exports = {
  startSignupConversation: startSignupConversation
}
