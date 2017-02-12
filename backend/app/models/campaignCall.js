const mongoose = require('mongoose')
const CampaignAction = require('./campaignAction')

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const campaignCallSchema = new Schema({
  title: String,
  message: String,
  task: String,
  link: String,
  active: Boolean,
  memberTypes: [{ type: String, enum: ['rep', 'sen'] }],
  parties: [{ type: String, enum: ['Democrat', 'Republican', 'Independent'] }],
  committees: Array
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  discriminatorKey: 'type'
})

campaignCallSchema.virtual('campaignUpdates', {
  ref: 'CampaignUpdate',
  localField: '_id',
  foreignField: 'campaignCall'
})

campaignCallSchema.methods.getMatchingRepresentatives = function() {
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

campaignCallSchema.methods.getMatchingUsersWithRepresentatives = function () {
  return Promise.all([
    this.getMatchingRepresentatives(),
    this.model('User').find({ active: true, unsubscribed: false }).exec(),
  ])
  .then(function([matchingRepresentatives, users]) {
    const repsByUser = users.reduce(function(repsByUser, user) {
      for (let rep of matchingRepresentatives) {
        const matchesSenator = (rep.legislator_type === 'sen' && rep.state === user.state)
        const matchesHouseRep = (
          rep.legislator_type === 'rep' &&
          rep.state === user.state &&
          rep.district === user.congressionalDistrict
        )
        if (matchesSenator || matchesHouseRep) {
          repsByUser[user._id] = repsByUser[user._id] || { user, representatives: [] }
          repsByUser[user._id].representatives.push(rep)
        }
      }
      return repsByUser
    }, {})

    return Object.values(repsByUser)
  })
}

module.exports = CampaignAction.discriminator('CampaignCall', campaignCallSchema)
