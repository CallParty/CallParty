const auth = require('basic-auth')
const jwt = require('jsonwebtoken')
const campaignMethods = require('../methods/campaignMethods')
const committeeMethods = require('../methods/committeeMethods')
const campaignCallMethods = require('../methods/campaignCallMethods')
const campaignUpdateMethods = require('../methods/campaignUpdateMethods')
const { getDistricts } = require('../utilities/getDistricts')
const { logMessage } = require('../utilities/logHelper')
const { downloadRepsYamlFile, loadRepsFromFile } = require('../utilities/representatives')
const {
  downloadCommitteeYamlFile,
  downloadCommitteeMembershipYamlFile,
  loadCommitteesFromFiles
} = require('../utilities/committees')
const { CampaignAction } = require('../models')

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
  apiRouter.post('/campaigns/:id/action/new', campaignMethods.newCampaignAction)

  apiRouter.get('/campaign_actions/:id', async function(req, res) {

    // get bot from currently logged in admin
    const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

    // process request
    const { type } = await CampaignAction.findOne({ _id: req.params.id, bot: bot }).select({ type: 1, _id: 0 }).exec()
    if (!type) {
      return res.status(404).json({ error: 'CampaignAction not found.' })
    }

    if (type === 'CampaignCall') {
      return campaignCallMethods.getCampaignCallDetail(req, res)
    } else if (type === 'CampaignUpdate') {
      return campaignUpdateMethods.getCampaignUpdateDetail(req, res)
    }
    else {
      throw new Error('Invalid action type')
    }
  })

  apiRouter.get('/clone_action/:id', async function(req, res) {

    // get bot from currently logged in admin
    const bot = process.env.DEFAULT_BOT // TODO: actually get this from admin user associated with session token

    /* this function returns a campaign action without its virtuals populated (to be used as a clone input) */
    const { type } = await CampaignAction.findOne({ _id: req.params.id, bot: bot }).select({ type: 1, _id: 0 }).exec()
    if (!type) {
      return res.status(404).json({ error: 'CampaignAction not found.' })
    }

    if (type === 'CampaignCall') {
      return campaignCallMethods.getCampaignCall(req, res)
    } else if (type === 'CampaignUpdate') {
      return campaignUpdateMethods.getCampaignUpdate(req, res)
    }
    else {
      throw new Error('Invalid action type')
    }
  })

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
