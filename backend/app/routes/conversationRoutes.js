const mongoose = require('mongoose')
const Promise = require('es6-promise')

const {
  User,
  CampaignCall,
  CampaignUpdate,
  Reps,
  UserConversation
} = require('../models')

const { startCallConversation } = require('../conversations/callConvo')
const { startUpdateConversation } = require('../conversations/updateConvo')
const { startSignupConversation } = require('../conversations/signupConvo')
const { startTestConversation } = require('../conversations/testConvo')
const { initConvos } = require('../conversations/initConversations')

mongoose.Promise = Promise
const ObjectId = mongoose.Types.ObjectId

module.exports = function(apiRouter) {

  apiRouter.post('/start/campaignCall/:id', function(req, res) {
    const campaignCallId = req.params.id
    const campaignCallPromise = CampaignCall.findById(ObjectId(campaignCallId))
      .populate('campaign').populate('userConversations').exec()
    campaignCallPromise.then(campaignCall => Promise.all([campaignCall, campaignCall.getMatchingUsersWithRepresentatives()]))
      .then(([campaignCall, matchingUsersWithRepresentatives]) => {
        // for ease of access, attach representatives and user as convoData to each userConversation
        const repsByUserId = {}
        const usersByUserId = {}
        const userConversations = campaignCall.userConversations
        for (let i = 0; i < matchingUsersWithRepresentatives.length; i++) {
          const item = matchingUsersWithRepresentatives[i]
          repsByUserId[item.user._id] = item.representatives
          usersByUserId[item.user._id] = item.user
        }
        for (let i = 0; i < userConversations.length; i++) {
          const userConversation = userConversations[i]
          const userId = userConversation.user
          const user = usersByUserId[userId]
          // TODO: figure out how to populate userConversations with real user instead of just id so that we don't need to do this
          userConversation.user = user
          userConversation.convoData = {
            representatives: repsByUserId[user._id],
          }
        }
        return initConvos(campaignCall, campaignCall.userConversations)
      })
    // send response
    res.send('ok')
  })

  apiRouter.post('/start/campaignUpdate/:id', function(req, res) {
    const campaignUpdateId = req.params.id
    const campaignUpdatePromise = CampaignUpdate.findById(ObjectId(campaignUpdateId))
      .populate('campaign').populate('userConversations').exec()
    campaignUpdatePromise.then((campaignUpdate) =>
      initConvos(campaignUpdate, campaignUpdate.userConversations)
    )
    // send response
    res.send('ok')
  })

  apiRouter.post('/start/callConvo', function(req, res) {
    const fbId = req.body.fbId
    const campaignCallId = req.body.campaignCallId
    const repIds = req.body.repIds
    const userPromise = User.findOne({ fbId: fbId }).exec()
    const repsPromise = Reps.find({ _id: { $in: repIds.map(ObjectId) } }).exec()
    const campaignCallPromise = CampaignCall.findById(ObjectId(campaignCallId)).populate('campaign').exec()
    Promise.all([userPromise, campaignCallPromise, repsPromise])
      .then(function([user, campaignCall, representatives]) {
        this.user = user
        this.representatives = representatives
        this.campaignCall = campaignCall
        return UserConversation.create({
          user: user,
          campaignAction: campaignCall._id,
        })
      })
      .then(function(userConversation) {
        startCallConversation(
          this.user,
          this.representatives,
          this.campaignCall,
          this.campaignCall.campaign,
          userConversation
        )
        res.send('ok')
      })
      .catch(function(err) {
        throw err
      })
  })

  apiRouter.post('/start/updateConvo', function(req, res) {
    const fbId = req.body.fbId
    const updateMessage = req.body.updateMessage
    startUpdateConversation(fbId, updateMessage)
    res.send('ok')
  })

  apiRouter.post('/start/signupConvo', function(req, res) {
    const fbId = req.body.fbId
    startSignupConversation(fbId)
    res.send('ok')
  })

  apiRouter.post('/start/testConvo', function(req, res) {
    const fbId = req.body.fbId
    startTestConversation(fbId)
    res.send('ok')
  })

}
