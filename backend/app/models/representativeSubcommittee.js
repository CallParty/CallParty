const mongoose = require('mongoose')
const Schema = mongoose.Schema

const representativeSubcommitteeSchema = new Schema({
  representative: { type: Schema.Types.ObjectId, ref: 'Reps' },
  subcommittee: { type: Schema.Types.ObjectId, ref: 'Subcommittee' }
})

representativeSubcommitteeSchema.index({ representative: 1, subcommittee: 1 }, { unique: true })

module.exports = mongoose.model('RepresentativeSubcommittee', representativeSubcommitteeSchema)
