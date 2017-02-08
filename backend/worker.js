const kue = require('kue')
const dotenv = require('dotenv')

dotenv.load()

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
  console.log('Queue is ready.')
  console.log(`Queue is using Redis config: ${JSON.stringify(redisConfig.redis)}`)
})

queue.on('error', function(err) {
  console.log(err)
  console.log(err.stack)
})

queue.process('callToAction', require('./jobs/callToAction'))
