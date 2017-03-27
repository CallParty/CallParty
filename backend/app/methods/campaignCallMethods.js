const { CampaignCall } = require('../models')

function getCampaignCall(req, res) {
  return CampaignCall
    .findById(req.params.id)
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
    .then(campaignCallObject => res.json(campaignCallObject))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignCall
}
