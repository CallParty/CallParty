const { AdminUser } = require('../models')
const { logMessage } = require('../utilities/logHelper')

exports.newAdmin = async function(req, res) {

  // parse data
  const data = req.body
  await logMessage(`++ @here creating new admin: ${JSON.stringify(data)}`)

  // check if admin with this username or bot already exists
  const alreadyUsername = await AdminUser.findOne({ username: data.username })
  // if (alreadyUsername) {
  //   throw new Error(`++ cannot create two adminUser with username ${data.username}`)
  // }
  const alreadyBot = await AdminUser.findOne({ bot: data.bot })
  // if (alreadyBot) {
  //   throw new Error(`++ cannot create two adminUser with bot ${data.bot}`)
  // }

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
  const bot = req.user.bot
  const currentAdmin = await AdminUser.findOne({bot: bot})
  res.json({
    username: currentAdmin.username,
    bot: currentAdmin.bot,
  })
}