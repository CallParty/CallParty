const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campaignActionSchema = new Schema({
  title: String,
  message: String,
  cta: String,
  active: Boolean,
  type: String,
  memberType: Array,
  party: Array,
  committee: Array,
  createdAt: { type: Date, default: () => moment.utc().toDate() },
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

campaignActionSchema.virtual('userActions', {
  ref: 'UserAction',
  localField: '_id',
  foreignField: 'campaignAction'
})

campaignActionSchema.virtual('campaignUpdates', {
  ref: 'CampaignUpdate',
  localField: '_id',
  foreignField: 'campaignAction'
})

module.exports = mongoose.model('CampaignAction', campaignActionSchema)
