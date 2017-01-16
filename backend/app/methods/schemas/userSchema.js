var mongoose = require('mongoose')
var moment = require('moment')
var Schema = mongoose.Schema

var userSchema = new Schema({
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
  active: { type: Boolean, default: true },
  subscribed: { type: Boolean, default: true },
  firstCTA: { type: Boolean, default: false }
})

var User = mongoose.model('User', userSchema)
module.exports = User

//---Dummy User:
//userid: "0000001",fb_id: "0000001",state: "FL",congressional_district: "0000001",create_date: "0000001",first_name: "Human",last_name: "Name",userActions: [{userActionRef: "0000001",userActionStatus: "0000001",}],active: true,subscribed: true,firstCTA: true
