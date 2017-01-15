var campaignMethods = require('../methods/campaignMethods')

module.exports = function (app) {
  app.get('/create-campaign', function (req, res) {
  	var campaignData = {title: "Lorem ipsum dolor sit amet", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
    req ? campaignMethods.createCampaign(campaignData) : ''
    res.send('')
  })

  app.get('/get-campaigns', function (req, res) {
    var campaignresponse = campaignMethods.lookupAllCampaigns(req) ? campaignMethods.lookupAllCampaigns(req) : ''
    res.send(campaignresponse)
  })

  app.get('/get-one-campaign', function (req, res) {
    var campaignresponse = campaignMethods.lookupOneCampaign(req) ? campaignMethods.lookupOneCampaign(req) : ''
    res.send(campaignresponse)
  })

  app.get('/modify-campaign', function (req, res) {
    var campaignresponse = campaignMethods.modifyCampaign(req) ? campaignMethods.modifyCampaign(req) : ''
    res.send(campaignresponse)
  })

  app.get('/create-action', function (req, res) {
    var campaignresponse = campaignMethods.createCampaignAction(req) ? campaignMethods.createCampaignAction(req) : ''
    res.send(campaignresponse)
  })
}