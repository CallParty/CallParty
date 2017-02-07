const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campaignActionSchema = new Schema({
  title: String,
  message: String,
  cta: String,
  active: Boolean,
  type: String,
  memberTypes: [{ type: String, enum: ['rep', 'sen'] }],
  parties: [{ type: String, enum: ['Democrat', 'Republican', 'Independent'] }],
  committees: Array,
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

campaignActionSchema.methods.getRepresentatives = function() {
  return this.model('Reps')
    .aggregate()
    .lookup({ from: 'representativecommittees', localField: '_id', foreignField: 'representative', as: 'representativeCommittees' })
    .unwind({ path: '$representativeCommittees', preserveNullAndEmptyArrays: true })
    .lookup({ from: 'committees', localField: 'representativeCommittees.committee', foreignField: '_id', as: 'committees' })
    .unwind({ path: '$committees', preserveNullAndEmptyArrays: true })
    .group({
      _id: '$_id',
      legislator_type: { $first: '$legislator_type' },
      party: { $first: '$party' },
      state: { $first: '$state' },
      district: { $first: '$district' },
      official_full: { $first: '$official_full' },
      committees: { $push: '$committees' }
    })
    .match({
      legislator_type: { $in: this.memberTypes },
      party: { $in: this.parties },
      'committees._id': { $in: this.committees }
    })
    .exec()
}

module.exports = mongoose.model('CampaignAction', campaignActionSchema)
