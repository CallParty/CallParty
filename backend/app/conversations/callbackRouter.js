var defaultConvo = require('./default')
var signupConvo = require('./signup')
var callToActionConvo = require('./calltoaction')

const callbackRoutes = {

  '/default': defaultConvo.defaultConvo,

  '/signup/askForAddress': signupConvo.askForAddressConvo,
  '/signup/handleAddressResponse': signupConvo.handleAddressResponseConvo,
  '/signup/finishSignup1':  signupConvo.finishSignup1Convo,
  '/signup/finishSignup2': signupConvo.finishSignup2Convo,

  '/calltoaction/part1': callToActionConvo.callToActionPart1Convo,
  '/calltoaction/part2': callToActionConvo.callToActionPart2Convo,
  '/calltoaction/part3': callToActionConvo.callToActionPart3Convo,
  '/calltoaction/thanksforsharing': callToActionConvo.thanksForSharingConvo,

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