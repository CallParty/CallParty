const kue = require('kue')
const express = require('express')
const basicAuth = require('basic-auth-connect')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

mongoose.Promise = require('es6-promise')

dotenv.load()
const logMessage = require('./app/utilities/logHelper').logMessage

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))

console.log('***-----MongoDB Connected-----***')

const createQueue = require('./app/utilities/createQueue')
const queue = createQueue()

queue.watchStuckJobs(1000)

queue.on('ready', function() {
  console.log('Queue is running')
})

queue.on('error', function(err) {
  console.log(err)
  console.log(err.stack)
})

queue.on('job enqueue', function(id, type) {
  console.log( 'Job %s got queued of type %s', id, type )
})

queue.process('callConvo', require('./jobs/processCallConvo'))

// kue viewer
const app = express()
app.use(basicAuth(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD))
app.use('/kue', kue.app)
app.set('port', 8083)
const http = require('http').Server(app)
logMessage('++ starting kue', '#_kue')
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'))
})
