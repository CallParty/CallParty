const { Reps } = require('../models')

async function getDistricts () {
  /* gets all the districts in the database */
  let districts = await Reps.find().distinct('district')
  // filter our null values
  districts = districts.filter(function(n){ return n });
  // split into state and district number and sort accordingly
  districts.sort(function(a, b) {
    let aSplit = a.split('-')
    let bSplit = b.split('-')
    if (aSplit[0] === bSplit[0]) {
      return (parseInt(aSplit[1]) - parseInt(bSplit[1]))
    }
    else {
      return aSplit[0] > bSplit[0] ? 1 : -1
    }
  })
  return districts
}

module.exports = {
  getDistricts,
}

