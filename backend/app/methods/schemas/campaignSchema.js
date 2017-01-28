const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campaignActionsSchema = new Schema({
  title: String,
  message: String,
  cta: String,
  active: Boolean,
  type: String,
})

campaignActionsSchema.methods.getUsers = function () {
  return this.model('UserAction').find({ _campaignAction: this._id }).exec()
    .then(userActions => {
      const userIds = userActions.map(userAction => userAction._id)

      return this.model('User').find({
        _id: { $in: userIds }
      }).exec()
    })
}

const campaignSchema = new Schema({
  title: String,
  description: String,
  active: Boolean,
  link: String,
  campaignActions: [campaignActionsSchema]
})

module.exports = mongoose.model('Campaign', campaignSchema)
