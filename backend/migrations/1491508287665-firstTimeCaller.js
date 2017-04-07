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
  const users = await User.find({})
  for (let user of users) {
    const userConversationCount = await UserConversation.count({ user: user._id }).exec()
    const isFirstTimeCaller = userConversationCount < 1
    await logMessage(`++ ${user.firstName} ${user.lastName} has ${userConversationCount} conversations: ${isFirstTimeCaller}`)
    user.firstTimeCaller = isFirstTimeCaller
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
