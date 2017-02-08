const kue = require('kue')

module.exports = function() {
  const redisConfig = {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      auth: process.env.REDIS_PASS || ''
    }
  }
  return kue.createQueue(redisConfig)
}
