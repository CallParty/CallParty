const mongoose = require('mongoose')
const Promise = require('es6-promise')
const { CampaignCall, CampaignUpdate } = require('../models')
const { initConvos } = require('../conversations/initConversations')
mongoose.Promise = Promise
const ObjectId = mongoose.Types.ObjectId

module.exports = function(apiRouter) {

  apiRouter.post('/send/campaignCall/:id', function(req, res) {
    const campaignCallId = req.params.id
    const campaignCallPromise = CampaignCall.findById(ObjectId(campaignCallId)).exec()
    campaignCallPromise.then(campaignCall => {
      return initConvos(campaignCall)
    })
    // send response
    res.send('ok')
  })

  apiRouter.post('/send/campaignUpdate/:id', function(req, res) {
    const campaignUpdateId = req.params.id
    const campaignUpdatePromise = CampaignUpdate.findById(ObjectId(campaignUpdateId)).exec()
    campaignUpdatePromise.then(campaignUpdate => {
      return initConvos(campaignUpdate)
    })
    // send response
    res.send('ok')
  })

}
