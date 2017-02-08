const kue = require('kue')

module.exports = function() {
  const redisConfig = {
    prefix: process.env.REDIS_PREFIX,
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      auth: process.env.REDIS_PASSWORD
    }
  }
  return kue.createQueue(redisConfig)
}
