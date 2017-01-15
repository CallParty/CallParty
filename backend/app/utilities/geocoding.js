require('any-promise/register/es6-promise')

var Promise = require('any-promise')
var rp = require('request-promise-any')

var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
})

/*
 * Looks up the state and congressional district for an address.
 * @param {string} address - An address to be converted into a state and congressional district.
 * @returns {Promise} A promise that resolves to the state and congressional district.
 * @throws Will throw an error if the address can't be geocoded or no congressional district is found.
 */
function getStateAndCongressionalDistrictFromAddress(address) {
  // first, turn the address into latitude and longitude using the Google Maps API
  return googleMapsClient.geocode({ address: address }).asPromise()
    .then(function(geocodingResponse) {
      var results = geocodingResponse.json.results
      if (!results.length) {
        throw new Error('No geocoding results found.')
      }
      var location = results[0].geometry.location

      // now, turn the latitude & longitude into a state and congressional district using the Sunlight Labs Congress API
      var districtLocationUrl = 'https://congress.api.sunlightfoundation.com/districts/locate'

      return rp({
        uri: districtLocationUrl,
        qs: {
          latitude: location.lat,
          longitude: location.lng
        },
        json: true
      })
    })
    .then(function(districtResponse) {
      if (!districtResponse.count) {
        throw new Error('No congressional districts found.')
      }
      return districtResponse.results[0]
    })
}

module.exports = {
  getStateAndCongressionalDistrictFromAddress: getStateAndCongressionalDistrictFromAddress
}
