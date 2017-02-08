const mongoose = require('mongoose')
const { User, Reps, CampaignAction } = require('../app/models')
const { startCallToActionConversation } = require('../app/conversations/calltoaction')

const ObjectId = mongoose.Types.ObjectId

module.exports = function processCallToActionJob(job, done) {
  const { userId, representativeIds, campaignActionId } = job.data

  Promise.all([
    User.findById(ObjectId(userId)).exec(),
    Reps.find({ _id: { $in: [representativeIds.map(ObjectId)] } }).exec(),
    CampaignAction.findById(ObjectId(campaignActionId)).populate('campaign').exec()
  ])
  .then(function([user, representatives, campaignAction]) {
    console.log(`Sending call to action to user with facebook ID: ${user.fbId}`)
    console.log(`Call to action data: ${campaignAction}`)

    startCallToActionConversation(user, representatives, campaignAction, campaignAction.campaign)
  })
  .then(done)
}
