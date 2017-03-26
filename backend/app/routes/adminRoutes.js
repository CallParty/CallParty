const auth = require('basic-auth')
const jwt = require('jsonwebtoken')
const campaignMethods = require('../methods/campaignMethods')
const committeeMethods = require('../methods/committeeMethods')
const campaignCallMethods = require('../methods/campaignCallMethods')
const { getDistricts } = require('../utilities/getDistricts')
const { logMessage } = require('../utilities/logHelper')
const { downloadRepsYamlFile, loadRepsFromFile } = require('../utilities/representatives')
const {
  downloadCommitteeYamlFile,
  downloadCommitteeMembershipYamlFile,
  loadCommitteesFromFiles
} = require('../utilities/committees')

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

module.exports = function(apiRouter) {
  apiRouter.get('/campaigns', campaignMethods.getCampaigns)
  apiRouter.get('/campaigns/:id', campaignMethods.getCampaign)
  apiRouter.post('/campaigns', campaignMethods.newCampaign)
  apiRouter.post('/campaigns/:id/call/new', campaignMethods.newCampaignCall)
  apiRouter.post('/campaigns/:id/update/new', campaignMethods.newCampaignUpdate)

  apiRouter.get('/campaign_calls/:id', campaignCallMethods.getCampaignCall)

  apiRouter.get('/committees', committeeMethods.getCommittees)
  apiRouter.get('/districts', async function(req, res) {
    const districts = await getDistricts()
    res.json(districts)
  })

  apiRouter.post('/representatives/refresh', async function(req, res) {
    await logMessage('++ updating representatives with latest data')
    await downloadRepsYamlFile().then(loadRepsFromFile)

    await logMessage('++ updating committees with latest data')
    await Promise.all([downloadCommitteeYamlFile(), downloadCommitteeMembershipYamlFile()]).then(loadCommitteesFromFiles)
    await logMessage('++ finished refreshing representatives')
    res.json({ success: true })
  })

  apiRouter.get('/token', handleTokenRequest)
  apiRouter.post('/token', handleTokenRequest)
}
