var representativesSchema = require('./schemas/representativesSchema.js'),
	mongoose = require('mongoose')

representativesSchema.methods.insertReps = function () {

	var name = 'dogs'
    	// id = this.id,
    	// full_name = this.full_name,
    	// first_name = this.first_name,
    	// last_name = this.last_name,
    	// official_full = this.official_full,
	    // gender = this.gender,
	    // state = this.state,
	    // legislator_type = this.legislator_type,
	    // term_start = this.term_start,
	    // term_end = this.term_end,
	    // party = this.party,
	    // url = this.url,
	    // phone = this.phone,
	    // contact_form = this.contact_form,
	    // state_rank = this.state_rank,
	    // terms = this.terms,
	    // bioguide = this.bioguide,
	    // govtrack = this.govtrack,
	    // wikipedia = this.wikipedia,
	    // wikidata = this.wikidata

	console.log('the name is: ' + name)
}

var Reps = mongoose.model('Reps', representativesSchema)
module.exports = Reps