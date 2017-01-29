var mongoose = require('mongoose'),
  Schema = mongoose.Schema

var repTerms = new Schema({
  type: String,
  start: String,
  end: String,
  state: String,
  district: String,
  party: String
})

var representativesSchema = new Schema({
  id: String,
  full_name: String,
  name: {
    first: String,
    last: String,
    official_full: String
  },
  gender: String,
  state: String,
  legislator_type: String,
  term_start: String,
  term_end: String,
  party: String,
  url: String,
  phone: String,
  contact_form: String,
  state_rank: String,
  terms: [repTerms],
  bioguide: String,
  govtrack: String,
  wikipedia: String,
  wikidata: String,
  image_url: String
})

var Reps = mongoose.model('Reps', representativesSchema)
module.exports = Reps
