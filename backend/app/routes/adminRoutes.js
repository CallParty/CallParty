const campaignMethods = require('../methods/campaignMethods')
const committeeMethods = require('../methods/committeeMethods')
const campaignCallMethods = require('../methods/campaignCallMethods')
const { setUserCallback } = require('../methods/userMethods')
const adminMethods = require('../methods/adminMethods')
const campaignUpdateMethods = require('../methods/campaignUpdateMethods')
const { getDistricts } = require('../utilities/getDistricts')
const { logMessage } = require('../utilities/logHelper')
const { downloadRepsYamlFile, loadRepsFromFile } = require('../utilities/representatives')
const {
  downloadCommitteeYamlFile,
  downloadCommitteeMembershipYamlFile,
  loadCommitteesFromFiles
} = require('../utilities/committees')
const { handleAuthTokenRequest } = require('../utilities/auth')
const { CampaignAction, User } = require('../models')


module.exports = function(apiRouter) {
  apiRouter.post('/updatePassword', adminMethods.updatePassword)
  apiRouter.get('/currentAdmin', adminMethods.getCurrentAdmin)
  apiRouter.get('/campaigns', campaignMethods.getCampaigns)
  apiRouter.get('/campaigns/:id', campaignMethods.getCampaign)
  apiRouter.post('/campaigns', campaignMethods.newCampaign)
  apiRouter.post('/campaigns/:id/action/new', campaignMethods.newCampaignAction)

  apiRouter.get('/campaign_actions/:id', async function (req, res) {

    // get bot from currently logged in admin
    const bot = req.adminUser.bot

    // process request
    const {type} = await CampaignAction.findOne({_id: req.params.id, bot: bot}).select({type: 1, _id: 0}).exec()
    if (!type) {
      return res.status(404).json({error: 'CampaignAction not found.'})
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

  apiRouter.get('/clone_action/:id', async function (req, res) {

    // get bot from currently logged in admin
    const bot = req.adminUser.bot

    /* this function returns a campaign action without its virtuals populated (to be used as a clone input) */
    const {type} = await CampaignAction.findOne({_id: req.params.id, bot: bot}).select({type: 1, _id: 0}).exec()
    if (!type) {
      return res.status(404).json({error: 'CampaignAction not found.'})
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
  apiRouter.get('/districts', async function (req, res) {
    const districts = await getDistricts()
    res.json(districts)
  })

  apiRouter.post('/representatives/refresh', async function (req, res) {
    await logMessage('++ updating representatives with latest data')
    await downloadRepsYamlFile().then(loadRepsFromFile)

    await logMessage('++ updating committees with latest data')
    await Promise.all([downloadCommitteeYamlFile(), downloadCommitteeMembershipYamlFile()]).then(loadCommitteesFromFiles)
    await logMessage('++ finished refreshing representatives')
    res.json({success: true})
  })

  apiRouter.get('/token', handleAuthTokenRequest)
  apiRouter.post('/token', handleAuthTokenRequest)

  apiRouter.get('/users', async function (req, res) {
    // get bot from currently logged in admin
    const bot = req.adminUser.bot

    // return users
    User
      .find({bot: bot})
      .exec(function (err, users) {
        if (err) return res.send(err)
        res.json(users)
      })
  }),

  apiRouter.post('/set-override', async function (req, res) {

    const bot = req.adminUser.bot
    const data = req.body
    const newOverrideValue = data.overrideValue
    const user = await User.findOne({bot: bot, _id: data.userId})
    if (newOverrideValue === 1) {
      await setUserCallback(user, '/override')
      await logMessage(`++ set override of user ${data.userId}`)
    } else {
      await setUserCallback(user, null)
      await logMessage(`++ removed override of user ${data.userId}`)
    }
    User
      .find({bot: bot})
      .exec(function (err, users) {
        if (err) return res.send(err)
        res.json(users)
      })
  })
}
