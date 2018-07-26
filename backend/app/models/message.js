const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

const messageSchema = new Schema({
  mid: { type: String, required: true, index: { unique: true } },
  createdAt: { type: Date, default: function() { moment.utc().toDate() }},
})

module.exports = mongoose.model('Message', messageSchema)
