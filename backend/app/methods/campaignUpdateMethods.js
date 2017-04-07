const { getPopulatedCampaignUpdateObject } = require('../utilities/campaignUpdates')

function getCampaignUpdateDetail(req, res) {
  return getPopulatedCampaignUpdateObject(req.params.id)
    .then(campaignUpdate => res.json(campaignUpdate))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignUpdateDetail
}
