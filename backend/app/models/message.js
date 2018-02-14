const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
  mid: { type: String, required: true, index: { unique: true } },
})

module.exports = mongoose.model('Message', messageSchema)
