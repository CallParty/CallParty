const { logMessage } = require('../utilities/logHelper')

exports.updatePassword = async function(req, res) {
  // only callparty user can create admin
  const adminUser = req.adminUser
  // update password
  const data = req.body
  await logMessage(`++ updating password for admin: ${req.user.bot}`)
  const hash = await adminUser.hashPassword(data.password)
  adminUser.password = hash
  await adminUser.save()

  // return response
  res.json({ message: 'success' })
}

exports.getCurrentAdmin = async function(req, res) {
  if (!req.adminUser) {
    res.sendStatus(401)
    return
  }

  res.json({
    username: req.adminUser.username,
    bot: req.adminUser.bot,
    isDebugAdmin: req.adminUser.isDebugAdmin
  })
}
