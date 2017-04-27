const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { User } = require('../app/models')
const logMessage = require('../app/utilities/logHelper').logMessage



mongoose.Promise = require('es6-promise')
mongoose.connect(process.env.MONGODB_URI)

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  // Write migration here
  await logMessage('++ running migration')
  let bot = null
  if (process.env.ENVIRONMENT === 'STAGING') {
    bot = 'callingteststaging'
  }
  else if (process.env.ENVIRONMENT === 'PROD') {
    bot = 'callparty'
  }
  await logMessage(`++ setting bot to ${bot} for all users`)
  const users = await User.find({})
  for (let user of users) {
    user.bot= bot
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
