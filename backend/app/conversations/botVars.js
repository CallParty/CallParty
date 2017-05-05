
const botVars = {
  orgName: {
    callparty: 'CallParty',
    govtrack: 'GovTrack',
  },
  orgEmail: {
    callparty: 'hi@callparty.org',
    govtrack: 'hi@govtrack.org'
  }
}

// this mapping from bot to botType allows testing bots to share botVars with prod bots more easily
const botTypes = {
  callparty: 'callparty',
  callingteststaging: 'callparty',
  callparty5: 'callparty',
  govtrack: 'govtrack',
  govtrackstaging: 'govtrack'
}

module.exports = {
  botVars,
  botTypes,
}