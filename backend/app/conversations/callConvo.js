const moment = require('moment')
const { stripIndent } = require('common-tags')
const { setUserCallback } = require('../methods/userMethods')
const { botReply } = require('../utilities/botReply')
const { UserAction } = require('../models')
const { UserConversation, Reps, Campaign } = require('../models')
const ACTION_TYPE_PAYLOADS = UserAction.ACTION_TYPE_PAYLOADS
const { logMessage } = require('../utilities/logHelper')


async function startCallConversation(user, userConversation, representatives, campaignCall) {

  // for testing so that we can ensure that an error on one user, does not botch the whole run
  if (campaignCall.subject === 'TestErrorLogging' && user.firstName === 'Max' && user.lastName === 'Fowler') {
    throw new Error('Testing error logging within conversation initiation')
  }

  // then begin the conversation
  representatives = await Reps.find({ _id: { $in: representatives } }).exec()

  const isFirstTimeCaller = user.firstTimeCaller
  // only send one representative if it's the user's first time calling
  if (isFirstTimeCaller) {
    representatives = representatives.slice(0, 1)
  }
  const convoData = {
    firstName: user.firstName,
    issueMessage: campaignCall.message,
    issueLink: campaignCall.issueLink,
    shareLink: campaignCall.shareLink,
    issueSubject: campaignCall.subject,
    issueTask: campaignCall.task,
    campaignCall: campaignCall.toObject({ virtuals: false }), // without toObject mongoose goes into an infinite loop on insert
    userConversationId: userConversation._id,
    representatives: representatives.map(representative => ({
      repType: representative.legislatorTitle,
      repShortTitle: representative.shortTitle,
      repName: representative.official_full,
      repTitle: representative.repTitle,
      repId: representative._id,
      repImage: representative.image_url,
      repPhoneNumbers: [
        representative.phoneNumbers.filter(({ officeType }) => officeType === 'district')[0],
        representative.phoneNumbers.filter(({ officeType }) => officeType === 'capitol')[0]
      ].filter(Boolean), // filter out undefined values
      repWebsite: representative.url,
    })),
    currentRepresentativeIndex: 0,
    numUserCalls: 0,  // the number of calls this user has made for this campaignCall
    isFirstTimeCaller: isFirstTimeCaller,
  }
  // save params as convoData
  userConversation.convoData = convoData
  await userConversation.save()

  await user.populate('currentConvo').execPopulate()

  if (isFirstTimeCaller) {
    return firstTimeIntroConvo(user, null)
  } else {
    return areYouReadyConvo(user, null)
  }
}

