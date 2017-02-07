const { Committee } = require('../models')
const {
  downloadCommitteeYamlFile,
  downloadCommitteeMembershipYamlFile,
  loadCommitteesFromFiles
} = require('../utilities/committees')

function getCommittees(req, res) {
  return Committee
    .find({})
    .populate('subcommittees')
    .populate({
      path: 'representativeCommittees',
      populate: {
        path: 'representative'
      }
    })
    .exec()
    .then(committees => res.json(committees))
    .catch(err => res.send(err))
}

function insertCommittees() {
  return Committee.count({}).exec()
    .then(function(count) {
      if (count !== 0) {
        return null
      }

      return Promise.all([
        downloadCommitteeYamlFile(), downloadCommitteeMembershipYamlFile()
      ])
      .then(loadCommitteesFromFiles)
    })
}

module.exports = {
  getCommittees,
  insertCommittees
}
