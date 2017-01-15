var mongoose = require('mongoose'),
  Schema = mongoose.Schema

var usersSchema = new Schema({
  _id: String,
  userid: String,
  fb_id: String,
  state: String,
  congressional_district: Number,
  create_date: String,
  first_name: String,
  last_name: String,
  fb_data: {
    unknown: String
  },
  userActions: [{
    userActionRef: String,
    userActionStatus: String
  }],
  active: Boolean,
  subscribed: Boolean,
  firstCTA: Boolean
})

var Users = mongoose.model('Users', usersSchema)
module.exports = Users

//---Dummy User:
//userid: "0000001",fb_id: "0000001",state: "FL",congressional_district: "0000001",create_date: "0000001",first_name: "Human",last_name: "Name",userActions: [{userActionRef: "0000001",userActionStatus: "0000001",}],active: true,subscribed: true,firstCTA: true