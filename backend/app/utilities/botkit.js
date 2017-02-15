const { bot } = require('../botkit_controller/botkitSetup')
const Raven = require('raven')


function botReply(message, text) {
  return new Promise(function(resolve, reject) {
    bot.reply(message, text, function(err, response) {
      if (err) {
        Raven.captureException(err)
        return reject(err)
      }
      resolve(response)
    })
  })
}

module.exports = {
  botReply,
}
