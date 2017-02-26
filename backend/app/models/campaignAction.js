const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

const campaignActionSchema = new Schema({
  title: String,
  createdAt: { type: Date, default: () => moment.utc().toDate() },
  sentAt: Date,
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  discriminatorKey: 'type'
})

campaignActionSchema.virtual('userConversations', {
  ref: 'UserConversation',
  localField: '_id',
  foreignField: 'campaignAction'
})

module.exports = mongoose.model('CampaignAction', campaignActionSchema)
