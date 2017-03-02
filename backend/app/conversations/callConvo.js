const moment = require('moment')
const { stripIndent } = require('common-tags')
const { setUserCallback } = require('../methods/userMethods')
const { botReply } = require('../utilities/botkit')
const { UserAction } = require('../models')
const { UserConversation, Reps } = require('../models')
const ACTION_TYPE_PAYLOADS = UserAction.ACTION_TYPE_PAYLOADS
const logMessage = require('../utilities/logHelper').logMessage

function startCallConversation(user, userConversation, representatives, campaignCall) {

  // for testing so that we can ensure that an error on one user, does not botch the whole run
  if (campaignCall.title === 'TestErrorLogging' && user.firstName === 'Max' && user.lastName === 'Fowler') {
    throw new Error('Testing error logging within conversation initiation')
  }

  const repsPromise = Reps.find({ _id: { $in: representatives } }).exec()
  // then begin the conversation
  return Promise.all([repsPromise, logPromise]).then(([representatives]) => {
    const convoData = {
      firstName: user.firstName,
      issueMessage: campaignCall.campaign.description,
      issueLink: campaignCall.issueLink,
      shareLink: campaignCall.shareLink,
      issueSubject: campaignCall.title,
      issueTask: campaignCall.task,
      campaignCall: campaignCall.toObject({ virtuals: false }), // without toObject mongoose goes into an infinite loop on insert
      userConversationId: userConversation._id,
      representatives: representatives.map(representative => ({
        repType: representative.legislatorTitle,
        repName: representative.official_full,
        repId: representative._id,
        repImage: representative.image_url,
        repPhoneNumber: representative.phone,
        repWebsite: representative.url,
      })),
      currentRepresentativeIndex: 0
    }
    // save params as convoData
    user.convoData = convoData

    return user.save().then(() => {
      return areYouReadyConvo(user, null)
    })
  })
}

// part 1
function areYouReadyConvo(user, message) {
  // set that the conversation has been intialized
  // (we could consider putting this after the first set of messages instead of before)
  UserConversation.update({ _id: user.convoData.userConversationId }, { active: true }).exec()
  // begin the conversation
  return botReply(user,
    `Hi ${user.convoData.firstName}. We've got an issue to call about.`
  )
  .then(() => {
    return botReply(user, `${user.convoData.issueMessage}. ` +
      `You can find out more about the issue here ${user.convoData.issueLink}.`
    )
  }).then(() => {
    const msg_attachment = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Are you ready to call now?',
          buttons: [
            {
              type: 'postback',
              title: 'Yes send me the info',
              payload: ACTION_TYPE_PAYLOADS.isReady
            },
            {
              type: 'postback',
              title: "I don't want to call",
              payload: ACTION_TYPE_PAYLOADS.noCall
            },
          ]
        }
      }
    }
    return botReply(user, msg_attachment).then(() =>
      setUserCallback(user, '/calltoaction/readyResponse')
    )
  })
}

function readyResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignAction: user.convoData.campaignCall,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user,
  })
  .then(() => {
    if (message.text === ACTION_TYPE_PAYLOADS.isReady) {
      const hasOneRep = user.convoData.representatives.length === 1
      return hasOneRep ? readyToCallSingleRepConvo(user, message) : readyToCallMultipleRepsConvo(user, message)
    }
    else if (message.text === ACTION_TYPE_PAYLOADS.noCall) {
      return noCallConvo(user, message)
    }
    else {
      throw new Error('Received unexpected message at path /calltoaction/readyResponse: ' + message.text)
    }
  })
}

function readyToCallSingleRepConvo(user, message) {
  const representative = user.convoData.representatives[0]
  const msgToSend = stripIndent`
        You'll be calling ${representative.repType} ${representative.repName}. ` +
    `When you call you'll talk to a staff member, or you'll leave a voicemail. ` +
    `Let them know:
        *  You're a constituent calling about ${user.convoData.issueSubject}.
        *  The call to action: "I'd like ${representative.repType} ${representative.repName} to ${user.convoData.issueTask}."
        *  Share any personal feelings or stories.
        *  If taking the wrong stance on this issue would endanger your vote, let them know.
        *  Answer any questions the staffer has, and be friendly!`
  return botReply(user, msgToSend).then(() => {
    const msgAttachment = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: `${representative.repType} ${representative.repName}`,
              image_url: representative.repImage,
              // TODO: for some reason facebook is throwing error with this default_action included
              // default_action: {
              //   type: 'phone_number',
              //   title: user.convoData.repPhoneNumber,
              //   payload: user.convoData.repPhoneNumber
              // },
              buttons: [
                {
                  type: 'phone_number',
                  title: representative.repPhoneNumber,
                  payload: representative.repPhoneNumber
                },
                {
                  type: 'web_url',
                  url: representative.repWebsite,
                  title: 'View Website'
                }
              ]
            }
          ]
        }
      }
    }
    return botReply(user, msgAttachment)
  })
  .then(() => botReply(user, 'Give me a thumbs up once you’ve tried to call!'))
  .then(() => setUserCallback(user, '/calltoaction/howDidItGo'))
}

