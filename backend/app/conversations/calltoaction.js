function startCallToActionConversation(bot, fbId, params) {
  const {
    firstName,
    issueMessage,
    issueLink,
    issueSubject,
    issueAction,
    repType,
    repName,
    repImage,
    repPhoneNumber,
    repWebsite
  } = params

  // part 1
  function callToActionPart1(response, convo) {
    convo.say(`Hi ${firstName}. We've got an issue to call about.`)
    convo.say(`${issueMessage}. You can find out more about the issue here ${issueLink}.`)
    convo.say(
      `You'll be calling ${repType} ${repName}. When you call you'll talk to a staff member, or you'll leave a voicemail.
      Let them know:
      *  You're a constituent calling about ${issueSubject}.
      *  The call to action: "I'd like ${repType} ${repName} to ${issueAction}."
      *  Share any personal feelings or stories.
      *  If taking the wrong stance on this issue would endanger your vote, let them know.
      *  Answer any questions the staffer has, and be friendly!`
    )
    convo.say(
      `Rep card
      ${repImage}
      ${repName}
      * ${repPhoneNumber} ⇢
      * ${repWebsite} ⇢`
    )
    convo.ask('Give me a thumbs up once you’ve tried to call!', function(response, convo) {
      callToActionPart2(response, convo)
      convo.next()
    })
  }

  // part 2
  function callToActionPart2(response, convo) {
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
    convo.ask(msg_attachment, function(response, convo) {
      callToActionPart3(response, convo)
      convo.next()
    })
  }

  // part 3
  function callToActionPart3(response, convo) {
    if (['I left a voicemail', 'I talk to a staffer'].indexOf(response.text) >= 0) {
      // TODO: gifs are not sending
      convo.say({
        attachment: {
          type: 'video',
          payload: {
            url: 'http://i.imgur.com/d3L1XIm.gif'
          }
        }
      })
      convo.say('Woo thanks for your work! We’ve had [callCount] calls so far. ' +
        'We’ll reach out when we have updates and an outcome on the issue.')
      convo.say('Share this action with your friends to make it a party [link]')
      convo.next()
    }
    else if (response.text === 'Something went wrong') {
      // TODO: gifs are not sending
      convo.say({
        attachment: {
          type: 'video',
          payload: {
            url: 'blob:http://imgur.com/586e2006-7a61-45c0-8e04-c492ad368456'
          }
        }
      })
      convo.ask('We’re sorry to hear that, but good on you for trying! Want to tell us about it?', function(response, convo) {
        convo.say('Thanks for sharing! We’ll reach back out if we can be helpful.')
        // TODO: log response.text to slack so we can see the feedback
        convo.next()
      })
    }
    else {
      // TODO: log an exception (this should never happen)
    }
    // TODO: no response for x time (not sure how to handle this)
  }

  // start conversation using above parts
  // use a fakeMessage to initiate the conversation with the correct user
  const fakeMessage = {
    channel: fbId,
    user: fbId
  }
  bot.startConversation(fakeMessage, callToActionPart1)
}

module.exports = {
  startCallToActionConversation: startCallToActionConversation
}
