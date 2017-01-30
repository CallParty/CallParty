const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campaignSchema = new Schema({
  title: String,
  description: String,
  active: Boolean,
  link: String,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

campaignSchema.virtual('campaignActions', {
  ref: 'CampaignAction',
  localField: '_id',
  foreignField: 'campaign'
})

campaignSchema.virtual('campaignUpdates', {
  ref: 'CampaignUpdate',
  localField: '_id',
  foreignField: 'campaign'
})

module.exports = mongoose.model('Campaign', campaignSchema)
