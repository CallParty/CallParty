var Slack = require('node-slack')
const Raven = require('raven')

// initialize slack
var slack = new Slack(process.env.SLACK_HOOK_URL)


function logMessage (message, channel, noSuffix) {
  console.log(message)
  if (!process.env.SLACK_HOOK_URL) {
    return Promise.resolve()
  }
  if (!channel) {
    channel = '#_log'
  }
  if (noSuffix !== true && process.env.SLACK_CHANNEL_SUFFIX) {
    channel = channel + process.env.SLACK_CHANNEL_SUFFIX
  }
  return slack.send({
    text: message,
    channel: channel,
    username: 'Bot'
  })
}

function captureException(e) {
  if (process.env.SENTRY_BACKEND_DSN) {
    Raven.captureException(e)
  }
  else {
    console.log(e)
  }
}

module.exports = {
  logMessage,
  captureException,
}