// part 1
function areYouReadyConvo(user) {
  // begin the conversation
  return botReply(user,
    `Hi ${user.currentConvo.convoData.firstName}. We've got an issue that needs your action.`
  )
  .then(() => {
    return botReply(user, `${user.currentConvo.convoData.issueMessage} ` +
      `You can find out more about it here ${user.currentConvo.convoData.issueLink}.`
    )
  }).then(() => {
    const msg_attachment = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `Are you ready to call? (You can come back later if you're busy)`,
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
  user.firstTimeCaller = false
  user.save()
  return botReply(user,
    `Hi ${user.currentConvo.convoData.firstName}. We've got an issue to call about.`
  )
  .then(() => {
    return botReply(user, `${user.currentConvo.convoData.issueMessage} ` +
      `You can find out more about it here ${user.currentConvo.convoData.issueLink}.`
    )
  })
  .then(() => {
    return botReply(user, `It’s your first call so we’ll walk through the steps: When you call your member's office, you'll either talk to a staffer or leave a voicemail. The staffer is there to listen to you and pass your concerns on to the Member of Congress. They're your buddy (and you'll probably talk to them again) so be friendly.`)
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
    Awesome. When you call, you're going to tell them your name, that you're a constituent (because you only want to be calling your own Members of Congress), and why you're calling. We'll give you a specific action to tell your representative to take, and feel free to share any personal feelings or stories so they understand why it matters to you.
  `))
  .then(() => botReply(user, stripIndent`
     The staffer will probably ask for your address or phone number to confirm you're a constituent. Thank them, and that's it!
  `))
  .then(() => {
    const msg_attachment = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `Ready to make your first call? (You can come back later if you're busy)`,
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

async function firstTimeReadyResponseConvo(user, message) {
  if (!Object.values(ACTION_TYPE_PAYLOADS).includes(message.text)) {
    logMessage(`++ User responded to firstTimeReadyResponseConvo with unexpected message: ${message.text}`)
    return botReply(user, `I'm sorry, I didn't understand that! Try choosing from one of the options above, or shoot us an email to talk to a person at ${user.bot.orgEmail}.`)
  }

  await UserAction.create({
    actionType: message.text,
    campaignCall: user.currentConvo.convoData.campaignCall._id,
    representative: user.currentConvo.convoData.representatives[user.currentConvo.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })

  if (message.text === ACTION_TYPE_PAYLOADS.isReady) {
    const representative = user.currentConvo.convoData.representatives[0]
    return botReply(user, `Here’s your first script and the information for your representative: "Hello, my name is ${user.currentConvo.convoData.firstName} and I’m a constituent of ${representative.repTitle}. I’m calling about ${user.currentConvo.convoData.issueSubject}. I’d like to ask that ${representative.repTitle} ${user.currentConvo.convoData.issueTask}. Thanks for listening, have a good day!"`)
    .then(() => sendRepCard(user, message))
  }
  else if (message.text === ACTION_TYPE_PAYLOADS.noCall) {
    return noCallConvo(user, message)
  }
  else {
    throw new Error('Received unexpected message at path /calltoaction/firstTimeReadyResponse: ' + message.text)
  }
}

async function readyResponseConvo(user, message) {
  if (!Object.values(ACTION_TYPE_PAYLOADS).includes(message.text)) {
    logMessage(`++ User responded to readyResponseConvo with unexpected message: ${message.text}`)
    return botReply(user, "I'm sorry, I didn't understand that! Try choosing from one of the options above, or shoot us an email to talk to a person at hi@callparty.org.")
  }

  await UserAction.create({
    actionType: message.text,
    campaignCall: user.currentConvo.convoData.campaignCall._id,
    representative: user.currentConvo.convoData.representatives[user.currentConvo.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })

  if (message.text === ACTION_TYPE_PAYLOADS.isReady) {
    const hasOneRep = user.currentConvo.convoData.representatives.length === 1
    const representative = user.currentConvo.convoData.representatives[0]
    let msgToSend
    if (hasOneRep) {
      msgToSend = stripIndent`
      Great! You'll be calling ${representative.repTitle}.
      You'll either talk to a staffer or leave a voicemail.
      When you call:

      \u2022 Be sure to say you're a constituent calling about ${user.currentConvo.convoData.issueSubject}
      \u2022 Let them know "I'd like ${representative.repTitle} to ${user.currentConvo.convoData.issueTask}"
      \u2022 Share any personal feelings or stories you have on the issue
      \u2022 Answer any questions the staffer has, and be friendly!
    `
    } else {
      msgToSend = stripIndent`
      Great! You'll be calling ${user.currentConvo.convoData.representatives.length} Members of Congress. You'll either talk to a staffer or leave a voicemail. When you call:

      \u2022 Be sure to say you're a constituent calling about ${user.currentConvo.convoData.issueSubject}
      \u2022 Let them know you'd like them to "${user.currentConvo.convoData.issueTask}"
      \u2022 Share any personal feelings or stories you have on the issue
      \u2022 Answer any questions the staffer has, and be friendly!

      Your first call is ${representative.repTitle}:
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
}

function sendRepCard(user) {
  const representative = user.currentConvo.convoData.representatives[user.currentConvo.convoData.currentRepresentativeIndex]

  const officeTypeLabels = {
    district: 'Local',
    capitol: 'DC'
  }
  const phoneNumberButtons = representative.repPhoneNumbers.map(({ officeType, phoneNumber }) => ({
    type: 'phone_number',
    title: `${officeTypeLabels[officeType]}: ${phoneNumber}`,
    payload: phoneNumber
  }))

  return botReply(user, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        image_aspect_ratio: 'square',
        elements: [
          {
            title: `${representative.repShortTitle} ${representative.repName}`,
            image_url: representative.repImage,
            // TODO: for some reason facebook is throwing error with this default_action included
            // default_action: {
            //   type: 'phone_number',
            //   title: user.currentConvo.convoData.repPhoneNumber,
            //   payload: user.currentConvo.convoData.repPhoneNumber
            // },
            buttons: [
              ...phoneNumberButtons,
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

function noCallConvo(user) {
  return botReply(user, `That's okay! Want to tell me why?`).then(() => {
    return setUserCallback(user, `/calltoaction/tellMeWhyResponse`)
  })
}

function tellMeWhyResponseConvo(user, message) {
  // this log line logs the user feedback to the _feedback channel in slack
  logMessage(`++ ${user.firstName} ${user.lastName} (${user.fbId}) said in response to I don't want to call: "${message.text}"`, '#_feedback')
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
    else if (numCalls === user.currentConvo.convoData.numUserCalls) {
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
  }).then(() => {
    // if callparty then send share link
    if (user.bot.botType === 'callparty') {
      const share_msg = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'Share this issue with your friends to make it a party',
              subtitle: user.currentConvo.convoData.issueSubject,
              image_url: 'https://storage.googleapis.com/callparty/cpshare.jpg',
              buttons: [
                {
                  type: 'element_share',
                  share_contents: {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'generic',
                        elements: [{
                          title: 'Call your Members of Congress and join the CallParty!',
                          subtitle: user.currentConvo.convoData.issueSubject,
                          image_url: 'https://storage.googleapis.com/callparty/cpshare.jpg',
                          default_action: {
                            type: 'web_url',
                            url: user.currentConvo.convoData.shareLink
                          },
                          buttons: [
                            {
                              type: 'web_url',
                              url: user.currentConvo.convoData.shareLink,
                              title: 'View More Info'
                            }
                          ]
                        }]
                      }
                    }
                  }
                },
                {
                  type: 'web_url',
                  url: user.currentConvo.convoData.shareLink,
                  title: 'View More Info'
                },
              ]
            }]
          }
        }
      }
      return botReply(user, share_msg).then(() => setUserCallback(user, null))
    }
    // no share fo gov track
    else {
      return setUserCallback(user, null)
    }
  })
}

