const { stripIndent } = require('common-tags')
const { User } = require('../models')
const { setUserCallback } = require('../methods/userMethods')
const { syncBotReply } = require('../utilities/botkit')

function startCallToActionConversation(bot, fbId, convoData) {
  return User.findOne({fbId: fbId}).exec().then(function (user) {
    // save params as convoData
    user.convoData = convoData
    user.save().then(function() {
      // start the conversation
      const fakeMessage = {
        channel: fbId,
        user: fbId
      }
      callToActionPart1Convo(bot, user, fakeMessage)
    })
  })
}

// part 1
function callToActionPart1Convo(bot, user, message) {
  return syncBotReply(bot, message,
    `Hi ${user.convoData.firstName}. We've got an issue to call about.`
  )
  .then(function() {
    return syncBotReply(bot, message, `${user.convoData.issueMessage}. ` +
      `You can find out more about the issue here ${user.convoData.issueLink}.`)
  })
  .then(function() {
    return syncBotReply(bot, message, stripIndent`
      You'll be calling ${user.convoData.repType} ${user.convoData.repName}. ` +
      `When you call you'll talk to a staff member, or you'll leave a voicemail.
      Let them know:
      *  You're a constituent calling about ${user.convoData.issueSubject}.
      *  The call to action: "I'd like ${user.convoData.repType} ${user.convoData.repName} to ${user.convoData.issueAction}."
      *  Share any personal feelings or stories.
      *  If taking the wrong stance on this issue would endanger your vote, let them know.
      *  Answer any questions the staffer has, and be friendly!
    `)
  })
  .then(function() {
    return syncBotReply(bot, message, stripIndent`
      Rep card
      ${user.convoData.repImage}
      ${user.convoData.repName}
      * ${user.convoData.repPhoneNumber} ⇢
      * ${user.convoData.repWebsite} ⇢
    `)
  })
  .then(() => syncBotReply(bot, message, 'Give me a thumbs up once you’ve tried to call!'))
  .then(() => setUserCallback(user, '/calltoaction/part2'))
}

// part 2
function callToActionPart2Convo(bot, user, message) {
  const msg_attachment = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: "How'd it go?",
        buttons: [
          {
            type: 'postback',
            title: 'I talked to a staffer',
            payload: 'I talked to a staffer'
          },
          {
            type: 'postback',
            title: 'I left a voicemail',
            payload: 'I left a voicemail'
          },
          {
            type: 'postback',
            title: 'Something went wrong',
            payload: 'Something went wrong'
          }
        ]
      }
    }
  }
  return syncBotReply(bot, message, msg_attachment)
    .then(() => setUserCallback(user, '/calltoaction/part3'))
}

// part 3
function callToActionPart3Convo(bot, user, message) {
  if (['I left a voicemail', 'I talk to a staffer'].indexOf(message.text) >= 0) {
    // TODO: gifs are not sending
    return syncBotReply(bot, message, {
      attachment: {
        type: 'video',
        payload: {
          url: 'http://i.imgur.com/d3L1XIm.gif'
        }
      }
    }).then(function() {
      return syncBotReply(bot, message, 'Woo thanks for your work! We’ve had [callCount] calls so far. ' +
        'We’ll reach out when we have updates and an outcome on the issue.')
    }).then(function() {
      return syncBotReply(bot, message, 'Share this action with your friends to make it a party [link]')
    }).then(function() {
      // calltoaction is over
      return setUserCallback(user, null)
    })
  }
  else if (message.text === 'Something went wrong') {
    // TODO: gifs are not sending
    return syncBotReply(bot, message, {
      attachment: {
        type: 'video',
        payload: {
          url: 'blob:http://imgur.com/586e2006-7a61-45c0-8e04-c492ad368456'
        }
      }
    })
    .then(function() {
      return syncBotReply(bot, message,
        'We’re sorry to hear that, but good on you for trying! Want to tell us about it?'
      )
    }).then(() => setUserCallback(user, '/calltoaction/thanksforsharing'))
  }
  else {
    throw new Error('Received unexpected message at path /calltoaction/part3: ' + message.text)
  }
}

// thanks for sharing
function thanksForSharingConvo(bot, user, message) {
  return syncBotReply(bot, message, 'Thanks for sharing! We’ll reach back out if we can be helpful.')
    .then(function() {
      // TODO: log response.text to slack so we can see the feedback
      return setUserCallback(user, null)
    })
}


module.exports = {
  startCallToActionConversation,
  callToActionPart1Convo,
  callToActionPart2Convo,
  callToActionPart3Convo,
  thanksForSharingConvo,
}
