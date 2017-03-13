const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { User } = require('../app/models')

dotenv.load()

mongoose.Promise = require('es6-promise')
mongoose.connect(process.env.MONGODB_URI)

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  await User.collection.updateMany({}, { $rename: { congressionalDistrict: 'districtNumber' } })
  const users = await User.find({})
  for (let user of users) {
    user.district = `${user.state}-${user.districtNumber}`
    await user.save()
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  await User.collection.updateMany({}, { $unset: { district: '' }, $rename: { districtNumber: 'congressionalDistrict' } })
}
