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

  // then begin the conversation
  const repsPromise = Reps.find({ _id: { $in: representatives } }).exec()
  const userConversationCountPromise = UserConversation.count({ user: user._id, active: true }).exec()
  return Promise.all([repsPromise, userConversationCountPromise])
    .then(([representatives, userConversationCount]) => {
      const isFirstTimeCaller = userConversationCount === 0
      // only send one representative if it's the user's first time calling
      if (isFirstTimeCaller) {
        representatives = representatives.slice(0, 1)
      }
      const convoData = {
        firstName: user.firstName,
        issueMessage: campaignCall.message,
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
        currentRepresentativeIndex: 0,
        numUserCalls: 0,  // the number of calls this user has made for this campaignCall
        isFirstTimeCaller: isFirstTimeCaller
      }
      // save params as convoData
      user.convoData = convoData

      return user.save().then(() => {
        if (isFirstTimeCaller) {
          return firstTimeIntroConvo(user, null)
        } else {
          return areYouReadyConvo(user, null)
        }
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
    `Hi ${user.convoData.firstName}. We've got an issue that needs your action.`
  )
  .then(() => {
    return botReply(user, `${user.convoData.issueMessage}. ` +
      `You can find out more about it here ${user.convoData.issueLink}.`
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

function firstTimeIntroConvo(user) {
  UserConversation.update({ _id: user.convoData.userConversationId }, { active: true }).exec()

  return botReply(user,
    `Hi ${user.convoData.firstName}. We've got an issue to call about. This is your first time calling, so let’s walk you through the steps and talk about some best practices.`
  )
  .then(() => {
    return botReply(user, `When you call your Congress Member's office, you'll either talk to a staff member or leave a voicemail. The staff member is there to listen to you and pass your concerns on to the Congress Member. They're your buddy, and you'll probably talk to them again so be friendly.`)
  })
  .then(() => botReply(user, `Give me a thumbs up if that sounds good!`))
  .then(() => setUserCallback(user, '/calltoaction/firstTimeAreYouReady'))
}

function firstTimeAreYouReadyConvo(user) {
  return botReply(user, {
    attachment: {
      type: 'image',
      payload: {
        url: 'https://storage.googleapis.com/callparty/thumbsup.gif'
      }
    }
  })
  .then(() => botReply(user, stripIndent`
    Awesome. When you call you’re going to tell them your name, that you’re a constituent (because you only want to be calling your own Congress Members), and why you’re calling. Always include a specific action you’d like the representative to take to be productive, and feel free to share any personal feelings or stories you have so they understand why it matters to you.
  `))
  .then(() => botReply(user, stripIndent`
     They’ll probably ask for your address or phone number to confirm you’re a constituent, and that’s it! Thank them and continue on with your day.
  `))
  .then(() => {
    const msg_attachment = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Ready to make your first call?',
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
            }
          ]
        }
      }
    }
    return botReply(user, msg_attachment).then(() =>
      setUserCallback(user, '/calltoaction/firstTimeReadyResponse')
    )
  })
}

function firstTimeReadyResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignCall: user.convoData.campaignCall._id,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })
  .then(() => {
    if (message.text === ACTION_TYPE_PAYLOADS.isReady) {
      const representative = user.convoData.representatives[0]
      return botReply(user, `${user.convoData.issueMessage}. ` +
        `You can find out more about it here ${user.convoData.issueLink}.`
      )
      .then(() => botReply(user, `Here’s your first script and the information for your representative: "Hello, my name is ${user.convoData.firstName} and I’m a constituent of ${representative.repName}. I’m calling about ${user.convoData.issueSubject}. I’d like to ask that ${representative.repName} ${user.convoData.issueTask}. Thanks for listening, have a good day!"`))
      .then(() => sendRepCard(user, message))
    }
    else if (message.text === ACTION_TYPE_PAYLOADS.noCall) {
      return noCallConvo(user, message)
    }
    else {
      throw new Error('Received unexpected message at path /calltoaction/readyResponse: ' + message.text)
    }
  })
}

function readyResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignCall: user.convoData.campaignCall._id,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })
  .then(() => {
    if (message.text === ACTION_TYPE_PAYLOADS.isReady) {
      const hasOneRep = user.convoData.representatives.length === 1
      const representative = user.convoData.representatives[0]
      let msgToSend
      if (hasOneRep) {
        msgToSend = stripIndent`
        Great! You'll be calling ${representative.repType} ${representative.repName}.
        You'll either talk to a staff member or leave a voicemail.
        When you call:

        \u2022 Be sure to say you're a constituent calling about ${user.convoData.issueSubject}
        \u2022 Let them know "I'd like ${representative.repType} ${representative.repName} to ${user.convoData.issueTask}"
        \u2022 Share any personal feelings or stories you have on the issue
        \u2022 Answer any questions the staffer has, and be friendly!
      `
      } else {
        msgToSend = stripIndent`
        Great! You'll be calling ${user.convoData.representatives.length} Congress Members. You'll either talk to a staff member or leave a voicemail. When you call:

        \u2022 Be sure to say you're a constituent calling about ${user.convoData.issueSubject}
        \u2022 Let them know: "I'd like the Congress Member to ${user.convoData.issueTask}"
        \u2022 Share any personal feelings or stories you have on the issue
        \u2022 Answer any questions the staffer has, and be friendly!

        Your first call is ${representative.repType} ${representative.repName}:
      `
      }
      return botReply(user, msgToSend)
        .then(() => sendRepCard(user, message))
    }
    else if (message.text === ACTION_TYPE_PAYLOADS.noCall) {
      return noCallConvo(user, message)
    }
    else {
      throw new Error('Received unexpected message at path /calltoaction/readyResponse: ' + message.text)
    }
  })
}

