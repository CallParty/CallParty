const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { Campaign, CampaignAction } = require('../app/models')
const logMessage = require('../app/utilities/logHelper').logMessage



mongoose.Promise = require('es6-promise')
mongoose.connect(process.env.MONGODB_URI)

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  // Write migration here
  await logMessage('++ running migration')
  let bot = process.env.DEFAULT_BOT
  await logMessage(`++ setting bot to ${bot} for all Campaigns`)
  const campaigns = await Campaign.find({})
  for (let campaign of campaigns) {
    console.log('++ saving campaign')
    campaign.bot = bot
    await campaign.save()
  }
  await logMessage(`++ setting bot to ${bot} for all CampaignAction`)
  const actions = await CampaignAction.find({})
  for (let action of actions) {
    console.log('++ saving action')
    action.bot = bot
    await action.save()
  }
  await logMessage('++ completed migration')
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
}
