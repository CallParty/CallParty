var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var representativesSchema = new Schema({
  id: String,
  full_name: String,
  first_name: String,
  last_name: String,
  official_full: String,
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
  district: String,
  bioguide: String,
  govtrack: String,
  wikipedia: String,
  wikidata: String,
  image_url: String
})

var Reps = mongoose.model('Reps', representativesSchema)
module.exports = Reps
