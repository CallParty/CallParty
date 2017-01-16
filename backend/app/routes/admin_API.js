var campaignMethods = require('../methods/campaignMethods')

module.exports = function (app) {
	app.get('/createcampaign', function (req, res) {
		req ? campaignMethods.createCampaign(req) : ''
		res.send('')
  	})

  app.get('/campaigns', campaignMethods.lookupAllCampaigns);
  app.get('/campaigns/:id', campaignMethods.lookupOneCampaign);
}