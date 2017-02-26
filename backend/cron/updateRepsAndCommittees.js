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

logMessage('++ updating representatives with latest data')
const repsPromise = downloadRepsYamlFile().then(loadRepsFromFile)

logMessage('++ updating committees with latest data')
const committeesPromise = Promise.all([downloadCommitteeYamlFile(), downloadCommitteeMembershipYamlFile()]).then(loadCommitteesFromFiles)

Promise.all([repsPromise, committeesPromise])
  .then(() => process.exit())
  .catch(() => process.exit(1))
