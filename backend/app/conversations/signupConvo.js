require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const rp = require('request-promise-any')
const mongoose = require('mongoose')
const geocoding = require('../utilities/geocoding')
const botReply = require('../utilities/botReply').botReply
const { User } = require('../models')
const { setUserCallback } = require('../methods/userMethods')
const { logMessage } = require('../utilities/logHelper')
const { getBotFromFbId } = require('../utilities/multiTenant')
const { botVars } = require('./botVars')

mongoose.Promise = Promise


function startSignupConversation(senderId, recipientId) {

  // figure out which bot the user sent a message to, based on the recipientId
  const bot = getBotFromFbId(recipientId)
  const fbToken = bot.fbToken

  const facebookGraphRequestOptions = {
    uri: `https://graph.facebook.com/${senderId}`,
    qs: { access_token: fbToken },
    json: true
  }

  return rp(facebookGraphRequestOptions)
    .then(function(fbUserData) {
      return User.findOneAndUpdate(
        { fbId: senderId },
        { firstName: fbUserData.first_name, lastName: fbUserData.last_name, bot: bot },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).exec()
    })
    .then(function(user) {
      return askForAddressConvo(user)
    })
    .catch(function(err) { throw new Error(err) })
}


async function askForAddressConvo(user) {
  const organization = botVars.orgName[user.botType]
  return botReply(user,
    `Hi there! Nice to meet you. ` +
    `I'm a bot made by the people at ${organization} to let you know when to call Congress about important issues, ` +
    `because civic action is way more effective in large groups. ` +
    `You can stop our messages any time by just saying ‘Stop’ or ‘Unsubscribe’.`
  ).then(function() {
    return botReply(user,
      `First, what's your full address? ` +
      `I need this to know who your reps are, and I won’t hold onto it after that.`
    )
  }).then(() => setUserCallback(user, '/signup/handleAddressResponse'))
}

function handleAddressResponseConvo(user, message) {
  return geocoding.getStateAndCongressionalDistrictFromAddress(message.text)
    .then(function(geocodingResult) {
      if (!geocodingResult) {
        throw new Error('++ failed to find district from address: ' + message.text)
      }
      else {
        const botReplyPromise = botReply(user, {
          attachment: {
            type: 'image',
            payload: {
              url: 'https://storage.googleapis.com/callparty/tada.gif'
            }
          }
        }).then(() => {
          return botReply(user, 'Great, thanks!')
        })
        return Promise.all([geocodingResult, botReplyPromise])
      }
    })
    .then(function([geocodingResult]) {
      user.state = geocodingResult.state
      user.districtNumber = geocodingResult.congressional_district.district_number
      user.district = `${geocodingResult.state}-${geocodingResult.congressional_district.district_number}`
      user.active = true
      return user.save()
    })
    .then(function(user) {
      finishSignup1Convo(user)
    })
    .catch(function() {
      // log exception
      logMessage(`++ failed to geocode address for user ${user.firstName} ${user.lastName} with string: ${message.text}`, '#_error')
      // then respond to user
      botReply(user,
        `Hm, something isn't right. Make sure to include your street address, city, state, and zip code like this: ` +
        `123 Party Street, Brooklyn, NY 11206`
      )
      return setUserCallback(user, '/signup/handleAddressResponse')
    })
}

function finishSignup1Convo(user) {
  return botReply(user,
    `Whenever there's an issue that needs action I'll send you information, ` +
    `including contact info for your rep and how to talk to them. ` +
    `I'll also send updates and outcomes on the issues. Have a nice day, and talk soon!`
  )

  .then(() => setUserCallback(user, null))
}

module.exports = {
  startSignupConversation,
  askForAddressConvo,
  handleAddressResponseConvo,
  finishSignup1Convo,
}
