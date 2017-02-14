var defaultConvo = require('./defaultConvo')
var signupConvo = require('./signupConvo')
var callConvo = require('./callConvo')

const callbackRoutes = {

  '/default': defaultConvo.defaultConvo,

  '/signup/askForAddress': signupConvo.askForAddressConvo,
  '/signup/handleAddressResponse': signupConvo.handleAddressResponseConvo,
  '/signup/finishSignup1':  signupConvo.finishSignup1Convo,
  '/signup/finishSignup2': signupConvo.finishSignup2Convo,

  '/calltoaction/part1': callConvo.callPart1Convo,
  '/calltoaction/part2': callConvo.callPart2Convo,
  '/calltoaction/part3': callConvo.callPart3Convo,
  '/calltoaction/thanksforsharing': callConvo.thanksForSharingConvo,

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
