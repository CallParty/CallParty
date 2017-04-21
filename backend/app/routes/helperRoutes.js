const google = require('googleapis')
const path = require('path')
const fs = require('fs')

const facebook_handler = require('../botkit_controller/botkitSetup').handler
const { logMessage, captureException } = require('../utilities/logHelper')

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

  apiRouter.get('/error', function () {
    throw new Error('Testing error handling')
  })

  apiRouter.get('/slack', function (req, res) {
    logMessage('++ slack test')
    res.send('slack test')
  })

  apiRouter.post('/upload_ssl_certs', function (req, res) {
    logMessage('++ receved request to /upload_ssl_certs')

    if (process.env.ENVIRONMENT !== 'PROD') {
      logMessage('++ environment is not PROD, will not attempt to upload SSL certificates to GCE load balancer')
      res.sendStatus(200)
      return
    }

    logMessage('++ uploading ssl certs to GCE load balancer')
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

      compute.sslCertificates.insert({
        project: process.env.GCLOUD_PROJECT,
        resource: {
          name: 'callparty-prod-certificate',
          certificate: certificate,
          privateKey: privateKey
        }
      }, function (err, result, response) {
        if (err) {
          captureException(err)
          res.sendStatus(500)
          return
        }

        const sslCertificateUrl = response.body.targetLink
        compute.setSslCertificates({
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
          res.sendStatus(200)
        })
      })
    })
  })
}
