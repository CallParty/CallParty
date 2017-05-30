const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ORG_NAMES = {
  callparty: 'CallParty',
  govtrack: 'GovTrack',
}

const ORG_EMAILS = {
  callparty: 'hi@callparty.org',
  govtrack: 'hi@govtrack.org'
}

const botSchema = new Schema({
  _id: { type: String, required: true, index: { unique: true } },
  fbId: { type: String, required: true, index: { unique: true } },
  fbToken: { type: String, required: true, index: { unique: true } },
  botType: { type: String, enum: ['callparty', 'govtrack'] }
})

botSchema.virtual('orgName').get(function() {
  return ORG_NAMES[this.botType] || ''
})

botSchema.virtual('orgEmail').get(function() {
  return ORG_EMAILS[this.botType] || ''
})

module.exports = mongoose.model('Bot', botSchema)
