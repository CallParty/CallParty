const dotenv = require('dotenv')
dotenv.load()

const mongoose = require('mongoose')
const Promise = require('es6-promise')
mongoose.Promise = Promise

const { logMessage } = require('../app/utilities/logHelper')
const { downloadRepsYamlFile, loadRepsFromFile } = require('../app/utilities/representatives')
const {
  downloadCommitteeYamlFile,
  downloadCommitteeMembershipYamlFile,
  loadCommitteesFromFiles
} = require('../app/utilities/committees')

mongoose.connect(process.env.MONGODB_URI)

logMessage('++ updating representatives with latest data', '#_cron')
downloadRepsYamlFile()
  .then(loadRepsFromFile)
  .then(() => logMessage('++ updating representatives with latest data', '#_cron'))
  .then(() => Promise.all([downloadCommitteeYamlFile(), downloadCommitteeMembershipYamlFile()]))
  .then(loadCommitteesFromFiles)
  .then(() => process.exit())
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
