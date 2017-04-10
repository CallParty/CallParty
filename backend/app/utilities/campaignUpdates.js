const { CampaignUpdate } = require('../models')
const { captureException } = require('./logHelper')

async function getPopulatedCampaignUpdateObject(id) {
  const campaignUpdate = await CampaignUpdate
    .findById(id)
    .populate({
      path: 'userConversations',
      populate: {
        path: 'user'
      }
    })
    .exec()
  if (campaignUpdate.targetingType === 'borrowed') {
    await campaignUpdate.populate('targetAction').execPopulate()
  }
  return campaignUpdate
}

module.exports = {
  getPopulatedCampaignUpdateObject
}
