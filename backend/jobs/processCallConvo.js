const mongoose = require('mongoose')
const { User, Reps, CampaignCall, UserConversation } = require('../app/models')
const { startCallConversation } = require('../app/conversations/callConvo')

const ObjectId = mongoose.Types.ObjectId

module.exports = function processCallConvoJob(job, done) {
  const { userId, representativeIds, campaignCallId } = job.data

  Promise.all([
    User.findById(userId).exec(),
    Reps.find({ _id: { $in: [representativeIds.map(ObjectId)] } }).exec(),
    CampaignCall.findById(campaignCallId).populate('campaign').exec(),
    UserConversation.create({ user: ObjectId(userId), campaignAction: ObjectId(campaignCallId) })
  ])
  .then(function([user, representatives, campaignCall, userConversation]) {
    startCallConversation(user, representatives, campaignCall, campaignCall.campaign, userConversation)
  })
  .then(done)
}
