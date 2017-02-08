const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ObjectId = mongoose.Types.ObjectId

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

campaignActionSchema.methods.getMatchingRepresentatives = function() {
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
      'committees._id': { $in: this.committees.map(ObjectId) }
    })
    .exec()
}

campaignActionSchema.methods.getMatchingUsers = function () {
  return Promise.all([
    this.getMatchingRepresentatives(),
    this.model('User').find({ active: true, unsubscribed: false }).exec(),
  ])
  .then(function([matchingRepresentatives, users]) {
    return users.filter(function(user) {
      for (let rep of matchingRepresentatives) {
        const matchesSenator = (rep.legislator_type === 'sen' && rep.state === user.state)
        const matchesHouseRep = (
          rep.legislator_type === 'rep' &&
          rep.state === user.state &&
          rep.district === user.congressionalDistrict
        )
        if (matchesSenator || matchesHouseRep) {
          return true
        }
      }
      return false
    })
  })
}

module.exports = mongoose.model('CampaignAction', campaignActionSchema)
