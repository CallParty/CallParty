const { CampaignCall } = require('../models')
const { getPopulatedCampaignCallObject } = require('../utilities/campaignCalls')

async function getCampaignCallDetail(req, res) {
  const campaignCall = await getPopulatedCampaignCallObject(req.params.id)
  return res.json(campaignCall)
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
