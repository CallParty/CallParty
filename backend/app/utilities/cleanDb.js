require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const mongoose = require('mongoose')
const moment = require('moment')
const { UserConversation } = require('../models')

mongoose.Promise = Promise


async function cleanDb() {
  // clear all conversations older than 60 days
  var ucCount = await UserConversation.count({}).exec()
  console.log(`++ found ${ucCount} total user conversations`)
  var today = moment().startOf('day')
  var dateWindow = moment(today).subtract(30, 'days').toDate()

  var ucCond = {
    $or: [
      {datePrompted: {
        $lte: dateWindow
      }},
      {datePrompted: {
        $eq: null
      }}
    ]
  }
  ucCount = await UserConversation.count(ucCond).exec()
  console.log(`++ found ${ucCount} total user conversations before ${dateWindow}`)

  console.log(`++ removing convo data`)
  var uc = await UserConversation.find(ucCond).exec()
  for (let convo of uc) {
    convo.convoData = null
    await convo.save()
  }
  console.log(`++ convo data removed`)

  // or if we need to delete it
  // console.log(`++ deleting user conversations`)
  // await UserConversation.remove(ucCond)
  // console.log(`++ deleted user conversations`)

}

module.exports = {
  cleanDb
}

if (require.main === module) {
  const dotenv = require('dotenv')
  dotenv.load()
  const dbUri = process.env.MONGODB_URI || ''
  mongoose.Promise = require('es6-promise')
  mongoose.connect(dbUri)
  cleanDb(process.env.DEFAULT_BOT).catch(function(err) {
    console.log(err)
  })
}
