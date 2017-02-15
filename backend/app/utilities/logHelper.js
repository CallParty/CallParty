var Slack = require('node-slack')

// initialize slack
var slack = new Slack(process.env.SLACK_HOOK_URL)


function logMessage (message, channel, noSuffix) {
  console.log(message)
  if (!process.env.SLACK_HOOK_URL) {
    return
  }
  if (!channel) {
    channel = '#_log'
  }
  if (!noSuffix & process.env.SLACK_CHANNEL_SUFFIX) {
    channel = channel + process.env.SLACK_CHANNEL_SUFFIX
  }
  slack.send({
    text: message,
    channel: channel,
    username: 'Bot'
  })
}

module.exports = {
  logMessage
}
