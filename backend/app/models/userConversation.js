const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userConversationSchema = new Schema({
  active: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignCall: { type: Schema.Types.ObjectId, ref: 'CampaignCall' },
  datePrompted:  { type: Date, default: () => moment.utc().toDate() },
  dateCompleted: Date
})

module.exports = mongoose.model('UserConversation', userConversationSchema)
