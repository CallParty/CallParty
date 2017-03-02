const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ACTION_TYPE_PAYLOADS = {
  error: 'error',
  staffer: 'staffer',
  voicemail: 'voicemail',
  isReady: 'isReady',
  noCall: 'noCall,'
}

const userActionsSchema = new Schema({
  actionType: {
    type: String,
    enum: Object.values(ACTION_TYPE_PAYLOADS)
  },
  campaignCall: { type: Schema.Types.ObjectId, ref: 'CampaignCall' },
  datePerformed:  { type: Date, default: () => moment.utc().toDate() },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
})

userActionsSchema.statics.ACTION_TYPE_PAYLOADS = ACTION_TYPE_PAYLOADS

module.exports = mongoose.model('UserAction', userActionsSchema)
