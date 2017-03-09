var Request = require('request')

module.exports = function (controller) {
  // subscribe to page events
  Request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + process.env.FACEBOOK_PAGE_TOKEN,
    function (err, res, body) {
      if (err) {
        controller.log('Could not subscribe to page messages')
      }
      else {
        controller.log('Successfully subscribed to Facebook events:', body)
        console.log('Botkit can now receive messages')

        // start ticking to send conversation messages
        controller.startTicking()
      }
    })

  var url = 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + process.env.FACEBOOK_PAGE_TOKEN

  // set up CTA for FB page
  var form1 = {
    'setting_type': 'call_to_actions',
    'thread_state': 'new_thread',
    'call_to_actions': [
      {
        'payload': 'optin'
      }
    ]
  }

  Request.post(url, {form: form1}, function (err, response, body) {
    if (err) {
      console.log(err)
    }
    else {
      console.log('CTA added', body)
    }
  })
}
