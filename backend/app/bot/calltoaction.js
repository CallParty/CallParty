

function startCallToActionDialog(bot, userAddress, params) {
  bot.beginDialog(userAddress, '/calltoaction', params)
}

function registerCallToActionDialogs(bot) {
  bot.dialog('/calltoaction', function (session, params) {
    session.send('This is a calltoaction')
    session.endDialog()
  })
}

module.exports = {
  registerCallToActionDialogs,
  startCallToActionDialog
}