const mongoose = require('mongoose')
const chai = require('chai')
const { CampaignAction, Reps, Committee, RepresentativeCommittee, User } = require('../app/models')

const expect = chai.expect

const dbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost/test'

mongoose.Promise = require('es6-promise')

describe('CampaignAction', function() {
  beforeEach(function(done) {
    mongoose.connect(dbUri, done)
  })

  afterEach(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      mongoose.disconnect(done)
    })
  })

  describe('.getMatchingRepresentatives()', function() {
    let committees = null
    let representatives = null

    beforeEach(function() {
      return Promise.all([
        Promise.all([
          Committee.create({ name: 'House Committee on Agriculture', thomasId: 'HSAG' }),
          Committee.create({ name: 'Senate Select Committee on Ethics', thomasId: 'SLET' })
        ]),
        Promise.all([
          Reps.create({ official_full: 'Sherrod Brown', bioguide: 'B000944', legislator_type: 'sen', party: 'Democrat', state: 'OH' }),
          Reps.create({ official_full: 'Bernard Sanders', bioguide: 'S000033', legislator_type: 'sen', party: 'Independent', state: 'VT' }),
          Reps.create({ official_full: 'Paul Ryan', bioguide: 'R000570', legislator_type: 'rep', party: 'Republican', state: 'WI', district: 1 })
        ])
      ])
      .then(function([testCommittees, testReps]) {
        committees = testCommittees
        representatives = testReps

        return Promise.all([
          RepresentativeCommittee.create({ representative: representatives[0]._id, committee: committees[1]._id }),
          RepresentativeCommittee.create({ representative: representatives[1]._id, committee: committees[1]._id }),
          RepresentativeCommittee.create({ representative: representatives[2]._id, committee: committees[0]._id })
        ])
      })
    })

    afterEach(function() {
      committees = null
      representatives = null
    })

    describe('when there are matching representatives', function() {
      let matchingRepresentatives = null
      let expectedRepresentatives = null

      beforeEach(function() {
        // Bernie is an Indepdendent so he shouldn't match this CampaignAction
        expectedRepresentatives = [representatives[0], representatives[2]]

        return CampaignAction.create({
          memberTypes: ['rep', 'sen'],
          parties: ['Democrat', 'Republican'],
          committees: committees.map(c => c._id)
        })
        .then(campaignAction => campaignAction.getMatchingRepresentatives())
        .then(matchingReps => matchingRepresentatives = matchingReps)
      })

      it('should return the correct representatives', function() {
        const matchingRepIds = matchingRepresentatives.map(r => r._id.toString()).sort()
        const expectedRepIds = expectedRepresentatives.map(r => r._id.toString()).sort()
        expect(matchingRepIds).to.deep.equal(expectedRepIds)
      })

      afterEach(function() {
        matchingRepresentatives = null
        expectedRepresentatives = null
      })
    })

    describe('when the CampaignAction has no memberTypes', function() {
      let matchingRepresentatives = null
      let expectedRepresentatives = null

      beforeEach(function() {
        // this CampaignAction has no memberTypes so no representatives should match
        expectedRepresentatives = []

        return CampaignAction.create({
          memberTypes: [],
          parties: ['Democrat', 'Republican'],
          committees: committees.map(c => c._id)
        })
        .then(campaignAction => campaignAction.getMatchingRepresentatives())
        .then(matchingReps => matchingRepresentatives = matchingReps)
      })

      afterEach(function() {
        matchingRepresentatives = null
        expectedRepresentatives = null
      })

      it('should return an empty array', function() {
        expect(matchingRepresentatives).to.deep.equal(expectedRepresentatives)
      })
    })

    describe('when the CampaignAction has no parties', function() {
      let matchingRepresentatives = null
      let expectedRepresentatives = null

      beforeEach(function() {
        // this CampaignAction has no memberTypes so no representatives should match
        expectedRepresentatives = []

        return CampaignAction.create({
          memberTypes: ['rep', 'sen'],
          parties: [],
          committees: committees.map(c => c._id)
        })
        .then(campaignAction => campaignAction.getMatchingRepresentatives())
        .then(matchingReps => matchingRepresentatives = matchingReps)
      })

      afterEach(function() {
        matchingRepresentatives = null
        expectedRepresentatives = null
      })

      it('should return an empty array', function() {
        expect(matchingRepresentatives).to.deep.equal(expectedRepresentatives)
      })
    })

    describe('when the CampaignAction has no committees', function() {
      let matchingRepresentatives = null
      let expectedRepresentatives = null

      beforeEach(function() {
        // this CampaignAction has no memberTypes so no representatives should match
        expectedRepresentatives = []

        return CampaignAction.create({
          memberTypes: ['rep', 'sen'],
          parties: ['Democrat', 'Republican'],
          committees: []
        })
        .then(campaignAction => campaignAction.getMatchingRepresentatives())
        .then(matchingReps => matchingRepresentatives = matchingReps)
      })

      afterEach(function() {
        matchingRepresentatives = null
        expectedRepresentatives = null
      })

      it('should return an empty array', function() {
        expect(matchingRepresentatives).to.deep.equal(expectedRepresentatives)
      })
    })
  })

  describe('.getMatchingUsersWithRepresentatives()', function() {
    let committees = null
    let representatives = null
    let users = null

    beforeEach(function() {
      return Promise.all([
        Promise.all([
          Committee.create({ name: 'House Committee on Agriculture', thomasId: 'HSAG' }),
          Committee.create({ name: 'Senate Select Committee on Ethics', thomasId: 'SLET' })
        ]),
        Promise.all([
          Reps.create({ official_full: 'Sherrod Brown', bioguide: 'B000944', legislator_type: 'sen', party: 'Democrat', state: 'OH' }),
          Reps.create({ official_full: 'Bernard Sanders', bioguide: 'S000033', legislator_type: 'sen', party: 'Independent', state: 'VT' }),
          Reps.create({ official_full: 'Paul Ryan', bioguide: 'R000570', legislator_type: 'rep', party: 'Republican', state: 'WI', district: 1 })
        ]),
        Promise.all([
          User.create({ active: true, state: 'OH', congressionalDistrict: 2 }),
          User.create({ active: true, state: 'VT', congressionalDistrict: 4 }),
          User.create({ active: true, state: 'WI', congressionalDistrict: 1 }),
          User.create({ active: true, state: 'WI', congressionalDistrict: 3 }),
          User.create({ active: true, state: 'NY', congressionalDistrict: 5 })
        ])
      ])
      .then(function([testCommittees, testReps, testUsers]) {
        committees = testCommittees
        representatives = testReps
        users = testUsers

        return Promise.all([
          RepresentativeCommittee.create({ representative: representatives[0]._id, committee: committees[1]._id }),
          RepresentativeCommittee.create({ representative: representatives[1]._id, committee: committees[1]._id }),
          RepresentativeCommittee.create({ representative: representatives[2]._id, committee: committees[0]._id })
        ])
      })
    })

    afterEach(function() {
      committees = null
      representatives = null
      users = null
    })

    describe('when there are matching users', function() {
      let matchingUsersWithRepresentatives = null
      let expectedUsersWithRepresentatives = null

      beforeEach(function() {
        // we should get the user who lives in Ohio and the user who lives in Wisconsin's 1st district
        expectedUsersWithRepresentatives = [
          { user: users[0], representatives: [representatives[0]] },
          { user: users[2], representatives: [representatives[2]] }
        ]

        return CampaignAction.create({
          memberTypes: ['rep', 'sen'],
          parties: ['Democrat', 'Republican'],
          committees: committees.map(c => c._id)
        })
        .then(campaignAction => campaignAction.getMatchingUsersWithRepresentatives())
        .then(matchingTestUsers => matchingUsersWithRepresentatives = matchingTestUsers)
      })

      it('should return the correct users', function() {
        const idComparator = (a, b) => {
          const idA = a.user._id.toString()
          const idB = b.user._id.toString()

          if (idA < idB) {
            return -1
          } else if (idA > idB) {
            return 1
          }
          return 0
        }
        const sortedMatchingUsersWithRepresentatives = matchingUsersWithRepresentatives.sort(idComparator)
        const sortedExpectedUsersWithRepresentatives = expectedUsersWithRepresentatives.sort(idComparator)
        const matchingUserIds = sortedMatchingUsersWithRepresentatives.map(u => u.user._id.toString())
        const expectedUserIds = sortedExpectedUsersWithRepresentatives.map(u => u.user._id.toString())
        const matchingRepresentativeIds = sortedMatchingUsersWithRepresentatives.map(u => u.representatives.map(r => r._id.toString()))
        const expectedRepresentativeIds = sortedExpectedUsersWithRepresentatives.map(u => u.representatives.map(r => r._id.toString()))

        expect(matchingUserIds).to.deep.equal(expectedUserIds)
        expect(matchingRepresentativeIds).to.deep.equal(expectedRepresentativeIds)
      })

      afterEach(function() {
        matchingUsersWithRepresentatives = null
        expectedUsersWithRepresentatives = null
      })
    })

    describe('when the CampaignAction has no memberTypes', function() {
      let matchingUsersWithRepresentatives = null
      let expectedUsersWithRepresentatives = null

      beforeEach(function() {
        expectedUsersWithRepresentatives = []

        return CampaignAction.create({
          memberTypes: [],
          parties: ['Democrat', 'Republican'],
          committees: committees.map(c => c._id)
        })
        .then(campaignAction => campaignAction.getMatchingUsersWithRepresentatives())
        .then(matchingTestUsers => matchingUsersWithRepresentatives = matchingTestUsers)
      })

      it('should return an empty array', function() {
        expect(matchingUsersWithRepresentatives).to.deep.equal(expectedUsersWithRepresentatives)
      })

      afterEach(function() {
        matchingUsersWithRepresentatives = null
        expectedUsersWithRepresentatives = null
      })
    })

    describe('when the CampaignAction has no parties', function() {
      let matchingUsersWithRepresentatives = null
      let expectedUsersWithRepresentatives = null

      beforeEach(function() {
        expectedUsersWithRepresentatives = []

        return CampaignAction.create({
          memberTypes: ['rep', 'sen'],
          parties: [],
          committees: committees.map(c => c._id)
        })
        .then(campaignAction => campaignAction.getMatchingUsersWithRepresentatives())
        .then(matchingTestUsers => matchingUsersWithRepresentatives = matchingTestUsers)
      })

      it('should return an empty array', function() {
        expect(matchingUsersWithRepresentatives).to.deep.equal(expectedUsersWithRepresentatives)
      })

      afterEach(function() {
        matchingUsersWithRepresentatives = null
        expectedUsersWithRepresentatives = null
      })
    })

    describe('when the CampaignAction has no committees', function() {
      let matchingUsersWithRepresentatives = null
      let expectedUsersWithRepresentatives = null

      beforeEach(function() {
        expectedUsersWithRepresentatives = []

        return CampaignAction.create({
          memberTypes: [],
          parties: ['Democrat', 'Republican'],
          committees: []
        })
        .then(campaignAction => campaignAction.getMatchingUsersWithRepresentatives())
        .then(matchingTestUsers => matchingUsersWithRepresentatives = matchingTestUsers)
      })

      it('should return an empty array', function() {
        expect(matchingUsersWithRepresentatives).to.deep.equal(expectedUsersWithRepresentatives)
      })

      afterEach(function() {
        matchingUsersWithRepresentatives = null
        expectedUsersWithRepresentatives = null
      })
    })
  })
})
