const mongoose = require('mongoose')
const Promise = require('es6-promise')

const { User, CampaignAction, Reps } = require('../models')

const startCallToActionConversation = require('../conversations/calltoaction').startCallToActionConversation
const startUpdateConversation = require('../conversations/update').startUpdateConversation
const startSignupConversation = require('../conversations/signup').startSignupConversation
const startTestConversation = require('../conversations/test').startTestConversation

mongoose.Promise = Promise
const ObjectId = mongoose.Types.ObjectId

module.exports = function(apiRouter) {

  apiRouter.post('/start/calltoaction', function(req, res) {
    const fbId = req.body.fbId
    const campaignActionId = req.body.campaignActionId
    const repIds = req.body.repIds
    const userPromise = User.findOne({ fbId: fbId }).exec()
    const campaignActionPromise = CampaignAction.findOne({ _id: campaignActionId}).populate('campaign').exec()
    const repsPromise = Reps.find({ _id: { $in: repIds.map(ObjectId) } }).exec()
    Promise.all([userPromise, campaignActionPromise, repsPromise])
      .then(function([user, campaignAction, representatives]) {
        startCallToActionConversation(user, representatives, campaignAction, campaignAction.campaign)
        res.send('ok')
      })
      .catch(function(err) { throw err })
  })

  apiRouter.post('/start/update', function(req, res) {
    const fbId = req.body.fbId
    const updateMessage = req.body.updateMessage
    startUpdateConversation(fbId, updateMessage)
    res.send('ok')
  })

  apiRouter.post('/start/signup', function(req, res) {
    const fbId = req.body.fbId
    startSignupConversation(fbId)
    res.send('ok')
  })

  apiRouter.post('/start/test', function(req, res) {
    const fbId = req.body.fbId
    startTestConversation(fbId)
    res.send('ok')
  })

}
