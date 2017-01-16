var campaignMethods = require('../methods/campaignMethods')

module.exports = function (app) {
	app.get('/createcampaign', function (req, res) {
		req ? campaignMethods.createCampaign(req) : ''
		res.send('')
  	})

  app.get('/campaigns', campaignMethods.getCampaigns);
  app.get('/campaigns/:id', campaignMethods.getCampaign);
  app.post('/campaigns', campaignMethods.newCampaign);
  app.post('/campaigns/:id/action/new', campaignMethods.newCampaignAction);
  // app.post('/campaigns/:id/update/new', campaignMethods.newCampaign); // TODO
}