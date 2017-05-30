const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10

const adminUserSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  bot: { type: String, ref: 'Bot', required: true },
})

adminUserSchema.methods.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

adminUserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  // if password hasn't been set yet, then it's open login
  if (!this.password) {
    return true
  }
  // otherwise actually compare password
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) {
        return reject(err)
      }
      resolve(isMatch)
    })
  })
}

module.exports = mongoose.model('AdminUser', adminUserSchema)
