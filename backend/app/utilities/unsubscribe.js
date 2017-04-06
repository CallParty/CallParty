
async function unsubscribeAndAnonymizeUser(user) {
  /*
   * Sets all of a users fields to null (including fbId)
   * so that they will not be identifiable in the future.
   *
   * If the user sends a new message to the bot they will appear as a new user,
   * and a new row in Users table will be created for them.
   *
   * We keep this anonymized user around so as not to break other tables
   * which may have a foreign key to user (which will now be anonymized).
   */
  var userId = user._id
  var props = Object.keys(user.toObject())
  props.forEach(function(prop){
    user[prop] = null
  })
  user._id = userId
  user.unsubscribed = true

  return user.save()
}


module.exports = {
  unsubscribeAndAnonymizeUser: unsubscribeAndAnonymizeUser
}