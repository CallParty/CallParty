const { CampaignCall } = require('../models')

async function getPopulatedCampaignCallObject(id) {
  return CampaignCall
    .findById(id)
    .populate('campaignUpdates userActions committees')
    .populate({
      path: 'userConversations',
      populate: {
        path: 'user'
      }
    })
    .exec()
}

module.exports = {
  getPopulatedCampaignCallObject
}
