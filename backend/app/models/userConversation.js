const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const USER_CONVO_STATUS = {
  error: 'error',
  pending: 'pending',
  sent: 'sent',
}

const userConversationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignAction: { type: Schema.Types.ObjectId, ref: 'CampaignAction' },
  datePrompted:  { type: Date },
  dateCompleted: Date,
  convoData: Schema.Types.Mixed,  // data which is needed to send this UserConversation
  status: {
    type: String,
    enum: Object.values(USER_CONVO_STATUS)
  },
})

userConversationSchema.statics.USER_CONVO_STATUS = USER_CONVO_STATUS

module.exports = mongoose.model('UserConversation', userConversationSchema)
