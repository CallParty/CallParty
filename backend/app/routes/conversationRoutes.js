const mongoose = require('mongoose')
const Promise = require('es6-promise')

const { User, CampaignCall, Reps } = require('../models')

const startCallToActionConversation = require('../conversations/callToAction').startCallToActionConversation
const startUpdateConversation = require('../conversations/update').startUpdateConversation
const startSignupConversation = require('../conversations/signup').startSignupConversation
const startTestConversation = require('../conversations/test').startTestConversation

mongoose.Promise = Promise
const ObjectId = mongoose.Types.ObjectId

module.exports = function(apiRouter) {

  apiRouter.post('/start/calltoaction', function(req, res) {
    const fbId = req.body.fbId
    const campaignCallId = req.body.campaignCallId
    const repIds = req.body.repIds
    const userPromise = User.findOne({ fbId: fbId }).exec()
    const repsPromise = Reps.find({ _id: { $in: repIds.map(ObjectId) } }).exec()
    const campaignCallPromise = CampaignCall.findById(ObjectId(campaignCallId)).populate('campaign').exec()
    Promise.all([userPromise, campaignCallPromise, repsPromise])
      .then(function([user, representatives, campaignCall]) {
        this.user = user
        this.representatives = representatives
        this.campaignCall = campaignCall
        return UserAction.create({
          user: user,
          campaignCall: campaignCall,
          // what is `targetName`?
          // what is `actionStatus`?
        })
      })
      .then(function(userAction) {
        startCallToActionConversation(
          this.user,
          this.representatives,
          this.campaignCall,
          this.campaignCall.campaign,
          userAction
        )
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
