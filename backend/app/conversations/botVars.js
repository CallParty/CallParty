

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

// duplicate certain keys for testing
Object.keys(botVars).forEach(function(key) {
  let keyVals = botVars[key]
  keyVals['callingteststaging'] = keyVals['callparty']
  keyVals['callparty5'] = keyVals['callparty']
  keyVals['govtrackstaging'] = keyVals['govtrack']
})

module.exports = {
  botVars,
}