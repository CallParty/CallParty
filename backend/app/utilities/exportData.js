require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const mongoose = require('mongoose')
const { logMessage } = require('../utilities/logHelper')
const { uploadFile, generateSignedUrlForFile } = require('./googleCloud')
const { sendEmail } = require('./emailHelper')
var jsonfile = require('jsonfile')
const fs = require('fs')
const { CampaignAction, User, UserAction, Reps, RepresentativeCommittee, RepresentativeSubcommittee } = require('../models')

mongoose.Promise = Promise


async function exportData(bot, email) {
  logMessage(`++ exporting data for ${bot}`)

  // create an object with the data we need
  const userActions = await UserAction.find({bot: bot})
  const users = await User.find({bot: bot, unsubscribed: false})
  const campaignActions = await CampaignAction.find({bot: bot})
  const representatives = await Reps.find({})
  const committees = await RepresentativeCommittee.find({})
  const subCommittees = await RepresentativeSubcommittee.find({})
  const output = {
    userActions: userActions,
    users: users,
    campaignActions: campaignActions,
    representatives: representatives,
    committees: committees,
    subCommittees: subCommittees
  }

  // upload the .json to google cloud
  const randomHash = Math.random(0, 1000000)
  var tempFile = `/tmp/export-${randomHash}.json`
  jsonfile.writeFileSync(tempFile, output)
  const destFileName = `exports/${randomHash}${bot}.json`
  await uploadFile(tempFile, destFileName)
  console.log('++ upload complete')
  const dataLink = await generateSignedUrlForFile(destFileName)
  console.log(`++ signed URL at ${dataLink}`)
  console.log('++ deleting temp file')
  fs.unlink(tempFile)

  // send an email with a link
  sendEmail('CallParty Export Complete', 'dataEmail.html', {dataLink: dataLink}, email)
}

module.exports = {
  exportData
}
