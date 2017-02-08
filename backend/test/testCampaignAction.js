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
      .then(function([newCommittees, newReps]) {
        committees = newCommittees
        representatives = newReps

        return Promise.all([
          RepresentativeCommittee.create({ representative: newReps[0]._id, committee: committees[1]._id }),
          RepresentativeCommittee.create({ representative: newReps[1]._id, committee: committees[1]._id }),
          RepresentativeCommittee.create({ representative: newReps[2]._id, committee: committees[0]._id })
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
})
