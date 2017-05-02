const mongoose = require('mongoose')
const CampaignAction = require('./campaignAction')
const Schema = mongoose.Schema

const campaignUpdateSchema = new Schema({
  message: String,
}, {
  discriminatorKey: 'type',
})

module.exports = CampaignAction.discriminator('CampaignUpdate', campaignUpdateSchema)
