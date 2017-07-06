var defaultConvo = require('./defaultConvo')
var signupConvo = require('./signupConvo')
var callConvo = require('./callConvo')
const { logMessage } = require('../utilities/logHelper')

const callbackRoutes = {

  '/default': defaultConvo.defaultConvo,

  '/signup/askForAddress': signupConvo.askForAddressConvo,
  '/signup/handleAddressResponse': signupConvo.handleAddressResponseConvo,
  '/signup/finishSignup1':  signupConvo.finishSignup1Convo,

  '/calltoaction/readyResponse': callConvo.readyResponseConvo,
  '/calltoaction/tellMeWhyResponse': callConvo.tellMeWhyResponseConvo,
  '/calltoaction/howDidItGo': callConvo.howDidItGoConvo,
  '/calltoaction/howDidItGoResponse': callConvo.howDidItGoResponseConvo,
  '/calltoaction/thanksForSharing': callConvo.thanksForSharingConvo,
  '/calltoaction/tryNextRepResponse': callConvo.tryNextRepResponseConvo,
  '/calltoaction/firstTimeAreYouReady': callConvo.firstTimeAreYouReadyConvo,
  '/calltoaction/firstTimeReadyResponse': callConvo.firstTimeReadyResponseConvo,

  // this callbackPath allows a human to override a convo with the bot
  '/override': (user, message) => {
    return logMessage(`${user.firstName} ${user.lastName} said "${message.text}"`, '#_override')
  },

}

const runCallback = async function(callbackPath, user, message) {
  const cb = callbackRoutes[callbackPath]
  if (cb) {
    await user.populate('currentConvo').execPopulate()
    cb(user, message)
  }
  else {
    throw new Error('Invalid callback route supplied')
  }
}

module.exports = {
  callbackRoutes,
  runCallback,
}
