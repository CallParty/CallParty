function botReply(bot, message, text) {
  // TODO: log error to slack somehow
  return new Promise(function(resolve, reject) {
    bot.reply(message, text, function(err, response) {
      if (err) { return reject(err) }
      resolve(response)
    })
  })
}

module.exports = {
  botReply,
}
