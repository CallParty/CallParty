const mongoose = require('mongoose')
const Schema = mongoose.Schema

const committeeSchema = new Schema({
  type: String,
  name: String,
  address: String,
  phone: String,
  jurisdiction: String,
  jurisdictionSource: String,
  thomasId: { type: String, unique: true },
  houseCommitteeId: String,
  senateCommitteeId: String,
  url: String,
  minorityUrl: String
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

committeeSchema.virtual('subcommittees', {
  ref: 'Subcommittee',
  localField: '_id',
  foreignField: 'committee'
})

committeeSchema.virtual('representativeCommittees', {
  ref: 'RepresentativeCommittee',
  localField: '_id',
  foreignField: 'committee'
})

committeeSchema.virtual('representatives').get(function() {
  if (!this.representativeCommittees) { return null }
  return this.representativeCommittees.map(rc => rc.representative)
})

module.exports = mongoose.model('Committee', committeeSchema)
