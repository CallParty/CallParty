var storage = require('@google-cloud/storage')
const { logMessage } = require('../utilities/logHelper')
const moment = require('moment')

const { GCLOUD_KEY_PATH, GCLOUD_BUCKET_NAME } = require('../constants')


function uploadFile(srcFileName, destFileName) {
  let gcs = storage({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: GCLOUD_KEY_PATH
  })

  var bucket = gcs.bucket(GCLOUD_BUCKET_NAME)

  // return promise for file upload
  return new Promise(function(resolve, reject) {
    logMessage(`++ uploading ${srcFileName} to gcs://${GCLOUD_BUCKET_NAME}/${destFileName}`)
    bucket.upload(srcFileName, {destination: destFileName}, function (err) {
      if (!err) {
        logMessage(`++ successfully uploaded ${srcFileName} to gcs://${GCLOUD_BUCKET_NAME}/${destFileName}`)
        return resolve()
      } else {
        return reject('++ failed to upload to google cloud')
      }
    })
  })
}

function makeFilePublic(filePath) {
  let gcs = storage({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: GCLOUD_KEY_PATH
  })

  var bucket = gcs.bucket(GCLOUD_BUCKET_NAME)

  return bucket.file(filePath)
    .makePublic()
    .then(() => {
      logMessage(`gs://${GCLOUD_BUCKET_NAME}/${filePath} is now public.`)
    })
    .catch(err => {
      throw err
    })
}

function generateSignedUrlForFile(filePath) {
  let gcs = storage({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: GCLOUD_KEY_PATH
  })

  var bucket = gcs.bucket(GCLOUD_BUCKET_NAME)
  var now = moment()
  const expirationDate = now.add(2, 'days')
  const stringifiedExpirationDate = expirationDate.format('MM-DD-YYYY')
  logMessage(stringifiedExpirationDate)
  const signedUrlptions = {
    action: 'read',
    expires: stringifiedExpirationDate,
  }

  // return promise for file upload
  logMessage(`++ making signedUrl for ${filePath}`)
  return bucket.file(filePath)
    .getSignedUrl(signedUrlptions)
    .then(results => {
      const url = results[0]
      return url
    })
    .catch(err => {
      throw err
    })
}

module.exports = {
  uploadFile,
  makeFilePublic,
  generateSignedUrlForFile
}

if (require.main === module) {
  // uploadFile('/Users/maxfowler/Desktop/temp.txt', 'exports/temp.txt')
  // makeFilePublic('exports/temp.txt')
  const toReturn = generateSignedUrlForFile('exports/temp.txt')
  console.log(toReturn)
}