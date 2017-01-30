require('any-promise/register/es6-promise')
const Promise = require('any-promise')
var builder = require('botbuilder')
const rp = require('request-promise-any')
const geocoding = require('../utilities/geocoding')
const { User } = require('../models')


function registerSignupDialogs(bot) {

  // The / dialog is started when the user first messages the bot
  bot.dialog('/', function (session) {
    session.beginDialog('/signup')
  })

  bot.dialog('/signup',
    [
      function (session, params, next) {
        // save their fbId
        const fbId = session.message.address.user.id
        session.userData.fbId = fbId

        // then make a request to the facebook API to get other information about the user
        const facebookGraphRequestOptions = {
          uri: `https://graph.facebook.com/${fbId}`,
          qs: {access_token: process.env.FACEBOOK_PAGE_TOKEN},
          json: true
        }
        rp(facebookGraphRequestOptions)
          .then(function (fbUserData) {
            User.findOrCreate({fbId: fbId}, {
              firstName: fbUserData.first_name,
              lastName: fbUserData.last_name
            }, function (err) {
              if (err) {
                throw err
              }
              // now that we have created a user, advance to the next stage of the conversation
              next()
            })
          })
          .catch(function(err) {console.log(err)})
      },
      // then start a conversation with the user
      function (session) {
        const organization = 'CallParty' // this should be looked up from the db eventually
        session.send(
          `Hi there! Nice to meet you. ` +
          `I’m a bot made to send you calls to action from the people at ${organization}, ` +
          `because taking civic action is way more effective in large groups. ` +
          `You can unsubscribe any time by just saying ‘stop’ or ‘unsubscribe’.`
        )
        builder.Prompts.text(session,
          'First thing’s first: What’s the address of your voting registration? ' +
          'I’ll use this to identify who your reps are – don’t worry, I won’t be holding onto it.'
        )
      },
      function (session, results) {
        if (results.response) {
          const address = results.response
          session.privateConversationData.address = address
          session.beginDialog('/process-address')
        }
        else {
          throw new Error('Failed to get address response from user')
        }
      }
    ]
  )

  bot.dialog('/process-address',
    [
      function (session) {
        const fbId = session.userData.fbId
        const address = session.privateConversationData.address
        const userPromise = User.findOne({fbId: fbId}).exec()
        const geocodingPromise = geocoding.getStateAndCongressionalDistrictFromAddress(address)
        Promise.all([userPromise, geocodingPromise])
          .then(function ([user, geocodingResult]) {
            session.send('Great!')

            user.state = geocodingResult.state
            user.congressionalDistrict = geocodingResult.congressional_district.district_number
            user.active = true
            user.save()
              .catch(function (err) {
                throw err
              })
            session.beginDialog('/finish-signup')
          })
          .catch(function (err) {
            // TODO: slack log exception somehow
            console.log('++ failed to geocode address: ' + err.stack)
            session.endDialog()
            // builder.Prompts.text(session,
            //   'Hm, something isn’t right. Make sure to include your street address, city, state, and zip code like this: ' +
            //   '123 Party Street, Brooklyn, NY 11206'
            // )
          })
      },
      function (session, results) {
        if (results.response) {
          const address = results.response
          session.privateConversationData.address = address
          session.beginDialog('/process-address')
        }
        else {
          throw new Error('Failed to get address response from user')
        }
      }
    ]
  )

  bot.dialog('/finish-signup',
    [
      function (session) {
        builder.Prompts.text(session,
          'Now that that’s sorted, we’ll reach out when there’s an issue that you can take an action about, ' +
          'including the rep for you to call and how to talk to them. ' +
          'We’ll also send updates and outcomes on the issues we send. Sound fun?'
        )
      },
      function (session, results) {
        if (results.response) {
          session.send('Excellent. Have a nice day, and talk soon!')
          session.endDialog()
        }
        else {
          throw new Error('Failed to get address response from user')
        }
      }
    ]
  )

}

module.exports = {
  registerSignupDialogs: registerSignupDialogs,
}