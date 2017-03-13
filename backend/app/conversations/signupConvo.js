require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const rp = require('request-promise-any')
const mongoose = require('mongoose')
const geocoding = require('../utilities/geocoding')
const botReply = require('../utilities/botkit').botReply
const { User } = require('../models')
const { setUserCallback } = require('../methods/userMethods')

mongoose.Promise = Promise


function startSignupConversation(fbId) {

  const facebookGraphRequestOptions = {
    uri: `https://graph.facebook.com/${fbId}`,
    qs: { access_token: process.env.FACEBOOK_PAGE_TOKEN },
    json: true
  }

  return rp(facebookGraphRequestOptions)
    .then(function(fbUserData) {
      return User.findOneAndUpdate(
        { fbId: fbId },
        { firstName: fbUserData.first_name, lastName: fbUserData.last_name },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).exec()
    })
    .then(function(user) {
      return askForAddressConvo(user)
    })
    .catch(function(err) { throw new Error(err) })
}


function askForAddressConvo(user) {
  const organization = 'CallParty' // this should be looked up from the db eventually
  return botReply(user,
    `Hi there! Nice to meet you. ` +
    `I'm a bot made by the people at ${organization} to send you important issues to call Congress about, ` +
    `because taking civic action is way more effective in large groups. ` +
    `You can unsubscribe any time by just saying ‘Stop’ or ‘Unsubscribe’.`
  ).then(function() {
    return botReply(user,
      `First thing, what's the address of your voting registration? ` +
      `I need this to identify who your reps are, but won't be holding onto it.`
    )
  }).then(() => setUserCallback(user, '/signup/handleAddressResponse'))
}

function handleAddressResponseConvo(user, message) {
  return geocoding.getStateAndCongressionalDistrictFromAddress(message.text)
    .then(function(geocodingResult) {
      if (!geocodingResult) {
        throw new Error('++ failed to find district from address: ' + message.text)
      }
      return Promise.all([geocodingResult, botReply(user, `Great, thanks!`)])
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
      // log this exception somehow
      botReply(user,
        `Hm, something isn't right. Make sure to include your street address, city, state, and zip code like this: ` +
        `123 Party Street, Brooklyn, NY 11206`
      )
      return setUserCallback(user, '/signup/handleAddressResponse')
    })
}

function finishSignup1Convo(user) {
  return botReply(user,
    `Whenever there's an issue that needs action, ` +
    `I'll send you information including contact info for your rep and how to talk to them. ` +
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
