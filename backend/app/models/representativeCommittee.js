const mongoose = require('mongoose')
const Schema = mongoose.Schema

const representativeCommitteeSchema = new Schema({
  representative: { type: Schema.Types.ObjectId, ref: 'Reps' },
  committee: { type: Schema.Types.ObjectId, ref: 'Committee' }
})

representativeCommitteeSchema.index({ representative: 1, committee: 1 }, { unique: true })

module.exports = mongoose.model('RepresentativeCommittee', representativeCommitteeSchema)
