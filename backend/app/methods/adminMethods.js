const { AdminUser } = require('../models')
const { logMessage } = require('../utilities/logHelper')

exports.newAdmin = async function(req, res) {

  // only callparty user can create admin
  const bot = req.adminUser.bot
  if (['callparty', 'callingteststaging'].indexOf(bot) < 0) {
    throw new Error('++ only callparty users can create admin')
  }

  // parse data
  const data = req.body
  await logMessage(`++ @here creating new admin: ${JSON.stringify(data)}`)

  // check if admin with this username or bot already exists
  const alreadyUsername = await AdminUser.findOne({ username: data.username })
  if (alreadyUsername) {
    throw new Error(`++ cannot create two adminUser with username ${data.username}`)
  }
  const alreadyBot = await AdminUser.findOne({ bot: data.bot })
  if (alreadyBot) {
    throw new Error(`++ cannot create two adminUser with bot ${data.bot}`)
  }

  // create admin
  const admin = new AdminUser({
    username: data.username,
    password: data.password,
    bot: data.bot,
  })
  await admin.save()
  await logMessage(`++ successfully created admin: ${JSON.stringify(data)}`)

  // return response
  res.json(admin)

}

exports.getCurrentAdmin = async function(req, res) {
  res.json({
    username: req.adminUser.username,
    bot: req.adminUser.bot,
  })
}
