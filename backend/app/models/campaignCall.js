const mongoose = require('mongoose')
const CampaignAction = require('./campaignAction')

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const campaignCallSchema = new Schema({
  title: String,
  message: String,
  task: String,
  actionAdminLabel: String,
  issueLink: String,
  shareLink: String,
  active: Boolean,
  memberTypes: [{ type: String, enum: ['rep', 'sen'] }],
  parties: [{ type: String, enum: ['Democrat', 'Republican', 'Independent'] }],
  committees: Array,
  districts: Array,
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

  // construct repsQuery
  let repsQuery = this.model('Reps')
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
      committees: { $push: '$committees' },
    })

  // add matchParams to repsQuery if they are supplied
  const matchParams = {}
  const hasMemberTypesFilter = this.memberTypes && this.memberTypes.length > 0
  const hasPartiesFilter = this.parties && this.parties.length > 0
  const hasCommitteesFilter = this.committees && this.committees.length > 0
  if (hasMemberTypesFilter) {
    matchParams.legislator_type = { $in: this.memberTypes }
  }
  if (hasPartiesFilter) {
    matchParams.party = { $in: this.parties }
  }
  if (hasCommitteesFilter) {
    matchParams['committees._id'] = { $in: this.committees.map(ObjectId) }
  }
  if (hasMemberTypesFilter || hasPartiesFilter || hasCommitteesFilter) {
    repsQuery = repsQuery.match(matchParams)
  }

  // return executed query
  return repsQuery.exec()
}

campaignCallSchema.methods.getMatchingUsers = function() {

  // base query
  let userQuery = this.model('User')

  // iteratively add filters to query based on targeting criteria
  const matchParams = { active: true, unsubscribed: false }
  const hasDistrictsFilter = this.districts && this.districts.length > 0
  if (hasDistrictsFilter) {
    matchParams.district = { $in: this.districts }
  }

  // filter by matchParams
  userQuery = userQuery.find(matchParams)

  // execute query and return
  return userQuery.exec()
}

campaignCallSchema.methods.getMatchingUsersWithRepresentatives = function () {

   // filter reps based on any rep filtering criteria (e.g. belongs to X committee)
  const repsPromise = this.getMatchingRepresentatives()

  // also filter users based on any user filtering criteria (e.g. user belongs to X district)
  const usersPromise = this.getMatchingUsers()

  // we take all matchingReps and matchingUsers and send to any user in matchingUsers who has a rep in matchingReps
  return Promise.all([repsPromise, usersPromise])
  .then(function([matchingRepresentatives, users]) {
    const repsByUser = users.reduce(function(repsByUser, user) {
      for (let rep of matchingRepresentatives) {
        const matchesSenator = (rep.legislator_type === 'sen' && rep.state === user.state)
        const matchesHouseRep = (
          rep.legislator_type === 'rep' &&
          rep.district === user.district
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
