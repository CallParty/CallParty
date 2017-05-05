
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
  callparty4: 'callparty',
  callparty3: 'callparty',
  callparty2: 'callparty',
  callparty1: 'callparty',
  govtrack: 'govtrack',
  gtrackstaging: 'govtrack'
}

module.exports = {
  botVars,
  botTypes,
}