function sendRepCard(user, message) {
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
  })
  .then(() => botReply(user, `Give me a thumbs up once you've tried to call!`))
  .then(() => setUserCallback(user, `/calltoaction/howDidItGo`))
}

function noCallConvo(user, message) {
  return botReply(user, `That's okay! Want to tell me why?`).then(() => {
    return setUserCallback(user, `/calltoaction/tellMeWhyResponse`)
  })
}

function tellMeWhyResponseConvo(user, message) {
  // this log line logs the user feedback to the _feedback channel in slack
  logMessage(`++ ${user.firstName} ${user.lastName} (${user.fbId}) said in response to I don't want to call: ${message.text}`, '#_feedback', true)
  return botReply(user, `Got it – I'll let you know when there's another issue to call about.`).then(() => {
    return setUserCallback(user, null)
  })
}

function howDidItGoConvo(user) {
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

function noNextRepResponse(user, message, numCalls) {
  return botReply(user, {
    attachment: {
      type: 'image',
      payload: {
        url: 'https://storage.googleapis.com/callparty/success.gif'
      }
    }
  })
  .then(() => {
    // if the user is the first caller
    if (numCalls <= 1) {
      return botReply(user, stripIndent`
        Congrats, you're the first caller on this issue! I'll reach out with updates and an outcome on this issue. Thanks for your work!
      `)
    }
    // if the user is only person who has made calls, then it's weird to tell them how many calls so far so remove that part
    else if (numCalls === user.convoData.numUserCalls) {
      return botReply(user, stripIndent`
        Woo thanks for your work! We'll reach out when we have updates and an outcome on the issue.
      `)
    }
    // otherwise tell them how many calls have been made so far
    else {
      return botReply(user, stripIndent`
        Woo thanks for your work! We've had ${numCalls} calls so far. We'll reach out when we have updates and an outcome on the issue.
      `)
    }
  })
  .then(() => botReply(user, stripIndent`
    Share this action with your friends to make it a party ${user.convoData.shareLink}
  `))
  .then(() => setUserCallback(user, null))
}

function hasNextRepResponse(user, message, numCalls) {
  const nextRep = user.convoData.representatives[user.convoData.currentRepresentativeIndex]
  let botReplyPromise
  if (numCalls <= 1) {
    botReplyPromise = botReply(user, stripIndent`
      Congrats, you're the first caller on this issue! Next is ${nextRep.repType} ${nextRep.repName}.
    `)
  } else {
    botReplyPromise = botReply(user, stripIndent`
      Excellent, we're at ${numCalls} calls! Next is ${nextRep.repType} ${nextRep.repName}.
    `)
  }
  return botReplyPromise.then(() => sendRepCard(user, message))
}

function userMadeCallResponse(user, message) {
  const userActionCountPromise = UserAction.count({
    campaignCall: user.convoData.campaignCall._id,
    actionType: {
      $in: [
        ACTION_TYPE_PAYLOADS.voicemail,
        ACTION_TYPE_PAYLOADS.staffer
      ]
    }
  }).exec()

  user.convoData.currentRepresentativeIndex++
  user.convoData.numUserCalls++
  user.markModified('convoData')
  const updateUserPromise = user.save()

  return Promise.all([userActionCountPromise, updateUserPromise])
    .then(([numCalls, user]) => {
      // log message in case we reached invalid state
      if (numCalls < 1) {
        logMessage('++ @here: this if clause is only executed if the user made a call. So if there are 0 calls something is weird')
      }
      // but continue regardless
      const hasNextRep = user.convoData.currentRepresentativeIndex < user.convoData.representatives.length
      if (!hasNextRep) {
        return noNextRepResponse(user, message, numCalls)
      } else {
        return hasNextRepResponse(user, message, numCalls)
      }
    })
}

function somethingWentWrongResponse(user) {
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
    .then(() => {
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
}

function howDidItGoResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignCall: user.convoData.campaignCall._id,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })
  .then(() => {
    if ([ACTION_TYPE_PAYLOADS.voicemail, ACTION_TYPE_PAYLOADS.staffer].indexOf(message.text) >= 0) {
      return userMadeCallResponse(user, message)
    } else if (message.text === ACTION_TYPE_PAYLOADS.error) {
      return somethingWentWrongResponse(user, message)
    } else {
      throw new Error('Received unexpected message at path /calltoaction/howDidItGoResponse: ' + message.text)
    }
  })
}

function tryNextRepResponseConvo(user, message) {
  return UserAction.create({
    actionType: message.text,
    campaignCall: user.convoData.campaignCall._id,
    representative: user.convoData.representatives[user.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })
  .then(() => {
    if (message.text === ACTION_TYPE_PAYLOADS.tryNextRep) {
      return sendRepCard(user, message)
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
    .then(() => botReply(user, `Thanks for sharing! We'll reach back out if we can be helpful.`))
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
  tryNextRepResponseConvo,
  firstTimeAreYouReadyConvo,
  firstTimeReadyResponseConvo
}
