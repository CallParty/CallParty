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
	var rep = new Rep({ name: 'frogs', full_name: 'frogs dogs' })
  	rep.insertReps()
  	rep.save(function (err) {
  		if (err) {
  			return handleError(err)
  		} else {
  			console.log('success!')
  		}
	})
	console.log('***-----MongoDB Connected-----***')
})

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
