const { CampaignCall } = require('../models')

async function getPopulatedCampaignCallObject(id) {
  return CampaignCall
    .findById(id)
    .populate('campaignUpdates userActions')
    .populate({
      path: 'userConversations',
      populate: {
        path: 'user'
      }
    })
    .exec()
    .then(async function(campaignCall) {
      return Object.assign(
        {},
        campaignCall.toObject(),
        { matchingRepresentatives: await campaignCall.getMatchingRepresentatives() }
      )
    })
}

module.exports = {
  getPopulatedCampaignCallObject
}
