const secrets = require('../../devops/secret_files/secret.json')

function getPageFromId(recipientId) {
  /* returns the string name of the facebook page, which is associated with the given fbId */
  const idToPage = {
    2060548600838593: 'callparty5'
  }
  return idToPage[recipientId]
}

function getTokenFromPage(page) {
  /* takes in a string as returned from getPageFromId, and returns the fbToken for sending messages to that page */
  const fbTokens = secrets['FB_TOKENS']
  return fbTokens[page]
}


module.exports = {
  getPageFromId,
  getTokenFromPage,
}