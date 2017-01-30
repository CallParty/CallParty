var testConvo = require('./test')

const callbackRoutes = {
  '/test1': testConvo.test1Convo,
  '/test2': testConvo.test2Convo
}

module.exports = {
  callbackRoutes
}