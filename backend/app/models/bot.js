const mongoose = require('mongoose')
const Schema = mongoose.Schema

const botSchema = new Schema({
  _id: { type: String, required: true, index: { unique: true } },
  fbId: { type: String, required: true, index: { unique: true } },
  fbToken: { type: String, required: true, index: { unique: true } },
  botType: { type: String, enum: ['callparty', 'govtrack'] }
})

module.exports = mongoose.model('Bot', botSchema)
