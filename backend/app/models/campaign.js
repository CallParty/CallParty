const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campaignSchema = new Schema({
  title: String,
  description: String,
  active: Boolean,
  link: String,
  createdAt: { type: Date, default: () => moment.utc().toDate() },
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

campaignSchema.virtual('campaignOps').get(function() {
  if (!this.campaignActions || !this.campaignUpdates) {
    return null
  }

  return this.campaignActions.concat(this.campaignUpdates)
})

module.exports = mongoose.model('Campaign', campaignSchema)
