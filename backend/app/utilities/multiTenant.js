const { Bot } = require('../models')
const { captureException } = require('./logHelper')

async function getBotFromFbId(recipientId) {
  /* returns the bot which is associated with the given fbId */
  const bot = await Bot.findOne({ fbId: recipientId })
  if (!bot) {
    captureException(new Error(`++ bot not found for fbId: ${recipientId}`))
  }
  return bot
}

module.exports = {
  getBotFromFbId,
}