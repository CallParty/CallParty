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

campaignSchema.virtual('campaignCalls').get(function() {
  if (!this.campaignActions) {
    return null
  }

  return this.campaignActions.filter(campaignAction => campaignAction.type === 'CampaignCall')
})

campaignSchema.virtual('campaignUpdates').get(function() {
  if (!this.campaignActions) {
    return null
  }

  return this.campaignActions.filter(campaignAction => campaignAction.type === 'CampaignUpdate')
})

campaignSchema.virtual('lastCampaignActionSentAt').get(function() {
  if (!this.campaignActions) {
    return null
  }

  return this.campaignActions.map(ca => ca.sentAt).filter(sentAt => !!sentAt).sort().reverse()[0] || null
})

module.exports = mongoose.model('Campaign', campaignSchema)
