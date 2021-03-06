const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.load()

const { Bot, Campaign, AdminUser, User, CampaignAction } = require('../app/models')
const { logMessage, captureException } = require('../app/utilities/logHelper')
const secrets = require('../devops/secret_files/secret.json')



mongoose.Promise = require('es6-promise')
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
}


function getTokenFromBotId(botId) {
  /* takes in a string botId and returns the fbToken for sending messages with that bot */
  const fbTokensDict = secrets['FB_TOKENS']
  const fbToken = fbTokensDict[botId]
  if (!fbToken) {
    captureException(new Error(`++ fbToken not found for bot: ${botId}`))
  }
  return fbToken
}


/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  // Write migration here
  let defaultBot = process.env.DEFAULT_BOT
  await logMessage('++ running migration')
  let bots = [
    {
      _id: 'callparty5',
      fbId: '2060548600838593',
      botType: 'callparty'
    },
    {
      _id: 'callingteststaging',
      fbId: '392499054435475',
      botType: 'callparty'
    },
    {
      _id: 'gtrackstaging',
      fbId: '427053054354007',
      botType: 'govtrack'
    }
  ]
  if (process.env.ENVIRONMENT === 'PROD') {
    bots.push(
      {
        _id: 'callparty',
        fbId: '243195752776526',
        botType: 'callparty'
      })
  }
  for (let botData of bots) {
    const fbToken = getTokenFromBotId(botData._id)
    botData.fbToken = fbToken
    await logMessage(`++ creating bot ${JSON.stringify(botData)}`)
    const bot = new Bot(botData)
    await bot.save()
  }

  const dBot = await Bot.findById(defaultBot)

  // update refs, such that they point to the bots
  await logMessage(`++ setting bot for all Campaigns`)
  const campaigns = await Campaign.find({})
  for (let campaign of campaigns) {
    console.log(`++ saving campaign from ${campaign.bot} to ${dBot._id}`)
    campaign.bot = dBot._id
    await campaign.save()
  }
  await logMessage(`++ setting bot for all CampaignAction`)
  const actions = await CampaignAction.find({})
  for (let action of actions) {
    console.log(`++ saving action from ${action.bot} to ${dBot._id}`)
    action.bot = dBot._id
    await action.save()
  }
  await logMessage(`++ setting bot for all User`)
  const users = await User.find({})
  for (let user of users) {
    user.bot = dBot._id
    await user.save()
  }
  await logMessage(`++ setting bot for all AdminUser`)
  const admins = await AdminUser.find({})
  for (let admin of admins) {
    admin.bot = dBot._id
    await admin.save()
  }

  await logMessage('++ completed migration')
}
/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
  const bots = Bot.find({})
  for (let bot of bots) {
    await bot.remove()
  }
}
