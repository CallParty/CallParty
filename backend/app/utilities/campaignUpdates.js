const { CampaignUpdate } = require('../models')

async function getPopulatedCampaignUpdateObject(id) {
  return CampaignUpdate
    .findById(id)
    .populate({
      path: 'campaignCall',
      populate: 'userActions committees'
    })
    .populate({
      path: 'userConversations',
      populate: {
        path: 'user'
      }
    })
    .exec()
    .then(async function(campaignUpdate) {
      return Object.assign(
        {},
        campaignUpdate.toObject(),
        {
          campaignCall: Object.assign(
            campaignUpdate.campaignCall.toObject(),
            { matchingRepresentatives: await campaignUpdate.campaignCall.getMatchingRepresentatives() }
          )
        }
      )
    })
}

module.exports = {
  getPopulatedCampaignUpdateObject
}
