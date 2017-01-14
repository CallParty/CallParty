// modules =================================================
var express = require('express'),    // framework d'appli
 	app = express(),
 	bodyParser = require('body-parser'), // BodyParser pour POST
	http = require('http').Server(app),      // préparer le serveur web
	dotenv = require('dotenv'),
	path = require('path')

var testingDB = require('./app/methods/methods.js').testingDB

// configuration ===========================================
testingDB('words')
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

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
