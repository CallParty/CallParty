
function defaultConvo(bot, user, message) {
  bot.reply(message, "Oh gosh I didn't understand that. If you'd like to talk to a person " +
    'send us an email at hi@callparty.org ')
}

module.exports = {
  defaultConvo,
}