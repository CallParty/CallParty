const { CampaignCall } = require('../models')
const { getPopulatedCampaignCallObject } = require('../utilities/campaignCalls')

function getCampaignCallDetail(req, res) {
  return getPopulatedCampaignCallObject(req.params.id)
    .then(campaignCallObject => res.json(campaignCallObject))
    .catch(err => res.send(err))
}

function getCampaignCall(req, res) {
  return CampaignCall
    .findById(req.params.id)
    .exec()
    .then(campaignCallObject => res.json(campaignCallObject))
    .catch(err => res.send(err))
}

module.exports = {
  getCampaignCall,
  getCampaignCallDetail
}
