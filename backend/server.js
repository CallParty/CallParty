// modules =================================================
var express = require('express'),    // framework d'appli
 	app = express(),
 	bodyParser = require('body-parser'), // BodyParser pour POST
	http = require('http').Server(app),      // préparer le serveur web
	dotenv = require('dotenv'),
	path = require('path'),
	mongoose = require('mongoose')

// configuration ===========================================
// load environment variables,
// either from .env files (development),
// heroku environment in production, etc...
dotenv.load()

app.use(express.static(path.join(__dirname, '/public')))

// parsing
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing url encoded

// view engine ejs
app.set('view engine', 'ejs')

// routes
require('./app/routes/routes')(app)
require('./app/routes/conversation_routes')(app)

// port
// app.set('port', (process.env.PORT || 5000))
app.set('port', (8081));

// mongodb
// Mongodb Connect - mongo --ssl --sslAllowInvalidCertificates aws-us-east-1-portal.23.dblayer.com:16768/callpartyDev -u callparty -p callparty1234!
var dbusername 	= 'callparty',
	dbpassword 	= 'callparty1234!'

mongoose.connect('mongodb://'+dbusername+':'+dbpassword+'@aws-us-east-1-portal.23.dblayer.com:16768/callpartyDev?ssl=true')
//mongoose.connect('mongodb://'+dbusername+':'+dbpassword+'@aws-us-east-1-portal.23.dblayer.com:16768/callpartyProd?ssl=true')
var db = mongoose.connection,
	Rep = require('./app/methods/representativesMethods.js')

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
	Rep.count({}, function(err,count) {
		if (err) {
			console.log("err:")
			console.log(err)
		} else {
			console.log("Rep DB Count:")
			console.log(count)
			if(count === 0) {
				var repData = require('./devops/datamodels/current-representatives.json')
				for (i=0; i < repData.length; i++) {
					var termlength = repData[i].terms.length - 1
					var lastterm = repData[i].terms[termlength]
					var addingrep = new Rep({
						"id": "rep-"+i,
						"full_name": repData[i].name.first + " " + repData[i].name.last,
						"first_name": repData[i].name.first,
						"last_name": repData[i].name.last,
						"official_full": repData[i].name.official_full,
						"gender": repData[i].bio.gender,
						"state": lastterm.state,
						"legislator_type": lastterm.legislator_type,
						"term_start": lastterm.term_start,
						"term_end": lastterm.term_end,
						"party": lastterm.party,
						"url": lastterm.url,
						"phone": lastterm.phone,
						"terms": repData[i].terms,
						"bioguide": repData[i].id.bioguide,
						"govtrack": repData[i].id.govtrack,
						"wikipedia": repData[i].wikipedia,
						"wikidata": repData[i].wikidata
					})
				 	addingrep.save(function (err) {
				 		if (err) {
				 			return handleError(err)
				 		} else {
				 			console.log('success!')
				 		}
					})
				}
			}
		}
	})

	console.log('***-----MongoDB Connected-----***')
})

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
