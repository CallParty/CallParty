const mongoose = require('mongoose')
const Promise = require('es6-promise')

var bot = require('../bot/setup').bot
const { User, Campaign, Reps } = require('../models.js')

const startCallToActionDialog = require('../bot/calltoaction').startCallToActionDialog

mongoose.Promise = Promise

module.exports = function(app) {

  app.post('/api/start/calltoaction', function(req, res) {
    const userAddress = req.body.userAddress
    const fbId = userAddress.user.id
    const userPromise = User.findOne({fbId: fbId}).exec()
    const campaignPromise = Campaign.findById(req.body.campaignId).exec() // TODO: figure out what conditions we use to look up campaign
    const repPromise = Reps.findById(req.body.repId).exec() // TODO: figure out what conditions we use to look up rep

    Promise.all([userPromise, campaignPromise, repPromise])
      .then(function([user, campaign, rep]) {
        // const campaignAction = campaign.campaignActions.id(req.body.campaignActionId)

        startCallToActionDialog(bot, userAddress, {
          firstName: user.firstName,
          issueMessage: campaign.campaign_description,
          issueLink: campaign.campaign_link,
          issueSubject: campaign.campaign_title,
          // issueAction: campaignAction.cta,
          issueAction: 'temp',
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
}
