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
    username: 'Bot',
    link_names: true,
  })
}

function captureException(e, params) {
  // log error to slack
  logMessage(`++ error: ${e.stack}`, '#_error').then(() => {
    if (params) {
      return logMessage(`++ with error params: ${params}`)
    }
    else {
      return Promise.resolve()
    }
  }).then(() => {
    // finally log error with sentry
    if (process.env.SENTRY_BACKEND_DSN) {
      params = params || {}
      Raven.captureException(e, params)
    }
  })
}

module.exports = {
  logMessage,
  captureException,
}
