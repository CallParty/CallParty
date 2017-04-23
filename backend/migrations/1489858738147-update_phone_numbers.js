const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { Reps } = require('../app/models')

dotenv.load()

mongoose.Promise = require('es6-promise')
mongoose.connect(process.env.MONGODB_URI)

/**
 * Make any changes you need to make to the database here
 */
export async function up () {
  const reps = await Reps.find({})
  for (let rep of reps) {
    const { phone, phoneNumbers } = await Reps.collection.findOne({ _id: rep._id }, { phone: 1, phoneNumbers: 1, _id: 0 })
    if (phoneNumbers) {
      continue
    }
    rep.phoneNumbers = [{ officeType: 'capitol', phoneNumber: phone }]
    await rep.save()
  }
  await Reps.collection.updateMany({}, { $unset: { phone: '' } })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
export async function down () {
  // Write migration here
  const reps = await Reps.find({})
  for (let rep of reps) {
    const phoneNumbers = rep.phoneNumbers
    Reps.collection.updateOne({ _id: rep._id }, { $unset: { phoneNumbers: '' }, $set: { phone: phoneNumbers.filter(({ officeType }) => officeType === 'capitol')[0].phoneNumber } })
  }
}
