

function startTestDialog(bot, userAddress, params) {
  bot.beginDialog(userAddress, '/', params)
}

function registerTestDialogs(bot) {
  bot.dialog('/', function (session, params) {
    session.send('This is a test message')
    session.endDialog()
  })
}

module.exports = {
  registerTestDialogs,
  startTestDialog
}