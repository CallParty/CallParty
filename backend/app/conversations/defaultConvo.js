const { botReply } = require('../utilities/botkit')

function defaultConvo(user, message) {
  botReply(user, `Oh gosh I didn't understand that. If you have a question, comment, or suggestion, a real person will respond here shortly. ` +
    `You can also email us at hi@callparty.org `)
}

module.exports = {
  defaultConvo,
}