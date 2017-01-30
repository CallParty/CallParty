var builder = require('botbuilder')
var registerSignupDialogs = require('./signup').registerSignupDialogs
var registerCallToActionDialogs = require('./calltoaction').registerCallToActionDialogs

var config = { appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD }
var connector = new builder.ChatConnector(config)
var bot = new builder.UniversalBot(connector, { persistConversationData: true })

// register different dialogs
registerSignupDialogs(bot)
registerCallToActionDialogs(bot)

// export the bot and connector
module.exports = {
  bot: bot,
  connector: connector
}