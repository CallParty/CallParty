const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const archivedUserActionSchema = new Schema({
  active: Boolean,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  campaignAction: { type: Schema.Types.ObjectId, ref: 'CampaignAction' },
  targetName: Boolean,
  actionType: String,
  datePrompted:  { type: Date, default: () => moment.utc().toDate() },
  dateCompleted: Date,
  actionStatus: String
})

module.exports = mongoose.model('ArchivedUserAction', archivedUserActionSchema)
