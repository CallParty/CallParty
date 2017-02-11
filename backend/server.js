// modules =================================================
const express = require('express') // framework d'appli
const app = express()
const Raven = require('raven')
// Must configure Raven before doing anything else with it
Raven.config(process.env.SENTRY_BACKEND_DSN).install()
// The request handler must be the first middleware on the app
app.use(Raven.requestHandler())
// The error handler must be before any other error middleware
app.use(Raven.errorHandler())

const apiRouter = express.Router()
const bodyParser = require('body-parser') // BodyParser pour POST
const http = require('http').Server(app) // préparer le serveur web
const dotenv = require('dotenv')
const path = require('path')
const mongoose = require('mongoose')
const jwt = require('express-jwt')

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

// set up JWT authentication and whitelist API routes that don't require JWT auth
// this has to go before we define the API routes
app.use(jwt({ secret: process.env.JWT_SECRET }).unless({
  path: [
    '/api/token',
    '/api/home',
    '/api/test',
    '/api/webhook',
    new RegExp('/api/start/.*', 'i')
  ]
}))

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

// handle JWT authorization failure
app.use(function(err, req, res, next) {
  if (err.name !== 'UnauthorizedError') {
    return next(err)
  }
  return res.sendStatus(401)
})

// mongodb
const dbUri = process.env.MONGODB_URI || ''

mongoose.Promise = require('es6-promise')
mongoose.connect(dbUri)
const db = mongoose.connection
const { insertReps } = require('./app/methods/representativesMethods')
const { insertCommittees } = require('./app/methods/committeeMethods')

db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', function() {
  insertReps().then(insertCommittees)
})

if (/.*callpartyprod$/.test(dbUri)) {
  console.log('***----- USING PROD DATABASE -----***')
}
else {
  console.log('++ staging database connected')
}


// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
