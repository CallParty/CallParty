const auth = require('basic-auth')
const jwt = require('jsonwebtoken')

const { AdminUser } = require('../models')

async function handleAuthTokenRequest(req, res) {
  const user = auth(req)

  if (!user || !user.name || !user.pass) {
    return res.sendStatus(401)
  }

  const adminUser = await AdminUser.findOne({ username: user.name }).exec()
  if (!adminUser) {
    return res.sendStatus(401)
  }

  const isPasswordMatch = await adminUser.comparePassword(user.pass)
  if (!isPasswordMatch) {
    return res.sendStatus(401)
  }

  const token = jwt.sign({ adminUserId: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' })
  res.json({ token: token })
}

async function adminUserMiddleware(req, res, next) {
  if (req.user && req.user.adminUserId) {
    req.adminUser = await AdminUser.findById(req.user.adminUserId).exec()
  }
  next()
}

module.exports = {
  handleAuthTokenRequest,
  adminUserMiddleware
}
