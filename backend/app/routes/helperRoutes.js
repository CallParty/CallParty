const { handleMessage } = require('../utilities/listener')
const { logMessage } = require('../utilities/logHelper')

module.exports = function (apiRouter) {
  // public pages=============================================
  // root
  apiRouter.get('/home', function (req, res) {
    res.send('hello')
  })

  apiRouter.get('/test', function (req, res) {
    res.json({ message: 'hello' })
  })

  apiRouter.get('/webhook', function (req, res) {
    // This enables subscription to the webhooks
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
      res.send(req.query['hub.challenge'])
    }
    else {
      res.send('Incorrect verify token')
    }
  })

  apiRouter.post('/webhook', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let senderId = event.sender.id
      let recipientId = event.recipient.id
      if (event.message) {
        handleMessage(senderId, recipientId, event.message)
      }
      else if (event.postback) {
        const message = {
          text: event.postback.payload,
          postback: event.postback,
        }
        handleMessage(senderId, recipientId, message)
      }
    }
    res.sendStatus(200)
  })

  apiRouter.get('/error', function () {
    throw new Error('Testing error handling')
  })

  apiRouter.get('/slack', function (req, res) {
    logMessage('++ slack test')
    res.send('slack test')
  })

}
