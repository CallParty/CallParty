// modules =================================================
const express = require('express') // framework d'appli
const app = express()
const Raven = require('raven');
// Must configure Raven before doing anything else with it
Raven.config('__DSN__').install();
// The request handler must be the first middleware on the app
app.use(Raven.requestHandler());
// The error handler must be before any other error middleware
app.use(Raven.errorHandler());
const apiRouter = express.Router()
const bodyParser = require('body-parser') // BodyParser pour POST
const http = require('http').Server(app) // préparer le serveur web
const dotenv = require('dotenv')
const path = require('path')
const mongoose = require('mongoose')

// configuration ===========================================
// load environment variables,
// either from .env files (development),
// heroku environment in production, etc...
dotenv.load()

// Handle CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// parsing
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing url encoded

app.use(express.static(path.join(__dirname, '/public')))

// view engine ejs
app.set('view engine', 'ejs')

// routes
require('./app/routes/routes')(apiRouter)
require('./app/routes/conversationRoutes')(apiRouter)
require('./app/routes/adminRoutes')(apiRouter)

app.use('/api', apiRouter)

// port
// app.set('port', (process.env.PORT || 5000))
app.set('port', (8081))
// Handle CORS
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')
  next()
})

// mongodb
var dburi = process.env.MONGODB_URI || ''

mongoose.connect(dburi)
var db = mongoose.connection
var Rep = require('./app/methods/representativesMethods.js')

db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', function() {
  Rep.insertReps()
})

console.log('***-----MongoDB Connected-----***')

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
