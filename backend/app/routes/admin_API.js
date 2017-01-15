var campaignMethods = require('../methods/campaignMethods')

module.exports = function (app) {
	app.get('/createcampaign', function (req, res) {
		req ? campaignMethods.createCampaign(req) : ''
		res.send('')
  	})

  	app.get('/getcampaigns', function (req, res) {
		var campaignresponse = campaignMethods.lookupAllCampaigns(req) ? campaignMethods.lookupAllCampaigns(req) : ''
		res.send(campaignresponse)
  	})
}