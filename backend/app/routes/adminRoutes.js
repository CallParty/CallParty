var campaignMethods = require('../methods/campaignMethods')

module.exports = function (apiRouter) {
  apiRouter.get('/campaigns', campaignMethods.getCampaigns)
  apiRouter.get('/campaigns/:id', campaignMethods.getCampaign)
  apiRouter.post('/campaigns', campaignMethods.newCampaign)
  apiRouter.post('/campaigns/:id/action/new', campaignMethods.newCampaignAction)
  apiRouter.post('/campaigns/:id/update/new', campaignMethods.newCampaignUpdate)
}
