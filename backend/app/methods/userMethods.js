const mongoose = require('mongoose')
const { User } = require('../models')

mongoose.Promise = require('es6-promise')

exports.createUser = function createUser(req) {
  var user = new User({
    fbId: req.fbId,
    state: req.state,
    congressionalDistrict: req.congressionalDistrict,
    firstName: req.firstName,
    lastName: req.lastName
  })

  return user.save()
    .then(user => user)
    .catch(err => console.log(err))
}

exports.lookupDistrict = function(req, res) {
  console.log('Looking up District')
}

exports.findUser = function(req, res) {
  User.find({}, function(err, user) {
    if (err) return res.send(err)
    console.log(user)
  })
}

//--- Using methods in application:
// var userfunc = require('')
// userfunc.lookupUser()
