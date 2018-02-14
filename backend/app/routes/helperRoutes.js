const { handleMessage, handleEcho } = require('../utilities/listener')
const { logMessage, captureException } = require('../utilities/logHelper')
const google = require('googleapis')
const path = require('path')
const fs = require('fs')
const dateTime = require('node-datetime')

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
        if (event.message.is_echo) {
          handleEcho(senderId, recipientId, event.message)
        } else {
          handleMessage(senderId, recipientId, event.message)
        }
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

  apiRouter.post('/upload_ssl_certs', async function (req, res) {
    logMessage('++ received request to /upload_ssl_certs')

    if (process.env.ENVIRONMENT !== 'PROD') {
      logMessage('++ environment is not PROD, will not attempt to upload SSL certificates to GCE load balancer')
      res.sendStatus(200)
      return
    }

    logMessage('++ uploading ssl certs to prod GCE load balancer')
    const key = require(path.resolve(path.join(__dirname, '..', '..', 'devops', 'secret_files', 'gce_credentials.json')))
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/compute'],
      null
    )
    jwtClient.authorize(function (err) {
      if (err) {
        throw err
      }

      const compute = google.compute({
        version: 'v1',
        auth: jwtClient
      })

      let certificate
      let privateKey
      try {
        certificate = fs.readFileSync('/etc/letsencrypt/live/admin.callparty.org/fullchain.pem', 'utf-8')
        privateKey = fs.readFileSync('/etc/letsencrypt/live/admin.callparty.org/privkey.pem', 'utf-8')
      } catch (e) {
        captureException(e)
        res.sendStatus(500)
        return
      }

      // upload new SSL cert
      var dt = dateTime.create()
      const dateStr = dt.format('Y-m-d') + '-' +(new Date().getTime())
      logMessage(`++ uploading new SSL certificate ${dateStr}`)
      compute.sslCertificates.insert({
        project: process.env.GCLOUD_PROJECT,
        resource: {
          name: `callparty-prod-certificate-${dateStr}`,
          certificate: certificate,
          privateKey: privateKey
        }
      }, function (err, result, response) {
        if (err) {
          captureException(err)
          res.sendStatus(500)
          return
        }

        // wait 5000, so that certificate can become ready
        setTimeout(function () {
          const sslCertificateUrl = response.body.targetLink
          compute.targetHttpsProxies.setSslCertificates({
            project: process.env.GCLOUD_PROJECT,
            targetHttpsProxy: 'callparty-prod-loadbalancer-target-proxy-2',
            resource: {
              sslCertificates: [sslCertificateUrl]
            }
          }, function (err) {
            if (err) {
              captureException(err)
              res.sendStatus(500)
              return
            }
            logMessage('++ successfully uploaded SSL certs to prod GCE load balancer')
            res.sendStatus(200)
          })
        }, 5000)
      })
    })
  })
}
