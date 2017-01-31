require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const rp = require('request-promise-any')
const mongoose = require('mongoose')
const geocoding = require('../utilities/geocoding')
const syncBotReply = require('../utilities/botkit').syncBotReply
const { User } = require('../models')
const setUserCallback = require('../methods/userMethods').setUserCallback

mongoose.Promise = Promise


function startSignupConversation(bot, fbId) {

  const facebookGraphRequestOptions = {
    uri: `https://graph.facebook.com/${fbId}`,
    qs: { access_token: process.env.FACEBOOK_PAGE_TOKEN },
    json: true
  }

  rp(facebookGraphRequestOptions)
    .then(function(fbUserData) {
      User.findOrCreate(
        { fbId: fbId },
        { firstName: fbUserData.first_name, lastName: fbUserData.last_name },
        function (err, user) {
          // use a fakeMessage to initiate the conversation with the correct user
          const fakeMessage = {
            channel: fbId,
            user: fbId
          }
          askForAddressConvo(bot, user, fakeMessage)
        })
    })
    .catch(function(err) { throw new Error(err) })
}


function askForAddressConvo(bot, user, message) {
  const organization = 'CallParty' // this should be looked up from the db eventually
  syncBotReply(bot, message,
    `Hi there! Nice to meet you. ` +
    `I’m a bot made to send you calls to action from the people at ${organization}, ` +
    `because taking civic action is way more effective in large groups. ` +
    `You can unsubscribe any time by just saying ‘stop’ or ‘unsubscribe’.`
  ).then(
    syncBotReply(bot, message,
      'First thing’s first: What’s the address of your voting registration?' +
      'I’ll use this to identify who your reps are – don’t worry, I won’t be holding onto it.'
    )).then(
    setUserCallback(user, '/signup/handleAddressResponse')
  )
}

function handleAddressResponseConvo(bot, user, message) {
  geocoding.getStateAndCongressionalDistrictFromAddress(message.text)
    .then(function(geocodingResult) {
      if (!geocodingResult) {
        throw new Error('++ failed to find district from address: ' + message.text)
      }
      syncBotReply(bot, message, 'Great!').then(function() {
        user.state = geocodingResult.state
        user.congressionalDistrict = geocodingResult.congressional_district.district_number
        user.active = true
        user.save().then(function(user) {
          finishSignup1Convo(bot, user, message)
        })
      })
    })
    .catch(function(err) {
      // log this exception somehow
      bot.reply(message,
        'Hm, something isn’t right. Make sure to include your street address, city, state, and zip code like this: ' +
        '123 Party Street, Brooklyn, NY 11206'
      )
      setUserCallback(user, '/signup/handleAddressResponse')
    })
}

function finishSignup1Convo(bot, user, message) {
  syncBotReply(bot, message,
    'Now that that’s sorted, we’ll reach out when there’s an issue that you can take an action about, ' +
    'including the rep for you to call and how to talk to them. ' +
    'We’ll also send updates and outcomes on the issues we send. Sound fun?'
  ).then(
    setUserCallback(user, '/signup/finishSignup2')
  )
}

function finishSignup2Convo(bot, user, message) {
  syncBotReply(bot, message, 'Excellent. Have a nice day, and talk soon!').then(
    setUserCallback(user, null)
  )
}

module.exports = {
  startSignupConversation,
  askForAddressConvo,
  handleAddressResponseConvo,
  finishSignup1Convo,
  finishSignup2Convo,
}