function hasNextRepResponse(user, message, numCalls) {
  const nextRep = user.currentConvo.convoData.representatives[user.currentConvo.convoData.currentRepresentativeIndex]
  let botReplyPromise
  if (numCalls <= 1) {
    botReplyPromise = botReply(user, stripIndent`
      Congrats, you're the first caller on this issue! Next is ${nextRep.repTitle}.
    `)
  } else {
    botReplyPromise = botReply(user, stripIndent`
      Excellent, we're at ${numCalls} calls! Next is ${nextRep.repTitle}.
    `)
  }
  return botReplyPromise.then(() => sendRepCard(user, message))
}

async function userMadeCallResponse(user, message) {
  const campaign = await Campaign.findById(user.currentConvo.convoData.campaignCall.campaign).populate('campaignActions').exec()
  const numCalls = await UserAction.count({
    campaignCall: {
      $in: campaign.campaignCalls.map(call => call._id)
    },
    actionType: {
      $in: [
        ACTION_TYPE_PAYLOADS.voicemail,
        ACTION_TYPE_PAYLOADS.staffer
      ]
    }
  }).exec()

  user.currentConvo.convoData.currentRepresentativeIndex++
  user.currentConvo.convoData.numUserCalls++
  user.currentConvo.markModified('convoData')
  await user.currentConvo.save()

  // log message in case we reached invalid state
  if (numCalls < 1) {
    logMessage('++ @here: this if clause is only executed if the user made a call. So if there are 0 calls something is weird')
  }
  // but continue regardless
  const hasNextRep = user.currentConvo.convoData.currentRepresentativeIndex < user.currentConvo.convoData.representatives.length
  if (!hasNextRep) {
    return noNextRepResponse(user, message, numCalls)
  } else {
    return hasNextRepResponse(user, message, numCalls)
  }
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

  user.currentConvo.convoData.currentRepresentativeIndex++
  user.currentConvo.markModified('convoData')
  const updateUserConvoPromise = user.currentConvo.save()

  return Promise.all([updateUserConvoPromise, messagePromise])
    .then(() => {
      const hasNextRep = user.currentConvo.convoData.currentRepresentativeIndex < user.currentConvo.convoData.representatives.length
      if (hasNextRep) {
        return botReply(user, stripIndent`
          We're sorry to hear that, but good on you for trying!
        `)
        .then(() => botReply(user, {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: ' Do you want to try your next member?',
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

async function howDidItGoResponseConvo(user, message) {
  if (!Object.values(ACTION_TYPE_PAYLOADS).includes(message.text)) {
    logMessage(`++ User responded to howDidItGoResponseConvo with unexpected message: ${message.text}`)
    return botReply(user, "I'm sorry, I didn't understand that! Try choosing from one of the options above, or shoot us an email to talk to a person at hi@callparty.org.")
  }

  await UserAction.create({
    actionType: message.text,
    campaignCall: user.currentConvo.convoData.campaignCall._id,
    representative: user.currentConvo.convoData.representatives[user.currentConvo.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })

  if ([ACTION_TYPE_PAYLOADS.voicemail, ACTION_TYPE_PAYLOADS.staffer].indexOf(message.text) >= 0) {
    return userMadeCallResponse(user, message)
  } else if (message.text === ACTION_TYPE_PAYLOADS.error) {
    return somethingWentWrongResponse(user, message)
  } else {
    throw new Error('Received unexpected message at path /calltoaction/howDidItGoResponse: ' + message.text)
  }
}

async function tryNextRepResponseConvo(user, message) {
  if (!Object.values(ACTION_TYPE_PAYLOADS).includes(message.text)) {
    logMessage(`++ User responded to tryNextRepResponseConvo with unexpected message: ${message.text}`)
    return botReply(user, "I'm sorry, I didn't understand that! Try choosing from one of the options above, or shoot us an email to talk to a person at hi@callparty.org.")
  }

  await UserAction.create({
    actionType: message.text,
    campaignCall: user.currentConvo.convoData.campaignCall._id,
    representative: user.currentConvo.convoData.representatives[user.currentConvo.convoData.currentRepresentativeIndex].repId,
    user: user._id,
  })

  if (message.text === ACTION_TYPE_PAYLOADS.tryNextRep) {
    return sendRepCard(user, message)
  }
  else if (message.text === ACTION_TYPE_PAYLOADS.noCall) {
    return noCallConvo(user, message)
  }
  else {
    throw new Error('Received unexpected message at path /calltoaction/tryNextRepResponse: ' + message.text)
  }
}

// thanks for sharing
function thanksForSharingConvo(user, message) {
  logMessage(`++ ${user.firstName} ${user.lastName} (${user.fbId}) said in response to something went wrong: "${message.text}"`, '#_feedback')
  return UserConversation.update({ _id: user.currentConvo.convoData.userConversationId }, { dateCompleted: moment.utc().toDate() }).exec()
    .then(() => botReply(user, `Got it – we'll reach back out if we can be helpful.`))
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