function readyToCallMultipleRepsConvo(user, message) {
  const firstRep = user.convoData.representatives[0]
  const msgToSend = stripIndent`
    You'll be calling ${user.convoData.representatives.length} Congress Members. When you call, you'll talk to a staff member, or you'll leave a voicemail. Let them know:
      *  You're a constituent calling about ${user.convoData.issueSubject}.
      *  The call to action: "I'd like the Congress Member to ${user.convoData.issueTask}."
      *  Share any personal feelings or stories.
      *  If taking the wrong stance on this issue would endanger your vote, let them know.
      *  Answer any questions the staffer has, and be friendly!

    Let's go! Your first call is ${firstRep.repType} ${firstRep.repName}:
  `
  return botReply(user, msgToSend)
    .then(() => multipleRepsCallNextRepConvo(user, message))
}

function multipleRepsCallNextRepConvo(user, message) {
  const representative = user.convoData.representatives[user.convoData.currentRepresentativeIndex]

  return botReply(user, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: `${representative.repType} ${representative.repName}`,
            image_url: representative.repImage,
            buttons: [
              {
                type: 'phone_number',
                title: representative.repPhoneNumber,
                payload: representative.repPhoneNumber
              },
              {
                type: 'web_url',
                url: representative.repWebsite,
                title: 'View Website'
              }
            ]
          }
        ]
      }
    }
  })
  .then(() => botReply(user, 'Give me a thumbs up once you’ve tried to call!'))
  .then(() => setUserCallback(user, '/calltoaction/howDidItGo'))
}

function noCallConvo(user, message) {
  return botReply(user, 'That\'s okay! Want to tell me why?').then(() => {
    return setUserCallback(user, '/calltoaction/tellMeWhyResponse')
  })
}

function tellMeWhyResponseConvo(user, message) {
  // this log line logs the user feedback to the _feedback channel in slack
  logMessage(`++ ${user.firstName} ${user.lastName} (${user.fbId}) said in response to I don't want to call: ${message.text}`, '#_feedback', true)
  return botReply(user, 'Got it – I\'ll let you know when there\'s another issue to call about.').then(() => {
    return setUserCallback(user, null)
  })
}

function howDidItGoConvo(user, message) {
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
  return botReply(user, msg_attachment).then(() =>
    setUserCallback(user, '/calltoaction/howDidItGoResponse')
  )
}

function howDidItGoResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignAction: user.convoData.campaignCall,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user,
  })
  .then(() => {
    const hasOneRep = user.convoData.representatives.length === 1
    return hasOneRep ? howDidItGoSingleRepResponseConvo(user, message) : howDidItGoMultipleRepsResponseConvo(user, message)
  })
}

