function syncBotReply(bot, message, text) {
  return new Promise(function(resolve, reject) {
    bot.reply(message, text, function(err, response) {
      if (err) { return reject(err) }
      resolve(response)
    })
  })
}

module.exports = {
  syncBotReply,
}
