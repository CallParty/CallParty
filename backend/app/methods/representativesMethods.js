const { downloadRepsYamlFile, loadRepsFromFile } = require('../utilities/representatives')
const { Reps } = require('../models')

function insertReps() {
  return Reps.count({}).exec()
    .then(function(count) {
      if (count !== 0) {
        return null
      }

      return downloadRepsYamlFile().then(loadRepsFromFile)
    })
    .then(() => console.log('success!'))
}

module.exports = {
  insertReps
}
