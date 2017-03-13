const { botReply } = require('../utilities/botkit')
const { logMessage } = require('../utilities/logHelper')

function defaultConvo(user, message) {
  logMessage(`++ ${user.firstName} ${user.lastName} (${user.fbId}) said something the bot didn't understand: "${message.text}"`, '#_feedback')
  botReply(user, `I'm sorry I didn't understand that! If you have a question, comment, or suggestion, a real person will respond here shortly. ` +
    `You can also email us at hi@callparty.org `)
}

module.exports = {
  defaultConvo,
}