const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campaignUpdateSchema = new Schema({
  message: String,
  createdAt: { type: Date, default: () => moment.utc().toDate() },
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  title: String,
  type: String,
  campaignAction: { type: Schema.Types.ObjectId, ref: 'CampaignAction' }
})

module.exports = mongoose.model('CampaignUpdate', campaignUpdateSchema)
