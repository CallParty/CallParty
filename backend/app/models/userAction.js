const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ACTION_TYPE_PAYLOADS = {
  error: 'error',
  staffer: 'staffer',
  voicemail: 'voicemail'
}

const userActionsSchema = new Schema({
  active: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignAction: { type: Schema.Types.ObjectId, ref: 'CampaignAction' },
  targetName: Boolean,
  actionType: {
    type: String,
    enum: Object.values(ACTION_TYPE_PAYLOADS)
    ]
  },
  datePrompted:  { type: Date, default: () => moment.utc().toDate() },
  dateCompleted: Date
})

module.exports = {
  mongoose.model('UserAction', userActionsSchema),
  ACTION_TYPE_PAYLOADS
}
