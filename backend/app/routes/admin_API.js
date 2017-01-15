var campaignMethods = require('../methods/campaignMethods')

module.exports = function (app) {
	app.get('/getcampaign', function (req, res) {
		req ? campaignMethods.createCampaign(req) : ''
		res.send('')
  	})
}