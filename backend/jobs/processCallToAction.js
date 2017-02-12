const mongoose = require('mongoose')
const { User, Reps, CampaignCall, UserConversation } = require('../app/models')
const { startCallToActionConversation } = require('../app/conversations/calltoaction')

const ObjectId = mongoose.Types.ObjectId

module.exports = function processCallToActionJob(job, done) {
  const { userId, representativeIds, campaignCallId } = job.data

  Promise.all([
    User.findById(userId).exec(),
    Reps.find({ _id: { $in: [representativeIds.map(ObjectId)] } }).exec(),
    CampaignCall.findById(campaignCallId).populate('campaign').exec(),
    UserConversation.create({ user: ObjectId(userId), campaignAction: ObjectId(campaignCallId) })
  ])
  .then(function([user, representatives, campaignCall, userConversation]) {
    startCallToActionConversation(user, representatives, campaignCall, campaignCall.campaign, userConversation)
  })
  .then(done)
}
