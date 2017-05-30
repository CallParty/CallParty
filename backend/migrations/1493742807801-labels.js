const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { CampaignCall, CampaignUpdate } = require('../app/models')
const { logMessage, captureException } = require('../app/utilities/logHelper')



mongoose.Promise = require('es6-promise')
console.log(process.env.MONGODB_URI)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
}

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  // Write migration here
  await logMessage('++ running migration')

  await logMessage(`++ setting label to title for all campaign calls`)
  const actions = await CampaignCall.find({})
  // const actions = await CampaignCall.find({})
  for (let action of actions) {
    try {
      let label = action._doc.title
      await logMessage(`++ renaming call to ${label}`)
      action.label = label
      if (!action.targetingType) {
        action.targetingType = 'borrowed'
      }
      await action.save()
    } catch (err) {
      await logMessage(`error: ${err.message}`)
      captureException(err)
    }
  }

  await logMessage(`++ setting label to 'Update: action.title' for all campaign updates`)
  const updates = await CampaignUpdate.find({}).populate('targetAction')
  for (let update of updates) {
    try {
      let label = 'Update'
      if (update.targetAction) {
        label = `Update: ${update.targetAction.label}`
      }
      await logMessage(`++ renaming update to ${label}`)
      update.label = label
      await update.save()
    }
    catch (err) {
      await logMessage('error')
    }
  }

  await logMessage('++ completed migration')
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
}
