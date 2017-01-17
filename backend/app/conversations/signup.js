require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const rp = require('request-promise-any')
const mongoose = require('mongoose')
const geocoding = require('../utilities/geocoding')
const { User } = require('../models')

mongoose.Promise = Promise

function startSignupConversation(bot, fbId) {

  function askForAddress(response, convo) {
    const organization = 'CallParty' // this should be looked up from the db eventually
    convo.say(`Hi there! Nice to meet you. I’m a bot made to send you calls to action from the people at ${organization}, because taking civic action is way more effective in large groups. You can unsubscribe any time by just saying ‘stop’ or ‘unsubscribe’.`)
    convo.ask('First thing’s first: What’s the address of your voting registration? I’ll use this to identify who your reps are – don’t worry, I won’t be holding onto it.', function(response, convo) {
      handleAddressResponse(response, convo)
      convo.next()
    })
  }

  function handleAddressResponse(response, convo) {
    const userPromise = User.findOne({ fbId }).exec()
    const geocodingPromise = geocoding.getStateAndCongressionalDistrictFromAddress(response.text)

    Promise.all([userPromise, geocodingPromise])
      .then(function([user, geocodingResult]) {
        convo.say('Great!')

        user.state = geocodingResult.state
        user.congressionalDistrict = geocodingResult.congressional_district.district_number
        user.active = true
        user.save()
          .catch(function(err) { throw err })

        finishSignup(response, convo)
        convo.next()
      })
      .catch(function() {
        convo.ask('Hm, something isn’t right. Make sure to include your street address, city, state, and zip code like this: 123 Party Street, Brooklyn, NY 11206', handleAddressResponse)
        convo.next()
      })
  }

  function finishSignup(response, convo) {
    convo.ask('Now that that’s sorted, we’ll reach out when there’s an issue that you can take an action about, including the rep for you to call and how to talk to them. We’ll also send updates and outcomes on the issues we send. Sound fun?', function(response, convo) {
      convo.say('Excellent. Have a nice day, and talk soon!')
      convo.next()
    })
  }

  const facebookGraphRequestOptions = {
    uri: `https://graph.facebook.com/${fbId}`,
    qs: { access_token: process.env.FACEBOOK_PAGE_TOKEN },
    json: true
  }

  rp(facebookGraphRequestOptions)
    .then(function(fbUserData) {
      User.findOrCreate({ fbId: fbId }, { firstName: fbUserData.first_name, lastName: fbUserData.last_name }, function(err) {
        if (err) { throw err }

        // start conversation using above parts
        // use a fakeMessage to initiate the conversation with the correct user
        const fakeMessage = {
          channel: fbId,
          user: fbId
        }
        bot.startConversation(fakeMessage, askForAddress)
      })
    })
    .catch(err => console.log(err))
}

module.exports = {
  startSignupConversation: startSignupConversation
}
