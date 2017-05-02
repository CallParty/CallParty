const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { CampaignCall, CampaignUpdate } = require('../app/models')
const logMessage = require('../app/utilities/logHelper').logMessage



mongoose.Promise = require('es6-promise')
console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  // Write migration here
  await logMessage('++ running migration')

  await logMessage(`++ setting label to title for all campaign calls`)
  const actions = await this('CampaignCall').find()
  // const actions = await CampaignCall.find({})
  for (let action of actions) {
    await logMessage(`++ renaming to ${action.title}`)
    action.label = action.title
    await action.save()
  }

  // await logMessage(`++ setting label to 'Update: action.title' for all campaign updates`)
  // const updates = await CampaignUpdate.find({}).populate('targetAction')
  // for (let update of updates) {
  //   let label = 'Update'
  //   if (update.targetAction) {
  //     label = `Update: ${update.targetAction.label}`
  //   }
  //   update.label = label
  //   await update.save()
  // }

  await logMessage('++ completed migration')
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
}
