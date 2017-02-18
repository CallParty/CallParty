const { Reps } = require('../models')

function refreshReps() {
  return Reps.remove({}).then(insertReps).then(console.log(`reps refreshed!`))
}
function insertReps() {
  return Reps.count({}).exec()
    .then(function(count) {
      if (count !== 0) {
        return null
      }

      const repData = require('../../devops/datamodels/current-representatives.json')
      return Promise.all(repData.map(function(rep, i) {
        const termLength = rep.terms.length - 1
        const lastTerm = rep.terms[termLength]

        return Reps.findOneAndUpdate(
          { bioguide: rep.id.bioguide },
          {
            id: `rep-${i}`,
            full_name: `${rep.name.first} ${rep.name.last}`,
            first_name: rep.name.first,
            last_name: rep.name.last,
            official_full: rep.name.official_full,
            gender: rep.bio.gender,
            state: lastTerm.state,
            party: lastTerm.party,
            url: lastTerm.url,
            phone: lastTerm.phone,
            govtrack: rep.id.govtrack,
            legislator_type: lastTerm.type,
            term_start: lastTerm.term_start,
            term_end: lastTerm.term_end,
            district: lastTerm.district,
            wikipedia: rep.wikipedia,
            wikidata: rep.wikidata
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec()
      }))
    })
    .then(() => console.log('success!'))
}

module.exports = {
  insertReps,
  refreshReps
}
