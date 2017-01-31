const { stripIndent } = require('common-tags')
const { User } = require('../models')
var setUserCallback = require('../methods/userMethods').setUserCallback

function startCallToActionConversation(bot, fbId, convoData) {
  User.findOne({fbId: fbId}).exec().then(function (user) {
    // save params as convoData
    user.convoData = convoData
    user.save()
    // start the conversation
    const fakeMessage = {
      channel: fbId,
      user: fbId
    }
    callToActionPart1Convo(bot, user, fakeMessage)
  })
}

// part 1
function callToActionPart1Convo(bot, user, message) {
  bot.reply(message, `Hi ${user.convoData.firstName}. We've got an issue to call about.`)
  bot.reply(message, `${user.convoData.issueMessage}. ` +
    `You can find out more about the issue here ${user.convoData.issueLink}.`)
  bot.reply(message, stripIndent`
      You'll be calling ${user.convoData.repType} ${user.convoData.repName}. ` +
    `When you call you'll talk to a staff member, or you'll leave a voicemail.
      Let them know:
      *  You're a constituent calling about ${user.convoData.issueSubject}.
      *  The call to action: "I'd like ${user.convoData.repType} ${user.convoData.repName} to ${user.convoData.issueAction}."
      *  Share any personal feelings or stories.
      *  If taking the wrong stance on this issue would endanger your vote, let them know.
      *  Answer any questions the staffer has, and be friendly!
    `)
  bot.reply(message, stripIndent`
      Rep card
      ${user.convoData.repImage}
      ${user.convoData.repName}
      * ${user.convoData.repPhoneNumber} ⇢
      * ${user.convoData.repWebsite} ⇢
    `)
  bot.reply(message, 'Give me a thumbs up once you’ve tried to call!')
  setUserCallback(user, '/calltoaction/part2')
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
  bot.reply(message, msg_attachment)
  setUserCallback(user, '/calltoaction/part3')
}

// part 3
function callToActionPart3Convo(bot, user, message) {
  if (['I left a voicemail', 'I talk to a staffer'].indexOf(message.text) >= 0) {
    // TODO: gifs are not sending
    bot.reply(message, {
      attachment: {
        type: 'video',
        payload: {
          url: 'http://i.imgur.com/d3L1XIm.gif'
        }
      }
    })
    bot.reply(message, 'Woo thanks for your work! We’ve had [callCount] calls so far. ' +
      'We’ll reach out when we have updates and an outcome on the issue.')
    bot.reply(message, 'Share this action with your friends to make it a party [link]')
    // calltoaction is over
    setUserCallback(user, null)
  }
  else if (message.text === 'Something went wrong') {
    // TODO: gifs are not sending
    bot.reply(message, {
      attachment: {
        type: 'video',
        payload: {
          url: 'blob:http://imgur.com/586e2006-7a61-45c0-8e04-c492ad368456'
        }
      }
    })
    bot.reply(message,
      'We’re sorry to hear that, but good on you for trying! Want to tell us about it?'
    )
    setUserCallback(user, '/calltoaction/thanksforsharing')
  }
  else {
    throw new Error('Received unexpected message at path /calltoaction/part3: ' + message.text)
  }
}

// thanks for sharing
function thanksForSharingConvo(bot, user, message) {
  bot.reply(message, 'Thanks for sharing! We’ll reach back out if we can be helpful.')
  // TODO: log response.text to slack so we can see the feedback
  setUserCallback(user, null)
}


module.exports = {
  startCallToActionConversation,
  callToActionPart1Convo,
  callToActionPart2Convo,
  callToActionPart3Convo,
  thanksForSharingConvo,
}
