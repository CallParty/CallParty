const { CampaignAction } = require('../models')

function getCampaignAction(req, res) {
  return CampaignAction
    .findById(req.params.id)
    .populate('campaignUpdates')
    .populate({
      path: 'userActions',
      populate: {
        path: 'user'
      }
    })
    .exec()
    .then(campaignAction => res.json(campaignAction))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignAction
}
