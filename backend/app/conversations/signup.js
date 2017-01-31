require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const rp = require('request-promise-any')
const mongoose = require('mongoose')
const geocoding = require('../utilities/geocoding')
const { User } = require('../models')
var setUserCallback = require('../methods/userMethods').setUserCallback

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
  bot.reply(message,
    `Hi there! Nice to meet you. ` +
    `I’m a bot made to send you calls to action from the people at ${organization}, ` +
    `because taking civic action is way more effective in large groups. ` +
    `You can unsubscribe any time by just saying ‘stop’ or ‘unsubscribe’.`
  )
  bot.reply(message,
    'First thing’s first: What’s the address of your voting registration?' +
    'I’ll use this to identify who your reps are – don’t worry, I won’t be holding onto it.'
  )
  setUserCallback(user, '/signup/handleAddressResponse')
}

function handleAddressResponseConvo(bot, user, message) {
  const geocodingPromise = geocoding.getStateAndCongressionalDistrictFromAddress(message.text)
  Promise.all([geocodingPromise])
    .then(function([geocodingResult]) {
      if (!geocodingResult) {
        throw new Error('++ failed to find district from address: ' + message.text)
      }
      bot.reply(message, 'Great!')
      user.state = geocodingResult.state
      user.congressionalDistrict = geocodingResult.congressional_district.district_number
      user.active = true
      user.save()
        .catch(function(err) { throw err })
      finishSignup1Convo(bot, user, message)
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
  bot.reply(message,
    'Now that that’s sorted, we’ll reach out when there’s an issue that you can take an action about, ' +
    'including the rep for you to call and how to talk to them. ' +
    'We’ll also send updates and outcomes on the issues we send. Sound fun?'
  )
  setUserCallback(user, '/signup/finishSignup2')
}

function finishSignup2Convo(bot, user, message) {
  bot.reply(message, 'Excellent. Have a nice day, and talk soon!')
  setUserCallback(user, null)
}

module.exports = {
  startSignupConversation,
  askForAddressConvo,
  handleAddressResponseConvo,
  finishSignup1Convo,
  finishSignup2Convo,
}
