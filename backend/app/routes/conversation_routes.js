var bot = require('../controllers/botkit').bot

var startCallToActionConversation = require('../conversations/calltoaction').startCallToActionConversation
var startUpdateConversation = require('../conversations/update').startUpdateConversation
var startSignupConversation = require('../conversations/signup').startSignupConversation
var startTestConversation1 = require('../conversations/testaction').startTestConversation1

module.exports = function (app) {

  app.get('/api/start/calltoaction', function(req, res) {
    startCallToActionConversation(bot, '1060815497377817')
    res.send('ok')
  })

  app.get('/api/start/update', function(req, res) {
    startUpdateConversation(bot, '1060815497377817')
    res.send('ok')
  })

  app.get('/api/start/signup', function(req, res) {
    startSignupConversation(bot, '1060815497377817')
    res.send('ok')
  })

  app.get('/api/start/testaction', function(req, res) {
    startTestConversation1(bot, '1060815497377817')
    res.send('ok')
  })

}
