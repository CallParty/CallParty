var setUserCallback = require('../methods/userMethods').setUserCallback

function test1Convo(bot, user, message) {
  bot.reply(message, 'test1 convo message')
  setUserCallback(user, '/test2')
}

function test2Convo(bot, user, message) {
  bot.reply(message, 'test2 convo message')
}

module.exports = {
  test1Convo,
  test2Convo,
}