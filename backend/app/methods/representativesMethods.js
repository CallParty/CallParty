var Reps = require('./schemas/representativesSchema.js'),
  mongoose = require('mongoose')

exports.insertReps = function(req, res) {
  Reps.count({}, function(err,count) {
    if (err) {
      console.error(err)
    } else {
      if(count === 0) {
        var repData = require('../../devops/datamodels/current-representatives.json')
        for (i=0; i < repData.length; i++) {
          var termlength = repData[i].terms.length - 1
          var lastterm = repData[i].terms[termlength]
          var addingrep = new Reps({
            "id": "rep-"+i,
            "full_name": repData[i].name.first + " " + repData[i].name.last,
            "first_name": repData[i].name.first,
            "last_name": repData[i].name.last,
            "official_full": repData[i].name.official_full,
            "gender": repData[i].bio.gender,
            "state": lastterm.state,
            "legislator_type": lastterm.legislator_type,
            "term_start": lastterm.term_start,
            "term_end": lastterm.term_end,
            "party": lastterm.party,
            "url": lastterm.url,
            "phone": lastterm.phone,
            "terms": repData[i].terms,
            "bioguide": repData[i].id.bioguide,
            "govtrack": repData[i].id.govtrack,
            "wikipedia": repData[i].wikipedia,
            "wikidata": repData[i].wikidata
          })
           addingrep.save(function (err) {
             if (err) {
               return handleError(err)
             } else {
               console.log('success!')
             }
          })
        }
      }
    }
  })
}