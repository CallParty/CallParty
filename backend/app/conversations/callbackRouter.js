var defaultConvo = require('./defaultConvo')
var signupConvo = require('./signupConvo')
var callConvo = require('./callConvo')

const callbackRoutes = {

  '/default': defaultConvo.defaultConvo,

  '/signup/askForAddress': signupConvo.askForAddressConvo,
  '/signup/handleAddressResponse': signupConvo.handleAddressResponseConvo,
  '/signup/finishSignup1':  signupConvo.finishSignup1Convo,
  '/signup/finishSignup2': signupConvo.finishSignup2Convo,

  '/calltoaction/readyResponse': callConvo.readyResponseConvo,
  '/calltoaction/tellMeWhyResponse': callConvo.tellMeWhyResponseConvo,
  '/calltoaction/howDidItGo': callConvo.howDidItGoConvo,
  '/calltoaction/howDidItGoResponse': callConvo.howDidItGoResponseConvo,
  '/calltoaction/thanksForSharing': callConvo.thanksForSharingConvo,
  '/calltoaction/tryNextRepResponse': callConvo.tryNextRepResponseConvo

}

const runCallback = function(callbackPath, user, message) {
  const cb = callbackRoutes[callbackPath]
  if (cb) {
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
