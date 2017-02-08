// const { startCallToActionConversation } = require('../../app/conversations/calltoaction')

module.exports = function setupCallToActionJob(queue) {
  queue.process('callToAction', function(job, done) {
    const { user, callToAction } = job.data

    console.log(`Sending call to action to user with facebook ID: ${user.fbId}`)
    console.log(`Call to action data: ${callToAction}`)

    done()
  })
}
