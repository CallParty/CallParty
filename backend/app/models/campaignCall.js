const mongoose = require('mongoose')
const CampaignAction = require('./campaignAction')

const Schema = mongoose.Schema

const campaignCallSchema = new Schema({
  title: String,
  message: String,
  task: String,
  issueLink: String,
  shareLink: String,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  discriminatorKey: 'type'
})

campaignCallSchema.virtual('campaignUpdates', {
  ref: 'CampaignUpdate',
  localField: '_id',
  foreignField: 'campaignCall'
})

campaignCallSchema.virtual('userActions', {
  ref: 'UserAction',
  localField: '_id',
  foreignField: 'campaignCall'
})


module.exports = CampaignAction.discriminator('CampaignCall', campaignCallSchema)
