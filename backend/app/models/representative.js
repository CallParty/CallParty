const mongoose = require('mongoose')
const Schema = mongoose.Schema

const representativeSchema = new Schema({
  id: String,
  full_name: String,
  first_name: String,
  last_name: String,
  official_full: String,
  gender: String,
  state: String,
  legislator_type: { type: String, enum: ['rep', 'sen'] },
  term_start: String,
  term_end: String,
  party: { type: String, enum: ['Democrat', 'Republican', 'Independent'] },
  url: String,
  phone: String,
  contact_form: String,
  state_rank: String,
  district: String,
  bioguide: { type: String, unique: true },
  govtrack: String,
  wikipedia: String,
  wikidata: String,
  image_url: String
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

representativeSchema.virtual('representativeCommittees', {
  ref: 'RepresentativeCommittee',
  localField: '_id',
  foreignField: 'representative'
})

representativeSchema.virtual('representativeSubcommittees', {
  ref: 'RepresentativeSubcommittee',
  localField: '_id',
  foreignField: 'representative'
})

representativeSchema.virtual('committees').get(function() {
  if (!this.representativeCommittees) { return null }
  return this.representativeCommittees.map(rc => rc.committee)
})

representativeSchema.virtual('subcommittees').get(function() {
  if (!this.representativeSubcommittees) { return null }
  return this.representativeSubcommittees.map(rs => rs.subcommittee)
})

representativeSchema.virtual('legislatorTitle').get(function() {
  if (!this.legislator_type) { return '' }

  const legislatorTypeLabels = {
    rep: 'Representative',
    sen: 'Senator'
  }
  return legislatorTypeLabels[this.legislator_type]
})

var Reps = mongoose.model('Reps', representativeSchema)
module.exports = Reps
