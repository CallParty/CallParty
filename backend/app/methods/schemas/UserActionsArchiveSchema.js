const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserActionsArchiveSchema = new Schema({
  active: Boolean,
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  _campaignAction: { type: Schema.Types.ObjectId, ref: 'CampaignAction' },
  targetName: Boolean,
  actionType: String,
  datePrompted:  { type: Date, default: () => moment.utc().toDate() },
  dateCompleted: Date,
  actionStatus: String
})

module.exports = UserActionsArchiveSchema
