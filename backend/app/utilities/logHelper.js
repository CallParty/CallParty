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
  const sendSlackNotifications = process.env.SLACK_SEND_NOTIFICATIONS === 'true'
  return slack.send({
    text: message,
    channel: channel,
    username: 'Bot',
    link_names: sendSlackNotifications,
  })
}

async function captureException(e, params) {
  // log error to slack
  try {
    await logMessage(`++ error: ${String(e.stack)}`, '#_error')
    if (params) {
      await logMessage(`++ with error params: ${params}`, '#_error')
    }
  } catch (e) {
    // regardless if slack logging succeeded, continue
  }
  // if sentry configured, log error with sentry
  if (process.env.SENTRY_BACKEND_DSN) {
    params = params || {}
    Raven.captureException(e, params)
  }
}

// this wrapper lets express routes with async code capture exceptions
// see: https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
function asyncWrap(fn) {
  return (req, res, next) => {
        const routePromise = fn(req, res, next)
        if (routePromise.catch) {
            routePromise.catch(err => next(err))
        }
    }
}


module.exports = {
  logMessage,
  captureException,
  asyncWrap,
}
