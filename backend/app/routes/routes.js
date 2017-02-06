var facebook_handler = require('../botkit_controller/botkitSetup').handler

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
    facebook_handler(req.body)
    res.send('ok')
  })

}
