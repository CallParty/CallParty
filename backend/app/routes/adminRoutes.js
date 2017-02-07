const auth = require('basic-auth')
const jwt = require('jsonwebtoken')
const campaignMethods = require('../methods/campaignMethods')

function handleTokenRequest(req, res) {
  const user = auth(req)

  if (!user || !user.name || !user.pass) {
    return res.sendStatus(401)
  }

  if (user.name !== process.env.ADMIN_USERNAME || user.pass !== process.env.ADMIN_PASSWORD) {
    return res.sendStatus(401)
  }

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '2h' })
  res.json({ token: token })
}

module.exports = function (apiRouter) {
  apiRouter.get('/campaigns', campaignMethods.getCampaigns)
  apiRouter.get('/campaigns/:id', campaignMethods.getCampaign)
  apiRouter.post('/campaigns', campaignMethods.newCampaign)
  apiRouter.post('/campaigns/:id/action/new', campaignMethods.newCampaignAction)
  apiRouter.post('/campaigns/:id/update/new', campaignMethods.newCampaignUpdate)

  apiRouter.get('/token', handleTokenRequest)
  apiRouter.post('/token', handleTokenRequest)
}
