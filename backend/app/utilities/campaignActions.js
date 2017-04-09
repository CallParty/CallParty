const { getPopulatedCampaignUpdateObject } = require('./campaignUpdates')
const { getPopulatedCampaignCallObject } = require('./campaignCalls')

async function getPopulatedCampaignActionObject(id, type) {
  return type === 'CampaignCall' ? getPopulatedCampaignCallObject(id) : getPopulatedCampaignUpdateObject(id)
}

module.exports = {
  getPopulatedCampaignActionObject
}
