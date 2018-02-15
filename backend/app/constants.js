const path = require('path')

const GCLOUD_KEY_PATH = path.resolve(path.join(__dirname, '..', 'devops', 'secret_files', 'gce_credentials.json'))
const GCLOUD_BUCKET_NAME = 'callparty'


module.exports = {
  GCLOUD_KEY_PATH,
  GCLOUD_BUCKET_NAME
}