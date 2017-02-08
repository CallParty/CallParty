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

queue.process('callToAction', require('./jobs/callToAction'))
