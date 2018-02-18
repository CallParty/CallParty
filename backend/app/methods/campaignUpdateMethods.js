const { CampaignUpdate } = require('../models')
const { getPopulatedCampaignUpdateObject } = require('../utilities/campaignUpdates')

function getCampaignUpdateDetail(req, res) {
  return getPopulatedCampaignUpdateObject(req.params.id)
    .then(campaignUpdate => res.json(campaignUpdate))
    .catch(err => res.send(err))
}

function getCampaignUpdate(req, res) {
  return CampaignUpdate
    .findById(req.params.id)
    .exec()
    .then(campaignUpdateObject => res.json(campaignUpdateObject))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignUpdateDetail,
  getCampaignUpdate
}
