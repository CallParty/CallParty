const { CampaignUpdate } = require('../models')

function getCampaignUpdate(req, res) {
  return CampaignUpdate
    .findById(req.params.id)
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
    .then(campaignUpdate => res.json(campaignUpdate))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignUpdate
}
