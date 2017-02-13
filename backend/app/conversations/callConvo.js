const moment = require('moment')
const { stripIndent } = require('common-tags')
const { setUserCallback } = require('../methods/userMethods')
const { botReply } = require('../utilities/botkit')
const { UserAction } = require('../models')
const { UserConversation } = require('../models')
const ACTION_TYPE_PAYLOADS = UserAction.ACTION_TYPE_PAYLOADS

function startCallConversation(user, representatives, campaignCall, campaign, userConversation) {
  const convoData = {
    firstName: user.firstName,
    issueMessage: campaignCall.description,
    issueLink: campaignCall.link,
    issueSubject: campaignCall.title,
    issueTask: campaignCall.task,
    campaignCall: campaignCall,
    repType: representatives[0].legislatorTitle,
    repName: representatives[0].official_full,
    repImage: representatives[0].image_url,
    repPhoneNumber: representatives[0].phone,
    repWebsite: representatives[0].url,
    userConversationId: userConversation._id
  }

  // save params as convoData
  user.convoData = convoData

  return user.save().then(() => {
    // start the conversation
    const fakeMessage = {
      channel: user.fbId,
      user: user.fbId
    }
    return callPart1Convo(user, fakeMessage)
  })
}

// part 1
function callPart1Convo(user, message) {
  // set that the conversation has been intialized
  UserConversation.update({ _id: user.convoData.userConversationId }, { active: true }).exec()
  // begin the conversation
  return botReply(message,
      `Hi ${user.convoData.firstName}. We've got an issue to call about.`
    )
    .then(() => {
      return botReply(message, `${user.convoData.issueMessage}. ` +
        `You can find out more about the issue here ${user.convoData.issueLink}.`
      )
    }).then(() => {
      const msgToSend = stripIndent`
        You'll be calling ${user.convoData.repType} ${user.convoData.repName}. ` +
        `When you call you'll talk to a staff member, or you'll leave a voicemail. ` +
        `Let them know:
        *  You're a constituent calling about ${user.convoData.issueSubject}.
        *  The call to action: "I'd like ${user.convoData.repType} ${user.convoData.repName} to ${user.convoData.issueTask}."
        *  Share any personal feelings or stories.
        *  If taking the wrong stance on this issue would endanger your vote, let them know.
        *  Answer any questions the staffer has, and be friendly!`
      return botReply(message, msgToSend)
    }).then(() => {
      const msgAttachment = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: `${user.convoData.repType} ${user.convoData.repName}`,
                image_url: user.convoData.repImage,
                // TODO: for some reason facebook is throwing error with this default_action included
                // default_action: {
                //   type: 'phone_number',
                //   title: user.convoData.repPhoneNumber,
                //   payload: user.convoData.repPhoneNumber
                // },
                buttons: [
                  {
                    type: 'phone_number',
                    title: user.convoData.repPhoneNumber,
                    payload: user.convoData.repPhoneNumber
                  },
                  {
                    type: 'web_url',
                    url: user.convoData.repWebsite,
                    title: 'View Website'
                  }
                ]
              }
            ]
          }
        }
      }
      return botReply(message, msgAttachment)
    })
    .then(() => botReply(message, 'Give me a thumbs up once you’ve tried to call!'))
    .then(() => setUserCallback(user, '/calltoaction/part2'))
}

// part 2
function callPart2Convo(user, message) {
  const msg_attachment = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: "How'd it go?",
        buttons: [
          {
            type: 'postback',
            title: 'Talked to a staffer',
            payload: ACTION_TYPE_PAYLOADS.staffer
          },
          {
            type: 'postback',
            title: 'Left a voicemail',
            payload: ACTION_TYPE_PAYLOADS.voicemail
          },
          {
            type: 'postback',
            title: 'Something went wrong',
            payload: ACTION_TYPE_PAYLOADS.error
          }
        ]
      }
    }
  }
  return botReply(message, msg_attachment).then(() =>
    setUserCallback(user, '/calltoaction/part3')
  )
}

// part 3
function callPart3Convo(user, message) {
  this.user = user
  return UserAction.create({
    actionType: message.text,
    campaignAction: this.user.convoData.campaignCall,
    user: this.user,
  })
  .then(() => {
    if ([ACTION_TYPE_PAYLOADS.voicemail, ACTION_TYPE_PAYLOADS.staffer].indexOf(message.text) >= 0) {
      return botReply(message, {
        attachment: {
          type: 'image',
          payload: {
            url: 'https://storage.googleapis.com/callparty/success.gif'
          }
        }
      })
      .then(() => {
        return UserAction.count({
          campaignAction: this.user.convoData.campaignCall,
          active: true,
          actionType: {
            $in: [
              ACTION_TYPE_PAYLOADS.voicemail,
              ACTION_TYPE_PAYLOADS.staffer
            ]
          }
        }).exec()
      })
      .then((numCalls) => {
        return botReply(message, stripIndent`
          Woo thanks for your work! We’ve had ${numCalls} calls so far.
          We’ll reach out when we have updates and an outcome on the issue.
          Share this action with your friends to make it a party ${this.user.convoData.issueLink}
          `)
      })
      .then(() => setUserCallback(user, null))
    }
    else if (message.text === ACTION_TYPE_PAYLOADS.error) {
      return botReply(message, {
        attachment: {
          type: 'image',
          payload: {
            url: 'https://storage.googleapis.com/callparty/bummer.gif'
          }
        }
      })
      .then(() => {
        botReply(message,
            'We’re sorry to hear that, but good on you for trying! Want to tell us about it?'
        )
      })
      .then(() => setUserCallback(user, '/calltoaction/thanksforsharing'))
    }
    else {
      throw new Error('Received unexpected message at path /calltoaction/part3: ' + message.text)
    }
  })
}

// thanks for sharing
function thanksForSharingConvo(user, message) {
  return UserConversation.update({ _id: user.convoData.userConversationId }, { dateCompleted: moment.utc().toDate() }).exec()
  .then(() => botReply(message, 'Thanks for sharing! We’ll reach back out if we can be helpful.'))
  .then(function () {
    // Should be logged to sentry and then slack.
    console.log(message.text)
    return setUserCallback(user, null)
  })
}


module.exports = {
  startCallConversation,
  callPart1Convo,
  callPart2Convo,
  callPart3Convo,
  thanksForSharingConvo,
}
