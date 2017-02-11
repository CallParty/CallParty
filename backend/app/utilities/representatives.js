const yaml = require('js-yaml')
const fs = require('fs')
const mongoose = require('mongoose')
const { Reps } = require('../models')
const downloadFile = require('./downloadFile')

mongoose.Promise = require('es6-promise')

const REPS_FILE_NAME = '/tmp/legislators-current.yaml'

function downloadRepsYamlFile() {
  return downloadFile(
    'https://raw.githubusercontent.com/unitedstates/congress-legislators/master/legislators-current.yaml',
    REPS_FILE_NAME
  )
}

function loadRepsFromFile() {
  console.log('Adding representatives to the db...')

  if (!fs.existsSync(REPS_FILE_NAME)) {
    throw new Error('Missing representative data YAML file!')
  }

  const repsFromYaml = yaml.safeLoad(fs.readFileSync(REPS_FILE_NAME))

  return Promise.all(repsFromYaml.map(function(repFromYaml, i) {
    const termLength = repFromYaml.terms.length - 1
    const lastTerm = repFromYaml.terms[termLength]

    return Reps.findOneAndUpdate(
      { bioguide: repFromYaml.id.bioguide },
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
        phone: lastTerm.phone,
        govtrack: repFromYaml.id.govtrack,
        legislator_type: lastTerm.type,
        term_start: lastTerm.term_start,
        term_end: lastTerm.term_end,
        district: lastTerm.district,
        wikipedia: repFromYaml.wikipedia,
        wikidata: repFromYaml.wikidata
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    .exec()
  }))
}

module.exports = {
  downloadRepsYamlFile,
  loadRepsFromFile
}
