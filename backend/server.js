// configuration ===========================================
// load environment variables,
const dotenv = require('dotenv')
dotenv.load()
const { logMessage, captureException } = require('./app/utilities/logHelper')
const express = require('express') // framework d'appli
const app = express()
const Raven = require('raven')

// modules =================================================
const apiRouter = express.Router()
const bodyParser = require('body-parser') // BodyParser pour POST
const server = require('http').Server(app) // préparer le serveur web
const path = require('path')
const mongoose = require('mongoose')
const jwt = require('express-jwt')
const io = require('socket.io')(server, { path: '/socket.io' })

// log unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', function(err) {
  captureException(err)
})
process.on('uncaughtException', function(err) {
  captureException(err)
})

io.on('connection', function connection(client) {
  client.emit('message', 'Socket connected OK')
})

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
const unauthenticatedPaths = [
  '/api/token',
  '/api/home',
  '/api/test',
  '/api/webhook',
  '/api/error',
  '/api/slack',
  '/api/upload_ssl_certs',
  '/api/admins'
]
if (process.env.DEBUG_ENDPOINTS === 'true') {
  unauthenticatedPaths.push(new RegExp('/api/start/.*', 'i'))
  unauthenticatedPaths.push(new RegExp('/api/send/.*', 'i'))
}
// all authenticated API endpoints will have access to the current user's bot at req.user.bot
app.use(jwt({ secret: process.env.JWT_SECRET }).unless({
  path: unauthenticatedPaths,
}))

// routes
require('./app/routes/helperRoutes')(apiRouter)
require('./app/routes/sendRoutes')(apiRouter, io)
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
  logMessage('***----- USING PROD DATABASE -----***')
}
else {
  logMessage('++ staging database connected')
}

// exception error handler
app.use(function (err, req, res, next) {
  captureException(err)
  next(err)
})

// configure error logging (needs to be at the bottom of server.js for some reason)
if (process.env.SENTRY_BACKEND_DSN) {
  logMessage('++ using Sentry for error logging')
  // Must configure Raven before doing anything else with it
  Raven.config(process.env.SENTRY_BACKEND_DSN).install()
  // The request handler must be the first middleware on the app
  app.use(Raven.requestHandler())
}

// START ===================================================
server.listen(app.get('port'), function () {
  logMessage('++ listening on port ' + app.get('port'))
})
