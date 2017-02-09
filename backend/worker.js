const kue = require('kue')
const express = require('express')
const basicAuth = require('basic-auth-connect')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

mongoose.Promise = require('es6-promise')

dotenv.load()

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

queue.on('job complete', function(id) {
  kue.Job.get(id, function(err, job) {
    if (err) { return }
    job.remove(function(err) {
      if (err) {
        console.error(err)
        return
      }
      console.log('removed completed job #%d', job.id)
    })
  })
})


queue.process('callToAction', require('./jobs/callToAction'))

// kue viewer
const app = express()
app.use(basicAuth(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD))
app.use('/', kue.app)
const http = require('http').Server(app)
http.listen(8083, function () {
  console.log('listening on port ' + app.get('port'))
})