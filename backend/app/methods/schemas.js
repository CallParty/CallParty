var representativesSchema = mongoose.Schema({
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
    terms: [{
        type: String,
        start: String,
        end: String,
        state: String,
        district: String,
        party: String
    }],
    bioguide: String,
    govtrack: String,
    wikipedia: String,
    wikidata: String
})

var usersSchema = mongoose.Schema({
	_id: String,
	userid: String,
	fbtoken: String,
	state: String,
	congressional_district: Number,
	create_date: String,
	fb_data: {
		unknown: String
	},
	active: Boolean,
	subscribed: Boolean
})

export { representativesSchema, usersSchema }