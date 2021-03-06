const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

const userSchema = new Schema({
  bot: { type: String, ref: 'Bot' },
  userId: String,
  fbId: String,
  state: String,
  districtNumber: String,
  district: String,
  createdAt: { type: Date, default: function() { moment.utc().toDate() }},
  firstName: String,
  lastName: String,
  fbData: {
    unknown: String
  },
  firstTimeCaller: { type: Boolean, default: true },
  active: { type: Boolean, default: false }, // set to true after the user provides their address
  unsubscribed: { type: Boolean, default: false }, // set to true when the user account is archived/deleted
  firstCTA: { type: Boolean, default: false },
  callbackPath: String, // controls which convoFunction will be called in response to next message
  convoData: Schema.Types.Mixed,  // the data which the next convoFunction will have access to
  currentConvo: { type: Schema.Types.ObjectId, ref: 'UserConversation' },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

userSchema.virtual('userConversations', {
  ref: 'UserConversation',
  localField: '_id',
  foreignField: 'user'
})

userSchema.virtual('botId').get(function() {
  // TODO: figure out why for some users bot is null
  if (this.bot) {
    return this.bot._id
  }
  else {
    return null
  }
})

userSchema.virtual('override').get(function() {
  if (this.callbackPath === '/override') {
    return 1
  }
  else {
    return 0
  }
})

module.exports = mongoose.model('User', userSchema)

//---Dummy User:
//userid: "0000001",fb_id: "0000001",state: "FL",congressional_district: "0000001",create_date: "0000001",first_name: "Human",last_name: "Name",userActions: [{userActionRef: "0000001",userActionStatus: "0000001",}],active: true,subscribed: true,firstCTA: true
