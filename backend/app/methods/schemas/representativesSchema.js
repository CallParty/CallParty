var mongoose = require('mongoose')
var Schema = mongoose.Schema

var repTerms = new Schema({
    type: String,
    start: String,
    end: String,
    state: String,
    district: String,
    party: String
})

var representativesSchema = new Schema({
    name: String,
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
    wikidata: String
})

var Representatives = mongoose.model('Representatives', representativesSchema)
module.exports = Representatives