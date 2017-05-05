const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10

const adminUserSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  bot: { type: String, required: true }
})

adminUserSchema.pre('save', function hashPassword(next) {
  const user = this

  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err)
      }

      user.password = hash
      next()
    })
  })
})

adminUserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
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
