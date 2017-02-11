const mongoose = require('mongoose')
const { User, CampaignUpdate } = require('../app/models')
const { startUpdateConversation } = require('../app/conversations/update')

const ObjectId = mongoose.Types.ObjectId

module.exports = function processUpdate(job, done) {
  const { userId, campaignUpdateId } = job.data

  Promise.all([
    User.findById(ObjectId(userId)).exec(),
    CampaignUpdate.findById(ObjectId(campaignUpdateId)).exec()
  ])
  .then(function([user, campaignUpdate]) {
    startUpdateConversation(user.fbId, campaignUpdate.message)
  })
  .then(done)
}
