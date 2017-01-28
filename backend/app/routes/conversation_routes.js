const mongoose = require('mongoose')
const Promise = require('es6-promise')

const bot = require('../controllers/botkit').bot
const { User, Campaign, Reps } = require('../models.js')

const startCallToActionConversation = require('../conversations/calltoaction').startCallToActionConversation
const startUpdateConversation = require('../conversations/update').startUpdateConversation
const startSignupConversation = require('../conversations/signup').startSignupConversation
const startTestConversation1 = require('../conversations/testaction').startTestConversation1

mongoose.Promise = Promise

module.exports = function(app) {

  app.post('/api/start/calltoaction', function(req, res) {
    const fbId = req.body.fbId
    const userPromise = User.findOne({id: fbId}).exec()
    const campaignPromise = Campaign.findById(req.body.campaignId).exec() // TODO: figure out what conditions we use to look up campaign
    const repPromise = Reps.findById(req.body.repId).exec() // TODO: figure out what conditions we use to look up rep

    Promise.all([userPromise, campaignPromise, repPromise])
      .then(function([user, campaign, rep]) {
        const campaignAction = campaign.campaignActions.id(req.body.campaignActionId)

        startCallToActionConversation(bot, fbId, {
          firstName: user.firstName,
          issueMessage: campaign.campaign_description,
          issueLink: campaign.campaign_link,
          issueSubject: campaign.campaign_title,
          issueAction: campaignAction.cta,
          repType: rep.legislator_type,
          repName: rep.name.official_full,
          repImage: rep.image_url,
          repPhoneNumber: rep.phone,
          repWebsite: rep.url
        })

        res.send('ok')
      })
      .catch(err => console.log(err))
  })

  app.post('/api/start/update', function(req, res) {
    const fbId = req.body.fbId
    startUpdateConversation(bot, fbId)
    res.send('ok')
  })

  app.post('/api/start/signup', function(req, res) {
    const fbId = req.body.fbId
    startSignupConversation(bot, fbId)
    res.send('ok')
  })

  app.post('/api/start/testaction', function(req, res) {
    const fbId = req.body.fbId
    startTestConversation1(bot, fbId)
    res.send('ok')
  })

}