function howDidItGoSingleRepResponseConvo(user, message) {
  if ([ACTION_TYPE_PAYLOADS.voicemail, ACTION_TYPE_PAYLOADS.staffer].indexOf(message.text) >= 0) {
    return botReply(user, {
      attachment: {
        type: 'image',
        payload: {
          url: 'https://storage.googleapis.com/callparty/success.gif'
        }
      }
    })
    .then(() => {
      return UserAction.count({
        campaignAction: user.convoData.campaignCall,
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
      if (numCalls !== 0) {
        return botReply(user, stripIndent`
          Woo thanks for your work! We’ve had ${numCalls} other calls so far. We’ll reach out when we have updates and an outcome on the issue.
        `)
      } else if (numCalls === 0) {
        return botReply(user, stripIndent`
          Congrats, you’re the first caller on this issue! You’ve joined the ranks of other famous firsts in American History. We'll reach out when we have updates and an outcome on the issue.
        `)
      }
    })
    .then(() => {
      return botReply(user, stripIndent`
        Share this action with your friends to make it a party ${user.convoData.shareLink}
      `)
    })
    .then(() => setUserCallback(user, null))
  } else if (message.text === ACTION_TYPE_PAYLOADS.error) {
    return botReply(user, {
      attachment: {
        type: 'image',
        payload: {
          url: 'https://storage.googleapis.com/callparty/bummer.gif'
        }
      }
    })
    .then(() => {
      botReply(user,
        'We’re sorry to hear that, but good on you for trying! Want to tell us about it?'
      )
    })
    .then(() => setUserCallback(user, '/calltoaction/thanksForSharing'))
  } else {
    throw new Error('Received unexpected message at path /calltoaction/part3: ' + message.text)
  }
}

function howDidItGoMultipleRepsResponseConvo(user, message) {
  if ([ACTION_TYPE_PAYLOADS.voicemail, ACTION_TYPE_PAYLOADS.staffer].indexOf(message.text) >= 0) {
    const userActionCountPromise = UserAction.count({
      campaignAction: user.convoData.campaignCall,
      active: true,
      actionType: {
        $in: [
          ACTION_TYPE_PAYLOADS.voicemail,
          ACTION_TYPE_PAYLOADS.staffer
        ]
      }
    }).exec()

    user.convoData.currentRepresentativeIndex++
    user.markModified('convoData')
    const updateUserPromise = user.save()

    return Promise.all([userActionCountPromise, updateUserPromise])
      .then(([numCalls, user]) => {
        const hasNextRep = user.convoData.currentRepresentativeIndex < user.convoData.representatives.length

        if (hasNextRep) {
          const nextRep = user.convoData.representatives[user.convoData.currentRepresentativeIndex]
          let botReplyPromise
          if (numCalls === 0) {
            botReplyPromise = botReply(user, stripIndent`
              Congrats, you're the first caller on this issue! Next is ${nextRep.repType} ${nextRep.repName}.
            `)
          } else {
            botReplyPromise = botReply(user, stripIndent`
              Excellent, we're at ${numCalls + 1} calls! Next is ${nextRep.repType} ${nextRep.repName}.
            `)
          }
          return botReplyPromise.then(() => multipleRepsCallNextRepConvo(user, message))
        } else {
          return botReply(user, {
            attachment: {
              type: 'image',
              payload: {
                url: 'https://storage.googleapis.com/callparty/success.gif'
              }
            }
          })
          .then(() => {
            let promise
            if (numCalls !== 0) {
              promise = botReply(user, stripIndent`
                Woo thanks for your work! We’ve had ${numCalls} other calls so far. We’ll reach out when we have updates and an outcome on the issue.
              `)
            } else if (numCalls === 0) {
              promise = botReply(user, stripIndent`
                Congrats, you’re the first caller on this issue! You’ve joined the ranks of other famous firsts in American History. We'll reach out when we have updates and an outcome on the issue.
              `)
            }
            return promise
          })
          .then(() => botReply(user, stripIndent`
            Share this action with your friends to make it a party ${user.convoData.shareLink}
          `))
          .then(() => setUserCallback(user, null))
        }
      })
  } else if (message.text === ACTION_TYPE_PAYLOADS.error) {
    const messagePromise = botReply(user, {
      attachment: {
        type: 'image',
        payload: {
          url: 'https://storage.googleapis.com/callparty/bummer.gif'
        }
      }
    })

    user.convoData.currentRepresentativeIndex++
    user.markModified('convoData')
    const updateUserPromise = user.save()

    return Promise.all([updateUserPromise, messagePromise])
    .then(([user]) => {
      const hasNextRep = user.convoData.currentRepresentativeIndex < user.convoData.representatives.length
      if (hasNextRep) {
        return botReply(user, stripIndent`
          We're sorry to hear that, but good on you for trying!
        `)
        .then(() => botReply(user, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: ' Do you want to try your next Congress Member?',
              buttons: [
                {
                  type: 'postback',
                  title: 'Yes',
                  payload: ACTION_TYPE_PAYLOADS.tryNextRep
                },
                {
                  type: 'postback',
                  title: 'No',
                  payload: ACTION_TYPE_PAYLOADS.noCall
                }
              ]
            }
          }
        }))
        .then(() => setUserCallback(user, '/calltoaction/tryNextRepResponse'))
      } else {
        return botReply(user,
          'We’re sorry to hear that, but good on you for trying! Want to tell us about it?'
        )
        .then(() => setUserCallback(user, '/calltoaction/thanksForSharing'))
      }
    })
  } else {
    throw new Error('Received unexpected message at path /calltoaction/part3: ' + message.text)
  }
}

function tryNextRepResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignAction: user.convoData.campaignCall,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user,
  })
  .then(() => {
    if (message.text === ACTION_TYPE_PAYLOADS.tryNextRep) {
      return multipleRepsCallNextRepConvo(user, message)
    }
    else if (message.text === ACTION_TYPE_PAYLOADS.noCall) {
      return noCallConvo(user, message)
    }
    else {
      throw new Error('Received unexpected message at path /calltoaction/tryNextRepResponse: ' + message.text)
    }
  })
}

// thanks for sharing
function thanksForSharingConvo(user, message) {
  logMessage(`++ ${user.firstName} ${user.lastName} (${user.fbId}) said in response to something went wrong: ${message.text}`, '#_feedback', true)
  return UserConversation.update({ _id: user.convoData.userConversationId }, { dateCompleted: moment.utc().toDate() }).exec()
    .then(() => botReply(user, 'Thanks for sharing! We’ll reach back out if we can be helpful.'))
    .then(function () {
      // Should be logged to sentry and then slack.
      console.log(message.text)
      return setUserCallback(user, null)
    })
}


module.exports = {
  startCallConversation,
  readyResponseConvo,
  tellMeWhyResponseConvo,
  howDidItGoConvo,
  howDidItGoResponseConvo,
  thanksForSharingConvo,
  tryNextRepResponseConvo
}
