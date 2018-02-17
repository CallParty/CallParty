const { botReply } = require('../utilities/botReply')
const { logMessage } = require('../utilities/logHelper')

function defaultConvo(user, message) {
  logMessage(`++ [${user.botId}] ${user.firstName} ${user.lastName} (${user.fbId}) said something the bot didn't understand: "${message.text}"`, '#_unexpected')

  const whitelistRegex = new RegExp(/bye|thank u|thank you|thanks+|sounds good|👍|cool|ok|okay|yay|thumbs up|k|kk|excellent|<3|rad/, 'i')

  const shouldReplyWithThumbsUp = message.text === undefined || (typeof message.text === 'string' && !message.text.endsWith('?') && whitelistRegex.test(message.text))

  const replyMessage = shouldReplyWithThumbsUp ?
    `👍` :
    `I'm sorry, I didn't understand that! Shoot us an email if you'd like to talk to a person ${user.bot.orgEmail}. You can also say 'stop' or 'unsubscribe' to stop receiving messages.`

  return botReply(user, replyMessage)
}

module.exports = {
  defaultConvo,
}
