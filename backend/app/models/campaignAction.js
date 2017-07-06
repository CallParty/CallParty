const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema
const { logMessage } = require('../utilities/logHelper')
const ObjectId = mongoose.Types.ObjectId

const CAMPAIGN_ACTION_STATUS = {
  error: 'error',
  preview: 'preview',
  sending: 'sending',
  sent: 'sent',
}

const campaignActionSchema = new Schema({
  bot: { type: String, ref: 'Bot' }, // this should always be the same as associated Campaign, but storing here for convenience
  label: String,
  createdAt: { type: Date, default: () => moment.utc().toDate() },
  sent: { type: Boolean, default: false },
  status: {
    type: String,
    enum: Object.values(CAMPAIGN_ACTION_STATUS)
  },
  sentAt: Date,
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },

  // TARGETING
  targetingType: { type: String, enum: ['segmenting', 'borrowed'] },

  // (independent targeting)
  // rep targeting
  memberTypes: [{ type: String, enum: ['rep', 'sen'] }],
  parties: [{ type: String, enum: ['Democrat', 'Republican', 'Independent'] }],
  committees: [{type: mongoose.Schema.Types.ObjectId, ref: 'Committee'}],
  // user targeting
  districts: Array,

  // (borrowed targeting)
  targetAction: { type: Schema.Types.ObjectId, ref: 'CampaignAction' },    // targets anyone who this action was sent to

  // CACHED (store targeted reps so that it doesn't have to be recalculated)
  targetedRepIds: [{ type: Schema.Types.ObjectId, ref: 'Representative' } ]

}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  discriminatorKey: 'type'
})

campaignActionSchema.virtual('userConversations', {
  ref: 'UserConversation',
  localField: '_id',
  foreignField: 'campaignAction'
})

campaignActionSchema.methods.getMatchingRepresentatives = async function() {

  if (this.targetingType === 'borrowed') {
    await this.populate('targetAction').execPopulate()
    return this.targetAction.getMatchingRepresentatives()
  }

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

campaignActionSchema.methods.getMatchingUsers = async function() {

  if (this.targetingType === 'borrowed') {
    await this.populate('targetAction').execPopulate()
    await this.targetAction.populate({ path: 'userConversations', populate: { path: 'user' }}).execPopulate()
    // this if clause is for debugging a weird intermittent bug where userConversations is sometimes but not always
    // loaded here https://github.com/CallParty/CallParty/issues/347
    if (!this.targetAction.userConversations) {
      logMessage('++ warning: re-fetching userConversations for target action')
      await this.targetAction.populate({ path: 'userConversations', populate: { path: 'user' }}).execPopulate()
    }
    return this.targetAction.userConversations.map(ua => ua.user)
  }

  // base query
  let userQuery = this.model('User')

  // iteratively add filters to query based on targeting criteria
  const matchParams = { active: true, unsubscribed: false, bot: this.bot}
  const hasDistrictsFilter = this.districts && this.districts.length > 0
  if (hasDistrictsFilter) {
    matchParams.district = { $in: this.districts }
  }

  // filter by matchParams
  userQuery = userQuery.find(matchParams)

  // execute query and return
  return userQuery.exec()
}

campaignActionSchema.methods.getMatchingUsersWithRepresentatives = function () {

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

campaignActionSchema.statics.CAMPAIGN_ACTION_STATUS = CAMPAIGN_ACTION_STATUS

module.exports = mongoose.model('CampaignAction', campaignActionSchema)
