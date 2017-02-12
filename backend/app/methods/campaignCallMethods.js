const { CampaignCall } = require('../models')

function getCampaignCall(req, res) {
  return CampaignCall
    .findById(req.params.id)
    .populate('campaignUpdates')
    .populate({
      path: 'userConversations',
      populate: {
        path: 'user'
      }
    })
    .exec()
    .then(campaignCall => res.json(campaignCall))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignCall
}
