const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { User } = require('../app/models')
const { logMessage } = require('../app/utilities/logHelper')

mongoose.Promise = require('es6-promise')
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
}

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  await logMessage('++ running migration')

  const users = await User.find({}).populate('currentConvo')
  for (let user of users) {
    if (!user.currentConvo) {
      continue
    }

    user.currentConvo.convoData = user.convoData
    await user.currentConvo.save()

    user.convoData = null
    await user.save()
  }

  await logMessage('++ completed migration')
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  await logMessage('++ reverting migration')

  const users = await User.find({})
  for (let user of users) {
    if (!user.currentConvo) {
      continue
    }

    user.convoData = user.currentConvo.convoData
    await user.save()
  }

  await logMessage('++ finished reverting migration')
}
