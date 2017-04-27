const secrets = require('../../devops/secret_files/secret.json')
const { captureException } = require('./logHelper')

function getBotFromFbId(recipientId) {
  /* returns the string name of the facebook page, which is associated with the given fbId */
  const idToBot = {
    2060548600838593: 'callparty5',
    392499054435475: 'callingteststaging',
    243195752776526: 'callparty', // TODO: make this correct
  }
  const bot = idToBot[recipientId]
  if (!bot) {
    captureException(new Error(`++ bot not found for fbId: ${recipientId}`))
  }
  return bot
}

function getTokenFromBot(bot) {
  /* takes in a string as returned from getBotFromId, and returns the fbToken for sending messages with that bot */
  const fbTokensDict = secrets['FB_TOKENS']
  const fbToken = fbTokensDict[bot]
  if (!fbToken) {
    captureException(new Error(`++ fbToken not found for bot: ${bot}`))
  }
  return fbToken
}


module.exports = {
  getBotFromFbId,
  getTokenFromBot,
}