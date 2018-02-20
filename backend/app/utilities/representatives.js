require('any-promise/register/es6-promise')
const Promise = require('any-promise')
const rp = require('request-promise-any')
const yaml = require('js-yaml')
const fs = require('fs')
const mongoose = require('mongoose')
const { Reps } = require('../models')
const downloadFile = require('./downloadFile')
const { logMessage } = require('../utilities/logHelper')

mongoose.Promise = Promise

const REPS_FILE_NAME = '/tmp/legislators-current.yaml'

function downloadRepsYamlFile() {
  return downloadFile(
    'https://raw.githubusercontent.com/unitedstates/congress-legislators/master/legislators-current.yaml',
    REPS_FILE_NAME
  )
}

async function loadRepsFromFile() {
  logMessage('++ adding representatives to the db...')

  if (!fs.existsSync(REPS_FILE_NAME)) {
    throw new Error('Missing representative data YAML file!')
  }

  const repsFromYaml = yaml.safeLoad(fs.readFileSync(REPS_FILE_NAME))
  const officeLocations = await fetchOfficeLocationsFromPhoneYourRep()

  return Promise.all(repsFromYaml.map(function(repFromYaml, i) {
    const termLength = repFromYaml.terms.length - 1
    const lastTerm = repFromYaml.terms[termLength]
    const bioguide = repFromYaml.id.bioguide

    return Reps.findOneAndUpdate(
      { bioguide: bioguide },
      {
        id: `rep-${i}`,
        full_name: `${repFromYaml.name.first} ${repFromYaml.name.last}`,
        first_name: repFromYaml.name.first,
        last_name: repFromYaml.name.last,
        official_full: repFromYaml.name.official_full,
        gender: repFromYaml.bio.gender,
        state: lastTerm.state,
        party: lastTerm.party,
        url: lastTerm.url,
        phoneNumbers: (officeLocations[bioguide] || []).map(({ office_type, phone }) => ({ officeType: office_type, phoneNumber: phone })),
        govtrack: repFromYaml.id.govtrack,
        legislator_type: lastTerm.type,
        term_start: lastTerm.term_start,
        term_end: lastTerm.term_end,
        district_number: lastTerm.district,
        district: lastTerm.state && lastTerm.district ? `${lastTerm.state}-${lastTerm.district}` : '',
        wikipedia: repFromYaml.wikipedia,
        wikidata: repFromYaml.wikidata,
        image_url: `https://theunitedstates.io/images/congress/225x275/${repFromYaml.id.bioguide}.jpg`
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .exec()
  }))
}

async function fetchOfficeLocationsFromPhoneYourRep() {
  const repsData = await rp({ uri: 'https://phone-your-rep.herokuapp.com/reps/', json: true })
  return repsData.reduce((acc, rep) => Object.assign(acc, { [rep.bioguide_id]: rep.office_locations }), {})
}

module.exports = {
  downloadRepsYamlFile,
  loadRepsFromFile
}
