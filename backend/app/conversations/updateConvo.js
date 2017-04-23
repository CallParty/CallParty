const { setUserCallback } = require('../methods/userMethods')
const botReply = require('../utilities/botkit').botReply


async function startUpdateConversation(user, userConversation, campaignUpdate) {
  await setUserCallback(user, '/default')
  return botReply(user, campaignUpdate.message)
}

module.exports = {
  startUpdateConversation: startUpdateConversation
}
