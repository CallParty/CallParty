const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subcommitteeSchema = new Schema({
  name: String,
  thomasId: String,
  address: String,
  phone: String,
  committee: { type: Schema.Types.ObjectId, ref: 'Committee' }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

subcommitteeSchema.virtual('representativeCommittees', {
  ref: 'RepresentativeSubcommittee',
  localField: '_id',
  foreignField: 'subcommittee'
})

subcommitteeSchema.virtual('representatives').get(function() {
  if (!this.representativeSubcommittees) { return null }
  return this.representativeSubcommittees.map(rc => rc.representative)
})

module.exports = mongoose.model('Subcommittee', subcommitteeSchema)
