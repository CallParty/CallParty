const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const moment = require('moment')
const Schema = mongoose.Schema

const userSchema = new Schema({
  userId: String,
  fbId: String,
  state: String,
  congressionalDistrict: Number,
  createdAt: { type: Date, default: () => moment.utc().toDate() },
  firstName: String,
  lastName: String,
  fbData: {
    unknown: String
  },
  userActions: [{
    userActionRef: String,
    userActionStatus: String
  }],
  active: { type: Boolean, default: false },
  unsubscribed: { type: Boolean, default: false },
  firstCTA: { type: Boolean, default: false }
})

userSchema.plugin(findOrCreate)

module.exports = mongoose.model('User', userSchema)

//---Dummy User:
//userid: "0000001",fb_id: "0000001",state: "FL",congressional_district: "0000001",create_date: "0000001",first_name: "Human",last_name: "Name",userActions: [{userActionRef: "0000001",userActionStatus: "0000001",}],active: true,subscribed: true,firstCTA: true
