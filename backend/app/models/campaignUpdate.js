const mongoose = require('mongoose')
const CampaignAction = require('./campaignAction')
const Schema = mongoose.Schema

const campaignUpdateSchema = new Schema({
  message: String,
  campaignCall: { type: Schema.Types.ObjectId, ref: 'CampaignCall' }
}, {
  discriminatorKey: 'type'
})

module.exports = CampaignAction.discriminator('CampaignUpdate', campaignUpdateSchema)
