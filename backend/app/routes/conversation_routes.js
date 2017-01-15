var bot = require('../controllers/botkit').bot

var startCallToActionConversation = require('../conversations/calltoaction').startCallToActionConversation
var startUpdateConversation = require('../conversations/update').startUpdateConversation
var startSignupConversation = require('../conversations/signup').startSignupConversation
var startTestConversation1 = require('../conversations/testaction').startTestConversation1

module.exports = function (app) {

  app.get('/api/start/calltoaction', function(req, res) {
    const fbId = req.query.fbId
    startCallToActionConversation(bot, fbId, {
      'firstName': 'user_first_name',
      'issueMessage': 'issue_message',
      'repType': 'rep_type',
      'repName': 'repName'
    })
    res.send('ok')
  })

  app.get('/api/start/update', function(req, res) {
    const fbId = req.query.fbId
    startUpdateConversation(bot, fbId)
    res.send('ok')
  })

  app.get('/api/start/signup', function(req, res) {
    const fbId = req.query.fbId
    startSignupConversation(bot, fbId)
    res.send('ok')
  })

  app.get('/api/start/testaction', function(req, res) {
    const fbId = req.query.fbId
    startTestConversation1(bot, fbId)
    res.send('ok')
  })

}
