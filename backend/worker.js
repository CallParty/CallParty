const kue = require('kue')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

mongoose.Promise = require('es6-promise')

dotenv.load()

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))

console.log('***-----MongoDB Connected-----***')

const redisConfig = {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    auth: process.env.REDIS_PASS || ''
  }
}

const queue = kue.createQueue(redisConfig)

queue.watchStuckJobs(1000)

queue.on('ready', function() {
  console.log(`Queue is ready, using Redis config: ${JSON.stringify(redisConfig.redis)}`)
})

queue.on('error', function(err) {
  console.log(err)
  console.log(err.stack)
})

queue.process('callToAction', require('./jobs/callToAction'))
