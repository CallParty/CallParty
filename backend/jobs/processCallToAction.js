const mongoose = require('mongoose')
const { User, Reps, CampaignAction, UserAction } = require('../app/models')
const { startCallToActionConversation } = require('../app/conversations/calltoaction')

const ObjectId = mongoose.Types.ObjectId

module.exports = function processCallToActionJob(job, done) {
  const { userId, representativeIds, campaignActionId } = job.data

  Promise.all([
    User.findById(ObjectId(userId)).exec(),
    Reps.find({ _id: { $in: [representativeIds.map(ObjectId)] } }).exec(),
    CampaignAction.findById(ObjectId(campaignActionId)).populate('campaign').exec(),
    UserAction.create({ user: ObjectId(userId), campaignAction: ObjectId(campaignActionId) })
  ])
  .then(function([user, representatives, campaignAction, userAction]) {
    startCallToActionConversation(user, representatives, campaignAction, campaignAction.campaign, userAction)
  })
  .then(done)
}
