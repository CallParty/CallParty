var Promise = require('es6-promise')
var Geocodio = require('geocodio')

var geocodio = new Geocodio({ api_key: process.env.GEOCODIO_API_KEY })

/*
 * Looks up the state and congressional district for an address.
 * @param {string} address - An address to be converted into a state and congressional district.
 * @returns {Promise} A promise that resolves to the state and congressional district.
 * @throws Will throw an error if the address can't be geocoded.
 */
function getStateAndCongressionalDistrictFromAddress(address) {
  return new Promise(function(resolve, reject) {
    geocodio.get('geocode', { q: address, fields: 'cd,stateleg' }, function(err, response) {
      if (err) {
        return reject(err)
      }
      resolve(response)
    })
  })
  .then(function(response) {
    return JSON.parse(response)
  })
  .then(function(geocodingResponse) {
    if (!geocodingResponse.results.length) {
      throw new Error('No geocoding results found.')
    }
    var result = geocodingResponse.results[0]

    // for more details on the values of congressional_district and state_legislative_district,
    // see https://geocod.io/docs/#fields
    return {
      state: result.address_components.state,
      congressional_district: result.fields.congressional_district,
      state_legislative_districts: result.fields.state_legislative_districts
    }
  })
}

module.exports = {
  getStateAndCongressionalDistrictFromAddress: getStateAndCongressionalDistrictFromAddress
}
