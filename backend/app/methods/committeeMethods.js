const { Committee } = require('../models')

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

module.exports = {
  getCommittees
}
