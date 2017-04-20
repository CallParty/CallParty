const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { User, UserConversation } = require('../app/models')
const logMessage = require('../app/utilities/logHelper').logMessage



mongoose.Promise = require('es6-promise')
mongoose.connect(process.env.MONGODB_URI)

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  // Write migration here
  await logMessage('++ running migration')
  let fbPage = null
  if (process.env.ENVIRONMENT === 'STAGING') {
    fbPage = 'callingteststaging'
  }
  else if (process.env.ENVIRONMENT === 'PROD') {
    fbPage = 'callparty'
  }
  await logMessage(`++ setting fbPage to ${fbPage} for all users`)
  const users = await User.find({})
  for (let user of users) {
    user.fbPage = fbPage
    await user.save()
  }
  await logMessage('++ completed migration')
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
}
